/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement, deepActiveElement, nextUid } from "./base";
import { registerOverlay, unregisterOverlay } from "./overlay-stack";

export type AdminUploadStatus = "pending" | "uploading" | "success" | "error";

export interface AdminUploadItem {
    id: string;
    name: string;
    size?: number;
    type?: string;
    status?: AdminUploadStatus;
    progress?: number;
    url?: string;
    error?: string;
    file?: File;
}

function formatFileSize(size = 0): string {
    if (!size) return "0 B";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function statusLabel(status: AdminUploadStatus): string {
    return {
        pending: "QUEUED",
        uploading: "UPLOADING",
        success: "READY",
        error: "FAILED",
    }[status];
}

export class AdminUploadListElement extends AdminElement {
    static properties = {
        files: { attribute: false },
        removable: { type: Boolean, reflect: true },
        retryable: { type: Boolean, reflect: true },
        previewable: { type: Boolean, reflect: true },
        compact: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        emptyLabel: { type: String, attribute: "empty-label" },
    };

    static styles = css`
        :host {
            display: block;
        }
        .list {
            display: grid;
            gap: 6px;
        }
        .empty {
            padding: 18px 12px;
            border: 1px dashed var(--aui-border-hover);
            background: var(--aui-bg);
            color: var(--aui-text-muted);
            text-align: center;
            font: 11px/1.4 var(--aui-font-mono);
        }
        .item {
            display: grid;
            grid-template-columns: 30px minmax(0, 1fr) auto;
            gap: 10px;
            align-items: center;
            min-width: 0;
            padding: 10px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
        }
        :host([compact]) .item {
            padding: 7px 8px;
        }
        .icon {
            display: grid;
            width: 30px;
            height: 30px;
            place-items: center;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-header);
            color: var(--aui-text-secondary);
            font: 10px/1 var(--aui-font-mono);
        }
        .body {
            min-width: 0;
        }
        .name {
            overflow: hidden;
            color: var(--aui-text-primary);
            text-overflow: ellipsis;
            white-space: nowrap;
            font: 700 11px/1.25 var(--aui-font-mono);
        }
        .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
            color: var(--aui-text-muted);
            font: 10px/1.2 var(--aui-font-mono);
        }
        .status[data-status="success"] {
            color: var(--aui-success);
        }
        .status[data-status="error"] {
            color: var(--aui-danger);
        }
        .status[data-status="uploading"] {
            color: var(--aui-info);
        }
        .error {
            margin-top: 4px;
            color: var(--aui-danger);
            font: 10px/1.3 var(--aui-font-mono);
        }
        progress {
            display: block;
            width: 100%;
            height: 4px;
            margin-top: 7px;
            accent-color: var(--aui-primary);
        }
        .actions {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        button {
            min-height: 26px;
            padding: 4px 7px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-control-bg);
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        button:hover:not(:disabled),
        button:focus-visible {
            border-color: var(--aui-border-hover);
            color: var(--aui-text-primary);
        }
        button:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.35;
        }
        @media (max-width: 520px) {
            .item {
                grid-template-columns: 28px minmax(0, 1fr);
            }
            .actions {
                grid-column: 2;
            }
        }
    `;

    files: AdminUploadItem[] = [];
    removable = true;
    retryable = true;
    previewable = true;
    compact = false;
    disabled = false;
    emptyLabel = "No files selected";

    setFiles(files: File[]): AdminUploadItem[] {
        const next = files.map((file) => ({
            id: nextUid("upload"),
            name: file.name,
            size: file.size,
            type: file.type,
            status: "pending" as const,
            file,
        }));
        this.files = next;
        this.dispatchDetail("aui-upload-change", { files: next });
        return next;
    }

    removeFile(id: string): void {
        if (this.disabled) return;
        const file = this.files.find((item) => item.id === id);
        if (!file) return;
        this.files = this.files.filter((item) => item.id !== id);
        this.dispatchDetail("aui-upload-remove", { id, file });
        this.dispatchDetail("aui-upload-change", { files: this.files });
    }

    retry(id: string): void {
        if (this.disabled) return;
        const file = this.files.find((item) => item.id === id);
        if (file) this.dispatchDetail("aui-upload-retry", { id, file });
    }

    preview(id: string): void {
        const file = this.files.find((item) => item.id === id);
        if (file) this.dispatchDetail("aui-upload-preview", { id, file });
    }

    render() {
        return html`<section class="list" role="list" aria-label="Uploaded files">
            ${
                this.files.length
                    ? this.files.map((file) => {
                          const status = file.status ?? "pending";
                          const progress = Math.max(0, Math.min(100, file.progress ?? 0));
                          return html`<article class="item" role="listitem">
                              <span class="icon" aria-hidden="true"
                                  >${file.type?.split("/").pop()?.slice(0, 4) || "FILE"}</span
                              >
                              <div class="body">
                                  <div class="name" title=${file.name}>${file.name}</div>
                                  <div class="meta">
                                      <span>${formatFileSize(file.size)}</span>
                                      <span class="status" data-status=${status}
                                          >${statusLabel(status)}</span
                                      >
                                  </div>
                                  ${
                                      status === "uploading"
                                          ? html`<progress
                                                max="100"
                                                .value=${progress}
                                                aria-label=${`Uploading ${file.name}`}
                                            ></progress>`
                                          : null
                                  }
                                  ${file.error ? html`<div class="error" role="alert">${file.error}</div>` : null}
                              </div>
                              <div class="actions">
                                  ${
                                      this.previewable
                                          ? html`<button
                                                type="button"
                                                @click=${() => this.preview(file.id)}
                                            >
                                                Preview
                                            </button>`
                                          : null
                                  }
                                  ${
                                      this.retryable && status === "error"
                                          ? html`<button
                                                type="button"
                                                @click=${() => this.retry(file.id)}
                                            >
                                                Retry
                                            </button>`
                                          : null
                                  }
                                  ${
                                      this.removable
                                          ? html`<button
                                                type="button"
                                                ?disabled=${this.disabled}
                                                aria-label=${`Remove ${file.name}`}
                                                @click=${() => this.removeFile(file.id)}
                                            >
                                                Remove
                                            </button>`
                                          : null
                                  }
                              </div>
                          </article>`;
                      })
                    : html`<div class="empty" role="status">${this.emptyLabel}</div>`
            }
        </section>`;
    }
}

export class AdminFilePreviewElement extends AdminElement {
    static properties = {
        file: { attribute: false },
        open: { type: Boolean, reflect: true },
        title: { type: String },
        closeLabel: { type: String, attribute: "close-label" },
        downloadLabel: { type: String, attribute: "download-label" },
        downloadable: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: contents;
        }
        dialog {
            width: min(720px, calc(100vw - 32px));
            max-height: 88vh;
            padding: 0;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-lg);
            background: var(--aui-surface);
            color: var(--aui-text);
            box-shadow: var(--aui-shadow-lg);
        }
        dialog::backdrop {
            background: var(--aui-overlay);
        }
        .panel {
            display: flex;
            max-height: 88vh;
            flex-direction: column;
        }
        .header,
        .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 16px;
            border-bottom: 1px solid var(--aui-border);
            background: var(--aui-header);
        }
        .footer {
            justify-content: flex-end;
            border-top: 1px solid var(--aui-border);
            border-bottom: 0;
        }
        h2 {
            overflow: hidden;
            margin: 0;
            color: var(--aui-text-primary);
            text-overflow: ellipsis;
            white-space: nowrap;
            font: 700 13px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .body {
            display: grid;
            min-height: 180px;
            place-items: center;
            overflow: auto;
            padding: 18px;
            background: var(--aui-bg);
        }
        .image {
            display: block;
            max-width: 100%;
            max-height: 56vh;
            object-fit: contain;
        }
        .document {
            width: min(100%, 620px);
            height: 56vh;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        .pdf-preview {
            display: grid;
            gap: 8px;
            width: min(100%, 620px);
        }
        .pdf-preview .file-name,
        .pdf-preview .file-meta {
            text-align: left;
        }
        .details {
            display: grid;
            gap: 8px;
            width: min(100%, 380px);
            padding: 18px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
            text-align: center;
        }
        .file-name {
            color: var(--aui-text-primary);
            font: 700 12px/1.3 var(--aui-font-mono);
            overflow-wrap: anywhere;
        }
        .file-meta,
        .unsupported {
            color: var(--aui-text-secondary);
            font: 11px/1.4 var(--aui-font-mono);
        }
        button,
        a {
            min-height: 28px;
            padding: 5px 9px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-control-bg);
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 10px/1 var(--aui-font-mono);
            text-decoration: none;
            text-transform: uppercase;
        }
        button:hover,
        button:focus-visible,
        a:hover,
        a:focus-visible {
            border-color: var(--aui-border-hover);
            color: var(--aui-text-primary);
        }
        button:focus-visible,
        a:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
        .close {
            min-width: 28px;
            padding: 4px;
            font-size: 14px;
        }
    `;

    file: AdminUploadItem | null = null;
    open = false;
    title = "";
    closeLabel = "Close preview";
    downloadLabel = "Download";
    downloadable = true;

    private dialogId = nextUid("file-preview");
    private objectUrl = "";
    private lastFocused: HTMLElement | null = null;

    protected firstUpdated(): void {
        this.syncObjectUrl();
        this.syncDialog();
    }

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("file")) this.syncObjectUrl();
        if (changed.has("open")) this.syncDialog();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.revokeObjectUrl();
        unregisterOverlay(this);
    }

    private revokeObjectUrl(): void {
        if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = "";
    }

    private syncObjectUrl(): void {
        this.revokeObjectUrl();
        const file = this.file?.file;
        if (!file || this.file?.url || typeof URL.createObjectURL !== "function") return;
        this.objectUrl = URL.createObjectURL(file);
    }

    private fileUrl(): string {
        return this.file?.url || this.objectUrl;
    }

    private syncDialog(): void {
        const dialog = this.renderRoot.querySelector("dialog");
        if (!dialog) return;
        if (this.open && !dialog.open) {
            this.lastFocused = deepActiveElement(document) as HTMLElement | null;
            if (typeof dialog.showModal === "function") dialog.showModal();
            else dialog.setAttribute("open", "");
            registerOverlay(this, () => this.close());
        }
        if (!this.open && dialog.open) {
            if (typeof dialog.close === "function") dialog.close();
            else dialog.removeAttribute("open");
            unregisterOverlay(this);
            this.lastFocused?.focus();
            this.lastFocused = null;
        }
    }

    private close(): void {
        if (!this.open) return;
        this.open = false;
        this.dispatchDetail("aui-file-preview-close", { file: this.file });
        this.dispatchDetail("aui-open-change", { open: false });
    }

    private download(): void {
        if (this.file) this.dispatchDetail("aui-file-download", { file: this.file });
    }

    private handleCancel(event: Event): void {
        event.preventDefault();
        this.close();
    }

    private handleClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.close();
    }

    private renderBody() {
        if (!this.file) return html`<div class="details" role="status">No file selected</div>`;
        const url = this.fileUrl();
        if (url && this.file.type?.startsWith("image/"))
            return html`<img class="image" src=${url} alt=${this.file.name} />`;
        if (url && this.file.type === "application/pdf")
            return html`<div class="pdf-preview">
                <div class="file-name">${this.file.name}</div>
                <iframe class="document" title=${this.file.name} src=${url}></iframe>
                <div class="file-meta">${this.file.type} · ${formatFileSize(this.file.size)}</div>
            </div>`;
        return html`<div class="details" role="status">
            <div class="file-name">${this.file.name}</div>
            <div class="file-meta">
                ${this.file.type || "Unknown type"} · ${formatFileSize(this.file.size)}
            </div>
            <div class="unsupported">Preview is unavailable for this file type.</div>
            ${url ? html`<a href=${url} target="_blank" rel="noreferrer">Open file</a>` : null}
        </div>`;
    }

    render() {
        const heading = this.title || this.file?.name || "File Preview";
        return html`<dialog
            aria-labelledby=${this.dialogId}
            @cancel=${this.handleCancel}
            @click=${this.handleClick}
        >
            <div class="panel">
                <header class="header">
                    <h2 id=${this.dialogId}>${heading}</h2>
                    <button
                        class="close"
                        type="button"
                        aria-label=${this.closeLabel}
                        @click=${this.close}
                    >
                        ×
                    </button>
                </header>
                <div class="body">${this.renderBody()}</div>
                <footer class="footer">
                    ${this.downloadable && this.file?.url ? html`<button type="button" @click=${this.download}>${this.downloadLabel}</button>` : null}
                    <button type="button" @click=${this.close}>${this.closeLabel}</button>
                </footer>
            </div>
        </dialog>`;
    }
}
