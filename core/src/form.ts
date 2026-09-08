/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement } from "./base";

export class AdminInputElement extends AdminElement {
    static properties = {
        value: { type: String },
        type: { type: String },
        name: { type: String, reflect: true },
        placeholder: { type: String },
        disabled: { type: Boolean, reflect: true },
        invalid: { type: Boolean, reflect: true },
        ariaLabel: { attribute: "aria-label" },
    };

    static styles = css`
        :host {
            display: block;
        }
        input {
            box-sizing: border-box;
            width: 100%;
            min-height: var(--aui-input-control-height, var(--aui-control-height));
            padding: 8px 10px;
            border: var(--aui-input-border, 1px solid var(--aui-border));
            border-radius: var(--aui-input-radius, var(--aui-radius));
            background: var(--aui-input-background, var(--aui-bg));
            color: var(--aui-text);
            font: var(--aui-input-font-size, 12px)/1.2 var(--aui-font-mono);
            transition:
                border-color var(--aui-transition),
                box-shadow var(--aui-transition);
        }
        input::placeholder {
            color: var(--aui-text-muted);
        }
        input:hover:not(:disabled) {
            border-color: var(--aui-border-hover);
        }
        input:focus {
            outline: none;
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        input:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
        :host([invalid]) input {
            border-color: var(--aui-danger);
        }
    `;

    value = "";
    type = "text";
    name = "";
    placeholder = "";
    disabled = false;
    invalid = false;
    ariaLabel = "";

    private handleInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.value = target.value;
        this.dispatchDetail("aui-input", { value: this.value });
    }

    private handleChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.value = target.value;
        this.dispatchDetail("aui-change", { value: this.value });
    }

    render() {
        return html`<input
            .value=${this.value}
            type=${this.type}
            name=${this.name}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            aria-label=${this.ariaLabel || undefined}
            aria-invalid=${this.invalid ? "true" : "false"}
            @input=${this.handleInput}
            @change=${this.handleChange}
        />`;
    }
}

export interface AdminSelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export class AdminSelectElement extends AdminElement {
    static properties = {
        value: { type: String },
        name: { type: String, reflect: true },
        disabled: { type: Boolean, reflect: true },
        invalid: { type: Boolean, reflect: true },
        options: { attribute: false },
        ariaLabel: { attribute: "aria-label" },
    };

    static styles = css`
        :host {
            display: block;
        }
        .control {
            position: relative;
        }
        select {
            box-sizing: border-box;
            width: 100%;
            min-height: var(--aui-control-height);
            padding: 8px 46px 8px 10px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-bg);
            color: var(--aui-text);
            font: var(--aui-input-font-size, 12px)/1.2 var(--aui-font-mono);
            appearance: none;
            -webkit-appearance: none;
        }
        select::-ms-expand {
            display: none;
        }
        select:hover:not(:disabled) {
            border-color: var(--aui-border-hover);
        }
        select:focus {
            outline: none;
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        select:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
        :host([invalid]) select {
            border-color: var(--aui-danger);
        }
        .chevron {
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
        .chevron::before {
            width: 7px;
            height: 7px;
            border-right: 1px solid currentColor;
            border-bottom: 1px solid currentColor;
            content: "";
            transform: translateY(-2px) rotate(45deg);
        }
        select:hover:not(:disabled) + .chevron {
            color: var(--aui-text-secondary);
        }
        select:focus + .chevron {
            color: var(--aui-text-primary);
        }
        select:disabled + .chevron {
            opacity: 0.3;
        }
    `;

    value = "";
    name = "";
    disabled = false;
    invalid = false;
    ariaLabel = "";
    options: AdminSelectOption[] = [];

    private handleChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.value = target.value;
        this.dispatchDetail("aui-change", { value: this.value });
    }

    render() {
        return html`<div class="control">
            <select
                .value=${this.value}
                name=${this.name}
                ?disabled=${this.disabled}
                aria-label=${this.ariaLabel || undefined}
                aria-invalid=${this.invalid ? "true" : "false"}
                @change=${this.handleChange}
            >
                <slot></slot>
                ${this.options.map(
                    (option) =>
                        html`<option value=${option.value} ?disabled=${option.disabled}>
                            ${option.label}
                        </option>`,
                )}
            </select>
            <span class="chevron" aria-hidden="true"></span>
        </div>`;
    }
}

export class AdminTextareaElement extends AdminElement {
    static properties = {
        value: { type: String },
        name: { type: String, reflect: true },
        placeholder: { type: String },
        rows: { type: Number },
        disabled: { type: Boolean, reflect: true },
        invalid: { type: Boolean, reflect: true },
        ariaLabel: { attribute: "aria-label" },
    };

