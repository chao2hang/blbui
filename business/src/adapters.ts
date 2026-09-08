/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { getAdminVirtualRange } from "@chaos_team/blbui-core";
import type { AdminBusinessColumn } from "./crud";

export interface AdminDataGridAdapter<
    Row extends Record<string, unknown> = Record<string, unknown>,
> {
    columns: AdminBusinessColumn[];
    rows: Row[];
    selectedKeys?: Array<string | number>;
    sortKey?: string;
    sortDirection?: "asc" | "desc" | "none";
    /** One-based page number, when the source table exposes pagination state. */
    page?: number;
    /** Page size, when the source table exposes pagination state. */
    pageSize?: number;
    total?: number;
}

export interface AdminVirtualRows<Row> {
    rows: Row[];
    start: number;
    end: number;
    top: number;
    bottom: number;
}

/**
 * Adapt a TanStack Table-like instance without making TanStack a dependency.
 * This intentionally uses the small public surface shared by TanStack Table
 * v8 and compatible headless table implementations.
 */
export interface AdminTableLike<Row extends Record<string, unknown>> {
    getAllLeafColumns(): Array<{
        id: string;
        columnDef?: {
            header?: unknown;
            meta?: { label?: string; align?: AdminBusinessColumn["align"] };
        };
    }>;
    getRowModel(): { rows: Array<{ id: string | number; original: Row }> };
    /** The pre-pagination model lets a server/client table report its filtered total. */
    getPrePaginationRowModel?: () => { rows: Array<unknown> };
    /** Used by headless table implementations that do not expose a pre-pagination model. */
    getFilteredRowModel?: () => { rows: Array<unknown> };
    getSelectedRowModel?: () => { rows: Array<{ id: string | number }> };
    getState?: () => {
        sorting?: Array<{ id: string; desc?: boolean }>;
        pagination?: { pageIndex?: number; pageSize?: number };
        /** TanStack's row-selection map also retains selections outside the current page. */
        rowSelection?: Record<string, boolean>;
    };
}

export interface AdminAdapterSelection {
    keys: Array<string | number>;
    /** True when every row in the current adapter page is selected. */
    all: boolean;
    /** True when at least one, but not every, current-page row is selected. */
    some: boolean;
}

/**
 * Map a row collection to the selection state expected by business tables.
 * The helper is intentionally pure so React/Vue/Svelte hosts can share the
 * same selection semantics without importing a table runtime.
 */
export function getAdapterSelection<Row extends Record<string, unknown>>(
    rows: Row[],
    selectedKeys: Array<string | number> = [],
    getKey: (row: Row, index: number) => string | number = (row, index) =>
        (row as Row & { id?: string | number }).id ?? index,
): AdminAdapterSelection {
    const keys = rows.map(getKey);
    const selected = keys.filter((key) => selectedKeys.includes(key));
    return {
        keys: selected,
        all: keys.length > 0 && selected.length === keys.length,
        some: selected.length > 0 && selected.length < keys.length,
    };
}

export function fromTable<Row extends Record<string, unknown>>(
    table: AdminTableLike<Row>,
): AdminDataGridAdapter<Row> {
    const columns = table.getAllLeafColumns().map((column) => ({
        key: column.id,
        label:
            typeof column.columnDef?.header === "string"
                ? column.columnDef.header
                : (column.columnDef?.meta?.label ?? column.id),
        align: column.columnDef?.meta?.align,
    }));
    const rows = table.getRowModel().rows.map((row) => ({ ...row.original, id: row.id }));
    const state = table.getState?.();
    const selectedKeys = state?.rowSelection
        ? Object.entries(state.rowSelection)
              .filter(([, selected]) => selected)
              .map(([key]) => key)
        : table.getSelectedRowModel?.()?.rows.map((row) => row.id);
    const sorting = state?.sorting?.[0];
    const pagination = state?.pagination;
    const total =
        table.getPrePaginationRowModel?.().rows.length ??
        table.getFilteredRowModel?.().rows.length ??
        rows.length;
    return {
        columns,
        rows,
        selectedKeys,
        sortKey: sorting?.id,
        sortDirection: sorting ? (sorting.desc ? "desc" : "asc") : "none",
        page: pagination?.pageIndex === undefined ? undefined : Math.max(1, pagination.pageIndex + 1),
        pageSize: pagination?.pageSize,
        total,
    };
}

export function virtualizeRows<Row>(
    rows: Row[],
    scrollTop: number,
    viewportHeight: number,
    rowHeight = 44,
    overscan = 4,
): AdminVirtualRows<Row> {
    const range = getAdminVirtualRange(rows.length, scrollTop, viewportHeight, rowHeight, overscan);
    return {
        rows: rows.slice(range.start, range.end),
        start: range.start,
        end: range.end,
        top: range.top,
        bottom: range.bottom,
    };
}
