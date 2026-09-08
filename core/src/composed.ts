/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement, nextUid } from "./base";
import type { AdminDataGridColumn } from "./system";

export type AdminFormLayout = "vertical" | "horizontal";

export class AdminFormElement extends AdminElement {
    static properties = {
        layout: { type: String, reflect: true },
        loading: { type: Boolean, reflect: true },
        submitLabel: { type: String, attribute: "submit-label" },
        resetLabel: { type: String, attribute: "reset-label" },
        showActions: { type: Boolean, attribute: "show-actions" },
        noValidate: { type: Boolean, attribute: "no-validate" },
    };

    static styles = css`
        :host {
            display: block;
        }
        form {
            display: grid;
            gap: 18px;
        }
        .fields {
            display: grid;
            gap: 16px;
        }
        :host([layout="horizontal"]) .fields {
            grid-template-columns: minmax(130px, 0.35fr) minmax(0, 1fr);
            align-items: start;
        }
        .actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            padding-top: 4px;
            border-top: 1px solid var(--aui-border);
        }
        button {
            min-height: var(--aui-control-height, 36px);
            padding: 8px 13px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-control-bg);
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 700 11px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        button[type="submit"] {
            border-color: var(--aui-primary);
            background: var(--aui-primary);
            color: var(--aui-primary-content);
        }
        button:hover:not(:disabled) {
            border-color: var(--aui-control-border-hover);
            color: var(--aui-text-primary);
        }
        button[type="submit"]:hover:not(:disabled) {
            background: var(--aui-secondary);
            color: var(--aui-secondary-content);
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.35;
        }
        @media (max-width: 640px) {
            :host([layout="horizontal"]) .fields {
                grid-template-columns: 1fr;
            }
            .actions {
                justify-content: stretch;
            }
            .actions button {
                flex: 1;
            }
        }
    `;

    layout: AdminFormLayout = "vertical";
    loading = false;
    submitLabel = "SUBMIT";
    resetLabel = "RESET";
    showActions = true;
    noValidate = false;

    private valid(): boolean {
        const form = this.shadowRoot?.querySelector<HTMLFormElement>("form");
        if (!form || this.noValidate) return true;
        return form.checkValidity();
    }

    private submit(event: SubmitEvent): void {
        event.preventDefault();
        const valid = this.valid();
        this.dispatchDetail("aui-submit", { valid });
        if (!valid) this.dispatchDetail("aui-invalid", {});
    }

    private reset(event: Event): void {
        event.preventDefault();
        this.shadowRoot?.querySelector<HTMLFormElement>("form")?.reset();
        this.dispatchDetail("aui-reset", {});
    }

    render() {
        return html`<form
            ?novalidate=${this.noValidate}
            aria-busy=${this.loading ? "true" : "false"}
            @submit=${this.submit}
        >
            <div class="fields"><slot></slot></div>
            ${
                this.showActions
                    ? html`<div class="actions">
                          <button type="reset" ?disabled=${this.loading} @click=${this.reset}>
                              ${this.resetLabel}
                          </button>
                          <button
                              type="submit"
                              ?disabled=${this.loading}
                              aria-busy=${this.loading ? "true" : "false"}
                          >
                              ${this.loading ? "LOADING..." : this.submitLabel}
                          </button>
                          <slot name="actions"></slot>
                      </div>`
                    : html`<slot name="actions"></slot>`
            }
        </form>`;
    }
}

