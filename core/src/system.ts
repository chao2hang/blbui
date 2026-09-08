/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement } from "./base";
import { getAdminVirtualRange } from "./virtual";

export class AdminContainerElement extends AdminElement {
    static properties = {
        maxWidth: { type: String, attribute: "max-width" },
        centered: { type: Boolean, reflect: true },
    };
    static styles = css`
        :host {
            display: block;
        }
        .container {
            width: 100%;
            max-width: var(--aui-container-width, 1280px);
            margin-inline: auto;
        }
        :host(:not([centered])) .container {
            max-width: none;
        }
    `;
    maxWidth = "1280px";
    centered = true;
    render() {
        return html`<div class="container" style=${`--aui-container-width:${this.maxWidth}`}>
            <slot></slot>
        </div>`;
    }
}

export class AdminStackElement extends AdminElement {
    static properties = {
        direction: { type: String, reflect: true },
        gap: { type: String },
        align: { type: String },
        justify: { type: String },
    };
    static styles = css`
        :host {
            display: block;
        }
        .stack {
            display: flex;
            gap: var(--aui-stack-gap, 16px);
            align-items: var(--aui-stack-align, stretch);
            justify-content: var(--aui-stack-justify, flex-start);
        }
        :host([direction="vertical"]) .stack {
            flex-direction: column;
        }
        :host([direction="horizontal"]) .stack {
            flex-direction: row;
            flex-wrap: wrap;
        }
    `;
    direction = "vertical";
    gap = "16px";
    align = "stretch";
    justify = "flex-start";
    render() {
        return html`<div
            class="stack"
            style=${`--aui-stack-gap:${this.gap};--aui-stack-align:${this.align};--aui-stack-justify:${this.justify}`}
        >
            <slot></slot>
        </div>`;
    }
}

