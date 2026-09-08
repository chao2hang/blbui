/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement } from "@chaos_team/blbui-core";

export interface AdminImportRow extends Record<string, unknown> {}

export interface AdminBulkAction {
    id: string;
    label: string;
    danger?: boolean;
    disabled?: boolean;
}

function parseCsv(source: string): AdminImportRow[] {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];
        if (char === '"') {
            if (quoted && source[index + 1] === '"') {
                value += '"';
                index += 1;
            } else quoted = !quoted;
        } else if (char === "," && !quoted) {
            row.push(value);
            value = "";
        } else if ((char === "\n" || char === "\r") && !quoted) {
            if (char === "\r" && source[index + 1] === "\n") index += 1;
            row.push(value);
            if (row.some((item) => item.trim())) rows.push(row);
            row = [];
            value = "";
        } else value += char;
    }
    if (value || row.length) {
        row.push(value);
        if (row.some((item) => item.trim())) rows.push(row);
    }
    const headers = rows.shift() ?? [];
    return rows.map((cells) =>
        Object.fromEntries(
            headers.map((header, index) => [
                header.trim() || `column-${index + 1}`,
                cells[index] ?? "",
            ]),
        ),
    );
}

function parseImport(source: string, filename: string): AdminImportRow[] {
    if (filename.toLowerCase().endsWith(".json")) {
        const value: unknown = JSON.parse(source);
        if (Array.isArray(value))
            return value.filter((item): item is AdminImportRow =>
                Boolean(item && typeof item === "object"),
            );
        if (value && typeof value === "object") return [value as AdminImportRow];
        return [];
    }
    return parseCsv(source);
}