export class AdminFormItemElement extends AdminElement {
    static properties = {
        label: { type: String },
        description: { type: String },
        error: { type: String },
        required: { type: Boolean, reflect: true },
        name: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            min-width: 0;
        }
        .item {
            display: grid;
            gap: 7px;
        }
        .label {
            color: var(--aui-text-secondary);
            font: 11px/1.2 var(--aui-font-mono);
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        .required {
            color: var(--aui-danger);
        }
        .description,
        .error {
            font: 11px/1.4 var(--aui-font-mono);
        }
        .description {
            color: var(--aui-text-muted);
        }
        .error {
            color: var(--aui-danger);
        }
        .control {
            min-width: 0;
        }
    `;

    label = "";
    description = "";
    error = "";
    required = false;
    name = "";
    private readonly controlId = nextUid("form-control");
    private readonly labelId = nextUid("form-label");
    private readonly messageId = nextUid("form-message");

    private syncControl(): void {
        const control = this.querySelector<HTMLElement>(
            "input, select, textarea, button, [role='combobox'], [role='textbox'], [role='checkbox']",
        );
        if (!control) return;
        if (!control.id) control.id = this.name || this.controlId;
        control.setAttribute("aria-labelledby", this.labelId);
        // The control is slotted into this component, while the visible label
        // lives in the component's shadow root. `aria-labelledby` cannot cross
        // that boundary for every browser/axe combination, so keep a direct
        // accessible name as the interoperable fallback.
        control.setAttribute("aria-label", this.label || this.name || "Field");
        const describedBy = [
            this.description ? `${this.messageId}-description` : "",
            this.error ? `${this.messageId}-error` : "",
        ]
            .filter(Boolean)
            .join(" ");
        if (describedBy) control.setAttribute("aria-describedby", describedBy);
        else control.removeAttribute("aria-describedby");
        if (this.error) control.setAttribute("aria-invalid", "true");
        else control.removeAttribute("aria-invalid");
    }

    protected updated(): void {
        this.syncControl();
    }

    render() {
        const descriptionId = this.description ? `${this.messageId}-description` : undefined;
        const errorId = this.error ? `${this.messageId}-error` : undefined;
        return html`<div class="item" data-invalid=${this.error ? "true" : "false"}>
            <label class="label" id=${this.labelId} for=${this.name || this.controlId}>
                ${this.label}<span class="required" ?hidden=${!this.required}> *</span>
                <slot name="label"></slot>
            </label>
            ${this.description ? html`<div class="description" id=${descriptionId}>${this.description}</div>` : null}
            <div class="control"><slot @slotchange=${this.syncControl}></slot></div>
            ${this.error ? html`<div class="error" id=${errorId} role="alert">${this.error}</div>` : null}
        </div>`;
    }
}

export type AdminSchemaFieldType =
    | "text"
    | "email"
    | "number"
    | "password"
    | "date"
    | "textarea"
    | "select"
    | "checkbox";

export interface AdminSchemaFormOption {
    value: string;
    label: string;
}

export interface AdminSchemaFormField {
    name: string;
    label: string;
    type?: AdminSchemaFieldType;
    value?: string | number | boolean;
    placeholder?: string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
    options?: AdminSchemaFormOption[];
}

export type AdminSchemaFormValue = string | number | boolean;

export class AdminSchemaFormElement extends AdminElement {
    static properties = {
        fields: { attribute: false },
        values: { attribute: false },
        layout: { type: String, reflect: true },
        loading: { type: Boolean, reflect: true },
        submitLabel: { type: String, attribute: "submit-label" },
        resetLabel: { type: String, attribute: "reset-label" },
    };

    static styles = css`
        :host {
            display: block;
        }
        form {
            display: grid;
            gap: 16px;
        }
        .fields {
            display: grid;
            gap: 14px;
        }
        :host([layout="horizontal"]) .fields {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .select-control {
            position: relative;
            width: 100%;
        }
        .control,
        input,
        textarea,
        select {
            box-sizing: border-box;
            width: 100%;
            min-height: var(--aui-control-height, 36px);
            padding: 8px 10px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            outline: 0;
            background: var(--aui-control-bg);
            color: var(--aui-text);
            font: var(--aui-input-font-size, 12px) / 1.3 var(--aui-font-mono);
        }
        .select-control select {
            padding-right: 46px;
            appearance: none;
            -webkit-appearance: none;
        }
        .select-control select::-ms-expand {
            display: none;
        }
        .select-chevron {
            position: absolute;
            top: 1px;
            right: 1px;
            bottom: 1px;
            width: 34px;
            display: grid;
            place-items: center;
            pointer-events: none;
            color: var(--aui-text-muted);
        }
        .select-chevron::before {
            width: 7px;
            height: 7px;
            border-right: 1px solid currentColor;
            border-bottom: 1px solid currentColor;
            content: "";
            transform: translateY(-2px) rotate(45deg);
        }
        .select-control select:hover:not(:disabled) + .select-chevron {
            color: var(--aui-text-secondary);
        }
        .select-control select:focus + .select-chevron {
            color: var(--aui-text-primary);
        }
        .select-control select:disabled + .select-chevron {
            opacity: 0.35;
        }
        textarea {
            min-height: 92px;
            resize: vertical;
        }
        input:focus,
        textarea:focus,
        select:focus {
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        input[type="checkbox"] {
            width: 16px;
            min-height: 16px;
            padding: 0;
            accent-color: var(--aui-primary);
        }
        .checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            min-height: var(--aui-control-height, 36px);
            color: var(--aui-text);
            font: 12px/1.3 var(--aui-font-mono);
        }
        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding-top: 4px;
            border-top: 1px solid var(--aui-border);
        }
        button {
            min-height: var(--aui-control-height, 36px);
            padding: 8px 13px;
            border: 1px solid var(--aui-primary);
            border-radius: var(--aui-radius);
            background: var(--aui-primary);
            color: var(--aui-primary-content);
            cursor: pointer;
            font: 700 11px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.35;
        }
        @media (max-width: 640px) {
            :host([layout="horizontal"]) .fields {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 768px) {
            .fields {
                gap: 15px;
            }
            input:not([type="checkbox"]),
            select {
                height: 38px;
                min-height: 38px;
                line-height: 20px;
            }
        }
    `;

    fields: AdminSchemaFormField[] = [];
    values: Record<string, AdminSchemaFormValue> = {};
    layout: AdminFormLayout = "vertical";
    loading = false;
    submitLabel = "SUBMIT";
    resetLabel = "RESET";

    protected willUpdate(changed: Map<string, unknown>): void {
        if (changed.has("fields") && !Object.keys(this.values).length)
            this.values = this.defaults();
    }

    private defaults(): Record<string, AdminSchemaFormValue> {
        return Object.fromEntries(
            this.fields.map((field) => [
                field.name,
                field.value ??
                    (field.type === "checkbox" ? false : field.type === "number" ? 0 : ""),
            ]),
        );
    }

    private valueFor(field: AdminSchemaFormField): AdminSchemaFormValue {
        return this.values[field.name] ?? field.value ?? (field.type === "checkbox" ? false : "");
    }

    private change(field: AdminSchemaFormField, event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const value: AdminSchemaFormValue =
            field.type === "checkbox"
                ? (target as HTMLInputElement).checked
                : field.type === "number"
                  ? Number(target.value)
                  : target.value;
        this.values = { ...this.values, [field.name]: value };
        this.dispatchDetail("aui-change", { name: field.name, value, values: this.values });
        this.dispatchDetail("aui-form-change", { name: field.name, value, values: this.values });
    }

    private valid(): boolean {
        const items = [...(this.shadowRoot?.querySelectorAll("aui-form-item") ?? [])];
        return items.every((item) => {
            const control = item.querySelector<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >("input, textarea, select");
            return !control || control.checkValidity();
        });
    }

    private submit(event: SubmitEvent): void {
        event.preventDefault();
        const valid = this.valid();
        const detail = { valid, values: this.values };
        this.dispatchDetail("aui-submit", detail);
        this.dispatchDetail("aui-form-submit", detail);
    }

    private reset(event: Event): void {
        event.preventDefault();
        this.values = this.defaults();
        this.dispatchDetail("aui-reset", { values: this.values });
        this.requestUpdate();
    }

    private control(field: AdminSchemaFormField): unknown {
        const value = this.valueFor(field);
        const common = {
            id: field.name,
            name: field.name,
            "aria-label": field.label,
            placeholder: field.placeholder,
            disabled: field.disabled || this.loading,
            required: field.required,
        };
        if (field.type === "textarea") {
            return html`<textarea
                id=${field.name}
                name=${field.name}
                aria-label=${field.label}
                placeholder=${field.placeholder ?? ""}
                ?disabled=${common.disabled}
                ?required=${field.required}
                .value=${String(value)}
                @input=${(event: Event) => this.change(field, event)}
            ></textarea>`;
        }
        if (field.type === "select") {
            return html`<div class="select-control">
                <select
                    id=${field.name}
                    name=${field.name}
                    aria-label=${field.label}
                    ?disabled=${common.disabled}
                    ?required=${field.required}
                    .value=${String(value)}
                    @change=${(event: Event) => this.change(field, event)}
                >
                    ${field.options?.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
                </select>
                <span class="select-chevron" aria-hidden="true"></span>
            </div>`;
        }
        return html`<input
            id=${field.name}
            name=${field.name}
            aria-label=${field.label}
            type=${field.type ?? "text"}
            placeholder=${field.placeholder ?? ""}
            ?disabled=${common.disabled}
            ?required=${field.required}
            .value=${field.type === "checkbox" ? "" : String(value)}
            .checked=${field.type === "checkbox" ? Boolean(value) : false}
            @input=${(event: Event) => this.change(field, event)}
            @change=${(event: Event) => this.change(field, event)}
        />`;
    }

    render() {
        return html`<form @submit=${this.submit}>
            <div class="fields">
                ${this.fields.map((field) =>
                    field.type === "checkbox"
                        ? html`<label class="checkbox"
                              ><input
                                  type="checkbox"
                                  name=${field.name}
                                  aria-label=${field.label}
                                  .checked=${Boolean(this.valueFor(field))}
                                  ?disabled=${field.disabled || this.loading}
                                  ?required=${field.required}
                                  @change=${(event: Event) => this.change(field, event)}
                              /><span>${field.label}</span></label
                          >`
                        : html`<aui-form-item
                              label=${field.label}
                              description=${field.description ?? ""}
                              ?required=${field.required}
                              >${this.control(field)}</aui-form-item
                          >`,
                )}
            </div>
            <div class="actions">
                <button type="reset" ?disabled=${this.loading} @click=${this.reset}>
                    ${this.resetLabel}
                </button>
                <button
                    type="submit"
                    ?disabled=${this.loading}
                    aria-busy=${this.loading ? "true" : "false"}
                >
                    ${this.loading ? "LOADING..." : this.submitLabel}
                </button>
            </div>
        </form>`;
    }
}

export class AdminTruncatedTextElement extends AdminElement {
    static properties = {
        text: { type: String },
        lines: { type: Number },
        label: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            min-width: 0;
            max-width: 100%;
        }
        .text {
            display: -webkit-box;
            overflow: hidden;
            color: var(--aui-text);
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: var(--aui-truncated-lines, 1);
            overflow-wrap: anywhere;
        }
    `;

    text = "";
    lines = 1;
    label = "";

    render() {
        const label = this.label || this.text;
        return html`<span
            class="text"
            title=${label}
            aria-label=${label}
            style=${`--aui-truncated-lines:${Math.max(1, Math.floor(this.lines))}`}
            ><slot>${this.text}</slot></span
        >`;
    }
}

export class AdminLoadingOverlayElement extends AdminElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        label: { type: String },
        fullscreen: { type: Boolean, reflect: true },
    };

    static styles = css`
        :host {
            position: relative;
            display: block;
            min-width: 0;
        }
        :host([fullscreen]) {
            position: fixed;
            z-index: 80;
            inset: 0;
        }
        .frame {
            position: relative;
            min-width: 0;
        }
        .overlay {
            position: absolute;
            z-index: 1;
            inset: 0;
            display: grid;
            place-items: center;
            min-height: 72px;
            background: var(--aui-surface-translucent);
            backdrop-filter: var(--aui-backdrop-filter, none);
        }
        :host([fullscreen]) .overlay {
            position: fixed;
        }
        :host(:not([open])) .overlay {
            display: none;
        }
        .message {
            display: grid;
            justify-items: center;
            gap: 9px;
            padding: 14px 18px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface-elevated);
            color: var(--aui-text-secondary);
            font: 11px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
    `;

    open = false;
    label = "LOADING...";
    fullscreen = false;

    render() {
        return html`<div class="frame" aria-busy=${this.open ? "true" : "false"}>
            <slot></slot>
            <div class="overlay" role="status" aria-live="polite" aria-label=${this.label}>
                <div class="message"><aui-spinner></aui-spinner><span>${this.label}</span></div>
            </div>
        </div>`;
    }
}

export class AdminProgressRingElement extends AdminElement {
    static properties = {
        value: { type: Number },
        max: { type: Number },
        size: { type: Number },
        strokeWidth: { type: Number, attribute: "stroke-width" },
        label: { type: String },
        showValue: { type: Boolean, attribute: "show-value" },
    };

