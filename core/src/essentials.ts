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

function dateValue(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateParts(value: string): [number, number, number] | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
        ? [year, month, day]
        : null;
}

function timeSeconds(value: string): number | null {
    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] ?? 0);
    if (hour > 23 || minute > 59 || second > 59) return null;
    return hour * 3600 + minute * 60 + second;
}

function timeValue(total: number, withSeconds: boolean): string {
    const safe = Math.max(0, Math.min(86_399, Math.round(total)));
    const hour = Math.floor(safe / 3600);
    const minute = Math.floor((safe % 3600) / 60);
    const second = safe % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}${withSeconds ? `:${String(second).padStart(2, "0")}` : ""}`;
}

function withinDate(value: string, min: string, max: string): boolean {
    return Boolean(dateParts(value)) && (!min || value >= min) && (!max || value <= max);
}

function withinTime(value: string, min: string, max: string): boolean {
    const current = timeSeconds(value);
    const lower = min ? timeSeconds(min) : null;
    const upper = max ? timeSeconds(max) : null;
    return (
        current !== null &&
        (lower === null || current >= lower) &&
        (upper === null || current <= upper)
    );
}

class AdminDateLikeElement extends AdminElement {
    static properties = {
        value: { type: String },
        min: { type: String },
        max: { type: String },
        step: { type: Number },
        label: { type: String },
        disabled: { type: Boolean, reflect: true },
        open: { type: Boolean, reflect: true },
        picker: { type: String, reflect: true },
    };

    static styles = css`
        :host {
            position: relative;
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
        .input-wrap {
            position: relative;
            display: flex;
        }
        .input-wrap input {
            padding-right: 38px;
        }
        .toggle {
            position: absolute;
            top: 1px;
            right: 1px;
            bottom: 1px;
            width: 34px;
            border: 0;
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 12px/1 var(--aui-font-mono);
        }
        .toggle:hover:not(:disabled) {
            color: var(--aui-text-primary);
            background: var(--aui-control-bg-hover);
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
        .popover {
            position: absolute;
            z-index: 60;
            top: calc(100% + 6px);
            left: 0;
            width: min(296px, calc(100vw - 24px));
            padding: 12px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-md);
            background: var(--aui-surface-elevated);
            box-shadow: var(--aui-shadow-lg);
            color: var(--aui-text);
            backdrop-filter: var(--aui-backdrop-filter);
        }
        .calendar-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 10px;
        }
        .calendar-head strong {
            color: var(--aui-text-primary);
            font: 700 11px/1.2 var(--aui-font-mono);
            letter-spacing: 0.06em;
        }
        .calendar-head button,
        .day {
            border: 1px solid transparent;
            border-radius: var(--aui-radius-sm);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 11px/1 var(--aui-font-mono);
        }
        .calendar-head button {
            width: 28px;
            height: 28px;
            border-color: var(--aui-border);
        }
        .calendar-head button:hover:not(:disabled),
        .day:hover:not(:disabled) {
            border-color: var(--aui-border-hover);
            background: var(--aui-control-bg-hover);
            color: var(--aui-text-primary);
        }
        .weekdays,
        .days {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 3px;
        }
        .weekday {
            padding: 4px 0;
            color: var(--aui-text-muted);
            text-align: center;
            font: 9px/1 var(--aui-font-mono);
        }
        .day {
            min-height: 30px;
        }
        .day[data-muted="true"] {
            color: var(--aui-text-muted);
            opacity: 0.55;
        }
        .day[data-selected="true"] {
            border-color: var(--aui-primary);
            background: var(--aui-primary);
            color: var(--aui-primary-content);
        }
        .time-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
        }
        .time-grid label {
            display: grid;
            gap: 5px;
            color: var(--aui-text-muted);
            font-size: 9px;
        }
        .time-grid select {
            min-height: 34px;
            padding: 6px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-control-bg);
            color: var(--aui-text);
            font: 11px/1 var(--aui-font-mono);
        }
        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
            outline: 0;
            box-shadow: var(--aui-focus-ring);
        }
    `;

    value = "";
    min = "";
    max = "";
    step = 60;
    label = "";
    disabled = false;
    open = false;
    picker: "native" | "custom" = "native";
    protected inputType: DateLike = "date";
    private viewYear = -1;
    private viewMonth = -1;
    private readonly onDocumentPointerDown = (event: PointerEvent): void => {
        if (this.open && !event.composedPath().includes(this)) this.setOpen(false);
    };
    private readonly onDocumentKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "Escape" && this.open) {
            event.preventDefault();
            this.setOpen(false);
        }
    };

    connectedCallback(): void {
        super.connectedCallback();
        document.addEventListener("pointerdown", this.onDocumentPointerDown);
        document.addEventListener("keydown", this.onDocumentKeyDown);
        this.syncView();
    }

    disconnectedCallback(): void {
        document.removeEventListener("pointerdown", this.onDocumentPointerDown);
        document.removeEventListener("keydown", this.onDocumentKeyDown);
        super.disconnectedCallback();
    }

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("value")) this.syncView();
    }

    private syncView(): void {
        if (this.inputType !== "date") return;
        const parts = dateParts(this.value);
        const date = parts ? new Date(parts[0], parts[1], 1) : new Date();
        this.viewYear = date.getFullYear();
        this.viewMonth = date.getMonth();
    }

    private setOpen(open: boolean): void {
        if (this.disabled || this.open === open) return;
        this.open = open;
        this.dispatchDetail("aui-open-change", { open });
        this.requestUpdate();
    }

    private toggleOpen(): void {
        if (!this.open) this.syncView();
        this.setOpen(!this.open);
    }

    protected change(event: Event): void {
        const next = (event.target as HTMLInputElement).value;
        const valid =
            this.inputType === "date"
                ? !next || withinDate(next, this.min, this.max)
                : !next || withinTime(next, this.min, this.max);
        if (!valid) return;
        this.value = next;
        const detail = { value: this.value };
        this.dispatchDetail(
            this.inputType === "date" ? "aui-date-change" : "aui-time-change",
            detail,
        );
        this.dispatchDetail("aui-change", detail);
    }

    private chooseDate(value: string): void {
        if (!withinDate(value, this.min, this.max)) return;
        this.value = value;
        this.dispatchDetail("aui-date-change", { value });
        this.dispatchDetail("aui-change", { value });
        this.setOpen(false);
    }

    private changeTime(event: Event): void {
        const form = this.renderRoot.querySelector<HTMLFormElement>(".time-grid");
        if (!form) return;
        const current = timeSeconds(this.value) ?? 0;
        const currentHour = Math.floor(current / 3600);
        const currentMinute = Math.floor((current % 3600) / 60);
        const currentSecond = current % 60;
        const readPart = (selector: string, fallback: number): number => {
            const value = form.querySelector<HTMLSelectElement>(selector)?.value;
            return value === undefined || value === "" ? fallback : Number(value);
        };
        const target = event.target as HTMLSelectElement;
        const hour = target.matches("[data-part='hour']") ? Number(target.value) : currentHour;
        const minute = target.matches("[data-part='minute']")
            ? Number(target.value)
            : readPart("[data-part='minute']", currentMinute);
        const second = target.matches("[data-part='second']")
            ? Number(target.value)
            : currentSecond;
        const next = timeValue(hour * 3600 + minute * 60 + second, this.hasSeconds());
        const step = Math.max(1, this.step || 60);
        const total = timeSeconds(next) ?? 0;
        const base = timeSeconds(this.min) ?? 0;
        const valid = total % step === base % step && withinTime(next, this.min, this.max);
        if (!valid) return;
        this.value = next;
        this.dispatchDetail("aui-time-change", { value: next });
        this.dispatchDetail("aui-change", { value: next });
        void event;
    }

    private hasSeconds(): boolean {
        return (this.step > 0 && this.step < 60) || this.value.split(":").length > 2;
    }

    private moveMonth(delta: number): void {
        const next = new Date(this.viewYear, this.viewMonth + delta, 1);
        this.viewYear = next.getFullYear();
        this.viewMonth = next.getMonth();
        this.requestUpdate();
    }

    private renderDatePicker(): unknown {
        const first = new Date(this.viewYear, this.viewMonth, 1).getDay();
        const total = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
        const days = Array.from({ length: Math.ceil((first + total) / 7) * 7 }, (_, index) => {
            const day = index - first + 1;
            return { day, muted: day < 1 || day > total };
        });
        return html`<div class="popover" role="dialog" aria-label=${this.label || "Choose date"}>
            <div class="calendar-head">
                <button
                    type="button"
                    aria-label="Previous month"
                    @click=${() => this.moveMonth(-1)}
                >
                    ‹
                </button>
                <strong>${this.viewYear} / ${String(this.viewMonth + 1).padStart(2, "0")}</strong>
                <button type="button" aria-label="Next month" @click=${() => this.moveMonth(1)}>
                    ›
                </button>
            </div>
            <div class="weekdays" aria-hidden="true">
                ${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => html`<span class="weekday">${day}</span>`)}
            </div>
            <div class="days" role="grid">
                ${days.map((item) => {
                    const value = item.muted
                        ? ""
                        : dateValue(this.viewYear, this.viewMonth, item.day);
                    const selected = value === this.value;
                    const allowed = !item.muted && withinDate(value, this.min, this.max);
                    return html`<button
                        class="day"
                        type="button"
                        role="gridcell"
                        data-muted=${item.muted ? "true" : "false"}
                        data-selected=${selected ? "true" : "false"}
                        ?disabled=${!allowed}
                        aria-label=${value || "Outside month"}
                        @click=${() => this.chooseDate(value)}
                    >
                        ${item.muted ? "" : item.day}
                    </button>`;
                })}
            </div>
        </div>`;
    }

    private renderTimePicker(): unknown {
        const current = timeSeconds(this.value) ?? timeSeconds(this.min) ?? 0;
        const withSeconds = this.hasSeconds();
        const hour = Math.floor(current / 3600);
        const minute = Math.floor((current % 3600) / 60);
        const second = current % 60;
        const minuteStep = this.step >= 60 ? Math.max(1, Math.floor(this.step / 60)) : 1;
        const values = (count: number, step: number) =>
            Array.from({ length: Math.ceil(count / step) }, (_, index) => index * step).filter(
                (item) => item < count,
            );
        return html`<div class="popover" role="dialog" aria-label=${this.label || "Choose time"}>
            <div class="time-grid" @change=${this.changeTime}>
                <label
                    >HOUR<select data-part="hour" .value=${String(hour)} aria-label="Hour">
                        ${values(24, 1).map((item) => html`<option value=${item} ?selected=${item === hour}>${String(item).padStart(2, "0")}</option>`)}
                    </select></label
                >
                <label
                    >MINUTE<select data-part="minute" .value=${String(minute)} aria-label="Minute">
                        ${values(60, minuteStep).map((item) => html`<option value=${item} ?selected=${item === minute}>${String(item).padStart(2, "0")}</option>`)}
                    </select></label
                >
                ${
                    withSeconds
                        ? html`<label
                              >SECOND<select
                                  data-part="second"
                                  .value=${String(second)}
                                  aria-label="Second"
                              >
                                  ${values(60, Math.max(1, this.step)).map((item) => html`<option value=${item} ?selected=${item === second}>${String(item).padStart(2, "0")}</option>`)}
                              </select></label
                          >`
                        : null
                }
            </div>
        </div>`;
    }

    render() {
        if (this.picker !== "custom") {
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
        return html`<div class="field">
            ${this.label ? html`<label>${this.label}</label>` : null}
            <div class="input-wrap">
                <input
                    type="text"
                    inputmode=${this.inputType === "date" ? "numeric" : "decimal"}
                    .value=${this.value}
                    ?disabled=${this.disabled}
                    readonly=${this.inputType === "date" || this.open}
                    aria-haspopup="dialog"
                    aria-expanded=${this.open ? "true" : "false"}
                    aria-label=${this.label || this.inputType}
                    @change=${this.change}
                    @click=${this.toggleOpen}
                />
                <button
                    class="toggle"
                    type="button"
                    ?disabled=${this.disabled}
                    aria-label=${this.open ? "Close picker" : `Open ${this.inputType} picker`}
                    @click=${this.toggleOpen}
                >
                    ${this.inputType === "date" ? "▦" : "◷"}
                </button>
            </div>
            ${this.open ? (this.inputType === "date" ? this.renderDatePicker() : this.renderTimePicker()) : null}
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
