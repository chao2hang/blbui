/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement, nextUid } from "./base";
import { isTopOverlay, registerOverlay, unregisterOverlay } from "./overlay-stack";

export type AdminAlertVariant = "info" | "success" | "warning" | "danger";

export class AdminAlertElement extends AdminElement {
    static properties = {
        variant: { type: String, reflect: true },
        title: { type: String },
        description: { type: String },
        closable: { type: Boolean, reflect: true },
        open: { type: Boolean },
    };
    static styles = css`
        :host {
            display: block;
        }
        .alert {
            display: grid;
            grid-template-columns: 24px minmax(0, 1fr) auto;
            gap: 12px;
            padding: 13px 14px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
            color: var(--aui-text);
        }
        :host([variant="info"]) .alert {
            border-color: var(--aui-info-border);
        }
        :host([variant="success"]) .alert {
            border-color: var(--aui-success-border);
        }
        :host([variant="warning"]) .alert {
            border-color: var(--aui-warning-border);
        }
        :host([variant="danger"]) .alert {
            border-color: var(--aui-danger-strong);
        }
        .icon {
            width: 22px;
            height: 22px;
            display: grid;
            place-items: center;
            border: 1px solid currentColor;
            color: var(--aui-text-secondary);
            font: 700 11px/1 var(--aui-font-mono);
        }
        :host([variant="info"]) .icon {
            color: var(--aui-info);
        }
        :host([variant="success"]) .icon {
            color: var(--aui-success);
        }
        :host([variant="warning"]) .icon {
            color: var(--aui-warning);
        }
        :host([variant="danger"]) .icon {
            color: var(--aui-danger);
        }
        h3 {
            margin: 0;
            color: var(--aui-text-primary);
            font: 700 11px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        p {
            margin: 5px 0 0;
            color: var(--aui-text-secondary);
            font: 12px/1.45 var(--aui-font-mono);
        }
        .close {
            width: 24px;
            height: 24px;
            border: 0;
            background: transparent;
            color: var(--aui-text-muted);
            cursor: pointer;
            font: 16px/1 var(--aui-font-mono);
        }
        .close:hover {
            color: var(--aui-text-primary);
        }
    `;
    variant: AdminAlertVariant = "info";
    title = "";
    description = "";
    closable = false;
    open = true;
    private icon(): string {
        if (this.variant === "success") return "✓";
        if (this.variant === "danger") return "×";
        if (this.variant === "warning") return "!";
        return "i";
    }
    private close(): void {
        this.open = false;
        this.dispatchDetail("aui-close", { open: false });
    }
    render() {
        if (!this.open) return html`<span hidden></span>`;
        return html`<div class="alert" role="alert">
            <span class="icon" aria-hidden="true">${this.icon()}</span>
            <div>
                <h3>${this.title}<slot name="title"></slot></h3>
                <p>${this.description}<slot></slot></p>
            </div>
            ${
                this.closable
                    ? html`<button
                          class="close"
                          type="button"
                          aria-label="Close"
                          @click=${this.close}
                      >
                          ×
                      </button>`
                    : null
            }
        </div>`;
    }
}

export class AdminIconButtonElement extends AdminElement {
    static properties = {
        label: { type: String },
        icon: { type: String },
        variant: { type: String, reflect: true },
        size: { type: String, reflect: true },
        disabled: { type: Boolean, reflect: true },
    };
    static styles = css`
        :host {
            display: inline-flex;
        }
        button {
            width: 32px;
            height: 32px;
            display: inline-grid;
            place-items: center;
            padding: 0;
            border: 1px solid transparent;
            border-radius: var(--aui-radius);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 14px/1 var(--aui-font-mono);
        }
        :host([size="sm"]) button {
            width: 28px;
            height: 28px;
            font-size: 12px;
        }
        :host([variant="danger"]) button {
            color: var(--aui-danger);
        }
        button:hover:not(:disabled) {
            border-color: var(--aui-border-hover);
            background: var(--aui-header);
            color: var(--aui-text-primary);
        }
        :host([variant="danger"]) button:hover:not(:disabled) {
            border-color: var(--aui-danger);
            background: var(--aui-danger-soft);
            color: var(--aui-danger-hover);
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
    `;
    label = "";
    icon = "•";
    variant = "default";
    size = "md";
    disabled = false;
    private activate(): void {
        this.dispatchDetail("aui-press", { label: this.label });
    }
    render() {
        return html`<button
            type="button"
            aria-label=${this.label}
            title=${this.label}
            ?disabled=${this.disabled}
            @click=${this.activate}
        >
            ${this.icon}<slot></slot>
        </button>`;
    }
}