    static styles = css`
        :host {
            display: inline-flex;
        }
        .ring {
            position: relative;
            display: inline-grid;
            place-items: center;
        }
        svg {
            display: block;
            transform: rotate(-90deg);
        }
        circle {
            fill: none;
        }
        .track {
            stroke: var(--aui-border);
        }
        .indicator {
            stroke: var(--aui-primary);
            stroke-linecap: round;
            transition: stroke-dashoffset var(--aui-transition);
        }
        .value {
            position: absolute;
            color: var(--aui-text-primary);
            font: 700 10px/1 var(--aui-font-mono);
        }
        @media (prefers-reduced-motion: reduce) {
            .indicator {
                transition: none;
            }
        }
    `;

    value = 0;
    max = 100;
    size = 48;
    strokeWidth = 4;
    label = "Progress";
    showValue = true;

    get percentage(): number {
        return Math.min(100, Math.max(0, this.max > 0 ? (this.value / this.max) * 100 : 0));
    }

    render() {
        const safeSize = Math.max(24, this.size);
        const safeStroke = Math.min(safeSize / 2, Math.max(1, this.strokeWidth));
        const center = safeSize / 2;
        const radius = center - safeStroke / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - this.percentage / 100);
        return html`<div
            class="ring"
            role="progressbar"
            aria-label=${this.label}
            aria-valuemin="0"
            aria-valuemax=${this.max}
            aria-valuenow=${Math.min(this.max, Math.max(0, this.value))}
        >
            <svg width=${safeSize} height=${safeSize} viewBox=${`0 0 ${safeSize} ${safeSize}`}>
                <circle
                    class="track"
                    cx=${center}
                    cy=${center}
                    r=${radius}
                    stroke-width=${safeStroke}
                ></circle>
                <circle
                    class="indicator"
                    cx=${center}
                    cy=${center}
                    r=${radius}
                    stroke-width=${safeStroke}
                    stroke-dasharray=${circumference}
                    stroke-dashoffset=${offset}
                ></circle>
            </svg>
            ${this.showValue ? html`<span class="value">${Math.round(this.percentage)}%</span>` : null}
        </div>`;
    }
}

