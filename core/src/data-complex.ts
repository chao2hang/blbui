/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement, nextUid } from "./base";
import type { AdminDataGridColumn } from "./system";

export interface AdminTreeTableNode extends Record<string, unknown> {
    id: string | number;
    label?: string;
    children?: AdminTreeTableNode[];
    disabled?: boolean;
}

type TreeRow = { node: AdminTreeTableNode; level: number; hasChildren: boolean };

export class AdminTreeTableElement extends AdminElement {
    static properties = {
        columns: { attribute: false },
        nodes: { attribute: false },
        expanded: { attribute: false },
        selected: { attribute: false },
        selectable: { type: Boolean, reflect: true },
        emptyLabel: { type: String, attribute: "empty-label" },
    };

    static styles = css`
        :host {
            display: block;
            min-width: 0;
        }
        .frame {
            overflow-x: auto;
            border: 1px solid var(--aui-border);
            background: var(--aui-bg);
        }
        table {
            width: 100%;
            min-width: 560px;
            border-collapse: collapse;
            color: var(--aui-text);
            font: 12px/1.4 var(--aui-font-mono);
        }
        th {
            padding: 9px 12px;
            border-bottom: 1px solid var(--aui-border);
            background: var(--aui-header);
            color: var(--aui-text-secondary);
            font-weight: 500;
            text-align: left;
            text-transform: uppercase;
        }
        td {
            padding: 9px 12px;
            border-bottom: 1px solid var(--aui-border);
        }
        tr[data-selected="true"] td,
        tr:hover td {
            background: var(--aui-table-row-hover);
        }
        .tree-cell {
            display: flex;
            align-items: center;
            gap: 5px;
            min-width: 0;
        }
        .tree-cell span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .toggle {
            width: 22px;
            min-width: 22px;
            min-height: 24px;
            padding: 0;
            border: 1px solid transparent;
            border-radius: var(--aui-radius-sm);
            background: transparent;
            color: var(--aui-text-secondary);
            cursor: pointer;
            font: inherit;
        }
        .toggle:hover {
            border-color: var(--aui-border-hover);
            color: var(--aui-text-primary);
        }
        .toggle[aria-hidden="true"] {
            cursor: default;
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
    `;

    columns: AdminDataGridColumn[] = [];
    nodes: AdminTreeTableNode[] = [];
    expanded: Array<string | number> = [];
    selected: string | number | null = null;
    selectable = false;
    emptyLabel = "NO NODES AVAILABLE";

    private isExpanded(id: string | number): boolean {
        return this.expanded.includes(id);
    }

    private flatten(nodes: AdminTreeTableNode[], level = 1): TreeRow[] {
        const rows: TreeRow[] = [];
        for (const node of nodes) {
            const hasChildren = Boolean(node.children?.length);
            rows.push({ node, level, hasChildren });
            if (hasChildren && this.isExpanded(node.id))
                rows.push(...this.flatten(node.children!, level + 1));
        }
        return rows;
    }

    private labelFor(column: AdminDataGridColumn): string {
        return column.label ?? column.title ?? column.key;
    }

    private valueFor(node: AdminTreeTableNode, key: string): string {
        const value = node[key];
        return value === null || value === undefined || value === "" ? "—" : String(value);
    }

    private toggle(node: AdminTreeTableNode): void {
        const nextExpanded = !this.isExpanded(node.id);
        const expanded = !nextExpanded
            ? this.expanded.filter((id) => id !== node.id)
            : [...this.expanded, node.id];
        this.expanded = expanded;
        this.dispatchDetail("aui-tree-table-toggle", { id: node.id, expanded: nextExpanded });
        this.requestUpdate();
    }

    private select(node: AdminTreeTableNode): void {
        if (!this.selectable || node.disabled) return;
        this.selected = node.id;
        this.dispatchDetail("aui-tree-table-select", { id: node.id, node });
        this.requestUpdate();
    }