export interface AdminOption {
    value: string;
    label: string;
    disabled?: boolean;
    description?: string;
}

export class AdminComboboxElement extends AdminElement {
    static properties = {
        options: { attribute: false },
        value: { type: String },
        placeholder: { type: String },
        disabled: { type: Boolean, reflect: true },
        open: { type: Boolean, reflect: true },
        ariaLabel: { attribute: "aria-label" },
    };
    static styles = css`
        :host {
            position: relative;
            display: block;
        }
        .control {
            min-height: var(--aui-control-height);
            display: flex;
            border: 1px solid var(--aui-border);
            background: var(--aui-bg);
        }
        .control:focus-within {
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        input {
            min-width: 0;
            flex: 1;
            padding: 8px 10px;
            border: 0;
            outline: 0;
            background: transparent;
            color: var(--aui-text);
            font: var(--aui-input-font-size, 12px)/1.2 var(--aui-font-mono);
        }
        input::placeholder {
            color: var(--aui-text-muted);
        }
        .chevron {
            width: 34px;
            display: grid;
            flex: 0 0 34px;
            place-items: center;
            padding: 0;
            border: 0;
            border-left: 1px solid var(--aui-border);
            background: var(--aui-header);
            color: var(--aui-text-muted);
            cursor: pointer;
        }
        .chevron::before {
            width: 6px;
            height: 6px;
            border-right: 1px solid currentColor;
            border-bottom: 1px solid currentColor;
            content: "";
            transform: translateY(-2px) rotate(45deg);
            transition: transform 120ms ease;
        }
        :host([open]) .chevron::before {
            transform: translateY(2px) rotate(225deg);
        }
        .list {
            position: absolute;
            z-index: 50;
            top: calc(100% + 4px);
            right: 0;
            left: 0;
            max-height: 240px;
            overflow: auto;
            padding: 4px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
            box-shadow: var(--aui-shadow-pop);
        }
        :host(:not([open])) .list {
            display: none;
        }
        .option {
            width: 100%;
            display: block;
            padding: 9px 8px;
            border: 0;
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            font: 11px/1.2 var(--aui-font-mono);
        }
        .option:hover,
        .option[data-active="true"] {
            background: var(--aui-header);
            color: var(--aui-text-primary);
        }
        .option:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
        .description {
            margin-top: 4px;
            color: var(--aui-text-muted);
            font-size: 10px;
        }
        .empty {
            padding: 12px 8px;
            color: var(--aui-text-muted);
            font: 11px/1.2 var(--aui-font-mono);
        }
    `;
    options: AdminOption[] = [];
    value = "#ffffff";
    placeholder = "Search or select";
    disabled = false;
    open = false;
    ariaLabel = "";
    private query = "";
    private activeIndex = 0;
    private listId = nextUid("combobox-list");
    private readonly onDocumentClick = (event: Event) => {
        if (isTopOverlay(this) && !this.contains(event.target as Node) && this.open) {
            this.open = false;
            this.requestUpdate();
        }
    };
    private filtered(): AdminOption[] {
        const query = this.query.toLowerCase();
        return this.options.filter(
            (option) =>
                option.label.toLowerCase().includes(query) ||
                option.value.toLowerCase().includes(query),
        );
    }
    private choose(option: AdminOption): void {
        if (option.disabled) return;
        this.value = option.value;
        this.query = option.label;
        this.open = false;
        this.dispatchDetail("aui-change", { value: option.value, option });
        this.requestUpdate();
    }
    private input(event: Event): void {
        this.query = (event.target as HTMLInputElement).value;
        this.open = true;
        this.activeIndex = 0;
        this.requestUpdate();
    }
    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("open")) {
            if (this.open) {
                document.addEventListener("click", this.onDocumentClick, true);
                registerOverlay(this, () => {
                    this.open = false;
                    this.requestUpdate();
                });
            } else {
                document.removeEventListener("click", this.onDocumentClick, true);
                unregisterOverlay(this);
            }
        }
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener("click", this.onDocumentClick, true);
        unregisterOverlay(this);
    }
    private keydown(event: KeyboardEvent): void {
        const options = this.filtered();
        if (event.key === "ArrowDown") {
            event.preventDefault();
            this.open = true;
            this.activeIndex = Math.min(this.activeIndex + 1, Math.max(options.length - 1, 0));
            this.requestUpdate();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            this.activeIndex = Math.max(this.activeIndex - 1, 0);
            this.requestUpdate();
        } else if (event.key === "Enter") {
            event.preventDefault();
            const option = options[this.activeIndex];
            if (option) this.choose(option);
        }
    }
    render() {
        const selected = this.options.find((option) => option.value === this.value);
        const options = this.filtered();
        return html`<div class="control">
                <input
                    .value=${this.query || selected?.label || ""}
                    placeholder=${this.placeholder}
                    ?disabled=${this.disabled}
                    role="combobox"
                    aria-label=${this.ariaLabel || undefined}
                    aria-expanded=${this.open ? "true" : "false"}
                    aria-controls=${this.listId}
                    aria-activedescendant=${
                        this.open && options.length
                            ? `${this.listId}-option-${this.activeIndex}`
                            : undefined
                    }
                    @focus=${() => {
                        this.open = true;
                        this.requestUpdate();
                    }}
                    @input=${this.input}
                    @keydown=${this.keydown}
                /><button
                    class="chevron"
                    type="button"
                    tabindex="-1"
                    aria-hidden="true"
                    @click=${() => {
                        this.open = !this.open;
                        this.requestUpdate();
                    }}
                ></button>
            </div>
            <div class="list" id=${this.listId} role="listbox">
                ${
                    options.length
                        ? options.map(
                              (option, index) =>
                                  html`<button
                                      class="option"
                                      type="button"
                                      role="option"
                                      id=${`${this.listId}-option-${index}`}
                                      aria-selected=${option.value === this.value ? "true" : "false"}
                                      data-active=${index === this.activeIndex ? "true" : "false"}
                                      ?disabled=${option.disabled}
                                      @click=${() => this.choose(option)}
                                  >
                                      ${option.label}${
                                          option.description
                                              ? html`<div class="description">
                                                    ${option.description}
                                                </div>`
                                              : null
                                      }
                                  </button>`,
                          )
                        : html`<div class="empty">NO MATCHES</div>`
                }
            </div>`;
    }
}

