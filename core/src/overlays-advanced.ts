/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement, focusableElements, nextUid } from "./base";

export interface AdminMenuItem {
    id: string;
    label: string;
    shortcut?: string;
    danger?: boolean;
    disabled?: boolean;
    separator?: boolean;
}

export class AdminTooltipElement extends AdminElement {
    static properties = { content: { type: String }, side: { type: String, reflect: true } };
    static styles = css`
        :host {
            position: relative;
            display: inline-flex;
        }
        .tooltip {
            position: absolute;
            z-index: 50;
            left: 50%;
            bottom: calc(100% + 8px);
            width: max-content;
            max-width: 240px;
            transform: translateX(-50%) translateY(3px);
            padding: 6px 8px;
            border: 1px solid var(--aui-border-hover);
            background: var(--aui-header);
            color: var(--aui-text);
            opacity: 0;
            pointer-events: none;
            transition:
                opacity var(--aui-transition),
                transform var(--aui-transition);
            font: 10px/1.3 var(--aui-font-mono);
        }
        :host([side="bottom"]) .tooltip {
            top: calc(100% + 8px);
            bottom: auto;
        }
        :host(:hover) .tooltip,
        :host(:focus-within) .tooltip {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
            .tooltip {
                transition: none;
            }
        }
    `;
    content = "";
    side = "top";
    private active = false;
    private tooltipId = nextUid("tooltip");
    private readonly onEnter = () => this.setActive(true);
    private readonly onLeave = () => this.setActive(false);
    private slotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement;
        const target = slot.assignedElements().find((node) => node instanceof HTMLElement);
        for (const node of slot.assignedElements()) {
            if (node instanceof HTMLElement && node !== target)
                node.removeAttribute("aria-describedby");
        }
        if (target) target.setAttribute("aria-describedby", this.tooltipId);
    }
    private setActive(active: boolean): void {
        if (this.active !== active) {
            this.active = active;
            this.requestUpdate();
        }
    }
    connectedCallback(): void {
        super.connectedCallback();
        this.addEventListener("pointerenter", this.onEnter);
        this.addEventListener("pointerleave", this.onLeave);
        this.addEventListener("focusin", this.onEnter);
        this.addEventListener("focusout", this.onLeave);
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEventListener("pointerenter", this.onEnter);
        this.removeEventListener("pointerleave", this.onLeave);
        this.removeEventListener("focusin", this.onEnter);
        this.removeEventListener("focusout", this.onLeave);
    }
    render() {
        return html`<slot @slotchange=${this.slotChange}></slot
            ><span
                class="tooltip"
                role="tooltip"
                id=${this.tooltipId}
                aria-hidden=${this.active ? "false" : "true"}
                >${this.content || html`<slot name="content"></slot>`}</span
            >`;
    }
}

export class AdminPopoverElement extends AdminElement {
    static properties = { open: { type: Boolean, reflect: true }, title: { type: String } };
    static styles = css`
        :host {
            position: relative;
            display: inline-flex;
        }
        .content {
            position: absolute;
            z-index: 40;
            top: calc(100% + 8px);
            left: 0;
            min-width: 220px;
            padding: 14px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
            box-shadow: var(--aui-shadow-pop);
        }
        :host(:not([open])) .content {
            display: none;
        }
        .title {
            margin-bottom: 9px;
            color: var(--aui-text-primary);
            font: 700 11px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
    `;
    open = false;
    title = "";
    private titleId = nextUid("popover-title");
    private lastFocused: HTMLElement | null = null;
    private readonly onDocumentClick = (event: Event) => {
        if (!this.contains(event.target as Node)) this.close();
    };
    private readonly onDocumentKeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            event.preventDefault();
            this.close();
        }
    };
    private triggerElement(): HTMLElement | null {
        return (
            this.shadowRoot
                ?.querySelector<HTMLSlotElement>("slot[name='trigger']")
                ?.assignedElements()
                .find((node): node is HTMLElement => node instanceof HTMLElement) ?? null
        );
    }
    private close(): void {
        if (!this.open) return;
        this.open = false;
        this.dispatchDetail("aui-open-change", { open: false });
        this.lastFocused?.focus();
        this.lastFocused = null;
    }
    private toggle(event: Event): void {
        if (this.open) {
            this.close();
            return;
        }
        if (!this.open) {
            this.lastFocused =
                this.triggerElement() ??
                [...event.composedPath()].find(
                    (node): node is HTMLElement => node instanceof HTMLElement && node !== this,
                ) ??
                (document.activeElement instanceof HTMLElement ? document.activeElement : null);
        }
        this.open = true;
        this.dispatchDetail("aui-open-change", { open: this.open });
    }
    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("open")) {
            if (this.open) {
                document.addEventListener("click", this.onDocumentClick, true);
                document.addEventListener("keydown", this.onDocumentKeydown);
                this.shadowRoot?.querySelector<HTMLElement>(".content")?.focus();
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
        this.lastFocused = null;
    }
    render() {
        return html`<span @click=${this.toggle}><slot name="trigger"></slot><slot></slot></span>
            <div
                class="content"
                role="dialog"
                tabindex="-1"
                aria-labelledby=${this.title ? this.titleId : undefined}
                aria-label=${this.title ? undefined : "Popover"}
            >
                ${this.title ? html`<div class="title" id=${this.titleId}>${this.title}</div>` : null}
                <slot name="content"></slot>
            </div>`;
    }
}

