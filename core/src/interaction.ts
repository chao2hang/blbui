/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement, nextUid } from "./base";
import type { AdminMenuEntry } from "./essentials";

export interface AdminCascaderOption {
    value: string;
    label: string;
    disabled?: boolean;
    children?: AdminCascaderOption[];
}

export class AdminCascaderElement extends AdminElement {
    static properties = {
        options: { attribute: false },
        value: { attribute: false },
        placeholder: { type: String },
        disabled: { type: Boolean, reflect: true },
        open: { type: Boolean, reflect: true },
        searchable: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            position: relative;
            display: block;
            max-width: 100%;
        }
        .trigger {
            box-sizing: border-box;
            width: 100%;
            min-height: var(--aui-control-height);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 10px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-control-bg);
            color: var(--aui-text);
            cursor: pointer;
            text-align: left;
            font: var(--aui-input-font-size, 12px)/1.2 var(--aui-font-mono);
        }
        .trigger:hover:not(:disabled),
        .trigger:focus-visible {
            border-color: var(--aui-control-border-hover);
        }
        .trigger:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
        .trigger:disabled {
            cursor: not-allowed;
            opacity: 0.45;
        }
        .value {
            min-width: 0;
            overflow: hidden;
            color: var(--aui-text-primary);
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .placeholder {
            color: var(--aui-text-muted);
        }
        .chevron {
            width: 34px;
            height: 34px;
            display: grid;
            flex: 0 0 34px;
            place-items: center;
            margin-right: -10px;
            color: var(--aui-text-muted);
        }
        .chevron::before {
            width: 7px;
            height: 7px;
            border-right: 1px solid currentColor;
            border-bottom: 1px solid currentColor;
            content: "";
            transform: translateY(-2px) rotate(45deg);
            transition: transform 120ms ease;
        }
        :host([open]) .chevron::before {
            transform: translateY(2px) rotate(225deg);
        }
        .trigger:hover:not(:disabled) .chevron,
        .trigger:focus-visible .chevron {
            color: var(--aui-text-secondary);
        }
        .panel {
            position: absolute;
            z-index: 60;
            top: calc(100% + 5px);
            left: 0;
            max-width: min(720px, calc(100vw - 24px));
            overflow: hidden;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
            box-shadow: var(--aui-shadow-pop);
        }
        :host(:not([open])) .panel {
            display: none;
        }
        .search {
            box-sizing: border-box;
            width: 100%;
            min-height: 34px;
            padding: 7px 9px;
            border: 0;
            border-bottom: 1px solid var(--aui-border);
            outline: 0;
            background: var(--aui-control-bg);
            color: var(--aui-text);
            font: 11px/1.2 var(--aui-font-mono);
        }
        .search:focus {
            box-shadow: var(--aui-focus-inset);
        }
        .levels {
            display: flex;
            max-width: inherit;
            overflow-x: auto;
        }
        .level {
            flex: 0 0 180px;
            max-height: 260px;
            overflow-y: auto;
            padding: 5px;
            border-right: 1px solid var(--aui-border);
        }
        .level:last-child {
            border-right: 0;
        }
        .level-title {
            padding: 6px 7px 5px;
            color: var(--aui-text-muted);
            font: 700 9px/1 var(--aui-font-mono);
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        .option {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 8px 7px;
            border: 1px solid transparent;
            border-radius: var(--aui-radius-sm);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            font: 11px/1.2 var(--aui-font-mono);
        }
        .option:hover:not(:disabled),
        .option[aria-selected="true"] {
            border-color: var(--aui-border-hover);
            background: var(--aui-control-bg-hover);
            color: var(--aui-text-primary);
        }
        .option:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
        .option:disabled {
            cursor: not-allowed;
            opacity: 0.35;
        }
        .arrow {
            color: var(--aui-text-muted);
        }
        .empty {
            padding: 14px 8px;
            color: var(--aui-text-muted);
            font: 10px/1.3 var(--aui-font-mono);
        }
    `;

    options: AdminCascaderOption[] = [];
    value: string[] = [];
    placeholder = "Select an option";
    disabled = false;
    open = false;
    searchable = false;

    private query = "";
    private activePath: AdminCascaderOption[] = [];
    private panelId = nextUid("cascader-panel");
    private readonly onDocumentClick = (event: Event) => {
        if (this.open && !this.contains(event.target as Node)) this.close();
    };
    private readonly onDocumentKeydown = (event: KeyboardEvent) => {
        if (this.open && event.key === "Escape") {
            event.preventDefault();
            this.close();
        }
    };

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("open")) {
            if (this.open) {
                document.addEventListener("click", this.onDocumentClick, true);
                document.addEventListener("keydown", this.onDocumentKeydown);
            } else {
                document.removeEventListener("click", this.onDocumentClick, true);
                document.removeEventListener("keydown", this.onDocumentKeydown);
            }
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener("click", this.onDocumentClick, true);
        document.removeEventListener("keydown", this.onDocumentKeydown);
    }

    private findPath(values: string[], options = this.options): AdminCascaderOption[] {
        for (const option of options) {
            if (option.value === values[0]) {
                if (values.length === 1) return [option];
                const childPath = option.children?.length
                    ? this.findPath(values.slice(1), option.children)
                    : [];
                if (childPath.length) return [option, ...childPath];
            }
        }
        return [];
    }

    private levels(): AdminCascaderOption[][] {
        const path = this.activePath.length ? this.activePath : this.findPath(this.value);
        const result: AdminCascaderOption[][] = [this.options];
        for (const selected of path) {
            if (!selected.children?.length) break;
            result.push(selected.children);
        }
        return result;
    }

    private pathLabel(): string {
        return this.findPath(this.value)
            .map((option) => option.label)
            .join(" / ");
    }

    private close(): void {
        if (!this.open) return;
        this.open = false;
        this.query = "";
        this.dispatchDetail("aui-open-change", { open: false });
    }

    private toggle(): void {
        if (this.disabled) return;
        this.open = !this.open;
        if (this.open) {
            this.activePath = this.findPath(this.value);
            this.query = "";
        }
        this.dispatchDetail("aui-open-change", { open: this.open });
    }

    private select(level: number, option: AdminCascaderOption): void {
        if (option.disabled) return;
        const path = [...this.activePath.slice(0, level), option];
        this.activePath = path;
        if (option.children?.length) {
            this.open = true;
            this.requestUpdate();
            return;
        }
        this.value = path.map((item) => item.value);
        this.open = false;
        this.query = "";
        const detail = { value: this.value, options: path };
        this.dispatchDetail("aui-cascader-change", detail);
        this.dispatchDetail("aui-change", detail);
    }

    private filtered(options: AdminCascaderOption[]): AdminCascaderOption[] {
        const query = this.query.trim().toLowerCase();
        if (!query) return options;
        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(query) ||
                option.value.toLowerCase().includes(query),
        );
    }

    render() {
        const path = this.activePath.length ? this.activePath : this.findPath(this.value);
        const levels = this.levels();
        const label = this.pathLabel();
        return html`<button
                class="trigger"
                type="button"
                ?disabled=${this.disabled}
                aria-haspopup="listbox"
                aria-expanded=${this.open ? "true" : "false"}
                aria-controls=${this.panelId}
                @click=${this.toggle}
                @keydown=${(event: KeyboardEvent) => {
                    if (event.key === "ArrowDown" || event.key === "Enter") {
                        event.preventDefault();
                        if (!this.open) this.toggle();
                    }
                }}
            >
                <span class=${label ? "value" : "value placeholder"}
                    >${label || this.placeholder}</span
                >
                <span class="chevron" aria-hidden="true"></span>
            </button>
            <div class="panel" id=${this.panelId} role="listbox" aria-label="Cascader options">
                ${
                    this.searchable
                        ? html`<input
                              class="search"
                              type="search"
                              placeholder="Filter options"
                              aria-label="Filter options"
                              .value=${this.query}
                              @input=${(event: Event) => {
                                  this.query = (event.target as HTMLInputElement).value;
                                  this.requestUpdate();
                              }}
                          />`
                        : null
                }
                <div class="levels">
                    ${levels.map((options, level) => {
                        const visible = this.filtered(options);
                        const selected = path[level]?.value;
                        return html`<div
                            class="level"
                            role="group"
                            aria-label=${`Level ${level + 1}`}
                        >
                            <div class="level-title">LEVEL ${level + 1}</div>
                            ${
                                visible.length
                                    ? visible.map(
                                          (option) => html`<button
                                              class="option"
                                              type="button"
                                              role="option"
                                              aria-selected=${option.value === selected ? "true" : "false"}
                                              ?disabled=${option.disabled}
                                              @click=${() => this.select(level, option)}
                                          >
                                              <span>${option.label}</span>
                                              ${
                                                  option.children?.length
                                                      ? html`<span class="arrow" aria-hidden="true"
                                                            >›</span
                                                        >`
                                                      : null
                                              }
                                          </button>`,
                                      )
                                    : html`<div class="empty">NO MATCHES</div>`
                            }
                        </div>`;
                    })}
                </div>
            </div>`;
    }
}

export interface AdminTransferOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export class AdminTransferElement extends AdminElement {
    static properties = {
        options: { attribute: false },
        values: { attribute: false },
        sourceTitle: { type: String, attribute: "source-title" },
        targetTitle: { type: String, attribute: "target-title" },
        searchable: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: block;
            max-width: 100%;
        }
        .transfer {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            gap: 10px;
        }
        .list {
            min-width: 0;
            overflow: hidden;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
        }
        .list-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 9px 10px;
            border-bottom: 1px solid var(--aui-border);
            background: var(--aui-header);
        }
        .list-title {
            color: var(--aui-text-primary);
            font: 700 10px/1 var(--aui-font-mono);
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }
        .count {
            color: var(--aui-text-muted);
            font: 10px/1 var(--aui-font-mono);
        }
        .search {
            box-sizing: border-box;
            width: 100%;
            min-height: 30px;
            padding: 6px 9px;
            border: 0;
            border-bottom: 1px solid var(--aui-border);
            outline: 0;
            background: var(--aui-control-bg);
            color: var(--aui-text);
            font: 10px/1.2 var(--aui-font-mono);
        }
        .search:focus {
            box-shadow: var(--aui-focus-inset);
        }
        .options {
            min-height: 150px;
            max-height: 230px;
            overflow-y: auto;
            padding: 5px;
        }
        .option {
            width: 100%;
            display: block;
            padding: 8px;
            border: 1px solid transparent;
            border-radius: var(--aui-radius-sm);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            font: 11px/1.25 var(--aui-font-mono);
        }
        .option:hover:not(:disabled),
        .option[aria-selected="true"] {
            border-color: var(--aui-border-hover);
            background: var(--aui-control-bg-hover);
            color: var(--aui-text-primary);
        }
        .option:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
        .option:disabled {
            cursor: not-allowed;
            opacity: 0.35;
        }
        .description {
            display: block;
            margin-top: 3px;
            color: var(--aui-text-muted);
            font-size: 9px;
        }
        .empty {
            padding: 16px 8px;
            color: var(--aui-text-muted);
            text-align: center;
            font: 10px/1.3 var(--aui-font-mono);
        }
        .actions {
            display: grid;
            gap: 6px;
        }
        .actions button {
            width: 30px;
            height: 30px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-control-bg);
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 700 14px/1 var(--aui-font-mono);
        }
        .actions button:hover:not(:disabled),
        .actions button:focus-visible {
            border-color: var(--aui-focus);
            color: var(--aui-text-primary);
        }
        .actions button:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
        .actions button:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
        @media (max-width: 540px) {
            .transfer {
                grid-template-columns: 1fr;
            }
            .actions {
                grid-template-columns: repeat(2, 30px);
                justify-content: center;
            }
        }
    `;

    options: AdminTransferOption[] = [];
    values: string[] = [];
    sourceTitle = "Available";
    targetTitle = "Selected";
    searchable = true;
    disabled = false;

    private sourceQuery = "";
    private targetQuery = "";
    private selectedSource = new Set<string>();
    private selectedTarget = new Set<string>();

    private filtered(side: "source" | "target"): AdminTransferOption[] {
        const query = (side === "source" ? this.sourceQuery : this.targetQuery).toLowerCase();
        const values = new Set(this.values);
        return this.options.filter((option) => {
            const inTarget = values.has(option.value);
            const matchesSide = side === "target" ? inTarget : !inTarget;
            const matchesQuery =
                !query ||
                option.label.toLowerCase().includes(query) ||
                option.value.toLowerCase().includes(query);
            return matchesSide && matchesQuery;
        });
    }

    private toggle(side: "source" | "target", value: string): void {
        const selected = side === "source" ? this.selectedSource : this.selectedTarget;
        if (selected.has(value)) selected.delete(value);
        else selected.add(value);
        this.requestUpdate();
    }

    private move(direction: "to-target" | "to-source"): void {
        if (this.disabled) return;
        const moving = direction === "to-target" ? this.selectedSource : this.selectedTarget;
        const oldValues = [...this.values];
        const next = new Set(this.values);
        for (const value of moving) {
            if (direction === "to-target") next.add(value);
            else next.delete(value);
        }
        this.values = this.options
            .filter((option) => next.has(option.value))
            .map((option) => option.value);
        moving.clear();
        const added = this.values.filter((value) => !oldValues.includes(value));
        const removed = oldValues.filter((value) => !this.values.includes(value));
        const detail = { values: this.values, added, removed };
        this.dispatchDetail("aui-transfer-change", detail);
        this.dispatchDetail("aui-change", detail);
        this.requestUpdate();
    }

    private renderList(side: "source" | "target", title: string) {
        const options = this.filtered(side);
        const selected = side === "source" ? this.selectedSource : this.selectedTarget;
        const query = side === "source" ? this.sourceQuery : this.targetQuery;
        const values = new Set(this.values);
        return html`<section class="list" aria-label=${title}>
            <header class="list-header">
                <span class="list-title">${title}</span>
                <span class="count"
                    >${side === "target" ? this.values.length : this.options.length - this.values.length}</span
                >
            </header>
            ${
                this.searchable
                    ? html`<input
                          class="search"
                          type="search"
                          placeholder="Filter"
                          aria-label=${`${title} filter`}
                          .value=${query}
                          @input=${(event: Event) => {
                              const next = (event.target as HTMLInputElement).value;
                              if (side === "source") this.sourceQuery = next;
                              else this.targetQuery = next;
                              this.requestUpdate();
                          }}
                      />`
                    : null
            }
            <div class="options" role="listbox" aria-multiselectable="true" aria-label=${title}>
                ${
                    options.length
                        ? options.map(
                              (option) => html`<button
                                  class="option"
                                  type="button"
                                  role="option"
                                  aria-selected=${selected.has(option.value) ? "true" : "false"}
                                  ?disabled=${this.disabled || option.disabled}
                                  @click=${() => this.toggle(side, option.value)}
                              >
                                  ${option.label}${
                                      option.description
                                          ? html`<span class="description"
                                                >${option.description}</span
                                            >`
                                          : null
                                  }
                              </button>`,
                          )
                        : html`<div class="empty">
                              ${values.size && side === "source" ? "ALL SELECTED" : "NO MATCHES"}
                          </div>`
                }
            </div>
        </section>`;
    }

    render() {
        const sourceSelected = [...this.selectedSource].filter(
            (value) => !this.values.includes(value),
        );
        const targetSelected = [...this.selectedTarget].filter((value) =>
            this.values.includes(value),
        );
        return html`<div class="transfer">
            ${this.renderList("source", this.sourceTitle)}
            <div class="actions" aria-label="Move options">
                <button
                    type="button"
                    title="Move selected to selected"
                    aria-label="Move selected to selected"
                    ?disabled=${this.disabled || sourceSelected.length === 0}
                    @click=${() => this.move("to-target")}
                >
                    ›
                </button>
                <button
                    type="button"
                    title="Move selected back"
                    aria-label="Move selected back"
                    ?disabled=${this.disabled || targetSelected.length === 0}
                    @click=${() => this.move("to-source")}
                >
                    ‹
                </button>
            </div>
            ${this.renderList("target", this.targetTitle)}
        </div>`;
    }
}

export class AdminContextMenuElement extends AdminElement {
    static properties = {
        items: { attribute: false },
        open: { type: Boolean, reflect: true },
        x: { type: Number },
        y: { type: Number },
        label: { type: String },
    };

    static styles = css`
        :host {
            display: contents;
        }
        .menu {
            position: fixed;
            z-index: 100;
            width: max-content;
            min-width: 190px;
            max-width: min(300px, calc(100vw - 16px));
            padding: 5px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
            box-shadow: var(--aui-shadow-pop);
        }
        :host(:not([open])) .menu {
            display: none;
        }
        button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            padding: 8px 9px;
            border: 1px solid transparent;
            border-radius: var(--aui-radius-sm);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            font: 11px/1.2 var(--aui-font-mono);
        }
        button:hover:not(:disabled),
        button:focus-visible {
            border-color: var(--aui-border-hover);
            background: var(--aui-control-bg-hover);
            color: var(--aui-text-primary);
        }
        button:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
        button.danger {
            color: var(--aui-danger);
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.35;
        }
        .separator {
            height: 1px;
            margin: 4px 2px;
            background: var(--aui-border);
        }
        kbd {
            color: var(--aui-text-muted);
            font: 10px/1 var(--aui-font-mono);
        }
    `;

    items: AdminMenuEntry[] = [];
    open = false;
    x = 0;
    y = 0;
    label = "Context menu";

    private readonly onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        this.x = event.clientX;
        this.y = event.clientY;
        this.open = true;
        this.dispatchDetail("aui-open-change", { open: true });
    };
    private readonly onDocumentClick = (event: Event) => {
        if (this.open && !this.contains(event.target as Node)) this.close();
    };
    private readonly onDocumentKeydown = (event: KeyboardEvent) => {
        if (!this.open) return;
        if (event.key === "Escape") {
            event.preventDefault();
            this.close();
            return;
        }
        const buttons = [
            ...(this.renderRoot.querySelectorAll<HTMLButtonElement>("button.item") ?? []),
        ];
        if (!buttons.length) return;
        const current = buttons.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const delta = event.key === "ArrowDown" ? 1 : -1;
            buttons[(current + delta + buttons.length) % buttons.length]?.focus();
        }
    };

    connectedCallback(): void {
        super.connectedCallback();
        this.addEventListener("contextmenu", this.onContextMenu);
    }

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("open")) {
            if (this.open) {
                document.addEventListener("click", this.onDocumentClick, true);
                document.addEventListener("keydown", this.onDocumentKeydown);
                this.updateComplete.then(() =>
                    this.renderRoot.querySelector<HTMLButtonElement>("button.item")?.focus(),
                );
            } else {
                document.removeEventListener("click", this.onDocumentClick, true);
                document.removeEventListener("keydown", this.onDocumentKeydown);
            }
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEventListener("contextmenu", this.onContextMenu);
        document.removeEventListener("click", this.onDocumentClick, true);
        document.removeEventListener("keydown", this.onDocumentKeydown);
    }

    private close(): void {
        if (!this.open) return;
        this.open = false;
        this.dispatchDetail("aui-open-change", { open: false });
    }

    private select(item: AdminMenuEntry): void {
        if (item.disabled || item.separator) return;
        this.dispatchDetail("aui-menu-select", { id: item.id, item });
        this.close();
    }

    render() {
        return html`<slot></slot>
            <div
                class="menu"
                role="menu"
                aria-label=${this.label}
                style=${`left:${Math.max(4, this.x)}px;top:${Math.max(4, this.y)}px`}
            >
                ${this.items.map((item) =>
                    item.separator
                        ? html`<div class="separator" role="separator"></div>`
                        : html`<button
                              class="item ${item.danger ? "danger" : ""}"
                              type="button"
                              role="menuitem"
                              ?disabled=${item.disabled}
                              @click=${() => this.select(item)}
                          >
                              <span>${item.label}</span><kbd>${item.shortcut ?? ""}</kbd>
                          </button>`,
                )}
            </div>`;
    }
}