export class AdminImportDialogElement extends AdminElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        accept: { type: String },
        maxSize: { type: Number, attribute: "max-size" },
        loading: { type: Boolean, reflect: true },
        rows: { attribute: false },
        error: { type: String },
        submitLabel: { type: String, attribute: "submit-label" },
        cancelLabel: { type: String, attribute: "cancel-label" },
    };

    static styles = css`
        :host {
            display: block;
        }
        dialog {
            width: min(720px, calc(100vw - 32px));
            max-width: 100%;
            padding: 0;
            border: 1px solid var(--aui-border-hover);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
            color: var(--aui-text);
            box-shadow: var(--aui-shadow-overlay);
        }
        dialog::backdrop {
            background: var(--aui-overlay);
            backdrop-filter: var(--aui-backdrop-filter, none);
        }
        .dialog {
            display: grid;
            gap: 16px;
            padding: 20px;
        }
        header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
        }
        h2 {
            margin: 0;
            color: var(--aui-text-primary);
            font: 700 14px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .close,
        button {
            min-height: 34px;
            padding: 7px 11px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-control-bg);
            color: var(--aui-text);
            cursor: pointer;
            font: 700 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .close {
            min-width: 34px;
            padding-inline: 8px;
        }
        button:hover:not(:disabled),
        button:focus-visible {
            border-color: var(--aui-focus);
            outline: none;
            box-shadow: var(--aui-focus-ring);
        }
        button.primary {
            border-color: var(--aui-primary);
            background: var(--aui-primary);
            color: var(--aui-primary-content);
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.45;
        }
        input[type="file"] {
            width: 100%;
            box-sizing: border-box;
            padding: 16px;
            border: 1px dashed var(--aui-border-hover);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-bg);
            color: var(--aui-text-secondary);
            font: 11px/1.3 var(--aui-font-mono);
        }
        .hint,
        .state {
            color: var(--aui-text-muted);
            font: 11px/1.4 var(--aui-font-mono);
        }
        .error {
            color: var(--aui-danger);
        }
        .preview {
            max-height: 260px;
            overflow: auto;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
        }
        table {
            width: 100%;
            min-width: 520px;
            border-collapse: collapse;
            color: var(--aui-text);
            font: 10px/1.3 var(--aui-font-mono);
        }
        th,
        td {
            padding: 8px 10px;
            border-bottom: 1px solid var(--aui-border);
            text-align: left;
            white-space: nowrap;
        }
        th {
            background: var(--aui-header);
            color: var(--aui-text-secondary);
            text-transform: uppercase;
        }
        footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        @media (max-width: 520px) {
            dialog {
                width: calc(100vw - 20px);
            }
            .dialog {
                padding: 14px;
            }
        }
    `;

    open = false;
    title = "IMPORT DATA";
    accept = ".csv,.json,text/csv,application/json";
    maxSize = 10 * 1024 * 1024;
    loading = false;
    rows: AdminImportRow[] = [];
    error = "";
    submitLabel = "IMPORT";
    cancelLabel = "CANCEL";

    protected updated(changed: Map<string, unknown>): void {
        if (!changed.has("open")) return;
        const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog");
        if (!dialog) return;
        if (this.open && !dialog.open) {
            try {
                dialog.showModal();
            } catch {
                dialog.setAttribute("open", "");
            }
        } else if (!this.open && dialog.open) {
            if (typeof dialog.close === "function") dialog.close();
            else dialog.removeAttribute("open");
        }
    }

    private close(): void {
        this.open = false;
        this.dispatchDetail("aui-import-cancel", {});
    }

    private async fileSelected(event: Event): Promise<void> {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        this.error = "";
        if (file.size > this.maxSize) {
            this.error = `FILE EXCEEDS ${(this.maxSize / 1024 / 1024).toFixed(1)} MB LIMIT`;
            this.rows = [];
            this.requestUpdate();
            return;
        }
        this.loading = true;
        this.requestUpdate();
        try {
            this.rows = parseImport(await file.text(), file.name);
            this.dispatchDetail("aui-import-parse", { file, rows: this.rows });
        } catch {
            this.rows = [];
            this.error = "FILE FORMAT COULD NOT BE READ";
        } finally {
            this.loading = false;
            this.requestUpdate();
        }
    }

    private submit(): void {
        if (this.loading || !this.rows.length) return;
        this.dispatchDetail("aui-import-submit", { rows: this.rows });
    }

    render() {
        const columns = [...new Set(this.rows.flatMap((row) => Object.keys(row)))].slice(0, 8);
        return html`<dialog
            @cancel=${(event: Event) => {
                event.preventDefault();
                this.close();
            }}
        >
            <div class="dialog" role="document">
                <header>
                    <h2>${this.title}</h2>
                    <button class="close" type="button" aria-label="Close" @click=${this.close}>
                        ×
                    </button>
                </header>
                <div>
                    <input
                        type="file"
                        .accept=${this.accept}
                        aria-label="Import file"
                        @change=${this.fileSelected}
                    />
                    <p class="hint">
                        CSV and JSON · MAX ${(this.maxSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                </div>
                ${this.loading ? html`<div class="state" role="status" aria-live="polite">READING FILE...</div>` : null}
                ${this.error ? html`<div class="state error" role="alert">${this.error}</div>` : null}
                ${
                    this.rows.length
                        ? html`<div class="preview" aria-label="Import preview">
                                  <table>
                                      <thead>
                                          <tr>
                                              ${columns.map((column) => html`<th>${column}</th>`)}
                                          </tr>
                                      </thead>
                                      <tbody>
                                          ${this.rows.slice(0, 20).map(
                                              (row) =>
                                                  html`<tr>
                                                      ${columns.map((column) => html`<td>${String(row[column] ?? "")}</td>`)}
                                                  </tr>`,
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                              <div class="hint">
                                  ${this.rows.length} ROWS
                                  READY${this.rows.length > 20 ? " · PREVIEWING FIRST 20" : ""}
                              </div>`
                        : html`<div class="state" role="status">SELECT A FILE TO PREVIEW</div>`
                }
                <footer>
                    <button type="button" @click=${this.close}>${this.cancelLabel}</button
                    ><button
                        class="primary"
                        type="button"
                        ?disabled=${this.loading || !this.rows.length}
                        @click=${this.submit}
                    >
                        ${this.submitLabel}
                    </button>
                </footer>
            </div>
        </dialog>`;
    }
}

export class AdminExportButtonElement extends AdminElement {
    static properties = {
        data: { attribute: false },
        format: { type: String },
        filename: { type: String },
        label: { type: String },
        disabled: { type: Boolean, reflect: true },
        loading: { type: Boolean, reflect: true },
    };
    static styles = css`
        :host {
            display: inline-block;
        }
        button {
            min-height: 34px;
            padding: 8px 12px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-control-bg);
            color: var(--aui-text);
            cursor: pointer;
            font: 700 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        button:hover:not(:disabled),
        button:focus-visible {
            border-color: var(--aui-focus);
            color: var(--aui-text-primary);
            outline: none;
            box-shadow: var(--aui-focus-ring);
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.45;
        }
    `;
    data: unknown[] | Record<string, unknown> = [];
    format: "csv" | "json" = "csv";
    filename = "export";
    label = "EXPORT";
    disabled = false;
    loading = false;

    private serialize(): string {
        if (this.format === "json") return JSON.stringify(this.data, null, 2);
        const rows: Record<string, unknown>[] = Array.isArray(this.data)
            ? this.data.filter((row): row is Record<string, unknown> =>
                  Boolean(row && typeof row === "object" && !Array.isArray(row)),
              )
            : [this.data];
        const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
        const quote = (value: unknown) => {
            const text = String(value ?? "");
            return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
        };
        return [
            columns.map(quote).join(","),
            ...rows.map((row) => columns.map((column) => quote(row[column])).join(",")),
        ].join("\n");
    }

    private export(): void {
        if (this.disabled || this.loading) return;
        const content = this.serialize();
        const extension = this.format === "json" ? "json" : "csv";
        const filename = this.filename.endsWith(`.${extension}`)
            ? this.filename
            : `${this.filename}.${extension}`;
        this.dispatchDetail("aui-export", {
            data: this.data,
            format: this.format,
            filename,
            content,
        });
        if (typeof document !== "undefined" && typeof URL !== "undefined") {
            try {
                const url = URL.createObjectURL(
                    new Blob([content], {
                        type: this.format === "json" ? "application/json" : "text/csv",
                    }),
                );
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = filename;
                anchor.click();
                URL.revokeObjectURL(url);
            } catch {
                /* Host can consume the aui-export event when downloads are unavailable. */
            }
        }
    }

    render() {
        return html`<button
            type="button"
            ?disabled=${this.disabled || this.loading}
            @click=${this.export}
            aria-busy=${this.loading ? "true" : "false"}
        >
            ${this.loading ? "..." : this.label}
        </button>`;
    }
}

export class AdminBulkActionsToolbarElement extends AdminElement {
    static properties = {
        selected: { type: Number },
        actions: { attribute: false },
        loading: { type: Boolean, reflect: true },
        clearLabel: { type: String, attribute: "clear-label" },
    };
    static styles = css`
        :host {
            display: block;
            min-width: 0;
        }
        .toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            padding: 10px 12px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-surface);
        }
        .summary {
            margin-right: auto;
            color: var(--aui-text-secondary);
            font: 700 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .summary strong {
            color: var(--aui-text-primary);
        }
        button {
            min-height: 32px;
            padding: 7px 10px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-control-bg);
            color: var(--aui-text);
            cursor: pointer;
            font: 700 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        button:hover:not(:disabled),
        button:focus-visible {
            border-color: var(--aui-focus);
            outline: none;
            box-shadow: var(--aui-focus-ring);
        }
        button[data-danger="true"] {
            color: var(--aui-danger);
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.45;
        }
        @media (max-width: 520px) {
            .summary {
                width: 100%;
                margin-right: 0;
            }
        }
    `;
    selected = 0;
    actions: AdminBulkAction[] = [];
    loading = false;
    clearLabel = "CLEAR SELECTION";

    private action(action: AdminBulkAction): void {
        if (this.loading || action.disabled) return;
        this.dispatchDetail("aui-bulk-action", { id: action.id, action, selected: this.selected });
    }

    private clear(): void {
        this.dispatchDetail("aui-bulk-clear", { selected: this.selected });
    }

    render() {
        return html`<div class="toolbar" role="toolbar" aria-label="Bulk actions">
            <span class="summary"><strong>${this.selected}</strong> SELECTED</span
            >${this.actions.map((action) => html`<button type="button" data-danger=${action.danger ? "true" : "false"} ?disabled=${this.loading || !this.selected || action.disabled} @click=${() => this.action(action)}>${action.label}</button>`)}<button
                type="button"
                ?disabled=${this.loading || !this.selected}
                @click=${this.clear}
            >
                ${this.clearLabel}</button
            ><slot></slot>
        </div>`;
    }
}