export class AdminGridElement extends AdminElement {
    static properties = {
        columns: { type: Number },
        gap: { type: String },
        minWidth: { type: String, attribute: "min-width" },
    };
    static styles = css`
        :host {
            display: block;
            min-width: 0;
            max-width: 100%;
            container-type: inline-size;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(
                var(--aui-grid-columns, 2),
                minmax(var(--aui-grid-min-width, 0px), 1fr)
            );
            gap: var(--aui-grid-gap, 16px);
        }
        ::slotted(*) {
            min-width: 0;
        }
        @container (max-width: 720px) {
            .grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
        @container (max-width: 460px) {
            .grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    columns = 2;
    gap = "16px";
    minWidth = "220px";
    render() {
        return html`<div
            class="grid"
            style=${`--aui-grid-columns:${this.columns};--aui-grid-gap:${this.gap};--aui-grid-min-width:${this.minWidth}`}
        >
            <slot></slot>
        </div>`;
    }
}

export class AdminSplitterElement extends AdminElement {
    static properties = {
        direction: { type: String, reflect: true },
        initial: { type: Number },
        min: { type: Number },
    };
    static styles = css`
        :host {
            display: block;
            min-height: 100px;
        }
        .splitter {
            height: 100%;
            min-height: inherit;
            display: flex;
        }
        :host([direction="vertical"]) .splitter {
            flex-direction: column;
        }
        .panel {
            min-width: 0;
            min-height: 0;
            overflow: auto;
            flex: 1;
        }
        .handle {
            flex: 0 0 1px;
            background: var(--aui-border);
        }
        :host([direction="horizontal"]) .handle {
            width: 1px;
            cursor: col-resize;
        }
        :host([direction="vertical"]) .handle {
            height: 1px;
            cursor: row-resize;
        }
    `;
    direction = "horizontal";
    initial = 50;
    min = 20;
    private percent: number | null = null;
    private dragging = false;
    private clampPercent(value: number): number {
        const floor = Math.min(this.min, 49);
        return Math.max(floor, Math.min(100 - floor, value));
    }
    private setPercent(value: number, emit = false): void {
        const next = this.clampPercent(Math.round(value));
        if (next === this.percent) return;
        this.percent = next;
        this.requestUpdate();
        if (emit) this.dispatchDetail("aui-splitter-change", { percent: next });
    }
    private handlePointerDown(event: PointerEvent): void {
        this.dragging = true;
        event.preventDefault();
    }
    private readonly handlePointerMove = (event: PointerEvent): void => {
        if (!this.dragging) return;
        const splitter = this.shadowRoot?.querySelector<HTMLElement>(".splitter");
        if (!splitter) return;
        const rect = splitter.getBoundingClientRect();
        if (!rect.width && !rect.height) return;
        const value =
            this.direction === "vertical"
                ? ((event.clientY - rect.top) / rect.height) * 100
                : ((event.clientX - rect.left) / rect.width) * 100;
        this.setPercent(value, true);
    };
    private readonly handlePointerUp = (): void => {
        this.dragging = false;
    };
    private handleKeydown(event: KeyboardEvent): void {
        const step = event.shiftKey ? 10 : 2;
        const current = this.percent ?? this.initial;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            this.setPercent(current - step, true);
            event.preventDefault();
        } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            this.setPercent(current + step, true);
            event.preventDefault();
        }
    }
    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener("pointermove", this.handlePointerMove);
        window.addEventListener("pointerup", this.handlePointerUp);
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener("pointermove", this.handlePointerMove);
        window.removeEventListener("pointerup", this.handlePointerUp);
    }
    render() {
        const percent = this.percent ?? this.initial;
        return html`<div class="splitter">
            <div class="panel" style=${`flex: 0 0 ${this.clampPercent(percent)}%;`}>
                <slot name="before"></slot>
            </div>
            <div
                class="handle"
                role="separator"
                tabindex="0"
                aria-orientation=${this.direction === "vertical" ? "horizontal" : "vertical"}
                aria-valuenow=${this.clampPercent(percent)}
                aria-valuemin=${Math.min(this.min, 49)}
                aria-valuemax=${100 - Math.min(this.min, 49)}
                @pointerdown=${this.handlePointerDown}
                @keydown=${this.handleKeydown}
            ></div>
            <div class="panel"><slot name="after"></slot></div>
        </div>`;
    }
}

export class AdminJsonViewerElement extends AdminElement {
    static properties = {
        value: { attribute: false },
        expanded: { type: Boolean, reflect: true },
        title: { type: String },
    };
    static styles = css`
        :host {
            display: block;
        }
        .viewer {
            border: 1px solid var(--aui-border);
            background: var(--aui-bg);
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 9px 11px;
            border-bottom: 1px solid var(--aui-border);
            color: var(--aui-text-secondary);
            font: 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        button {
            border: 0;
            background: transparent;
            color: var(--aui-text-muted);
            cursor: pointer;
            font: 10px/1 var(--aui-font-mono);
        }
        pre {
            max-height: 360px;
            overflow: auto;
            margin: 0;
            padding: 13px;
            color: var(--aui-json-text);
            font: 11px/1.55 var(--aui-font-mono);
            white-space: pre-wrap;
        }
        :host(:not([expanded])) pre {
            max-height: 110px;
            overflow: hidden;
        }
    `;
    value: unknown = {};
    expanded = false;
    title = "JSON";
    private text(): string {
        if (typeof this.value === "string") return this.value;
        try {
            return JSON.stringify(this.value, null, 2);
        } catch {
            return "[UNSERIALIZABLE]";
        }
    }
    render() {
        return html`<section class="viewer">
            <header class="header">
                <span>${this.title}</span
                ><button
                    type="button"
                    @click=${() => {
                        this.expanded = !this.expanded;
                    }}
                >
                    ${this.expanded ? "COLLAPSE" : "EXPAND"}
                </button>
            </header>
            <pre><slot>${this.text()}</slot></pre>
        </section>`;
    }
}

export interface AdminLogEntry {
    time?: string;
    level?: string;
    message: string;
    meta?: string;
}

export class AdminLogViewerElement extends AdminElement {
    static properties = { entries: { attribute: false }, follow: { type: Boolean, reflect: true } };
    static styles = css`
        :host {
            display: block;
        }
        .logs {
            max-height: 360px;
            overflow: auto;
            padding: 10px;
            border: 1px solid var(--aui-border);
            background: var(--aui-bg);
            font: 11px/1.5 var(--aui-font-mono);
        }
        .entry {
            display: grid;
            grid-template-columns: 90px 60px minmax(0, 1fr);
            gap: 10px;
            padding: 4px 0;
            border-bottom: 1px solid var(--aui-grid-line-strong);
        }
        .time {
            color: var(--aui-text-muted);
        }
        .level {
            color: var(--aui-info);
            text-transform: uppercase;
        }
        .entry[data-level="error"] .level {
            color: var(--aui-danger);
        }
        .entry[data-level="warn"] .level {
            color: var(--aui-warning);
        }
        .message {
            min-width: 0;
            overflow-wrap: anywhere;
            color: var(--aui-text-secondary);
        }
        .meta {
            color: var(--aui-text-muted);
        }
        @media (max-width: 640px) {
            .entry {
                grid-template-columns: 70px 45px minmax(0, 1fr);
                gap: 5px;
            }
        }
    `;
    entries: AdminLogEntry[] = [];
    follow = false;
    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("entries") && this.follow) {
            const logs = this.shadowRoot?.querySelector<HTMLElement>(".logs");
            if (logs) logs.scrollTop = logs.scrollHeight;
        }
    }
    render() {
        return html`<div class="logs" role="log" aria-live="polite">
            ${this.entries.map(
                (entry) =>
                    html`<div class="entry" data-level=${entry.level ?? "info"}>
                        <span class="time">${entry.time ?? "—"}</span
                        ><span class="level">${entry.level ?? "INFO"}</span
                        ><span class="message"
                            >${entry.message}${
                                entry.meta ? html` <span class="meta">${entry.meta}</span>` : null
                            }</span
                        >
                    </div>`,
            )}<slot></slot>
        </div>`;
    }
}

export type AdminDataGridSortDirection = "asc" | "desc";

export interface AdminDataGridFilterOption {
    value: string;
    label: string;
}

export interface AdminDataGridColumn {
    key: string;
    label?: string;
    /** `title` is kept as a compatibility alias for the first DataGrid API. */
    title?: string;
    align?: "left" | "right" | "center";
    sortable?: boolean;
    filterable?: boolean;
    filterOptions?: AdminDataGridFilterOption[];
    width?: string;
    hidden?: boolean;
}

export interface AdminDataGridBatchAction {
    id: string;
    label: string;
    danger?: boolean;
    disabled?: boolean;
}

export type AdminDataGridRow = Record<string, unknown> & { id?: string | number };

export class AdminDataGridElement extends AdminElement {
    static properties = {
        columns: { attribute: false },
        rows: { attribute: false },
        loading: { type: Boolean, reflect: true },
        error: { type: Boolean, reflect: true },
        selectable: { type: Boolean, reflect: true },
        mobileCards: { type: Boolean, attribute: "mobile-cards", reflect: true },
        virtual: { type: Boolean, reflect: true },
        serverSide: { type: Boolean, attribute: "server-side", reflect: true },
        emptyLabel: { type: String, attribute: "empty-label" },
        loadingLabel: { type: String, attribute: "loading-label" },
        errorLabel: { type: String, attribute: "error-label" },
        sortKey: { type: String, attribute: "sort-key" },
        sortDirection: { type: String, attribute: "sort-direction" },
        selectedKeys: { attribute: false },
        filters: { attribute: false },
        batchActions: { attribute: false },
        page: { type: Number, reflect: true },
        pageSize: { type: Number, attribute: "page-size" },
        total: { type: Number },
        pageSizeOptions: { attribute: false },
        rowHeight: { type: Number, attribute: "row-height" },
        virtualOverscan: { type: Number, attribute: "virtual-overscan" },
        rowKey: { type: String, attribute: "row-key" },
    };
    static styles = css`
        :host {
            display: block;
            min-width: 0;
        }
        .frame {
            overflow: hidden;
            border: 1px solid var(--aui-border);
            background: var(--aui-bg);
        }
        .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            min-height: 40px;
            padding: 6px 10px;
            border-bottom: 1px solid var(--aui-border);
            background: var(--aui-surface-subtle);
            color: var(--aui-text-muted);
            font: 10px/1.2 var(--aui-font-mono);
        }
        .selection {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .batch-actions,
        .page-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .batch-actions button,
        .page-actions button,
        .page-actions select {
            min-height: 28px;
            padding: 4px 8px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 10px/1.1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .page-actions select {
            padding-right: 30px;
        }
        .batch-actions button:hover:not(:disabled),
        .page-actions button:hover:not(:disabled),
        .page-actions select:hover {
            border-color: var(--aui-border-hover);
            color: var(--aui-text-primary);
        }
        .batch-actions .danger {
            border-color: var(--aui-danger-border);
            color: var(--aui-danger);
        }
        button:disabled,
        select:disabled {
            cursor: not-allowed;
            opacity: 0.35;
        }
        .scroll {
            overflow-x: auto;
        }
        .scroll[data-virtual="true"] {
            max-height: var(--aui-data-grid-virtual-height, 420px);
            overflow-y: auto;
        }
        table {
            width: 100%;
            min-width: 640px;
            border-collapse: collapse;
            color: var(--aui-text);
            font: 12px/1.4 var(--aui-font-mono);
            white-space: nowrap;
        }
        th {
            padding: 9px 12px;
            border-bottom: 1px solid var(--aui-border);
            background: var(--aui-header);
            color: var(--aui-text-secondary);
            font-weight: 500;
            text-align: left;
            text-transform: uppercase;
            vertical-align: top;
        }
        th[aria-sort="ascending"],
        th[aria-sort="descending"] {
            color: var(--aui-text-primary);
        }
        .heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .sort {
            min-width: 0;
            padding: 0;
            border: 0;
            background: transparent;
            color: inherit;
            cursor: pointer;
            font: inherit;
            text-align: left;
            text-transform: inherit;
        }
        .sort:not(:disabled):hover {
            color: var(--aui-text-primary);
        }
        .filter {
            box-sizing: border-box;
            width: 100%;
            min-height: 26px;
            margin-top: 6px;
            padding: 4px 30px 4px 6px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            outline: 0;
            background: var(--aui-control-bg);
            color: var(--aui-text);
            font: 10px/1.2 var(--aui-font-mono);
        }
        select {
            appearance: none;
            -webkit-appearance: none;
            background-image:
                linear-gradient(45deg, transparent 50%, var(--aui-text-muted) 50%),
                linear-gradient(135deg, var(--aui-text-muted) 50%, transparent 50%);
            background-position:
                calc(100% - 11px) 50%,
                calc(100% - 7px) 50%;
            background-repeat: no-repeat;
            background-size: 4px 4px;
        }
        select::-ms-expand {
            display: none;
        }
        .filter:focus {
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        td {
            padding: 11px 12px;
            border-bottom: 1px solid var(--aui-border);
            color: var(--aui-text);
        }
        tr:hover td,
        tr[data-selected="true"] td {
            background: var(--aui-table-row-hover);
        }
        tr[data-selected="true"] td {
            color: var(--aui-text-primary);
        }
        .checkbox {
            width: 15px;
            height: 15px;
            margin: 0;
            accent-color: var(--aui-primary);
        }
        .state {
            min-height: var(--aui-table-state-min-height, 96px);
            display: grid;
            place-items: center;
            padding: var(--aui-table-state-padding, 16px);
            color: var(--aui-text-muted);
            text-align: center;
            font: 11px/1.3 var(--aui-font-mono);
        }
        .error-state {
            color: var(--aui-danger);
        }
        .cards {
            display: none;
            gap: 8px;
            padding: 8px;
        }
        .card {
            display: grid;
            gap: 8px;
            padding: 10px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        .card-header,
        .card-pair {
            display: flex;
            justify-content: space-between;
            gap: 12px;
        }
        .card-header {
            color: var(--aui-text-primary);
            font-weight: 700;
        }
        .card-pair {
            color: var(--aui-text-secondary);
            font-size: 11px;
        }
        .card-pair strong {
            max-width: 65%;
            overflow: hidden;
            color: var(--aui-text);
            font-weight: 400;
            text-align: right;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .pagination {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 7px 10px;
            border-top: 1px solid var(--aui-border);
            background: var(--aui-surface-subtle);
            color: var(--aui-text-muted);
            font: 10px/1.2 var(--aui-font-mono);
        }
        @media (max-width: 640px) {
            .toolbar,
            .pagination {
                align-items: flex-start;
                flex-direction: column;
            }
            :host([mobile-cards]) .scroll {
                display: none;
            }
            :host([mobile-cards]) .cards {
                display: grid;
            }
        }
    `;

    columns: AdminDataGridColumn[] = [];
    rows: AdminDataGridRow[] = [];
    loading = false;
    error = false;
    selectable = false;
    mobileCards = true;
    virtual = false;
    serverSide = false;
    emptyLabel = "NO DATA AVAILABLE";
    loadingLabel = "LOADING...";
    errorLabel = "FAILED TO LOAD DATA";
    sortKey = "";
    sortDirection: AdminDataGridSortDirection = "asc";
    selectedKeys: Array<string | number> = [];
    filters: Record<string, string> = {};
    batchActions: AdminDataGridBatchAction[] = [];
    page = 1;
    pageSize = 10;
    total = 0;
    pageSizeOptions = [10, 25, 50];
    rowHeight = 44;
    virtualOverscan = 4;
    rowKey = "id";

    private virtualScrollTop = 0;
    private readonly labelFor = (column: AdminDataGridColumn): string =>
        column.label ?? column.title ?? column.key;
    private readonly visibleColumns = (): AdminDataGridColumn[] =>
        this.columns.filter((column) => !column.hidden);
    private key(row: AdminDataGridRow, index: number): string | number {
        const candidate = row[this.rowKey];
        return typeof candidate === "string" || typeof candidate === "number"
            ? candidate
            : (row.id ?? index);
    }
    private valueFor(row: AdminDataGridRow, key: string): string {
        const value = row[key];
        return value === null || value === undefined || value === "" ? "—" : String(value);
    }
    private compare(left: unknown, right: unknown): number {
        if (typeof left === "number" && typeof right === "number") return left - right;
        return String(left ?? "").localeCompare(String(right ?? ""), undefined, {
            numeric: true,
            sensitivity: "base",
        });
    }
    private processedRows(): Array<{ row: AdminDataGridRow; index: number }> {
        let result = this.rows.map((row, index) => ({ row, index }));
        if (!this.serverSide) {
            result = result.filter(({ row }) =>
                Object.entries(this.filters).every(([key, value]) =>
                    this.valueFor(row, key).toLowerCase().includes(value.trim().toLowerCase()),
                ),
            );
            if (this.sortKey) {
                result.sort((left, right) => {
                    const order = this.compare(left.row[this.sortKey], right.row[this.sortKey]);
                    return this.sortDirection === "asc" ? order : -order;
                });
            }
        }
        if (this.serverSide || this.pageSize <= 0) return result;
        const start = Math.max(0, (this.page - 1) * this.pageSize);
        return result.slice(start, start + this.pageSize);
    }
    private totalPages(): number {
        const sourceTotal = this.serverSide ? this.total || this.rows.length : this.rows.length;
        return Math.max(1, this.pageSize > 0 ? Math.ceil(sourceTotal / this.pageSize) : 1);
    }
    private emitPageChange(): void {
        const detail = {
            page: this.page,
            pageSize: this.pageSize,
            total: this.serverSide ? this.total : this.rows.length,
        };
        this.dispatchDetail("aui-page-change", detail);
        this.dispatchDetail("aui-data-grid-page-change", detail);
    }
    private changePage(page: number): void {
        const next = Math.max(1, Math.min(this.totalPages(), page));
        if (next === this.page) return;
        this.page = next;
        this.emitPageChange();
        this.requestUpdate();
    }
    private changePageSize(event: Event): void {
        const next = Math.max(1, Number((event.target as HTMLSelectElement).value) || 10);
        if (next === this.pageSize) return;
        this.pageSize = next;
        this.page = 1;
        this.emitPageChange();
        this.requestUpdate();
    }
    private sort(column: AdminDataGridColumn): void {
        if (!column.sortable) return;
        const direction: AdminDataGridSortDirection =
            this.sortKey === column.key && this.sortDirection === "asc" ? "desc" : "asc";
        this.sortKey = column.key;
        this.sortDirection = direction;
        const detail = { key: column.key, direction };
        this.dispatchDetail("aui-sort-change", detail);
        this.dispatchDetail("aui-data-grid-sort-change", detail);
        this.requestUpdate();
    }
    private changeFilter(key: string, event: Event): void {
        const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
        this.filters = { ...this.filters, [key]: value };
        if (!value) {
            const next = { ...this.filters };
            delete next[key];
            this.filters = next;
        }
        this.page = 1;
        const detail = { filters: this.filters, key, value };
        this.dispatchDetail("aui-filter-change", detail);
        this.dispatchDetail("aui-data-grid-filter-change", detail);
        this.requestUpdate();
    }
    private toggleRow(key: string | number): void {
        this.selectedKeys = this.selectedKeys.includes(key)
            ? this.selectedKeys.filter((item) => item !== key)
            : [...this.selectedKeys, key];
        this.dispatchDetail("aui-selection-change", { keys: this.selectedKeys });
        this.requestUpdate();
    }
    private toggleAll(event: Event, rows: Array<{ row: AdminDataGridRow; index: number }>): void {
        const checked = (event.target as HTMLInputElement).checked;
        const keys = rows.map(({ row, index }) => this.key(row, index));
        this.selectedKeys = checked
            ? [...new Set([...this.selectedKeys, ...keys])]
            : this.selectedKeys.filter((key) => !keys.includes(key));
        this.dispatchDetail("aui-selection-change", { keys: this.selectedKeys });
        this.requestUpdate();
    }
    private batchAction(action: AdminDataGridBatchAction): void {
        if (action.disabled || !this.selectedKeys.length) return;
        const selectedRows = this.rows.filter((row, index) =>
            this.selectedKeys.includes(this.key(row, index)),
        );
        this.dispatchDetail("aui-batch-action", {
            id: action.id,
            keys: this.selectedKeys,
            rows: selectedRows,
        });
    }
    private onScroll(event: Event): void {
        if (!this.virtual) return;
        this.virtualScrollTop = (event.currentTarget as HTMLElement).scrollTop;
        this.requestUpdate();
    }
    private renderFilter(column: AdminDataGridColumn): unknown {
        if (!column.filterable) return null;
        if (column.filterOptions?.length) {
            return html`<select
                class="filter"
                aria-label=${`Filter ${this.labelFor(column)}`}
                .value=${this.filters[column.key] ?? ""}
                @change=${(event: Event) => this.changeFilter(column.key, event)}
            >
                <option value="">ALL</option>
                ${column.filterOptions.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
            </select>`;
        }
        return html`<input
            class="filter"
            type="search"
            aria-label=${`Filter ${this.labelFor(column)}`}
            placeholder="FILTER"
            .value=${this.filters[column.key] ?? ""}
            @input=${(event: Event) => this.changeFilter(column.key, event)}
        />`;
    }
    private renderHeader(
        columns: AdminDataGridColumn[],
        rows: Array<{ row: AdminDataGridRow; index: number }>,
    ): unknown {
        const allSelected =
            rows.length > 0 &&
            rows.every(({ row, index }) => this.selectedKeys.includes(this.key(row, index)));
        return html`<thead>
            <tr>
                ${
                    this.selectable
                        ? html`<th aria-label="Selection">
                              <input
                                  class="checkbox"
                                  type="checkbox"
                                  aria-label="Select visible rows"
                                  .checked=${allSelected}
                                  @change=${(event: Event) => this.toggleAll(event, rows)}
                              />
                          </th>`
                        : null
                }
                ${columns.map((column) => {
                    const sort = this.sortKey === column.key ? this.sortDirection : undefined;
                    return html`<th
                        style=${column.width ? `width:${column.width};text-align:${column.align ?? "left"}` : `text-align:${column.align ?? "left"}`}
                        aria-sort=${sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none"}
                    >
                        <div class="heading">
                            ${
                                column.sortable
                                    ? html`<button
                                          class="sort"
                                          type="button"
                                          @click=${() => this.sort(column)}
                                      >
                                          ${this.labelFor(column)}
                                          ${sort === "asc" ? "↑" : sort === "desc" ? "↓" : "↕"}
                                      </button>`
                                    : html`<span>${this.labelFor(column)}</span>`
                            }
                        </div>
                        ${this.renderFilter(column)}
                    </th>`;
                })}
            </tr>
        </thead>`;
    }
    private renderRow(
        row: AdminDataGridRow,
        index: number,
        columns: AdminDataGridColumn[],
    ): unknown {
        const key = this.key(row, index);
        return html`<tr
            data-row-key=${String(key)}
            data-selected=${this.selectedKeys.includes(key) ? "true" : "false"}
        >
            ${
                this.selectable
                    ? html`<td>
                          <input
                              class="checkbox"
                              type="checkbox"
                              aria-label=${`Select row ${key}`}
                              .checked=${this.selectedKeys.includes(key)}
                              @change=${() => this.toggleRow(key)}
                          />
                      </td>`
                    : null
            }
            ${columns.map(
                (column) => html`<td style=${`text-align:${column.align ?? "left"}`}>
                    ${this.valueFor(row, column.key)}
                </td>`,
            )}
        </tr>`;
    }
    private renderTable(
        rows: Array<{ row: AdminDataGridRow; index: number }>,
        columns: AdminDataGridColumn[],
    ): unknown {
        const rowCount = rows.length;
        const span = columns.length + (this.selectable ? 1 : 0);
        let renderRows = rows;
        let top = 0;
        let bottom = 0;
        if (this.virtual && rowCount) {
            const range = getAdminVirtualRange(
                rowCount,
                this.virtualScrollTop,
                420,
                this.rowHeight,
                this.virtualOverscan,
            );
            renderRows = rows.slice(range.start, range.end);
            top = range.top;
            bottom = range.bottom;
        }
        return html`<table aria-rowcount=${this.serverSide && this.total ? this.total : rowCount}>
            ${this.renderHeader(columns, rows)}
            <tbody>
                ${
                    top
                        ? html`<tr aria-hidden="true">
                              <td
                                  colspan=${span}
                                  style=${`height:${top}px;padding:0;border:0`}
                              ></td>
                          </tr>`
                        : null
                }
                ${renderRows.map(({ row, index }) => this.renderRow(row, index, columns))}
                ${
                    bottom
                        ? html`<tr aria-hidden="true">
                              <td
                                  colspan=${span}
                                  style=${`height:${bottom}px;padding:0;border:0`}
                              ></td>
                          </tr>`
                        : null
                }
            </tbody>
        </table>`;
    }
    private renderCards(
        rows: Array<{ row: AdminDataGridRow; index: number }>,
        columns: AdminDataGridColumn[],
    ): unknown {
        return html`<div class="cards">
            ${rows.map(({ row, index }) => {
                const key = this.key(row, index);
                return html`<article
                    class="card"
                    data-row-key=${String(key)}
                    data-selected=${this.selectedKeys.includes(key) ? "true" : "false"}
                >
                    <div class="card-header">
                        <span>${this.valueFor(row, columns[0]?.key ?? this.rowKey)}</span>
                        ${
                            this.selectable
                                ? html`<input
                                      class="checkbox"
                                      type="checkbox"
                                      aria-label=${`Select row ${key}`}
                                      .checked=${this.selectedKeys.includes(key)}
                                      @change=${() => this.toggleRow(key)}
                                  />`
                                : null
                        }
                    </div>
                    ${columns.slice(1).map((column) => html`<div class="card-pair"><span>${this.labelFor(column)}</span><strong>${this.valueFor(row, column.key)}</strong></div>`)}
                </article>`;
            })}
        </div>`;
    }
    private renderPagination(): unknown {
        if (this.pageSize <= 0 || this.totalPages() <= 1) return null;
        const total = this.serverSide ? this.total : this.rows.length;
        return html`<nav class="pagination" aria-label="Data grid pagination">
            <span>PAGE ${this.page} / ${this.totalPages()} · ${total} ROWS</span>
            <div class="page-actions">
                <select
                    aria-label="Rows per page"
                    .value=${String(this.pageSize)}
                    @change=${this.changePageSize}
                >
                    ${this.pageSizeOptions.map((size) => html`<option value=${size}>${size} / PAGE</option>`)}
                </select>
                <button
                    type="button"
                    ?disabled=${this.page <= 1}
                    @click=${() => this.changePage(this.page - 1)}
                >
                    PREV
                </button>
                <button
                    type="button"
                    ?disabled=${this.page >= this.totalPages()}
                    @click=${() => this.changePage(this.page + 1)}
                >
                    NEXT
                </button>
            </div>
        </nav>`;
    }
    render() {
        const columns = this.visibleColumns();
        const rows = this.processedRows();
        const hasRows = rows.length > 0 || (this.serverSide && this.total > 0);
        const content = this.loading
            ? html`<div class="state" role="status" aria-live="polite">${this.loadingLabel}</div>`
            : this.error
              ? html`<div class="state error-state" role="alert">${this.errorLabel}</div>`
              : !hasRows
                ? html`<div class="state" role="status">${this.emptyLabel}</div>`
                : html`<div
                          class="scroll"
                          data-virtual=${this.virtual ? "true" : "false"}
                          @scroll=${this.onScroll}
                      >
                          ${this.renderTable(rows, columns)}
                      </div>
                      ${this.mobileCards && !this.virtual ? this.renderCards(rows, columns) : null}`;
        const selectedCount = this.selectedKeys.length;
        return html`<div class="frame" aria-busy=${this.loading ? "true" : "false"}>
            ${
                this.batchActions.length
                    ? html`<div class="toolbar">
                          <span class="selection">${selectedCount} SELECTED</span>
                          <div class="batch-actions">
                              ${this.batchActions.map(
                                  (action) => html`<button
                                      type="button"
                                      class=${action.danger ? "danger" : ""}
                                      ?disabled=${action.disabled || !selectedCount}
                                      @click=${() => this.batchAction(action)}
                                  >
                                      ${action.label}
                                  </button>`,
                              )}
                          </div>
                      </div>`
                    : null
            }
            ${content} ${this.renderPagination()}
            <slot></slot>
        </div>`;
    }
}

export interface AdminKanbanColumn {
    id: string;
    title: string;
    items: Array<{ id: string; title: string; meta?: string }>;
}

export class AdminKanbanElement extends AdminElement {
    static properties = { columns: { attribute: false } };
    static styles = css`
        :host {
            display: block;
            min-width: 0;
        }
        .board {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 12px;
            overflow-x: auto;
        }
        .column {
            min-height: 280px;
            padding: 10px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        .column-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 5px 2px 11px;
            border-bottom: 1px solid var(--aui-border);
            color: var(--aui-text-primary);
            font: 700 11px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .count {
            color: var(--aui-text-muted);
            font-weight: 400;
        }
        .card {
            margin-top: 9px;
            padding: 11px;
            border: 1px solid var(--aui-border);
            background: var(--aui-bg);
            cursor: grab;
        }
        .card:hover {
            border-color: var(--aui-border-hover);
        }
        .card-title {
            color: var(--aui-text);
            font: 11px/1.35 var(--aui-font-mono);
        }
        .meta {
            margin-top: 6px;
            color: var(--aui-text-muted);
            font: 10px/1.2 var(--aui-font-mono);
        }
    `;
    columns: AdminKanbanColumn[] = [];
    private move(itemId: string, columnId: string): void {
        this.dispatchDetail("aui-kanban-change", { itemId, columnId });
    }
    private cardKeydown(event: KeyboardEvent, itemId: string): void {
        if (!event.altKey) return;
        const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!direction) return;
        event.preventDefault();
        const fromIndex = this.columns.findIndex((column) =>
            column.items.some((item) => item.id === itemId),
        );
        const target = this.columns[fromIndex + direction];
        if (target) this.move(itemId, target.id);
    }
    render() {
        return html`<div class="board">
            ${this.columns.map(
                (column) =>
                    html`<section
                        class="column"
                        data-column=${column.id}
                        @dragover=${(event: DragEvent) => event.preventDefault()}
                        @drop=${(event: DragEvent) => {
                            const id = event.dataTransfer?.getData("text/plain");
                            if (id) this.move(id, column.id);
                        }}
                    >
                        <header class="column-header">
                            <span>${column.title}</span
                            ><span class="count">${column.items.length}</span>
                        </header>
                        ${column.items.map(
                            (item) =>
                                html`<article
                                    class="card"
                                    tabindex="0"
                                    role="button"
                                    aria-label=${item.title}
                                    title="Alt+←/→ moves this card"
                                    draggable="true"
                                    @dragstart=${(event: DragEvent) =>
                                        event.dataTransfer?.setData("text/plain", item.id)}
                                    @keydown=${(event: KeyboardEvent) => this.cardKeydown(event, item.id)}
                                >
                                    <div class="card-title">${item.title}</div>
                                    ${item.meta ? html`<div class="meta">${item.meta}</div>` : null}
                                </article>`,
                        )}
                    </section>`,
            )}
        </div>`;
    }
}