export class AdminHoverCardElement extends AdminElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        side: { type: String, reflect: true },
        delay: { type: Number },
        closeDelay: { type: Number, attribute: "close-delay" },
    };

    static styles = css`
        :host {
            position: relative;
            display: inline-flex;
            max-width: 100%;
        }
        .trigger {
            display: inline-flex;
            min-width: 0;
        }
        .panel {
            position: absolute;
            z-index: 55;
            top: calc(100% + 9px);
            left: 0;
            width: min(320px, calc(100vw - 24px));
            padding: 13px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
            box-shadow: var(--aui-shadow-pop);
        }
        :host([side="top"]) .panel {
            top: auto;
            bottom: calc(100% + 9px);
        }
        :host([side="right"]) .panel {
            top: 0;
            left: calc(100% + 9px);
        }
        :host([side="left"]) .panel {
            top: 0;
            right: calc(100% + 9px);
            left: auto;
        }
        :host(:not([open])) .panel {
            display: none;
        }
        .title {
            margin-bottom: 6px;
            color: var(--aui-text-primary);
            font: 700 11px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .content {
            color: var(--aui-text-secondary);
            font: 11px/1.45 var(--aui-font-ui);
        }
        @media (prefers-reduced-motion: reduce) {
            .panel {
                transition: none;
            }
        }
    `;

    open = false;
    title = "";
    side = "bottom";
    delay = 160;
    closeDelay = 80;

    private openTimer: number | undefined;
    private closeTimer: number | undefined;
    private panelId = nextUid("hover-card");

    connectedCallback(): void {
        super.connectedCallback();
        this.addEventListener("pointerenter", this.scheduleOpen);
        this.addEventListener("pointerleave", this.scheduleClose);
        this.addEventListener("focusin", this.scheduleOpen);
        this.addEventListener("focusout", this.scheduleClose);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEventListener("pointerenter", this.scheduleOpen);
        this.removeEventListener("pointerleave", this.scheduleClose);
        this.removeEventListener("focusin", this.scheduleOpen);
        this.removeEventListener("focusout", this.scheduleClose);
        this.clearTimers();
    }

    private clearTimers(): void {
        if (this.openTimer !== undefined) window.clearTimeout(this.openTimer);
        if (this.closeTimer !== undefined) window.clearTimeout(this.closeTimer);
        this.openTimer = undefined;
        this.closeTimer = undefined;
    }

    private readonly scheduleOpen = () => {
        this.clearTimers();
        if (this.open) return;
        this.openTimer = window.setTimeout(
            () => {
                this.open = true;
                this.dispatchDetail("aui-open-change", { open: true });
            },
            Math.max(0, this.delay),
        );
    };

    private readonly scheduleClose = (event: Event) => {
        const related = (event as FocusEvent).relatedTarget;
        if (related instanceof Node && this.contains(related)) return;
        this.clearTimers();
        this.closeTimer = window.setTimeout(
            () => {
                if (!this.open) return;
                this.open = false;
                this.dispatchDetail("aui-open-change", { open: false });
            },
            Math.max(0, this.closeDelay),
        );
    };

    private syncTrigger(): void {
        const target = this.renderRoot
            .querySelector<HTMLSlotElement>("slot[name='trigger']")
            ?.assignedElements()
            .find((node) => node instanceof HTMLElement);
        if (target instanceof HTMLElement) {
            target.setAttribute("aria-expanded", this.open ? "true" : "false");
            target.setAttribute("aria-describedby", this.panelId);
        }
    }

    render() {
        return html`<span class="trigger"
                ><slot name="trigger"><slot></slot></slot
            ></span>
            <div
                class="panel"
                id=${this.panelId}
                role="dialog"
                aria-label=${this.title || "Details"}
            >
                ${this.title ? html`<div class="title">${this.title}</div>` : null}
                <div class="content"><slot name="content"></slot></div>
            </div>`;
    }

    protected updated(): void {
        this.syncTrigger();
    }
}