    render() {
        const columns: AdminDataGridColumn[] = this.columns.length
            ? this.columns.filter((column) => !column.hidden)
            : [{ key: "label", label: "NAME" }];
        const rows = this.flatten(this.nodes);
        return html`<div class="frame">
            ${
                rows.length
                    ? html`<table aria-label="Tree table">
                          <thead>
                              <tr>
                                  ${columns.map((column) => html`<th>${this.labelFor(column)}</th>`)}
                              </tr>
                          </thead>
                          <tbody>
                              ${rows.map(
                                  ({ node, level, hasChildren }) => html`<tr
                                      data-row-key=${String(node.id)}
                                      data-selected=${this.selected === node.id ? "true" : "false"}
                                      aria-selected=${this.selected === node.id ? "true" : "false"}
                                      @click=${() => this.select(node)}
                                  >
                                      ${columns.map(
                                          (column, index) => html`<td
                                              style=${`text-align:${column.align ?? "left"}`}
                                          >
                                              ${
                                                  index === 0
                                                      ? html`<div
                                                            class="tree-cell"
                                                            style=${`padding-inline-start:${Math.max(0, level - 1) * 18}px`}
                                                        >
                                                            <button
                                                                class="toggle"
                                                                type="button"
                                                                aria-label=${hasChildren ? (this.isExpanded(node.id) ? "Collapse" : "Expand") : "No children"}
                                                                aria-expanded=${hasChildren ? String(this.isExpanded(node.id)) : "false"}
                                                                aria-hidden=${hasChildren ? "false" : "true"}
                                                                ?disabled=${!hasChildren || node.disabled}
                                                                @click=${(event: Event) => {
                                                                    event.stopPropagation();
                                                                    this.toggle(node);
                                                                }}
                                                            >
                                                                ${hasChildren ? (this.isExpanded(node.id) ? "−" : "+") : "·"}
                                                            </button>
                                                            <span
                                                                >${this.valueFor(node, column.key)}</span
                                                            >
                                                        </div>`
                                                      : this.valueFor(node, column.key)
                                              }
                                          </td>`,
                                      )}
                                  </tr>`,
                              )}
                          </tbody>
                      </table>`
                    : html`<div class="state" role="status">${this.emptyLabel}</div>`
            }
        </div>`;
    }
}

export interface AdminListViewItem {
    id: string | number;
    title: string;
    description?: string;
    meta?: string;
    status?: string;
    disabled?: boolean;
}

export class AdminListViewElement extends AdminElement {
    static properties = {
        items: { attribute: false },
        loading: { type: Boolean, reflect: true },
        error: { type: Boolean, reflect: true },
        selectable: { type: Boolean, reflect: true },
        selectedKeys: { attribute: false },
        loadingLabel: { type: String, attribute: "loading-label" },
        emptyLabel: { type: String, attribute: "empty-label" },
        errorLabel: { type: String, attribute: "error-label" },
    };

    static styles = css`
        :host {
            display: block;
            min-width: 0;
        }
        .list {
            display: grid;
            gap: 6px;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .item {
            width: 100%;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 4px 12px;
            padding: 12px;
            border: 1px solid var(--aui-border);
            border-radius: var(--aui-radius-sm);
            background: var(--aui-surface);
            color: var(--aui-text);
            cursor: pointer;
            font: inherit;
            text-align: left;
        }
        .item:hover:not(:disabled),
        .item[aria-selected="true"] {
            border-color: var(--aui-focus);
            background: var(--aui-table-row-hover);
        }
        .title {
            color: var(--aui-text-primary);
            font: 700 12px/1.2 var(--aui-font-mono);
        }
        .description {
            color: var(--aui-text-secondary);
            font: 11px/1.35 var(--aui-font-mono);
        }
        .meta,
        .status {
            color: var(--aui-text-muted);
            font: 10px/1.2 var(--aui-font-mono);
            text-transform: uppercase;
        }
        .meta {
            grid-column: 1;
        }
        .status {
            grid-column: 2;
            grid-row: 1 / span 2;
            align-self: center;
            color: var(--aui-info);
        }
        .state {
            min-height: var(--aui-table-state-min-height, 96px);
            display: grid;
            place-items: center;
            color: var(--aui-text-muted);
            font: 11px/1.3 var(--aui-font-mono);
        }
        .state[role="alert"] {
            color: var(--aui-danger);
        }
    `;