export class AdminColumnSettingsElement extends AdminElement {
    static properties = {
        columns: { attribute: false },
        visibleKeys: { attribute: false },
        open: { type: Boolean, reflect: true },
        title: { type: String },
        closeLabel: { type: String, attribute: "close-label" },
    };

    static styles = css`
        :host {
            position: relative;
            display: inline-block;
        }
        .trigger,
        .close {
            min-height: 30px;
            padding: 6px 9px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-control-bg);
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 10px/1.1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .trigger:hover,
        .close:hover,
        .trigger:focus-visible,
        .close:focus-visible {
            border-color: var(--aui-focus);
            color: var(--aui-text-primary);
        }
        .panel {
            position: absolute;
            z-index: 10;
            top: calc(100% + 6px);
            right: 0;
            width: min(280px, calc(100vw - 24px));
            padding: 12px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-surface-elevated);
            box-shadow: var(--aui-shadow-md);
        }
        :host(:not([open])) .panel {
            display: none;
        }
        .heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
            color: var(--aui-text-primary);
            font: 700 11px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .list {
            display: grid;
            gap: 6px;
        }
        label {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px;
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: 11px/1.2 var(--aui-font-mono);
        }
        label:hover {
            background: var(--aui-control-bg-hover);
            color: var(--aui-text-primary);
        }
        input {
            accent-color: var(--aui-primary);
        }
    `;

