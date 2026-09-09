/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { AdminElement } from "@chaos_team/blbui-core";

export type AdminEditorFormat = "markdown" | "html";

export interface AdminSanitizeOptions {
    allowImages?: boolean;
}

export interface AdminSerializedEditorContent {
    format: AdminEditorFormat;
    source: string;
    html: string;
}

const allowedElements = new Set([
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "del",
    "code",
    "pre",
    "blockquote",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "a",
]);
const dangerousElements = new Set([
    "base",
    "embed",
    "form",
    "iframe",
    "link",
    "meta",
    "object",
    "script",
    "style",
    "svg",
    "template",
]);

export function escapeEditorHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function safeUrl(value: string): string | null {
    const candidate = value.trim();
    if (!candidate || /[\u0000-\u001f\u007f]/.test(candidate)) return null;
    try {
        const parsed = new URL(candidate, "https://blbui.invalid");
        if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return null;
        return candidate;
    } catch {
        return null;
    }
}

/**
 * Sanitize HTML produced by a third-party editor before it is rendered.
 * Unknown elements are unwrapped, dangerous elements and all event/style
 * attributes are dropped, and links are restricted to safe protocols.
 */
export function sanitizeRichTextHtml(input: string, options: AdminSanitizeOptions = {}): string {
    if (typeof DOMParser === "undefined" || typeof document === "undefined") {
        return input ? `<p>${escapeEditorHtml(input)}</p>` : "";
    }
    const parsed = new DOMParser().parseFromString(`<div>${input}</div>`, "text/html");
    const source = parsed.body.firstElementChild;
    if (!source) return "";
    const output = parsed.createElement("div");

    const clean = (node: Node): Node | null => {
        if (node.nodeType === Node.TEXT_NODE) return parsed.createTextNode(node.nodeValue ?? "");
        if (!(node instanceof Element)) return null;
        const tag = node.tagName.toLowerCase();
        if (dangerousElements.has(tag)) return null;
        if (tag === "img") {
            if (!options.allowImages) return null;
            const src = safeUrl(node.getAttribute("src") ?? "");
            if (!src) return null;
            const image = parsed.createElement("img");
            image.setAttribute("src", src);
            image.setAttribute("alt", node.getAttribute("alt") ?? "");
            return image;
        }
        if (!allowedElements.has(tag)) {
            const fragment = parsed.createDocumentFragment();
            for (const child of [...node.childNodes]) {
                const cleaned = clean(child);
                if (cleaned) fragment.append(cleaned);
            }
            return fragment;
        }
        const cleanElement = parsed.createElement(tag);
        if (tag === "a") {
            const href = safeUrl(node.getAttribute("href") ?? "");
            if (href) {
                cleanElement.setAttribute("href", href);
                cleanElement.setAttribute("rel", "noopener noreferrer");
                if (node.getAttribute("target") === "_blank") {
                    cleanElement.setAttribute("target", "_blank");
                }
            }
        }
        for (const child of [...node.childNodes]) {
            const cleaned = clean(child);
            if (cleaned) cleanElement.append(cleaned);
        }
        return cleanElement;
    };

    for (const child of [...source.childNodes]) {
        const cleaned = clean(child);
        if (cleaned) output.append(cleaned);
    }
    return output.innerHTML;
}