    items: AdminListViewItem[] = [];
    loading = false;
    error = false;
    selectable = true;
    selectedKeys: Array<string | number> = [];
    loadingLabel = "LOADING...";
    emptyLabel = "NO ITEMS AVAILABLE";
    errorLabel = "FAILED TO LOAD ITEMS";

    private select(item: AdminListViewItem): void {
        if (item.disabled) return;
        const selected = this.selectable
            ? this.selectedKeys.includes(item.id)
                ? this.selectedKeys.filter((id) => id !== item.id)
                : [...this.selectedKeys, item.id]
            : [item.id];
        this.selectedKeys = selected;
        this.dispatchDetail("aui-list-view-select", { id: item.id, item, selectedKeys: selected });
        this.requestUpdate();
    }

    render() {
        const content = this.loading
            ? html`<div class="state" role="status" aria-live="polite">${this.loadingLabel}</div>`
            : this.error
              ? html`<div class="state" role="alert">${this.errorLabel}</div>`
              : this.items.length
                ? html`<ul class="list">
                      ${this.items.map(
                          (item) => html`<li>
                              <button
                                  class="item"
                                  type="button"
                                  ?disabled=${item.disabled}
                                  aria-selected=${this.selectedKeys.includes(item.id) ? "true" : "false"}
                                  @click=${() => this.select(item)}
                              >
                                  <span class="title">${item.title}</span>
                                  ${item.status ? html`<span class="status">${item.status}</span>` : null}
                                  ${item.description ? html`<span class="description">${item.description}</span>` : null}
                                  ${item.meta ? html`<span class="meta">${item.meta}</span>` : null}
                              </button>
                          </li>`,
                      )}
                  </ul>`
                : html`<div class="state" role="status">${this.emptyLabel}</div>`;
        return html`${content}<slot></slot>`;
    }
}

export type AdminFilterFieldType = "text" | "number" | "date" | "select";
export type AdminFilterOperator = "equals" | "contains" | "startsWith" | "gt" | "lt" | "isEmpty";
export interface AdminFilterField {
    key: string;
    label: string;
    type?: AdminFilterFieldType;
    options?: Array<{ value: string; label: string }>;
}
export interface AdminFilterRule {
    id?: string;
    field: string;
    operator: AdminFilterOperator;
    value?: string;
}

const builderStyles = css`
    :host {
        display: block;
        min-width: 0;
    }
    form {
        display: grid;
        gap: 8px;
    }
    .rule {
        display: grid;
        grid-template-columns: minmax(120px, 0.8fr) minmax(110px, 0.7fr) minmax(140px, 1fr) auto;
        gap: 6px;
        align-items: center;
    }
    select,
    input,
    button {
        box-sizing: border-box;
        min-height: var(--aui-control-height-compact);
        padding: 6px 8px;
        border: 1px solid var(--aui-border);
        border-radius: var(--aui-radius-sm);
        background: var(--aui-control-bg);
        color: var(--aui-text);
        font: 11px/1.2 var(--aui-font-mono);
    }
    select:focus,
    input:focus,
    button:focus-visible {
        border-color: var(--aui-focus);
        outline: none;
        box-shadow: var(--aui-focus-ring);
    }
    button {
        cursor: pointer;
    }
    button:hover:not(:disabled) {
        border-color: var(--aui-border-hover);
        color: var(--aui-text-primary);
    }
    .actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }
    .empty {
        color: var(--aui-text-muted);
        font: 11px/1.3 var(--aui-font-mono);
    }
    @media (max-width: 620px) {
        .rule {
            grid-template-columns: 1fr 1fr;
        }
        .rule input,
        .rule select:nth-child(3) {
            min-width: 0;
        }
        .rule button {
            grid-column: 2;
            justify-self: end;
        }
    }
`;