export interface AdminNotificationItem {
    id: string;
    title?: string;
    message: string;
    variant?: "default" | "info" | "success" | "warning" | "danger";
    duration?: number;
    closable?: boolean;
    actionLabel?: string;
}

export class AdminNotificationCenterElement extends AdminElement {
    static properties = {
        notifications: { attribute: false },
        position: { type: String, reflect: true },
        max: { type: Number },
        persistKey: { type: String, attribute: "persist-key" },
        clearLabel: { type: String, attribute: "clear-label" },
    };

    static styles = css`
        :host {
            position: fixed;
            z-index: 90;
            inset: auto 16px 16px auto;
            display: block;
            width: min(360px, calc(100vw - 32px));
            pointer-events: none;
        }
        :host([position="bottom-left"]) {
            right: auto;
            left: 16px;
        }
        :host([position="top-right"]) {
            top: 16px;
            right: 16px;
            bottom: auto;
        }
        :host([position="top-left"]) {
            top: 16px;
            right: auto;
            bottom: auto;
            left: 16px;
        }
        .center {
            display: grid;
            gap: 8px;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            color: var(--aui-text-muted);
            font: 10px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .clear {
            padding: 0;
            border: 0;
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: inherit;
            text-decoration: underline;
        }
        .clear:hover,
        .clear:focus-visible {
            color: var(--aui-text-primary);
        }
        .notification {
            position: relative;
            display: grid;
            grid-template-columns: 4px minmax(0, 1fr) auto;
            gap: 10px;
            padding: 12px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface-elevated);
            box-shadow: var(--aui-shadow-md);
            color: var(--aui-text);
            pointer-events: auto;
        }
        .notification::before {
            content: "";
            width: 4px;
            border-radius: var(--aui-radius-full);
            background: var(--aui-primary);
        }
        .notification[data-variant="info"]::before {
            background: var(--aui-info);
        }
        .notification[data-variant="success"]::before {
            background: var(--aui-success);
        }
        .notification[data-variant="warning"]::before {
            background: var(--aui-warning);
        }
        .notification[data-variant="danger"]::before {
            background: var(--aui-danger);
        }
        .body {
            min-width: 0;
        }
        .title {
            color: var(--aui-text-primary);
            font: 700 11px/1.25 var(--aui-font-mono);
        }
        .message {
            margin-top: 4px;
            color: var(--aui-text-secondary);
            font: 11px/1.4 var(--aui-font-ui);
        }
        .actions {
            display: flex;
            align-items: start;
            gap: 6px;
        }
        .action,
        .close {
            border: 0;
            background: transparent;
            cursor: pointer;
            font: 10px/1.2 var(--aui-font-mono);
        }
        .action {
            color: var(--aui-primary);
            text-decoration: underline;
        }
        .close {
            padding: 0 2px;
            color: var(--aui-text-muted);
            font-size: 15px;
            line-height: 1;
        }
        .action:hover,
        .action:focus-visible,
        .close:hover,
        .close:focus-visible {
            color: var(--aui-text-primary);
        }
        .action:focus-visible,
        .close:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
    `;