function renderInline(source: string): string {
    const tokens: string[] = [];
    const token = (value: string): string => {
        const marker = `\u0000${tokens.length}\u0000`;
        tokens.push(value);
        return marker;
    };
    let value = source
        .replace(/`([^`\n]+)`/g, (_match, code: string) =>
            token(`<code>${escapeEditorHtml(code)}</code>`),
        )
        .replace(
            /\[([^\]]+)\]\(([^)\s]+)(?:\s+["']([^"']+)["'])?\)/g,
            (_match, label: string, url: string, title?: string) => {
                const safe = safeUrl(url);
                if (!safe) return escapeEditorHtml(label);
                const titleAttr = title ? ` title="${escapeEditorHtml(title)}"` : "";
                return token(
                    `<a href="${escapeEditorHtml(safe)}" rel="noopener noreferrer"${titleAttr}>${renderInline(label)}</a>`,
                );
            },
        )
        .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_match, strong?: string, alternate?: string) =>
            token(`<strong>${renderInline(strong ?? alternate ?? "")}</strong>`),
        )
        .replace(
            /(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)/g,
            (_match, em?: string, alternate?: string) =>
                token(`<em>${renderInline(em ?? alternate ?? "")}</em>`),
        );
    value = escapeEditorHtml(value);
    return value.replace(
        /\u0000(\d+)\u0000/g,
        (_match, index: string) => tokens[Number(index)] ?? "",
    );
}

/** Convert the supported Markdown subset to safe, dependency-free HTML. */
export function renderMarkdownToHtml(markdown: string): string {
    const lines = markdown.replaceAll("\r\n", "\n").split("\n");
    const blocks: string[] = [];
    let index = 0;
    while (index < lines.length) {
        const line = lines[index] ?? "";
        if (!line.trim()) {
            index += 1;
            continue;
        }
        const fence = line.match(/^\s*```\s*([\w-]*)\s*$/);
        if (fence) {
            const code: string[] = [];
            index += 1;
            while (index < lines.length && !/^\s*```\s*$/.test(lines[index] ?? "")) {
                code.push(lines[index] ?? "");
                index += 1;
            }
            if (index < lines.length) index += 1;
            const language = fence[1] ? ` data-language="${escapeEditorHtml(fence[1])}"` : "";
            blocks.push(`<pre${language}><code>${escapeEditorHtml(code.join("\n"))}</code></pre>`);
            continue;
        }
        const heading = line.match(/^\s*(#{1,4})\s+(.+?)\s*#*\s*$/);
        if (heading) {
            const level = heading[1]?.length ?? 1;
            blocks.push(`<h${level}>${renderInline(heading[2] ?? "")}</h${level}>`);
            index += 1;
            continue;
        }
        if (/^\s*>/.test(line)) {
            const quote: string[] = [];
            while (index < lines.length && /^\s*>/.test(lines[index] ?? "")) {
                quote.push((lines[index] ?? "").replace(/^\s*>\s?/, ""));
                index += 1;
            }
            blocks.push(`<blockquote>${quote.map(renderInline).join("<br>")}</blockquote>`);
            continue;
        }
        const list = line.match(/^\s*([-*+] |\d+\. )(.+)$/);
        if (list) {
            const ordered = /^\d/.test(list[1] ?? "");
            const items: string[] = [];
            while (index < lines.length) {
                const item = (lines[index] ?? "").match(/^\s*([-*+] |\d+\. )(.+)$/);
                if (!item || /^\d/.test(item[1] ?? "") !== ordered) break;
                items.push(`<li>${renderInline(item[2] ?? "")}</li>`);
                index += 1;
            }
            blocks.push(`<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`);
            continue;
        }
        const paragraph: string[] = [];
        while (index < lines.length) {
            const current = lines[index] ?? "";
            if (
                !current.trim() ||
                /^\s*```/.test(current) ||
                /^\s*#{1,4}\s+/.test(current) ||
                /^\s*>/.test(current) ||
                /^\s*([-*+] |\d+\. )/.test(current)
            )
                break;
            paragraph.push(current.trim());
            index += 1;
        }
        if (paragraph.length) blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
        else index += 1;
    }
    return blocks.join("");
}

/** Normalize editor content for storage and safe read-only rendering. */
export function serializeEditorContent(
    source: string,
    format: AdminEditorFormat = "markdown",
    options: AdminSanitizeOptions = {},
): AdminSerializedEditorContent {
    return {
        format,
        source,
        html:
            format === "html"
                ? sanitizeRichTextHtml(source, options)
                : renderMarkdownToHtml(source),
    };
}

export class AdminMarkdownViewerElement extends AdminElement {
    static properties = {
        value: { type: String },
        label: { type: String },
        emptyLabel: { type: String, attribute: "empty-label" },
    };

    static styles = css`
        :host {
            display: block;
            color: var(--aui-text);
            font: 13px/1.6 var(--aui-font-ui);
        }
        .content {
            min-height: 48px;
            padding: 12px 14px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
        }
        .empty {
            color: var(--aui-text-muted);
            font: 11px/1.4 var(--aui-font-mono);
        }
        :is(h1, h2, h3, h4) {
            margin: 0 0 10px;
            color: var(--aui-text-primary);
        }
        :is(p, ul, ol, blockquote, pre) {
            margin: 0 0 10px;
        }
        :is(ul, ol) {
            padding-left: 22px;
        }
        blockquote {
            padding-left: 12px;
            border-left: 2px solid var(--aui-border-hover);
            color: var(--aui-text-secondary);
        }
        pre {
            overflow: auto;
            padding: 10px 12px;
            border: 1px solid var(--aui-border);
            background: var(--aui-header);
            color: var(--aui-text-primary);
            font: 12px/1.5 var(--aui-font-mono);
        }
        code {
            color: var(--aui-primary);
            font-family: var(--aui-font-mono);
        }
        a {
            color: var(--aui-primary);
        }
    `;

    value = "";
    label = "Markdown content";
    emptyLabel = "No content";

    render() {
        return html`<div
            class="content"
            role="${this.value ? "document" : "status"}"
            aria-label=${this.label}
        >
            ${this.value ? unsafeHTML(renderMarkdownToHtml(this.value)) : html`<span class="empty">${this.emptyLabel}</span>`}
        </div>`;
    }
}

export class AdminMarkdownEditorElement extends AdminElement {
    static formAssociated = true;
    static properties = {
        value: { type: String },
        format: { type: String },
        name: { type: String, reflect: true },
        placeholder: { type: String },
        rows: { type: Number },
        disabled: { type: Boolean, reflect: true },
        readOnly: { type: Boolean, attribute: "readonly", reflect: true },
        preview: { type: Boolean, reflect: true },
        invalid: { type: Boolean, reflect: true },
        error: { type: String },
        previewLabel: { type: String, attribute: "preview-label" },
        allowImages: { type: Boolean, attribute: "allow-images" },
    };