export class AdminMultiSelectElement extends AdminElement {
    static properties = {
        options: { attribute: false },
        values: { attribute: false },
        placeholder: { type: String },
        disabled: { type: Boolean, reflect: true },
        open: { type: Boolean, reflect: true },
    };
    static styles = css`
        :host {
            position: relative;
            display: block;
        }
        .control {
            min-height: var(--aui-control-height);
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 4px 6px;
            border: 1px solid var(--aui-border);
            background: var(--aui-bg);
            cursor: text;
        }
        .control:focus-within {
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        .chips {
            min-width: 0;
            display: flex;
            flex: 1;
            flex-wrap: wrap;
            gap: 4px;
        }
        .chip {
            display: inline-flex;
            flex: 0 0 auto;
            align-items: center;
            gap: 4px;
            padding: 3px 5px;
            border: 1px solid var(--aui-border-hover);
            color: var(--aui-text);
            font: 10px/1 var(--aui-font-mono);
            white-space: nowrap;
        }
        .chip button {
            padding: 0;
            border: 0;
            background: transparent;
            color: var(--aui-text-muted);
            cursor: pointer;
        }
        input {
            min-width: 80px;
            flex: 1;
            padding: 5px 4px;
            border: 0;
            outline: 0;
            background: transparent;
            color: var(--aui-text);
            font: var(--aui-input-font-size, 11px)/1.2 var(--aui-font-mono);
        }
        input::placeholder {
            color: var(--aui-text-muted);
        }
        .chevron {
            width: 34px;
            height: 34px;
            display: grid;
            flex: 0 0 34px;
            place-items: center;
            margin-right: -6px;
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
        .control:hover .chevron {
            color: var(--aui-text-secondary);
        }
        .list {
            position: absolute;
            z-index: 50;
            top: calc(100% + 4px);
            right: 0;
            left: 0;
            max-height: 240px;
            overflow: auto;
            padding: 4px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
            box-shadow: var(--aui-shadow-pop);
        }
        :host(:not([open])) .list {
            display: none;
        }
        .option {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 8px;
            border: 0;
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            font: 11px/1.2 var(--aui-font-mono);
        }
        .option:hover,
        .option[data-active="true"] {
            background: var(--aui-header);
            color: var(--aui-text-primary);
        }
        .check {
            width: 13px;
            height: 13px;
            display: grid;
            place-items: center;
            border: 1px solid var(--aui-border-hover);
            color: var(--aui-text-inverse);
            font-size: 9px;
        }
        .option[data-selected="true"] .check {
            background: var(--aui-text-primary);
        }
    `;
    options: AdminOption[] = [];
    values: string[] = [];
    placeholder = "Select items";
    disabled = false;
    open = false;
    private query = "";
    private activeIndex = 0;
    private listId = nextUid("multiselect-list");
    private readonly onDocumentClick = (event: Event) => {
        if (isTopOverlay(this) && !this.contains(event.target as Node) && this.open) {
            this.open = false;
            this.requestUpdate();
        }
    };
    private toggle(value: string): void {
        this.values = this.values.includes(value)
            ? this.values.filter((item) => item !== value)
            : [...this.values, value];
        this.dispatchDetail("aui-change", { values: this.values });
        this.requestUpdate();
    }
    private removeValue(value: string): void {
        this.values = this.values.filter((item) => item !== value);
        this.dispatchDetail("aui-change", { values: this.values });
        this.requestUpdate();
    }
    private keydown(event: KeyboardEvent): void {
        const query = this.query.toLowerCase();
        const filtered = this.options.filter((option) =>
            option.label.toLowerCase().includes(query),
        );
        const move = (delta: number) => {
            if (!filtered.length) return;
            this.activeIndex = (this.activeIndex + delta + filtered.length) % filtered.length;
            event.preventDefault();
            this.requestUpdate();
        };
        switch (event.key) {
            case "ArrowDown":
                this.open = true;
                move(1);
                break;
            case "ArrowUp":
                move(-1);
                break;
            case "Enter":
            case " ": {
                const option = filtered[this.activeIndex];
                if (option) {
                    event.preventDefault();
                    this.toggle(option.value);
                }
                break;
            }
            case "Escape":
                this.open = false;
                this.requestUpdate();
                break;
            case "Backspace":
                if (!this.query && this.values.length)
                    this.removeValue(this.values[this.values.length - 1]);
                break;
        }
    }
    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("open")) {
            if (this.open) {
                document.addEventListener("click", this.onDocumentClick, true);
                registerOverlay(this, () => {
                    this.open = false;
                    this.requestUpdate();
                });
            } else {
                document.removeEventListener("click", this.onDocumentClick, true);
                unregisterOverlay(this);
            }
        }
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener("click", this.onDocumentClick, true);
        unregisterOverlay(this);
    }
    render() {
        const query = this.query.toLowerCase();
        const filtered = this.options.filter((option) =>
            option.label.toLowerCase().includes(query),
        );
        return html`<div
                class="control"
                @click=${() => {
                    this.open = true;
                }}
            >
                <div class="chips">
                    ${this.values.map((value) => {
                        const option = this.options.find((item) => item.value === value);
                        return html`<span class="chip"
                            >${option?.label ?? value}<button
                                type="button"
                                aria-label=${`Remove ${option?.label ?? value}`}
                                @click=${(event: Event) => {
                                    event.stopPropagation();
                                    this.removeValue(value);
                                }}
                            >
                                ×
                            </button></span
                        >`;
                    })}<input
                        .value=${this.query}
                        placeholder=${this.values.length ? "" : this.placeholder}
                        ?disabled=${this.disabled}
                        role="combobox"
                        aria-expanded=${this.open ? "true" : "false"}
                        aria-controls=${this.listId}
                        aria-activedescendant=${
                            this.open && filtered.length
                                ? `${this.listId}-option-${this.activeIndex}`
                                : undefined
                        }
                        @input=${(event: Event) => {
                            this.query = (event.target as HTMLInputElement).value;
                            this.activeIndex = 0;
                            this.requestUpdate();
                        }}
                        @keydown=${this.keydown}
                    />
                </div>
                <span class="chevron" aria-hidden="true"></span>
            </div>
            <div class="list" id=${this.listId} role="listbox" aria-multiselectable="true">
                ${filtered.map(
                    (option, index) =>
                        html`<button
                            class="option"
                            type="button"
                            role="option"
                            id=${`${this.listId}-option-${index}`}
                            aria-selected=${this.values.includes(option.value) ? "true" : "false"}
                            data-selected=${this.values.includes(option.value) ? "true" : "false"}
                            data-active=${index === this.activeIndex ? "true" : "false"}
                            @click=${() => this.toggle(option.value)}
                        >
                            <span class="check"
                                >${this.values.includes(option.value) ? "✓" : ""}</span
                            >${option.label}
                        </button>`,
                )}
            </div>`;
    }
}