    notifications: AdminNotificationItem[] = [];
    position = "bottom-right";
    max = 5;
    persistKey = "";
    clearLabel = "CLEAR ALL";

    private timers = new Map<string, number>();
    private restoring = true;

    private restore(): void {
        if (!this.persistKey || typeof localStorage === "undefined") {
            this.restoring = false;
            return;
        }
        try {
            const raw = localStorage.getItem(this.persistKey);
            if (raw && !this.notifications.length) {
                const value = JSON.parse(raw) as unknown;
                if (Array.isArray(value)) {
                    this.notifications = value.filter((item): item is AdminNotificationItem =>
                        Boolean(
                            item && typeof item === "object" && "id" in item && "message" in item,
                        ),
                    );
                }
            }
        } catch {
            // Storage is optional and can be blocked by privacy settings.
        }
        this.restoring = false;
        this.requestUpdate();
    }

    private persist(): void {
        if (this.restoring || !this.persistKey || typeof localStorage === "undefined") return;
        try {
            localStorage.setItem(this.persistKey, JSON.stringify(this.notifications));
        } catch {
            // Storage is optional and can be blocked by privacy settings.
        }
    }

    protected firstUpdated(): void {
        this.restore();
    }

    push(item: Omit<AdminNotificationItem, "id"> & { id?: string }): string {
        const id = item.id ?? nextUid("notification");
        const notification = { ...item, id } as AdminNotificationItem;
        this.notifications = [...this.notifications, notification];
        this.dispatchDetail("aui-notifications-change", { notifications: this.notifications });
        this.persist();
        this.requestUpdate();
        return id;
    }