export class AdminDropdownElement extends AdminElement {
    static properties = { items: { attribute: false }, open: { type: Boolean, reflect: true } };
    static styles = css`
        :host {
            position: relative;
            display: inline-flex;
        }
        .menu {
            position: absolute;
            z-index: 50;
            top: calc(100% + 5px);
            right: 0;
            min-width: 180px;
            padding: 4px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
            box-shadow: var(--aui-shadow-pop);
        }
        :host(:not([open])) .menu {
            display: none;
        }
        button {
            width: 100%;
            display: flex;
            justify-content: space-between;
            gap: 15px;
            padding: 8px;
            border: 0;
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            font: 11px/1.2 var(--aui-font-mono);
        }
        button:hover:not(:disabled) {
            background: var(--aui-header);
            color: var(--aui-text-primary);
        }
        button.danger {
            color: var(--aui-danger);
        }
        button.separator {
            margin-top: 4px;
            border-top: 1px solid var(--aui-border);
        }
        kbd {
            color: var(--aui-text-muted);
            font: 10px/1 var(--aui-font-mono);
        }
    `;
    items: AdminMenuItem[] = [];
    open = false;
    private lastFocused: HTMLElement | null = null;
    private readonly onDocumentClick = (event: Event) => {
        if (!this.contains(event.target as Node)) this.close();
    };
    private readonly onDocumentKeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && this.open) {
            event.preventDefault();
            this.close();
        }
    };
    private triggerElement(): HTMLElement | null {
        return (
            this.shadowRoot
                ?.querySelector<HTMLSlotElement>("slot[name='trigger']")
                ?.assignedElements()
                .find((node): node is HTMLElement => node instanceof HTMLElement) ?? null
        );
    }
    private readonly onMenuKeydown = (event: KeyboardEvent) => {
        const buttons = this.shadowRoot?.querySelectorAll<HTMLElement>(
            ".menu button[role='menuitem']",
        );
        if (!buttons?.length) return;
        const current = [...buttons].findIndex(
            (button) => button === (event.target as HTMLElement),
        );
        const move = (delta: number) => {
            buttons[(current + delta + buttons.length) % buttons.length].focus();
            event.preventDefault();
        };
        switch (event.key) {
            case "ArrowDown":
                move(1);
                break;
            case "ArrowUp":
                move(-1);
                break;
            case "Home":
                buttons[0].focus();
                event.preventDefault();
                break;
            case "End":
                buttons[buttons.length - 1].focus();
                event.preventDefault();
                break;
            case "Escape":
                event.preventDefault();
                this.close();
                break;
            case "Tab":
                this.close(false);
                break;
        }
    };
    private close(restoreFocus = true): void {
        if (!this.open) return;
        this.open = false;
        this.dispatchDetail("aui-open-change", { open: false });
        if (restoreFocus) this.lastFocused?.focus();
        this.lastFocused = null;
    }
    private select(item: AdminMenuItem): void {
        if (item.disabled || item.separator) return;
        this.dispatchDetail("aui-menu-select", { id: item.id });
        this.close();
    }
    private syncTriggerAria(): void {
        for (const node of this.shadowRoot
            ?.querySelector<HTMLSlotElement>("[name='trigger']")
            ?.assignedElements() ?? []) {
            if (node instanceof HTMLElement) {
                node.setAttribute("aria-haspopup", "menu");
                node.setAttribute("aria-expanded", this.open ? "true" : "false");
            }
        }
    }
    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("open")) {
            if (this.open) {
                document.addEventListener("click", this.onDocumentClick, true);
                document.addEventListener("keydown", this.onDocumentKeydown);
                this.shadowRoot
                    ?.querySelector<HTMLElement>(".menu button[role='menuitem']")
                    ?.focus();
            } else {
                document.removeEventListener("click", this.onDocumentClick, true);
                document.removeEventListener("keydown", this.onDocumentKeydown);
            }
            this.syncTriggerAria();
        }
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener("click", this.onDocumentClick, true);
        document.removeEventListener("keydown", this.onDocumentKeydown);
        this.lastFocused = null;
    }
    render() {
        return html`<span
                @click=${(event: Event) => {
                    if (!this.open) {
                        this.lastFocused =
                            this.triggerElement() ?? [...event.composedPath()].find(
                                (node): node is HTMLElement =>
                                    node instanceof HTMLElement && node !== this,
                            ) ??
                            (document.activeElement instanceof HTMLElement
                                ? document.activeElement
                                : null);
                    }
                    if (this.open) {
                        this.close();
                        return;
                    }
                    this.open = true;
                    this.dispatchDetail("aui-open-change", { open: this.open });
                }}
                ><slot name="trigger" @slotchange=${this.syncTriggerAria}><slot></slot></slot
            ></span>
            <div class="menu" role="menu" @keydown=${this.onMenuKeydown}>
                ${this.items.map((item) =>
                    item.separator
                        ? html`<div class="separator" role="separator"></div>`
                        : html`<button
                              type="button"
                              role="menuitem"
                              class=${item.danger ? "danger" : ""}
                              ?disabled=${item.disabled}
                              @click=${() => this.select(item)}
                          >
                              ${item.label}${item.shortcut ? html`<kbd>${item.shortcut}</kbd>` : null}
                          </button>`,
                )}
            </div>`;
    }
}