export class AdminCommandElement extends AdminElement {
    static properties = {
        items: { attribute: false },
        open: { type: Boolean, reflect: true },
        placeholder: { type: String },
    };
    static styles = css`
        :host {
            display: block;
        }
        .command {
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        .search {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px;
            border-bottom: 1px solid var(--aui-border);
        }
        .search span {
            color: var(--aui-text-muted);
        }
        input {
            min-width: 0;
            flex: 1;
            border: 0;
            outline: 0;
            background: transparent;
            color: var(--aui-text);
            font: var(--aui-input-font-size, 12px)/1.2 var(--aui-font-mono);
        }
        .items {
            max-height: 260px;
            overflow: auto;
            padding: 4px;
        }
        .item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 9px 8px;
            border: 0;
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            font: 11px/1.2 var(--aui-font-mono);
        }
        .item:hover,
        .item[data-active="true"] {
            background: var(--aui-header);
            color: var(--aui-text-primary);
        }
        kbd {
            color: var(--aui-text-muted);
            font: 10px/1 var(--aui-font-mono);
        }
        .empty {
            padding: 12px 8px;
            color: var(--aui-text-muted);
            font: 11px/1 var(--aui-font-mono);
        }
        .trigger {
            min-height: var(--aui-control-height);
            padding: 0 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid var(--aui-border);
            background: var(--aui-header);
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 11px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .trigger:hover {
            color: var(--aui-text-primary);
        }
    `;
    items: Array<AdminOption & { shortcut?: string }> = [];
    open = true;
    placeholder = "Type a command";
    private query = "";
    private activeIndex = 0;
    private readonly onDocumentClick = (event: Event) => {
        if (isTopOverlay(this) && this.open && !this.contains(event.target as Node))
            this.setOpen(false);
    };
    private setOpen(open: boolean): void {
        if (this.open === open) return;
        this.open = open;
        this.dispatchDetail("aui-open-change", { open });
        this.requestUpdate();
        if (open) {
            document.addEventListener("click", this.onDocumentClick, true);
            registerOverlay(this, () => this.setOpen(false));
        } else {
            document.removeEventListener("click", this.onDocumentClick, true);
            unregisterOverlay(this);
        }
    }
    private select(item: AdminOption): void {
        if (item.disabled) return;
        this.dispatchDetail("aui-command", { id: item.value, item });
    }
    private keydown(event: KeyboardEvent): void {
        const items = this.items.filter((item) =>
            item.label.toLowerCase().includes(this.query.toLowerCase()),
        );
        if (event.key === "ArrowDown") {
            event.preventDefault();
            this.activeIndex = Math.min(this.activeIndex + 1, Math.max(items.length - 1, 0));
            this.requestUpdate();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            this.activeIndex = Math.max(this.activeIndex - 1, 0);
            this.requestUpdate();
        } else if (event.key === "Enter") {
            const item = items[this.activeIndex];
            if (item) this.select(item);
        } else if (event.key === "Escape") {
            if (isTopOverlay(this)) this.setOpen(false);
        }
    }

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("open") && this.open) {
            document.addEventListener("click", this.onDocumentClick, true);
            registerOverlay(this, () => this.setOpen(false));
        }
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener("click", this.onDocumentClick, true);
        unregisterOverlay(this);
    }
    render() {
        if (!this.open) {
            return html`<button
                class="trigger"
                type="button"
                aria-haspopup="listbox"
                @click=${() => this.setOpen(true)}
            >
                ⌘ Commands
            </button>`;
        }
        const items = this.items.filter((item) =>
            item.label.toLowerCase().includes(this.query.toLowerCase()),
        );
        return html`<div class="command">
            <div class="search">
                <span aria-hidden="true">⌕</span
                ><input
                    placeholder=${this.placeholder}
                    aria-label=${this.placeholder}
                    .value=${this.query}
                    @input=${(event: Event) => {
                        this.query = (event.target as HTMLInputElement).value;
                        this.activeIndex = 0;
                        this.requestUpdate();
                    }}
                    @keydown=${this.keydown}
                />
            </div>
            <div class="items" role="listbox">
                ${
                    items.length
                        ? items.map(
                              (item, index) =>
                                  html`<button
                                      class="item"
                                      type="button"
                                      role="option"
                                      data-active=${index === this.activeIndex ? "true" : "false"}
                                      ?disabled=${item.disabled}
                                      @click=${() => this.select(item)}
                                  >
                                      <span>${item.label}</span>${
                                          item.shortcut ? html`<kbd>${item.shortcut}</kbd>` : null
                                      }
                                  </button>`,
                          )
                        : html`<div class="empty">NO COMMANDS</div>`
                }
            </div>
        </div>`;
    }
}

