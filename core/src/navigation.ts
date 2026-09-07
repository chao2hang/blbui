/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement } from "./base";

export interface AdminNavItem {
    id: string;
    label: string;
    href?: string;
    active?: boolean;
    disabled?: boolean;
}

export class AdminNavElement extends AdminElement {
    static properties = { items: { attribute: false } };
    static styles = css`
        :host {
            display: block;
        }
        nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        a,
        button {
            display: block;
            width: 100%;
            padding: 8px 12px;
            border: 0;
            border-left: 2px solid transparent;
            border-radius: var(--aui-radius);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            text-align: left;
            text-decoration: none;
            font: 12px/1.2 var(--aui-font-mono);
        }
        a:hover,
        button:hover:not(:disabled) {
            color: var(--aui-text-primary);
        }
        [aria-current="page"] {
            border-left-color: var(--aui-text-primary);
            background: linear-gradient(90deg, var(--aui-white-3), transparent);
            color: var(--aui-text-primary);
            font-weight: 500;
        }
        button:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
    `;
    items: AdminNavItem[] = [];
    render() {
        return html`<nav aria-label="Primary navigation">
            ${this.items.map((item) =>
                item.href
                    ? html`<a
                          href=${item.href}
                          aria-current=${item.active ? "page" : undefined}
                          aria-disabled=${item.disabled ? "true" : undefined}
                          @click=${() => this.dispatchDetail("aui-nav-change", { id: item.id })}
                          >${item.label}</a
                      >`
                    : html`<button
                          type="button"
                          ?disabled=${item.disabled}
                          aria-current=${item.active ? "page" : undefined}
                          @click=${() => this.dispatchDetail("aui-nav-change", { id: item.id })}
                      >
                          ${item.label}
                      </button>`,
            )}
        </nav>`;
    }
}

export interface AdminBreadcrumbItem {
    label: string;
    href?: string;
}

export class AdminBreadcrumbElement extends AdminElement {
    static properties = {
        items: { attribute: false },
        maxItems: { type: Number, attribute: "max-items" },
        overflowLabel: { type: String, attribute: "overflow-label" },
    };
    static styles = css`
        :host {
            display: block;
        }
        nav {
            color: var(--aui-text-secondary);
            font: 12px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        ol {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        li:not(:last-child)::after {
            content: "/";
            margin-left: 8px;
            color: var(--aui-text-muted);
        }
        li:last-child {
            color: var(--aui-text);
        }
        .overflow {
            position: relative;
        }
        .overflow-button {
            padding: 0;
            border: 0;
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: inherit;
            text-transform: inherit;
        }
        .overflow-button:hover,
        .overflow-button:focus-visible {
            color: var(--aui-text-primary);
        }
        .overflow-menu {
            position: absolute;
            z-index: 5;
            top: calc(100% + 8px);
            left: 0;
            min-width: 170px;
            padding: 5px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface-elevated);
            box-shadow: var(--aui-shadow-md);
        }
        .overflow-menu a {
            display: block;
            padding: 7px 8px;
            text-decoration: none;
        }
        a {
            color: inherit;
            text-decoration: none;
        }
        a:hover {
            color: var(--aui-text-primary);
            text-decoration: underline;
        }
    `;
    items: Array<string | AdminBreadcrumbItem> = [];
    maxItems = 0;
    overflowLabel = "MORE";
    private overflowOpen = false;

    private toggleOverflow(): void {
        this.overflowOpen = !this.overflowOpen;
        this.dispatchDetail("aui-breadcrumb-overflow", { open: this.overflowOpen });
        this.requestUpdate();
    }

    render() {
        const items: AdminBreadcrumbItem[] = this.items.map((item) =>
            typeof item === "string" ? { label: item } : item,
        );
        const collapsed = this.maxItems >= 3 && items.length > this.maxItems;
        const headCount = collapsed ? Math.max(1, this.maxItems - 2) : items.length;
        const hidden = collapsed ? items.slice(headCount, -1) : [];
        const visible = collapsed
            ? [...items.slice(0, headCount), { label: this.overflowLabel }, items.at(-1)!]
            : items;
        return html`<nav aria-label="Breadcrumb">
            <ol>
                ${visible.map((item, index) => {
                    const isOverflow = collapsed && index === headCount;
                    const isLast = !isOverflow && index === visible.length - 1;
                    return html`<li aria-current=${isLast ? "page" : undefined}>
                        ${
                            isOverflow
                                ? html`<span class="overflow"
                                      ><button
                                          class="overflow-button"
                                          type="button"
                                          aria-expanded=${this.overflowOpen ? "true" : "false"}
                                          aria-haspopup="menu"
                                          @click=${this.toggleOverflow}
                                      >
                                          ${this.overflowLabel}
                                      </button>
                                      ${
                                          this.overflowOpen
                                              ? html`<span class="overflow-menu" role="menu">
                                                    ${hidden.map(
                                                        (entry) => html`<a
                                                            role="menuitem"
                                                            href=${entry.href ?? "#"}
                                                            >${entry.label}</a
                                                        >`,
                                                    )}
                                                </span>`
                                              : null
                                      }</span
                                  >`
                                : isLast || !item.href
                                  ? html`${item.label}`
                                  : html`<a href=${item.href}>${item.label}</a>`
                        }
                    </li>`;
                })}
            </ol>
        </nav>`;
    }
}