    dismiss(id: string): void {
        if (!this.notifications.some((item) => item.id === id)) return;
        this.notifications = this.notifications.filter((item) => item.id !== id);
        const timer = this.timers.get(id);
        if (timer !== undefined) window.clearTimeout(timer);
        this.timers.delete(id);
        this.dispatchDetail("aui-notification-close", { id });
        this.dispatchDetail("aui-notifications-change", { notifications: this.notifications });
        this.persist();
        this.requestUpdate();
    }

    clear(): void {
        if (!this.notifications.length) return;
        const ids = this.notifications.map((item) => item.id);
        for (const id of ids) {
            const timer = this.timers.get(id);
            if (timer !== undefined) window.clearTimeout(timer);
        }
        this.timers.clear();
        this.notifications = [];
        this.dispatchDetail("aui-notifications-clear", { ids });
        this.dispatchDetail("aui-notifications-change", { notifications: this.notifications });
        this.persist();
        this.requestUpdate();
    }

    private schedule(item: AdminNotificationItem): void {
        if (this.timers.has(item.id) || !item.duration) return;
        this.timers.set(
            item.id,
            window.setTimeout(() => this.dismiss(item.id), Math.max(0, item.duration ?? 0)),
        );
    }

    protected updated(): void {
        const visible = this.notifications.slice(-Math.max(1, this.max || 5));
        for (const item of visible) this.schedule(item);
        for (const id of this.timers.keys()) {
            if (!this.notifications.some((item) => item.id === id)) this.timers.delete(id);
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        for (const timer of this.timers.values()) window.clearTimeout(timer);
        this.timers.clear();
    }

    render() {
        const visible = this.notifications.slice(-Math.max(1, this.max || 5));
        return html`<section
            class="center"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
        >
            ${
                visible.length
                    ? html`<header class="header">
                          <span
                              >${visible.length}
                              NOTIFICATION${visible.length === 1 ? "" : "S"}</span
                          >
                          <button class="clear" type="button" @click=${this.clear}>
                              ${this.clearLabel}
                          </button>
                      </header>`
                    : null
            }
            ${visible.map(
                (item) => html`<article
                    class="notification"
                    data-variant=${item.variant ?? "default"}
                    role="alert"
                >
                    <div class="body">
                        ${item.title ? html`<div class="title">${item.title}</div>` : null}
                        <div class="message">${item.message}</div>
                    </div>
                    <div class="actions">
                        ${
                            item.actionLabel
                                ? html`<button
                                      class="action"
                                      type="button"
                                      @click=${() =>
                                          this.dispatchDetail("aui-notification-action", {
                                              id: item.id,
                                              item,
                                          })}
                                  >
                                      ${item.actionLabel}
                                  </button>`
                                : null
                        }
                        ${
                            item.closable !== false
                                ? html`<button
                                      class="close"
                                      type="button"
                                      aria-label="Dismiss notification"
                                      @click=${() => this.dismiss(item.id)}
                                  >
                                      ×
                                  </button>`
                                : null
                        }
                    </div>
                </article>`,
            )}
        </section>`;
    }
}