    columns: AdminDataGridColumn[] = [];
    visibleKeys: string[] = [];
    open = false;
    title = "COLUMNS";
    closeLabel = "Close column settings";
    private pendingKeys: string[] = [];

    protected willUpdate(changed: Map<string, unknown>): void {
        if (changed.has("visibleKeys") || changed.has("columns")) {
            this.pendingKeys = this.visibleKeys.length
                ? [...this.visibleKeys]
                : this.columns.filter((column) => !column.hidden).map((column) => column.key);
        }
    }

    private toggle(key: string): void {
        const next = this.pendingKeys.includes(key)
            ? this.pendingKeys.filter((item) => item !== key)
            : [...this.pendingKeys, key];
        if (!next.length) return;
        this.pendingKeys = next;
        this.visibleKeys = next;
        this.dispatchDetail("aui-column-settings-change", {
            keys: next,
            columns: this.columns.filter((column) => next.includes(column.key)),
        });
        this.requestUpdate();
    }

    private close(): void {
        this.open = false;
        this.dispatchDetail("aui-open-change", { open: false });
    }

    render() {
        return html`<button
                class="trigger"
                type="button"
                aria-haspopup="dialog"
                aria-expanded=${this.open ? "true" : "false"}
                @click=${() => {
                    this.open = !this.open;
                    this.dispatchDetail("aui-open-change", { open: this.open });
                }}
            >
                ${this.title}
            </button>
            <section class="panel" role="dialog" aria-label=${this.title}>
                <div class="heading">
                    <span>${this.title}</span>
                    <button
                        class="close"
                        type="button"
                        aria-label=${this.closeLabel}
                        @click=${this.close}
                    >
                        ×
                    </button>
                </div>
                <div class="list">
                    ${this.columns.map(
                        (column) => html`<label
                            ><input
                                type="checkbox"
                                .checked=${this.pendingKeys.includes(column.key)}
                                ?disabled=${this.pendingKeys.length === 1 && this.pendingKeys.includes(column.key)}
                                @change=${() => this.toggle(column.key)}
                            /><span>${column.label ?? column.title ?? column.key}</span></label
                        >`,
                    )}
                </div>
            </section>
            <slot></slot>`;
    }
}