const filterOperators: Array<{ value: AdminFilterOperator; label: string }> = [
    { value: "equals", label: "IS" },
    { value: "contains", label: "CONTAINS" },
    { value: "startsWith", label: "STARTS WITH" },
    { value: "gt", label: ">" },
    { value: "lt", label: "<" },
    { value: "isEmpty", label: "IS EMPTY" },
];

function defaultOperator(field?: AdminFilterField): AdminFilterOperator {
    return field?.type === "number" || field?.type === "date" ? "equals" : "contains";
}

function filterValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
}

export class AdminFilterBuilderElement extends AdminElement {
    static properties = {
        fields: { attribute: false },
        filters: { attribute: false },
        maxRules: { type: Number, attribute: "max-rules" },
        addLabel: { type: String, attribute: "add-label" },
        clearLabel: { type: String, attribute: "clear-label" },
        applyLabel: { type: String, attribute: "apply-label" },
    };
    static styles = builderStyles;
    fields: AdminFilterField[] = [];
    filters: AdminFilterRule[] = [];
    maxRules = 8;
    addLabel = "ADD FILTER";
    clearLabel = "CLEAR";
    applyLabel = "APPLY";

    private emitChange(): void {
        this.dispatchDetail("aui-filter-builder-change", { filters: this.filters });
        this.requestUpdate();
    }
    private add(): void {
        if (this.filters.length >= this.maxRules || !this.fields.length) return;
        const field = this.fields[0];
        this.filters = [
            ...this.filters,
            {
                id: nextUid("filter"),
                field: field.key,
                operator: defaultOperator(field),
                value: "",
            },
        ];
        this.emitChange();
    }
    private removeRule(index: number): void {
        this.filters = this.filters.filter((_, itemIndex) => itemIndex !== index);
        this.emitChange();
    }
    private updateRule(index: number, patch: Partial<AdminFilterRule>): void {
        this.filters = this.filters.map((rule, itemIndex) =>
            itemIndex === index ? { ...rule, ...patch } : rule,
        );
        this.emitChange();
    }
    private renderValue(rule: AdminFilterRule, index: number): unknown {
        if (rule.operator === "isEmpty") return html`<span class="empty">NO VALUE REQUIRED</span>`;
        const field = this.fields.find((item) => item.key === rule.field);
        if (field?.options)
            return html`<select
                aria-label="Filter value"
                .value=${rule.value ?? ""}
                @change=${(event: Event) => this.updateRule(index, { value: filterValue(event) })}
            >
                <option value="">SELECT...</option>
                ${field.options.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
            </select>`;
        return html`<input
            aria-label="Filter value"
            type=${field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
            .value=${rule.value ?? ""}
            placeholder="VALUE"
            @input=${(event: Event) => this.updateRule(index, { value: filterValue(event) })}
        />`;
    }
    private submit(): void {
        this.dispatchDetail("aui-filter-builder-submit", { filters: this.filters });
    }
    private clear(): void {
        this.filters = [];
        this.emitChange();
    }
    render() {
        return html`<form
            @submit=${(event: Event) => {
                event.preventDefault();
                this.submit();
            }}
        >
            ${
                this.filters.length
                    ? this.filters.map(
                          (rule, index) => html`<div class="rule">
                              <select
                                  aria-label="Filter field"
                                  .value=${rule.field}
                                  @change=${(event: Event) => {
                                      const field = this.fields.find(
                                          (item) => item.key === filterValue(event),
                                      );
                                      this.updateRule(index, {
                                          field: filterValue(event),
                                          operator: defaultOperator(field),
                                          value: "",
                                      });
                                  }}
                              >
                                  ${this.fields.map((field) => html`<option value=${field.key}>${field.label}</option>`)}
                              </select>
                              <select
                                  aria-label="Filter operator"
                                  .value=${rule.operator}
                                  @change=${(event: Event) => this.updateRule(index, { operator: filterValue(event) as AdminFilterOperator })}
                              >
                                  ${filterOperators.map((operator) => html`<option value=${operator.value}>${operator.label}</option>`)}
                              </select>
                              ${this.renderValue(rule, index)}
                              <button
                                  type="button"
                                  aria-label="Remove filter"
                                  @click=${() => this.removeRule(index)}
                              >
                                  ×
                              </button>
                          </div>`,
                      )
                    : html`<span class="empty">NO FILTERS CONFIGURED</span>`
            }
            <div class="actions">
                <button
                    type="button"
                    @click=${this.add}
                    ?disabled=${this.filters.length >= this.maxRules || !this.fields.length}
                >
                    ${this.addLabel}</button
                ><button type="button" @click=${this.clear} ?disabled=${!this.filters.length}>
                    ${this.clearLabel}</button
                ><button type="submit" ?disabled=${!this.filters.length}>${this.applyLabel}</button>
            </div>
        </form>`;
    }
}