export class AdminColorPickerElement extends AdminElement {
    static properties = {
        value: { type: String },
        label: { type: String },
        disabled: { type: Boolean, reflect: true },
    };
    static styles = css`
        :host {
            display: inline-flex;
        }
        .picker {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        input[type="color"] {
            width: 36px;
            height: 36px;
            padding: 2px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-bg);
        }
        label {
            color: var(--aui-text-secondary);
            font: 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        code {
            color: var(--aui-text);
            font: 11px/1 var(--aui-font-mono);
        }
    `;
    value = "";
    label = "Color";
    disabled = false;
    private change(event: Event): void {
        this.value = (event.target as HTMLInputElement).value;
        this.dispatchDetail("aui-color-change", { value: this.value });
    }
    render() {
        return html`<div class="picker">
            <input
                type="color"
                .value=${this.value}
                ?disabled=${this.disabled}
                aria-label=${this.label}
                @input=${this.change}
            /><label>${this.label}</label><code>${this.value}</code>
        </div>`;
    }
}

export interface AdminDateRangePreset {
    id: string;
    label: string;
    start: string;
    end: string;
}

export class AdminDateRangeElement extends AdminElement {
    static properties = {
        start: { type: String },
        end: { type: String },
        startLabel: { type: String, attribute: "start-label" },
        endLabel: { type: String, attribute: "end-label" },
        min: { type: String },
        max: { type: String },
        presets: { attribute: false },
        presetLabel: { type: String, attribute: "preset-label" },
        clearable: { type: Boolean, reflect: true },
        required: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        invalid: { type: Boolean, reflect: true },
        error: { type: String },
    };
    static styles = css`
        :host {
            display: block;
        }
        .range {
            display: flex;
            flex-wrap: wrap;
            align-items: end;
            gap: 10px;
        }
        .presets {
            display: flex;
            flex: 1 0 100%;
            flex-wrap: wrap;
            align-items: center;
            gap: 6px;
        }
        .preset-label {
            color: var(--aui-text-muted);
            font: 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .preset,
        .clear {
            min-height: 28px;
            padding: 5px 8px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm, var(--aui-radius));
            background: var(--aui-surface);
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 10px/1 var(--aui-font-mono);
        }
        .preset:hover,
        .clear:hover {
            border-color: var(--aui-border-hover);
            color: var(--aui-text-primary);
        }
        .preset:focus-visible,
        .clear:focus-visible {
            outline: 2px solid var(--aui-focus);
            outline-offset: 2px;
        }
        label {
            display: flex;
            flex-direction: column;
            gap: 6px;
            color: var(--aui-text-secondary);
            font: 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        input {
            box-sizing: border-box;
            min-height: 36px;
            padding: 8px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-bg);
            color: var(--aui-text);
            color-scheme: var(--aui-color-scheme, dark);
            font: var(--aui-input-font-size, 12px)/1 var(--aui-font-mono);
        }
        input:focus {
            outline: 1px solid var(--aui-focus);
            outline-offset: 2px;
        }
        :host([invalid]) input {
            border-color: var(--aui-danger);
        }
        .error {
            margin-top: 6px;
            color: var(--aui-danger);
            font: 10px/1.3 var(--aui-font-mono);
        }
        .actions {
            display: flex;
            align-items: center;
            gap: 6px;
            padding-bottom: 1px;
        }
    `;
    start = "";
    end = "";
    startLabel = "From";
    endLabel = "To";
    min = "";
    max = "";
    presets: AdminDateRangePreset[] = [];
    presetLabel = "Quick ranges";
    clearable = false;
    required = false;
    disabled = false;
    invalid = false;
    error = "";

