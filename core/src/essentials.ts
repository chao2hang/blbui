/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement } from "./base";

export interface AdminMenuEntry {
    id: string;
    label: string;
    description?: string;
    shortcut?: string;
    icon?: string;
    disabled?: boolean;
    danger?: boolean;
    separator?: boolean;
}

export class AdminMenuElement extends AdminElement {
    static properties = {
        items: { attribute: false },
        value: { type: String, reflect: true },
        orientation: { type: String, reflect: true },
        compact: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: block;
        }
        nav {
            display: flex;
            flex-direction: column;
            gap: 3px;
            min-width: 180px;
            padding: 6px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface);
            color: var(--aui-text);
        }
        :host([orientation="horizontal"]) nav {
            flex-direction: row;
            align-items: center;
            min-width: 0;
        }
        :host([orientation="horizontal"]) button {
            width: auto;
        }
        button {
            width: 100%;
            display: grid;
            grid-template-columns: auto minmax(0, 1fr) auto;
            align-items: center;
            gap: 9px;
            min-height: 34px;
            padding: 7px 9px;
            border: 1px solid transparent;
            border-radius: var(--aui-radius-sm);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            font: 500 12px/1.25 var(--aui-font-ui);
        }
        :host([compact]) button {
            min-height: 28px;
            padding-block: 4px;
        }
        button:hover:not(:disabled),
        button[aria-current="page"] {
            border-color: var(--aui-border-hover);
            background: var(--aui-control-bg-hover);
            color: var(--aui-text-primary);
        }
        button[aria-current="page"] {
            border-left-color: var(--aui-primary);
        }
        button.danger {
            color: var(--aui-danger);
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.4;
        }
        .icon,
        .shortcut {
            color: var(--aui-text-muted);
            font-family: var(--aui-font-mono);
        }
        .label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .description {
            display: block;
            margin-top: 2px;
            color: var(--aui-text-muted);
            font-size: 10px;
        }
        .separator {
            height: 1px;
            margin: 4px 2px;
            background: var(--aui-border);
        }
    `;

    items: AdminMenuEntry[] = [];
    value = "";
    orientation: "vertical" | "horizontal" = "vertical";
    compact = false;

    private select(item: AdminMenuEntry): void {
        if (item.disabled || item.separator) return;
        this.value = item.id;
        this.dispatchDetail("aui-menu-select", { id: item.id, item });
    }

    render() {
        return html`<nav role="menu" aria-label="Menu">
            ${this.items.map((item) =>
                item.separator
                    ? html`<div class="separator" role="separator"></div>`
                    : html`<button
                          type="button"
                          class=${item.danger ? "danger" : ""}
                          ?disabled=${item.disabled}
                          aria-current=${item.id === this.value ? "page" : undefined}
                          role="menuitem"
                          @click=${() => this.select(item)}
                      >
                          <span class="icon" aria-hidden="true">${item.icon ?? ""}</span>
                          <span class="label"
                              >${item.label}${
                                  item.description
                                      ? html`<small class="description">${item.description}</small>`
                                      : null
                              }</span
                          >
                          <span class="shortcut">${item.shortcut ?? ""}</span>
                      </button>`,
            )}
            <slot></slot>
        </nav>`;
    }
}

export class AdminSidebarElement extends AdminElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        width: { type: String },
        closeLabel: { type: String, attribute: "close-label" },
    };

    static styles = css`
        :host {
            display: block;
            width: var(--aui-sidebar-width, 256px);
        }
        .sidebar {
            width: var(--aui-sidebar-width, 256px);
            min-height: 100%;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--aui-border);
            background: var(--aui-surface);
            color: var(--aui-text);
            transition:
                width var(--aui-transition),
                transform var(--aui-transition),
                opacity var(--aui-transition);
        }
        :host(:not([open])) .sidebar {
            width: 0;
            overflow: hidden;
            transform: translateX(-8px);
            opacity: 0;
            pointer-events: none;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            min-height: 56px;
            padding: 12px 14px;
            border-bottom: 1px solid var(--aui-border);
        }
        h2 {
            min-width: 0;
            margin: 0;
            overflow: hidden;
            color: var(--aui-text-primary);
            text-overflow: ellipsis;
            white-space: nowrap;
            font: 700 12px/1 var(--aui-font-mono);
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .close {
            width: 28px;
            height: 28px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
        }
        .close:hover {
            border-color: var(--aui-border-hover);
            color: var(--aui-text-primary);
        }
        .body {
            flex: 1;
            min-height: 0;
            padding: 12px;
            overflow: auto;
        }
        .footer {
            padding: 12px;
            border-top: 1px solid var(--aui-border);
        }
    `;

    open = true;
    title = "Navigation";
    width = "256px";
    closeLabel = "Close navigation";

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("width")) this.style.setProperty("--aui-sidebar-width", this.width);
    }

    private close(): void {
        this.open = false;
        this.dispatchDetail("aui-open-change", { open: false });
    }

    render() {
        return html`<aside class="sidebar" aria-label=${this.title}>
            <header class="header">
                <h2>${this.title}</h2>
                <button
                    class="close"
                    type="button"
                    aria-label=${this.closeLabel}
                    @click=${this.close}
                >
                    ×
                </button>
            </header>
            <div class="body"><slot></slot></div>
            <footer class="footer"><slot name="footer"></slot></footer>
        </aside>`;
    }
}

export class AdminNavbarElement extends AdminElement {
    static properties = {
        title: { type: String },
        sticky: { type: Boolean, reflect: true },
        bordered: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: block;
        }
        header {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 18px;
            min-height: var(--aui-header-height, 64px);
            padding: 10px var(--aui-page-padding, 32px);
            background: var(--aui-surface-translucent, var(--aui-surface));
            color: var(--aui-text);
            backdrop-filter: var(--aui-backdrop-filter, none);
        }
        :host([sticky]) header {
            position: sticky;
            top: 0;
        }
        :host([bordered]) header {
            border-bottom: 1px solid var(--aui-border);
        }
        .brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            color: var(--aui-text-primary);
        }
        .title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font: 700 13px/1.2 var(--aui-font-mono);
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        .content {
            flex: 1;
            min-width: 0;
        }
        .actions {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
    `;

    title = "";
    sticky = false;
    bordered = true;

    render() {
        return html`<header>
            <div class="brand">
                <slot name="brand"><span class="title">${this.title}</span></slot>
            </div>
            <div class="content"><slot></slot></div>
            <div class="actions"><slot name="actions"></slot></div>
        </header>`;
    }
}