    static styles = css`
        :host {
            display: block;
        }
        textarea {
            box-sizing: border-box;
            width: 100%;
            min-height: 96px;
            padding: 10px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius);
            background: var(--aui-bg);
            color: var(--aui-text);
            resize: vertical;
            font: var(--aui-input-font-size, 12px)/1.45 var(--aui-font-mono);
            transition:
                border-color var(--aui-transition),
                box-shadow var(--aui-transition);
        }
        textarea::placeholder {
            color: var(--aui-text-muted);
        }
        textarea:hover:not(:disabled) {
            border-color: var(--aui-border-hover);
        }
        textarea:focus {
            outline: none;
            border-color: var(--aui-focus);
            box-shadow: var(--aui-focus-ring);
        }
        textarea:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
        :host([invalid]) textarea {
            border-color: var(--aui-danger);
        }
    `;

    value = "";
    name = "";
    placeholder = "";
    rows = 4;
    disabled = false;
    invalid = false;
    ariaLabel = "";

    private handleInput(event: Event): void {
        this.value = (event.target as HTMLTextAreaElement).value;
        this.dispatchDetail("aui-input", { value: this.value });
    }

    render() {
        return html`<textarea
            .value=${this.value}
            name=${this.name}
            placeholder=${this.placeholder}
            rows=${this.rows}
            ?disabled=${this.disabled}
            aria-label=${this.ariaLabel || undefined}
            aria-invalid=${this.invalid ? "true" : "false"}
            @input=${this.handleInput}
        ></textarea>`;
    }
}

export class AdminCheckboxElement extends AdminElement {
    static properties = {
        checked: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        label: { type: String },
        ariaLabel: { attribute: "aria-label" },
    };

    static styles = css`
        :host {
            display: inline-flex;
        }
        label {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--aui-text);
            cursor: pointer;
            font: 12px/1.2 var(--aui-font-mono);
        }
        input {
            width: 16px;
            height: 16px;
            margin: 0;
            accent-color: var(--aui-text-primary);
            border-radius: var(--aui-radius);
        }
        label:has(input:disabled) {
            cursor: not-allowed;
            opacity: 0.3;
        }
    `;

    checked = false;
    disabled = false;
    label = "";
    ariaLabel = "";

    private handleChange(event: Event): void {
        this.checked = (event.target as HTMLInputElement).checked;
        this.dispatchDetail("aui-checked-change", { checked: this.checked });
    }

    render() {
        return html`<label
            ><input
                type="checkbox"
                .checked=${this.checked}
                ?disabled=${this.disabled}
                aria-label=${this.ariaLabel || undefined}
                @change=${this.handleChange} /><span>${this.label}<slot></slot></span
        ></label>`;
    }
}

export class AdminSwitchElement extends AdminElement {
    static properties = {
        checked: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        label: { type: String },
        ariaLabel: { attribute: "aria-label" },
    };

    static styles = css`
        :host {
            display: inline-flex;
        }
        label {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--aui-text);
            cursor: pointer;
            font: 12px/1.2 var(--aui-font-mono);
        }
        input {
            position: absolute;
            width: 1px;
            height: 1px;
            opacity: 0;
        }
        .track {
            width: 30px;
            height: 16px;
            position: relative;
            border: 1px solid var(--aui-border-hover);
            background: var(--aui-bg);
        }
        .thumb {
            width: 10px;
            height: 10px;
            position: absolute;
            top: 50%;
            left: 2px;
            background: var(--aui-text-muted);
            transform: translateY(-50%);
            transition:
                transform var(--aui-transition),
                background-color var(--aui-transition);
        }
        input:checked + .track {
            border-color: var(--aui-text-primary);
        }
        input:checked + .track .thumb {
            transform: translate(14px, -50%);
            background: var(--aui-text-primary);
        }
        input:focus-visible + .track {
            outline: 1px solid var(--aui-focus);
            outline-offset: 2px;
        }
        label:has(input:disabled) {
            cursor: not-allowed;
            opacity: 0.3;
        }
        @media (prefers-reduced-motion: reduce) {
            .thumb {
                transition: none;
            }
        }
    `;

    checked = false;
    disabled = false;
    label = "";
    ariaLabel = "";

    private handleChange(event: Event): void {
        this.checked = (event.target as HTMLInputElement).checked;
        this.dispatchDetail("aui-checked-change", { checked: this.checked });
    }

    render() {
        return html`<label
            ><input
                type="checkbox"
                role="switch"
                .checked=${this.checked}
                ?disabled=${this.disabled}
                aria-checked=${this.checked ? "true" : "false"}
                aria-label=${this.ariaLabel || undefined}
                @change=${this.handleChange} /><span class="track"><span class="thumb"></span></span
            ><span>${this.label}<slot></slot></span
        ></label>`;
    }
}