export class AdminDrawerElement extends AdminElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        side: { type: String, reflect: true },
        width: { type: String },
        mobileMode: { type: String, attribute: "mobile-mode", reflect: true },
    };
    static styles = css`
        :host {
            display: contents;
        }
        .backdrop {
            position: fixed;
            z-index: 60;
            inset: 0;
            background: var(--aui-overlay);
        }
        .panel {
            position: fixed;
            z-index: 61;
            top: 0;
            bottom: 0;
            right: 0;
            width: min(var(--aui-drawer-width, 420px), 100vw);
            display: flex;
            flex-direction: column;
            border-left: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        :host([mobile-mode="full"]) .panel {
            width: min(var(--aui-drawer-width, 420px), 100vw);
        }
        :host([side="left"]) .panel {
            right: auto;
            left: 0;
            border-right: 1px solid var(--aui-border);
            border-left: 0;
        }
        :host(:not([open])) .backdrop,
        :host(:not([open])) .panel {
            display: none;
        }
        .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 18px;
            border-bottom: 1px solid var(--aui-border);
        }
        h2 {
            margin: 0;
            color: var(--aui-text-primary);
            font: 700 14px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .close {
            width: 28px;
            height: 28px;
            border: 1px solid var(--aui-border);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
        }
        .body {
            min-height: 0;
            flex: 1;
            overflow: auto;
            padding: 18px;
        }
        .footer {
            padding: 14px 18px;
            border-top: 1px solid var(--aui-border);
            background: var(--aui-header);
        }
        @media (max-width: 640px) {
            :host([mobile-mode="full"]) .panel {
                right: 0;
                left: 0;
                width: 100vw;
                border-right: 0;
                border-left: 0;
            }
            :host([mobile-mode="full"]) .body {
                padding: 14px;
            }
        }
    `;
    open = false;
    title = "";
    side = "right";
    width = "420px";
    mobileMode: "overlay" | "full" = "overlay";
    private lastFocused: HTMLElement | null = null;
    private readonly onDocumentKeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") this.close();
        else if (event.key === "Tab") this.trapFocus(event);
    };
    private trapFocus(event: KeyboardEvent): void {
        const panel = this.shadowRoot?.querySelector<HTMLElement>(".panel");
        const focusable = panel ? focusableElements(panel) : [];
        if (!focusable.length) {
            event.preventDefault();
            panel?.focus();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        const inside = active instanceof HTMLElement && this.contains(active);
        if (event.shiftKey && (active === first || !inside)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (active === last || !inside)) {
            event.preventDefault();
            first.focus();
        }
    }
    private close(): void {
        this.open = false;
        this.dispatchDetail("aui-close", { open: false });
    }
    private toggle(): void {
        if (this.open) this.close();
        else this.open = true;
    }
    protected updated(changed: Map<string, unknown>): void {
        if (!changed.has("open")) return;
        if (this.open) {
            this.lastFocused =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;
            document.addEventListener("keydown", this.onDocumentKeydown);
            const panel = this.shadowRoot?.querySelector<HTMLElement>(".panel");
            const first = panel ? focusableElements(panel)[0] : undefined;
            (first ?? panel)?.focus();
        } else {
            document.removeEventListener("keydown", this.onDocumentKeydown);
            this.lastFocused?.focus();
            this.lastFocused = null;
        }
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener("keydown", this.onDocumentKeydown);
    }
    render() {
        return html`<div class="backdrop" @click=${this.close}></div>
            <aside
                class="panel"
                style=${`--aui-drawer-width:${this.width}`}
                role="dialog"
                aria-modal="true"
                aria-label=${this.title}
                tabindex="-1"
            >
                <header class="header">
                    <h2>${this.title}<slot name="title"></slot></h2>
                    <button class="close" type="button" aria-label="Close" @click=${this.close}>
                        ×
                    </button>
                </header>
                <div class="body"><slot></slot></div>
                <footer class="footer"><slot name="footer"></slot></footer>
            </aside>
            <div @click=${this.toggle}><slot name="trigger"></slot></div>`;
    }
}