    private readonly startId = nextUid("date-range-start");
    private readonly endId = nextUid("date-range-end");
    private readonly errorId = nextUid("date-range-error");

    private isDate(value: string): boolean {
        return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
    }

    private validationError(): string {
        if (!this.isDate(this.start)) return "Start date must use YYYY-MM-DD format.";
        if (!this.isDate(this.end)) return "End date must use YYYY-MM-DD format.";
        if (this.required && (!this.start || !this.end)) return "Both dates are required.";
        if (this.start && this.end && this.start > this.end)
            return "Start date must be before end date.";
        if (
            this.min &&
            ((this.start && this.start < this.min) || (this.end && this.end < this.min))
        )
            return `Dates must be on or after ${this.min}.`;
        if (
            this.max &&
            ((this.start && this.start > this.max) || (this.end && this.end > this.max))
        )
            return `Dates must be on or before ${this.max}.`;
        return "";
    }

    protected willUpdate(changed: Map<string, unknown>): void {
        if (["start", "end", "min", "max", "required"].some((key) => changed.has(key))) {
            const error = this.validationError();
            if (error !== this.error || Boolean(error) !== this.invalid) {
                this.error = error;
                this.invalid = Boolean(error);
                this.dispatchDetail("aui-range-validation", { valid: !error, error });
            }
        }
    }