type DateLike = "date" | "time";

class AdminDateLikeElement extends AdminElement {
    static properties = {
        value: { type: String },
        min: { type: String },
        max: { type: String },
        step: { type: Number },
        label: { type: String },
        disabled: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: inline-flex;
            width: 100%;
            max-width: 280px;
        }
        .field {
            width: 100%;
            display: grid;
            gap: 6px;
        }
        label {
            color: var(--aui-text-secondary);
            font: 700 10px/1 var(--aui-font-mono);
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        input {
            box-sizing: border-box;
            width: 100%;
            min-height: var(--aui-control-height);
            padding: 8px 10px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            outline: 0;
            background: var(--aui-control-bg);
            color: var(--aui-text);
            color-scheme: var(--aui-color-scheme, dark);
            font: var(--aui-input-font-size, 12px)/1.2 var(--aui-font-mono);
            transition:
                border-color var(--aui-transition),
                box-shadow var(--aui-transition);
        }
        input:hover:not(:disabled) {
            border-color: var(--aui-control-border-hover);
        }
        input:focus {
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        input:disabled {
            cursor: not-allowed;
            opacity: 0.45;
        }
    `;

    value = "";
    min = "";
    max = "";
    step = 60;
    label = "";
    disabled = false;
    protected inputType: DateLike = "date";

    protected change(event: Event): void {
        this.value = (event.target as HTMLInputElement).value;
        const detail = { value: this.value };
        this.dispatchDetail(
            this.inputType === "date" ? "aui-date-change" : "aui-time-change",
            detail,
        );
        this.dispatchDetail("aui-change", detail);
    }

    render() {
        return html`<div class="field">
            ${this.label ? html`<label>${this.label}</label>` : null}
            <input
                type=${this.inputType}
                .value=${this.value}
                min=${this.min || undefined}
                max=${this.max || undefined}
                step=${this.step || undefined}
                ?disabled=${this.disabled}
                aria-label=${this.label || this.inputType}
                @change=${this.change}
            />
        </div>`;
    }
}

export class AdminDatePickerElement extends AdminDateLikeElement {
    protected inputType: DateLike = "date";
}

export class AdminTimePickerElement extends AdminDateLikeElement {
    protected inputType: DateLike = "time";
}

export class AdminPinInputElement extends AdminElement {
    static properties = {
        length: { type: Number },
        value: { type: String },
        masked: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        label: { type: String },
    };

    static styles = css`
        :host {
            display: inline-flex;
            max-width: 100%;
        }
        .field {
            display: grid;
            gap: 7px;
        }
        label {
            color: var(--aui-text-secondary);
            font: 700 10px/1 var(--aui-font-mono);
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        .inputs {
            display: flex;
            max-width: 100%;
            flex-wrap: wrap;
            gap: 8px;
        }
        input {
            box-sizing: border-box;
            width: 38px;
            height: 42px;
            padding: 0;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            outline: 0;
            background: var(--aui-control-bg);
            color: var(--aui-text-primary);
            text-align: center;
            font: 700 16px/1 var(--aui-font-mono);
            transition:
                border-color var(--aui-transition),
                box-shadow var(--aui-transition),
                background var(--aui-transition);
        }
        input:focus {
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
            background: var(--aui-control-bg-hover);
        }
        input:disabled {
            cursor: not-allowed;
            opacity: 0.45;
        }
        :host([masked]) input {
            -webkit-text-security: disc;
        }
        @media (max-width: 420px) {
            .inputs {
                gap: 5px;
            }
            input {
                width: 32px;
            }
        }
    `;

    length = 6;
    value = "";
    masked = false;
    disabled = false;
    label = "Verification code";

    private get normalizedLength(): number {
        return Math.max(1, Math.min(12, Math.floor(this.length || 6)));
    }

    private handleInput(index: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        const digit = input.value.replace(/[^0-9A-Za-z]/g, "").slice(-1);
        input.value = digit;
        const chars = [...this.renderRoot.querySelectorAll<HTMLInputElement>("input")].map(
            (node) => node.value,
        );
        this.value = chars.join("");
        this.dispatchDetail("aui-pin-change", {
            value: this.value,
            complete: this.value.length === this.normalizedLength,
        });
        if (digit) {
            const next = this.renderRoot.querySelectorAll<HTMLInputElement>("input")[index + 1];
            next?.focus();
        }
    }

    private handleKeydown(index: number, event: KeyboardEvent): void {
        if (event.key !== "Backspace") return;
        const input = event.target as HTMLInputElement;
        if (input.value) return;
        this.renderRoot.querySelectorAll<HTMLInputElement>("input")[index - 1]?.focus();
    }

    render() {
        const digits = Array.from(
            { length: this.normalizedLength },
            (_, index) => this.value[index] ?? "",
        );
        return html`<div class="field">
            ${this.label ? html`<label>${this.label}</label>` : null}
            <div class="inputs" role="group" aria-label=${this.label}>
                ${digits.map(
                    (digit, index) => html`<input
                        inputmode="numeric"
                        maxlength="1"
                        autocomplete=${index === 0 ? "one-time-code" : "off"}
                        type=${this.masked ? "password" : "text"}
                        aria-label=${`${this.label} ${index + 1}`}
                        .value=${digit}
                        ?disabled=${this.disabled}
                        @input=${(event: Event) => this.handleInput(index, event)}
                        @keydown=${(event: KeyboardEvent) => this.handleKeydown(index, event)}
                    />`,
                )}
            </div>
        </div>`;
    }
}

export interface AdminDescriptionItem {
    label: string;
    value: string;
    description?: string;
    span?: number;
}

export class AdminDescriptionsElement extends AdminElement {
    static properties = {
        items: { attribute: false },
        columns: { type: Number },
        bordered: { type: Boolean, reflect: true },
        compact: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            display: block;
            min-width: 0;
            max-width: 100%;
            container-type: inline-size;
        }
        dl {
            display: grid;
            grid-template-columns: repeat(var(--aui-description-columns, 2), minmax(0, 1fr));
            margin: 0;
            border-top: 1px solid var(--aui-border);
            border-left: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            overflow: hidden;
        }
        .item {
            min-width: 0;
            display: grid;
            grid-template-columns: minmax(90px, 0.65fr) minmax(0, 1.35fr);
            gap: 12px;
            padding: 12px 14px;
            border-right: 1px solid var(--aui-border);
            border-bottom: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        :host([compact]) .item {
            padding-block: 8px;
        }
        :host(:not([bordered])) dl {
            border: 0;
            border-radius: var(--aui-radius-none);
        }
        :host(:not([bordered])) .item {
            border-right: 0;
            padding-inline: 0;
        }
        dt {
            color: var(--aui-text-secondary);
            font: 700 10px/1.3 var(--aui-font-mono);
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }
        dd {
            min-width: 0;
            margin: 0;
            color: var(--aui-text);
            font: 12px/1.4 var(--aui-font-ui);
        }
        dd small {
            display: block;
            margin-top: 3px;
            color: var(--aui-text-muted);
            font: 10px/1.35 var(--aui-font-mono);
        }
        @container (max-width: 600px) {
            dl {
                grid-template-columns: 1fr;
            }
        }
    `;

    items: AdminDescriptionItem[] = [];
    columns = 2;
    bordered = true;
    compact = false;

    render() {
        const columns = Math.max(1, Math.min(4, this.columns));
        return html`<dl style=${`--aui-description-columns:${columns}`}>
            ${this.items.map(
                (item) => html`<div
                    class="item"
                    style=${`grid-column:span ${Math.max(1, item.span ?? 1)}`}
                >
                    <dt>${item.label}</dt>
                    <dd>
                        ${item.value}${item.description ? html`<small>${item.description}</small>` : null}
                    </dd>
                </div>`,
            )}
            <slot></slot>
        </dl>`;
    }
}
