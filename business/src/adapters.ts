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
    getSelectedRowModel?: () => { rows: Array<{ id: string | number }> };
    getState?: () => { sorting?: Array<{ id: string; desc?: boolean }> };
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
    const selectedKeys = table.getSelectedRowModel?.()?.rows.map((row) => row.id);
    const sorting = table.getState?.()?.sorting?.[0];
    return {
        columns,
        rows,
        selectedKeys,
        sortKey: sorting?.id,
        sortDirection: sorting ? (sorting.desc ? "desc" : "asc") : "none",
        total: rows.length,
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