    private change(kind: "start" | "end", event: Event): void {
        this[kind] = (event.target as HTMLInputElement).value;
        this.dispatchDetail("aui-range-change", { start: this.start, end: this.end });
    }

    private applyPreset(preset: AdminDateRangePreset): void {
        this.start = preset.start;
        this.end = preset.end;
        this.dispatchDetail("aui-range-preset", {
            preset,
            start: this.start,
            end: this.end,
        });
        this.dispatchDetail("aui-range-change", { start: this.start, end: this.end });
        this.requestUpdate();
    }

    private clear(): void {
        this.start = "";
        this.end = "";
        this.dispatchDetail("aui-range-change", { start: "", end: "" });
        this.requestUpdate();
    }

    render() {
        const describedBy = this.error ? this.errorId : undefined;
        return html`<div class="range" role="group" aria-label="Date range">
            ${
                this.presets.length
                    ? html`<div class="presets" aria-label=${this.presetLabel}>
                          <span class="preset-label">${this.presetLabel}</span>
                          ${this.presets.map(
                              (preset) => html`<button
                                  class="preset"
                                  type="button"
                                  ?disabled=${this.disabled}
                                  @click=${() => this.applyPreset(preset)}
                              >
                                  ${preset.label}
                              </button>`,
                          )}
                      </div>`
                    : null
            }
            <label for=${this.startId}
                >${this.startLabel}<input
                    id=${this.startId}
                    type="date"
                    .value=${this.start}
                    min=${this.min || undefined}
                    max=${this.end || this.max || undefined}
                    ?required=${this.required}
                    ?disabled=${this.disabled}
                    aria-invalid=${this.invalid ? "true" : "false"}
                    aria-describedby=${describedBy}
                    @change=${(event: Event) => this.change("start", event)} /></label
            ><label for=${this.endId}
                >${this.endLabel}<input
                    id=${this.endId}
                    type="date"
                    .value=${this.end}
                    min=${this.start || this.min || undefined}
                    max=${this.max || undefined}
                    ?required=${this.required}
                    ?disabled=${this.disabled}
                    aria-invalid=${this.invalid ? "true" : "false"}
                    aria-describedby=${describedBy}
                    @change=${(event: Event) => this.change("end", event)} /></label
            >${
                this.clearable && (this.start || this.end)
                    ? html`<div class="actions">
                          <button
                              class="clear"
                              type="button"
                              ?disabled=${this.disabled}
                              @click=${this.clear}
                          >
                              Clear
                          </button>
                      </div>`
                    : null
            }${
                this.error
                    ? html`<div id=${this.errorId} class="error" role="alert">${this.error}</div>`
                    : null
            }
        </div>`;
    }
}