export class AdminToastElement extends AdminElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        title: { type: String },
        message: { type: String },
        variant: { type: String, reflect: true },
        duration: { type: Number },
    };
    static styles = css`
        :host {
            position: fixed;
            z-index: 100;
            right: 20px;
            bottom: 20px;
            display: block;
        }
        :host(:not([open])) {
            display: none;
        }
        .toast {
            min-width: 280px;
            max-width: 420px;
            padding: 14px 16px;
            border: 1px solid var(--aui-border-hover);
            background: var(--aui-surface);
            box-shadow: var(--aui-shadow-pop);
        }
        :host([variant="success"]) .toast {
            border-color: var(--aui-success);
        }
        :host([variant="danger"]) .toast {
            border-color: var(--aui-danger);
        }
        .row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
        }
        strong {
            color: var(--aui-text-primary);
            font: 700 11px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        p {
            margin: 7px 0 0;
            color: var(--aui-text-secondary);
            font: 12px/1.4 var(--aui-font-mono);
        }
        button {
            border: 0;
            background: transparent;
            color: var(--aui-text-muted);
            cursor: pointer;
        }
    `;
    open = false;
    title = "Notification";
    message = "";
    variant = "default";
    duration = 4000;
    private timer: number | undefined;
    private close(): void {
        this.open = false;
        this.dispatchDetail("aui-close", { open: false });
    }
    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("open")) {
            if (this.timer !== undefined) {
                window.clearTimeout(this.timer);
                this.timer = undefined;
            }
            if (this.open && this.duration > 0) {
                this.timer = window.setTimeout(() => {
                    this.timer = undefined;
                    this.close();
                }, this.duration);
            }
        }
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.timer !== undefined) {
            window.clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
    render() {
        return html`<div class="toast" role="status">
            <div class="row">
                <strong>${this.title}</strong
                ><button type="button" aria-label="Close" @click=${this.close}>×</button>
            </div>
            <p>${this.message}<slot></slot></p>
        </div>`;
    }
}