export interface AdminQueryRule extends AdminFilterRule {}

export class AdminQueryBuilderElement extends AdminElement {
    static properties = {
        fields: { attribute: false },
        rules: { attribute: false },
        logic: { type: String, reflect: true },
        applyLabel: { type: String, attribute: "apply-label" },
    };
    static styles = builderStyles;
    fields: AdminFilterField[] = [];
    rules: AdminQueryRule[] = [];
    logic: "and" | "or" = "and";
    applyLabel = "RUN QUERY";
    private emitChange(): void {
        this.dispatchDetail("aui-query-change", { logic: this.logic, rules: this.rules });
        this.requestUpdate();
    }
    private add(): void {
        if (!this.fields.length) return;
        const field = this.fields[0];
        this.rules = [
            ...this.rules,
            { id: nextUid("query"), field: field.key, operator: defaultOperator(field), value: "" },
        ];
        this.emitChange();
    }
    private updateRule(index: number, patch: Partial<AdminQueryRule>): void {
        this.rules = this.rules.map((rule, itemIndex) =>
            itemIndex === index ? { ...rule, ...patch } : rule,
        );
        this.emitChange();
    }
    private removeRule(index: number): void {
        this.rules = this.rules.filter((_, itemIndex) => itemIndex !== index);
        this.emitChange();
    }
    private submit(): void {
        this.dispatchDetail("aui-query-submit", { logic: this.logic, rules: this.rules });
    }
    render() {
        return html`<form
            @submit=${(event: Event) => {
                event.preventDefault();
                this.submit();
            }}
        >
            <div class="actions">
                <select
                    aria-label="Query logic"
                    .value=${this.logic}
                    @change=${(event: Event) => {
                        this.logic = filterValue(event) as "and" | "or";
                        this.emitChange();
                    }}
                >
                    <option value="and">ALL CONDITIONS</option>
                    <option value="or">ANY CONDITION</option></select
                ><button type="button" @click=${this.add} ?disabled=${!this.fields.length}>
                    ADD CONDITION
                </button>
            </div>
            ${
                this.rules.length
                    ? this.rules.map(
                          (rule, index) =>
                              html`<div class="rule">
                                  <select
                                      aria-label="Query field"
                                      .value=${rule.field}
                                      @change=${(event: Event) => this.updateRule(index, { field: filterValue(event) })}
                                  >
                                      ${this.fields.map((field) => html`<option value=${field.key}>${field.label}</option>`)}</select
                                  ><select
                                      aria-label="Query operator"
                                      .value=${rule.operator}
                                      @change=${(event: Event) => this.updateRule(index, { operator: filterValue(event) as AdminFilterOperator })}
                                  >
                                      ${filterOperators.map((operator) => html`<option value=${operator.value}>${operator.label}</option>`)}</select
                                  ><input
                                      aria-label="Query value"
                                      .value=${rule.value ?? ""}
                                      @input=${(event: Event) => this.updateRule(index, { value: filterValue(event) })}
                                  /><button
                                      type="button"
                                      aria-label="Remove condition"
                                      @click=${() => this.removeRule(index)}
                                  >
                                      ×
                                  </button>
                              </div>`,
                      )
                    : html`<span class="empty">NO CONDITIONS CONFIGURED</span>`
            }
            <div class="actions">
                <button type="submit" ?disabled=${!this.rules.length}>${this.applyLabel}</button>
            </div>
        </form>`;
    }
}