    static styles = css`
        :host {
            display: block;
            color: var(--aui-text);
            font: 12px/1.4 var(--aui-font-ui);
        }
        .editor {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 10px;
        }
        .editor.single {
            grid-template-columns: minmax(0, 1fr);
        }
        textarea {
            width: 100%;
            min-height: 160px;
            box-sizing: border-box;
            resize: vertical;
            padding: 10px 12px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            outline: 0;
            background: var(--aui-control-bg);
            color: var(--aui-text-primary);
            font: 12px/1.5 var(--aui-font-mono);
        }
        textarea:focus {
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        textarea:disabled {
            cursor: not-allowed;
            opacity: 0.55;
        }
        .preview {
            min-width: 0;
            min-height: 160px;
            overflow: auto;
            padding: 10px 12px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
            color: var(--aui-text);
        }
        .preview-label {
            margin-bottom: 8px;
            color: var(--aui-text-muted);
            font: 700 10px/1 var(--aui-font-mono);
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        .preview :is(h1, h2, h3, h4) {
            margin: 0 0 8px;
            color: var(--aui-text-primary);
        }
        .preview :is(p, ul, ol, blockquote, pre) {
            margin: 0 0 8px;
        }
        .preview :is(ul, ol) {
            padding-left: 20px;
        }
        .preview blockquote {
            padding-left: 10px;
            border-left: 2px solid var(--aui-border-hover);
            color: var(--aui-text-secondary);
        }
        .preview pre {
            overflow: auto;
            padding: 8px 10px;
            background: var(--aui-header);
            font: 11px/1.5 var(--aui-font-mono);
        }
        .preview code {
            color: var(--aui-primary);
            font-family: var(--aui-font-mono);
        }
        .preview a {
            color: var(--aui-primary);
        }
        .error {
            margin-top: 6px;
            color: var(--aui-danger);
            font: 11px/1.4 var(--aui-font-mono);
        }
        @media (max-width: 640px) {
            .editor {
                grid-template-columns: minmax(0, 1fr);
            }
        }
    `;

    value = "";
    format: AdminEditorFormat = "markdown";
    name = "";
    placeholder = "Write Markdown...";
    rows = 8;
    disabled = false;
    readOnly = false;
    preview = true;
    invalid = false;
    error = "";
    previewLabel = "Preview";
    allowImages = false;
    private formInternals: ElementInternals | undefined;

    connectedCallback(): void {
        super.connectedCallback();
        if (!this.formInternals && typeof this.attachInternals === "function") {
            try {
                this.formInternals = this.attachInternals();
            } catch {
                // Some older browsers expose attachInternals without form support.
            }
        }
        this.syncFormValue();
    }

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("value") || changed.has("name")) this.syncFormValue();
    }

    formResetCallback(): void {
        this.value = "";
        this.syncFormValue();
    }

    formDisabledCallback(disabled: boolean): void {
        this.disabled = disabled;
    }

    private syncFormValue(): void {
        if (typeof this.formInternals?.setFormValue === "function") {
            this.formInternals.setFormValue(this.value);
        }
    }

    private input(event: Event): void {
        this.value = (event.target as HTMLTextAreaElement).value;
        this.syncFormValue();
        this.dispatchDetail("aui-input", { value: this.value });
    }

    private change(): void {
        this.dispatchDetail("aui-change", { value: this.value });
    }

    protected previewHtml(): string {
        return serializeEditorContent(this.value, this.format, {
            allowImages: this.allowImages,
        }).html;
    }

    render() {
        const showPreview = this.preview || this.readOnly;
        return html`<div class="editor ${showPreview ? "" : "single"}">
                ${
                    this.readOnly
                        ? ""
                        : html`<textarea
                              .value=${this.value}
                              name=${this.name || undefined}
                              rows=${this.rows}
                              placeholder=${this.placeholder}
                              ?disabled=${this.disabled}
                              ?readonly=${this.readOnly}
                              aria-invalid=${this.invalid ? "true" : "false"}
                              @input=${this.input}
                              @change=${this.change}
                          ></textarea>`
                }
                ${
                    showPreview
                        ? html`<section class="preview" aria-label=${this.previewLabel}>
                              ${this.readOnly ? null : html`<div class="preview-label">${this.previewLabel}</div>`}
                              ${
                                  this.value
                                      ? unsafeHTML(this.previewHtml())
                                      : html`<span class="empty">No content</span>`
                              }
                          </section>`
                        : null
                }
            </div>
            ${this.error ? html`<div class="error" role="alert">${this.error}</div>` : null}`;
    }
}

/** HTML-source variant with the same controlled/form contract and safe preview. */
export class AdminRichTextEditorElement extends AdminMarkdownEditorElement {
    format: AdminEditorFormat = "html";
    placeholder = "Write rich text HTML...";
}
