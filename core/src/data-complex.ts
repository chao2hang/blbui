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
export interface AdminFilterOption {
    value: string;
    label: string;
}
export interface AdminFilterField {
    key: string;
    label: string;
    type?: AdminFilterFieldType;
    options?: AdminFilterOption[];
    /** Resolve select options lazily when a field has a large or remote dictionary. */
    loadOptions?: (query?: string) => AdminFilterOption[] | Promise<AdminFilterOption[]>;
}
export interface AdminFilterRule {
    id?: string;
    field: string;
    operator: AdminFilterOperator;
    value?: string;
}
export interface AdminFilterGroup {
    id?: string;
    logic: "and" | "or";
    rules: AdminFilterNode[];
}
export type AdminFilterNode = AdminFilterRule | AdminFilterGroup;
export function isAdminFilterGroup(node: AdminFilterNode): node is AdminFilterGroup {
    return "rules" in node && Array.isArray(node.rules);
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
    .group {
        display: grid;
        gap: 8px;
        padding: 10px;
        border: 1px dashed var(--aui-border);
        background: var(--aui-surface);
    }
    .group[data-depth="1"] {
        background: var(--aui-bg);
    }
    .group-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        color: var(--aui-text-muted);
        font: 10px/1.2 var(--aui-font-mono);
        text-transform: uppercase;
    }
    .group-heading select {
        width: auto;
        min-width: 130px;
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
    select {
        padding-right: 34px;
        appearance: none;
        -webkit-appearance: none;
        background-image:
            linear-gradient(45deg, transparent 50%, var(--aui-text-muted) 50%),
            linear-gradient(135deg, var(--aui-text-muted) 50%, transparent 50%);
        background-position:
            calc(100% - 13px) 50%,
            calc(100% - 9px) 50%;
        background-repeat: no-repeat;
        background-size: 4px 4px;
    }
    select::-ms-expand {
        display: none;
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

function newFilterRule(prefix: string, field?: AdminFilterField): AdminFilterRule {
    return {
        id: nextUid(prefix),
        field: field?.key ?? "",
        operator: defaultOperator(field),
        value: "",
    };
}

function flattenFilterNodes(nodes: AdminFilterNode[]): AdminFilterRule[] {
    return nodes.flatMap((node) =>
        isAdminFilterGroup(node) ? flattenFilterNodes(node.rules) : [node],
    );
}

function cloneFilterNodes(nodes: AdminFilterNode[]): AdminFilterNode[] {
    return nodes.map((node) =>
        isAdminFilterGroup(node) ? { ...node, rules: cloneFilterNodes(node.rules) } : { ...node },
    );
}

export class AdminFilterBuilderElement extends AdminElement {
    static properties = {
        fields: { attribute: false },
        filters: { attribute: false },
        maxRules: { type: Number, attribute: "max-rules" },
        maxDepth: { type: Number, attribute: "max-depth" },
        addLabel: { type: String, attribute: "add-label" },
        addGroupLabel: { type: String, attribute: "add-group-label" },
        clearLabel: { type: String, attribute: "clear-label" },
        applyLabel: { type: String, attribute: "apply-label" },
    };
    static styles = builderStyles;
    fields: AdminFilterField[] = [];
    filters: AdminFilterNode[] = [];
    maxRules = 8;
    maxDepth = 2;
    addLabel = "ADD FILTER";
    addGroupLabel = "ADD GROUP";
    clearLabel = "CLEAR";
    applyLabel = "APPLY";
    private readonly optionCache = new Map<string, AdminFilterOption[]>();
    private readonly optionPending = new Set<string>();
    private readonly optionErrors = new Set<string>();

    private emitChange(): void {
        this.dispatchDetail("aui-filter-builder-change", { filters: this.filters });
        this.requestUpdate();
    }
    private addRule(path: number[] = []): void {
        if (flattenFilterNodes(this.filters).length >= this.maxRules || !this.fields.length) return;
        const next = cloneFilterNodes(this.filters);
        const target = this.nodesAt(next, path);
        target.push(newFilterRule("filter", this.fields[0]));
        this.filters = next;
        this.emitChange();
    }
    private addGroup(path: number[] = []): void {
        if (path.length >= this.maxDepth) return;
        const next = cloneFilterNodes(this.filters);
        const target = this.nodesAt(next, path);
        target.push({
            id: nextUid("filter-group"),
            logic: "and",
            rules: [newFilterRule("filter", this.fields[0])],
        });
        this.filters = next;
        this.emitChange();
    }
    private nodesAt(nodes: AdminFilterNode[], path: number[]): AdminFilterNode[] {
        let current = nodes;
        for (const index of path) {
            const node = current[index];
            if (!node || !isAdminFilterGroup(node)) return current;
            current = node.rules;
        }
        return current;
    }
    private removeNode(path: number[]): void {
        if (!path.length) return;
        const next = cloneFilterNodes(this.filters);
        this.nodesAt(next, path.slice(0, -1)).splice(path.at(-1)!, 1);
        this.filters = next;
        this.emitChange();
    }
    private updateNode(path: number[], patch: Partial<AdminFilterRule>): void {
        const next = cloneFilterNodes(this.filters);
        const parent = this.nodesAt(next, path.slice(0, -1));
        const node = parent[path.at(-1)!];
        if (!node || isAdminFilterGroup(node)) return;
        parent[path.at(-1)!] = { ...node, ...patch };
        this.filters = next;
        this.emitChange();
    }
    private updateGroup(path: number[], logic: "and" | "or"): void {
        const next = cloneFilterNodes(this.filters);
        const parent = this.nodesAt(next, path.slice(0, -1));
        const node = parent[path.at(-1)!];
        if (!node || !isAdminFilterGroup(node)) return;
        parent[path.at(-1)!] = { ...node, logic };
        this.filters = next;
        this.emitChange();
    }
    private ensureOptions(field?: AdminFilterField): void {
        if (
            !field?.loadOptions ||
            this.optionCache.has(field.key) ||
            this.optionPending.has(field.key)
        )
            return;
        this.optionPending.add(field.key);
        Promise.resolve()
            .then(() => field.loadOptions?.())
            .then((options) => this.optionCache.set(field.key, options ?? []))
            .catch(() => this.optionErrors.add(field.key))
            .finally(() => {
                this.optionPending.delete(field.key);
                this.requestUpdate();
            });
    }
    private renderValue(rule: AdminFilterRule, path: number[]): unknown {
        if (rule.operator === "isEmpty") return html`<span class="empty">NO VALUE REQUIRED</span>`;
        const field = this.fields.find((item) => item.key === rule.field);
        this.ensureOptions(field);
        const options = field?.options ?? this.optionCache.get(field?.key ?? "");
        if (field?.loadOptions && this.optionPending.has(field.key))
            return html`<span class="empty" role="status">LOADING OPTIONS...</span>`;
        if (field?.loadOptions && this.optionErrors.has(field.key))
            return html`<span class="empty" role="alert">OPTIONS UNAVAILABLE</span>`;
        if (options)
            return html`<select
                aria-label="Filter value"
                .value=${rule.value ?? ""}
                @change=${(event: Event) => this.updateNode(path, { value: filterValue(event) })}
            >
                <option value="">SELECT...</option>
                ${options.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
            </select>`;
        return html`<input
            aria-label="Filter value"
            type=${field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
            .value=${rule.value ?? ""}
            placeholder="VALUE"
            @input=${(event: Event) => this.updateNode(path, { value: filterValue(event) })}
        />`;
    }
    private renderNodes(nodes: AdminFilterNode[], parentPath: number[] = [], depth = 0): unknown {
        return nodes.map((node, index) => {
            const path = [...parentPath, index];
            if (isAdminFilterGroup(node))
                return html`<div class="group" data-depth=${depth + 1}>
                    <div class="group-heading">
                        <span>GROUP ${depth + 1}</span>
                        <select
                            aria-label="Group logic"
                            .value=${node.logic}
                            @change=${(event: Event) => this.updateGroup(path, filterValue(event) as "and" | "or")}
                        >
                            <option value="and">ALL CONDITIONS</option>
                            <option value="or">ANY CONDITION</option>
                        </select>
                    </div>
                    ${this.renderNodes(node.rules, path, depth + 1)}
                    <div class="actions">
                        <button
                            type="button"
                            @click=${() => this.addRule(path)}
                            ?disabled=${flattenFilterNodes(this.filters).length >= this.maxRules}
                        >
                            ${this.addLabel}
                        </button>
                        ${depth + 1 < this.maxDepth ? html`<button type="button" @click=${() => this.addGroup(path)}>${this.addGroupLabel}</button>` : null}
                        <button
                            type="button"
                            aria-label="Remove group"
                            @click=${() => this.removeNode(path)}
                        >
                            REMOVE GROUP
                        </button>
                    </div>
                </div>`;
            return html`<div class="rule">
                <select
                    aria-label="Filter field"
                    .value=${node.field}
                    @change=${(event: Event) => {
                        const field = this.fields.find((item) => item.key === filterValue(event));
                        this.updateNode(path, {
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
                    .value=${node.operator}
                    @change=${(event: Event) => this.updateNode(path, { operator: filterValue(event) as AdminFilterOperator, value: node.value })}
                >
                    ${filterOperators.map((operator) => html`<option value=${operator.value}>${operator.label}</option>`)}
                </select>
                ${this.renderValue(node, path)}
                <button
                    type="button"
                    aria-label="Remove filter"
                    @click=${() => this.removeNode(path)}
                >
                    ×
                </button>
            </div>`;
        });
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
            ${this.filters.length ? this.renderNodes(this.filters) : html`<span class="empty">NO FILTERS CONFIGURED</span>`}
            <div class="actions">
                <button
                    type="button"
                    @click=${() => this.addRule()}
                    ?disabled=${flattenFilterNodes(this.filters).length >= this.maxRules || !this.fields.length}
                >
                    ${this.addLabel}
                </button>
                <button
                    type="button"
                    @click=${() => this.addGroup()}
                    ?disabled=${!this.fields.length || this.maxDepth < 1}
                >
                    ${this.addGroupLabel}
                </button>
                <button type="button" @click=${this.clear} ?disabled=${!this.filters.length}>
                    ${this.clearLabel}</button
                ><button type="submit" ?disabled=${!this.filters.length}>${this.applyLabel}</button>
            </div>
        </form>`;
    }
}

export interface AdminQueryRule extends AdminFilterRule {}
export interface AdminQueryGroup extends AdminFilterGroup {}
export type AdminQueryNode = AdminQueryRule | AdminQueryGroup;

export class AdminQueryBuilderElement extends AdminElement {
    static properties = {
        fields: { attribute: false },
        rules: { attribute: false },
        logic: { type: String, reflect: true },
        maxDepth: { type: Number, attribute: "max-depth" },
        applyLabel: { type: String, attribute: "apply-label" },
    };
    static styles = builderStyles;
    fields: AdminFilterField[] = [];
    rules: AdminQueryNode[] = [];
    logic: "and" | "or" = "and";
    maxDepth = 2;
    applyLabel = "RUN QUERY";
    private readonly optionCache = new Map<string, AdminFilterOption[]>();
    private readonly optionPending = new Set<string>();
    private readonly optionErrors = new Set<string>();
    private emitChange(): void {
        this.dispatchDetail("aui-query-change", { logic: this.logic, rules: this.rules });
        this.requestUpdate();
    }
    private nodesAt(nodes: AdminQueryNode[], path: number[]): AdminQueryNode[] {
        let current = nodes;
        for (const index of path) {
            const node = current[index];
            if (!node || !isAdminFilterGroup(node)) return current;
            current = node.rules as AdminQueryNode[];
        }
        return current;
    }
    private add(path: number[] = []): void {
        if (!this.fields.length) return;
        const next = cloneFilterNodes(this.rules);
        this.nodesAt(next as AdminQueryNode[], path).push(newFilterRule("query", this.fields[0]));
        this.rules = next as AdminQueryNode[];
        this.emitChange();
    }
    private addGroup(path: number[] = []): void {
        if (!this.fields.length || path.length >= this.maxDepth) return;
        const next = cloneFilterNodes(this.rules);
        this.nodesAt(next as AdminQueryNode[], path).push({
            id: nextUid("query-group"),
            logic: "and",
            rules: [newFilterRule("query", this.fields[0])],
        });
        this.rules = next as AdminQueryNode[];
        this.emitChange();
    }
    private updateRule(path: number[], patch: Partial<AdminQueryRule>): void {
        const next = cloneFilterNodes(this.rules) as AdminQueryNode[];
        const parent = this.nodesAt(next, path.slice(0, -1));
        const node = parent[path.at(-1)!];
        if (!node || isAdminFilterGroup(node)) return;
        parent[path.at(-1)!] = { ...node, ...patch };
        this.rules = next;
        this.emitChange();
    }
    private updateGroup(path: number[], logic: "and" | "or"): void {
        const next = cloneFilterNodes(this.rules) as AdminQueryNode[];
        const parent = this.nodesAt(next, path.slice(0, -1));
        const node = parent[path.at(-1)!];
        if (!node || !isAdminFilterGroup(node)) return;
        parent[path.at(-1)!] = { ...node, logic };
        this.rules = next;
        this.emitChange();
    }
    private removeNode(path: number[]): void {
        if (!path.length) return;
        const next = cloneFilterNodes(this.rules) as AdminQueryNode[];
        this.nodesAt(next, path.slice(0, -1)).splice(path.at(-1)!, 1);
        this.rules = next;
        this.emitChange();
    }
    private ensureOptions(field?: AdminFilterField): void {
        if (
            !field?.loadOptions ||
            this.optionCache.has(field.key) ||
            this.optionPending.has(field.key)
        )
            return;
        this.optionPending.add(field.key);
        Promise.resolve()
            .then(() => field.loadOptions?.())
            .then((options) => this.optionCache.set(field.key, options ?? []))
            .catch(() => this.optionErrors.add(field.key))
            .finally(() => {
                this.optionPending.delete(field.key);
                this.requestUpdate();
            });
    }
    private renderQueryValue(rule: AdminQueryRule, path: number[]): unknown {
        if (rule.operator === "isEmpty") return html`<span class="empty">NO VALUE REQUIRED</span>`;
        const field = this.fields.find((item) => item.key === rule.field);
        this.ensureOptions(field);
        const options = field?.options ?? this.optionCache.get(field?.key ?? "");
        if (field?.loadOptions && this.optionPending.has(field.key))
            return html`<span class="empty" role="status">LOADING OPTIONS...</span>`;
        if (field?.loadOptions && this.optionErrors.has(field.key))
            return html`<span class="empty" role="alert">OPTIONS UNAVAILABLE</span>`;
        if (options)
            return html`<select
                aria-label="Query value"
                .value=${rule.value ?? ""}
                @change=${(event: Event) => this.updateRule(path, { value: filterValue(event) })}
            >
                <option value="">SELECT...</option>
                ${options.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
            </select>`;
        return html`<input
            aria-label="Query value"
            type=${field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
            .value=${rule.value ?? ""}
            @input=${(event: Event) => this.updateRule(path, { value: filterValue(event) })}
        />`;
    }
    private renderNodes(nodes: AdminQueryNode[], parentPath: number[] = [], depth = 0): unknown {
        return nodes.map((node, index) => {
            const path = [...parentPath, index];
            if (isAdminFilterGroup(node))
                return html`<div class="group" data-depth=${depth + 1}>
                    <div class="group-heading">
                        <span>GROUP ${depth + 1}</span
                        ><select
                            aria-label="Group logic"
                            .value=${node.logic}
                            @change=${(event: Event) => this.updateGroup(path, filterValue(event) as "and" | "or")}
                        >
                            <option value="and">ALL CONDITIONS</option>
                            <option value="or">ANY CONDITION</option>
                        </select>
                    </div>
                    ${this.renderNodes(node.rules as AdminQueryNode[], path, depth + 1)}
                    <div class="actions">
                        <button type="button" @click=${() => this.add(path)}>ADD CONDITION</button
                        >${depth + 1 < this.maxDepth ? html`<button type="button" @click=${() => this.addGroup(path)}>ADD GROUP</button>` : null}<button
                            type="button"
                            @click=${() => this.removeNode(path)}
                        >
                            REMOVE GROUP
                        </button>
                    </div>
                </div>`;
            return html`<div class="rule">
                <select
                    aria-label="Query field"
                    .value=${node.field}
                    @change=${(event: Event) => this.updateRule(path, { field: filterValue(event), value: "" })}
                >
                    ${this.fields.map((field) => html`<option value=${field.key}>${field.label}</option>`)}</select
                ><select
                    aria-label="Query operator"
                    .value=${node.operator}
                    @change=${(event: Event) => this.updateRule(path, { operator: filterValue(event) as AdminFilterOperator })}
                >
                    ${filterOperators.map((operator) => html`<option value=${operator.value}>${operator.label}</option>`)}</select
                >${this.renderQueryValue(node, path)}<button
                    type="button"
                    aria-label="Remove condition"
                    @click=${() => this.removeNode(path)}
                >
                    ×
                </button>
            </div>`;
        });
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
            </div>
            ${this.rules.length ? this.renderNodes(this.rules) : html`<span class="empty">NO CONDITIONS CONFIGURED</span>`}
            <div class="actions">
                <button type="button" @click=${() => this.add()} ?disabled=${!this.fields.length}>
                    ADD CONDITION
                </button>
                <button
                    type="button"
                    @click=${() => this.addGroup()}
                    ?disabled=${!this.fields.length || this.maxDepth < 1}
                >
                    ADD GROUP
                </button>
                <button type="submit" ?disabled=${!this.rules.length}>${this.applyLabel}</button>
            </div>
        </form>`;
    }
}