export class AdminTagInputElement extends AdminElement {
    static properties = {
        values: { attribute: false },
        placeholder: { type: String },
        disabled: { type: Boolean, reflect: true },
    };
    static styles = css`
        :host {
            display: block;
        }
        .input {
            min-height: var(--aui-control-height);
            display: flex;
            align-items: center;
            gap: 5px;
            flex-wrap: wrap;
            padding: 4px 7px;
            border: 1px solid var(--aui-border);
            background: var(--aui-bg);
        }
        .input:focus-within {
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        .tag {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 3px 6px;
            border: 1px solid var(--aui-border-hover);
            color: var(--aui-text);
            font: 10px/1 var(--aui-font-mono);
        }
        .tag button {
            padding: 0;
            border: 0;
            background: transparent;
            color: var(--aui-text-muted);
            cursor: pointer;
        }
        input {
            min-width: 90px;
            flex: 1;
            padding: 5px 2px;
            border: 0;
            outline: 0;
            background: transparent;
            color: var(--aui-text);
            font: var(--aui-input-font-size, 11px)/1.2 var(--aui-font-mono);
        }
        input::placeholder {
            color: var(--aui-text-muted);
        }
    `;
    values: string[] = [];
    placeholder = "Add tag and press Enter";
    disabled = false;
    private add(event: KeyboardEvent): void {
        if (event.key !== "Enter" && event.key !== ",") return;
        event.preventDefault();
        const input = event.target as HTMLInputElement;
        const value = input.value.trim().replace(/,$/, "");
        if (!value || this.values.includes(value)) return;
        this.values = [...this.values, value];
        input.value = "";
        this.dispatchDetail("aui-tags-change", { values: this.values });
        this.requestUpdate();
    }
    private removeValue(value: string): void {
        this.values = this.values.filter((item) => item !== value);
        this.dispatchDetail("aui-tags-change", { values: this.values });
        this.requestUpdate();
    }
    render() {
        return html`<div class="input">
            ${this.values.map(
                (value) =>
                    html`<span class="tag"
                        >${value}<button
                            type="button"
                            aria-label=${`Remove ${value}`}
                            @click=${() => this.removeValue(value)}
                        >
                            ×
                        </button></span
                    >`,
            )}<input
                placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                @keydown=${this.add}
            />
        </div>`;
    }
}
