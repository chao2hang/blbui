/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { describe, expect, it } from "vitest";
import {
    fromTable,
    getAdapterSelection,
    virtualizeRows,
    type AdminTableLike,
} from "../business/src/adapters";
import {
    connectEditorAdapter,
    readEditorState,
    writeEditorState,
    type AdminEditorAdapter,
} from "../business/src/editor-adapters";

type Row = { id: string; name: string };

function table(overrides: Partial<AdminTableLike<Row>> = {}): AdminTableLike<Row> {
    return {
        getAllLeafColumns: () => [
            { id: "name", columnDef: { header: "Name" } },
            { id: "status", columnDef: { meta: { label: "State", align: "center" } } },
        ],
        getRowModel: () => ({
            rows: [{ id: "gateway-2", original: { id: "gateway-2", name: "Edge" } }],
        }),
        getState: () => ({
            sorting: [{ id: "name", desc: true }],
            pagination: { pageIndex: 1, pageSize: 25 },
            rowSelection: { "gateway-1": true, "gateway-2": false, "gateway-9": true },
        }),
        getPrePaginationRowModel: () => ({ rows: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}] }),
        ...overrides,
    };
}

describe("business data adapter contract", () => {
    it("maps columns, server pagination, sorting and off-page selection", () => {
        const result = fromTable(table());

        expect(result.columns).toEqual([
            { key: "name", label: "Name", align: undefined },
            { key: "status", label: "State", align: "center" },
        ]);
        expect(result.rows).toEqual([{ id: "gateway-2", name: "Edge" }]);
        expect(result.selectedKeys).toEqual(["gateway-1", "gateway-9"]);
        expect(result.sortKey).toBe("name");
        expect(result.sortDirection).toBe("desc");
        expect(result.page).toBe(2);
        expect(result.pageSize).toBe(25);
        expect(result.total).toBe(10);
    });

    it("falls back to selected rows and filtered rows for compatible table runtimes", () => {
        const result = fromTable(
            table({
                getState: () => ({ pagination: { pageIndex: 0, pageSize: 10 } }),
                getSelectedRowModel: () => ({ rows: [{ id: "gateway-2" }] }),
                getFilteredRowModel: () => ({ rows: [{}, {}, {}] }),
                getPrePaginationRowModel: undefined,
            }),
        );

        expect(result.selectedKeys).toEqual(["gateway-2"]);
        expect(result.total).toBe(3);
        expect(result.sortDirection).toBe("none");
        expect(result.page).toBe(1);
    });

    it("reports current-page selection without coupling to a table runtime", () => {
        const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
        expect(getAdapterSelection(rows, ["a", "c"])).toEqual({
            keys: ["a", "c"],
            all: false,
            some: true,
        });
        expect(getAdapterSelection(rows, ["a", "b", "c"]).all).toBe(true);
        expect(getAdapterSelection([], ["a"])).toEqual({ keys: [], all: false, some: false });
    });

    it("keeps virtual ranges bounded and reports spacer sizes", () => {
        const rows = Array.from({ length: 100 }, (_, index) => index);
        const result = virtualizeRows(rows, 440, 88, 44, 1);

        expect(result.start).toBe(9);
        expect(result.end).toBe(13);
        expect(result.rows).toEqual([9, 10, 11, 12]);
        expect(result.top).toBe(396);
        expect(result.bottom).toBe(3828);
    });

    it("normalizes editor selections without coupling to an editor runtime", () => {
        let value = "hello";
        let selection = { from: 1, to: 3 };
        let listener: ((state: { value: string; selection: typeof selection }) => void) | undefined;
        const adapter: AdminEditorAdapter = {
            getValue: () => value,
            setValue: (next) => {
                value = next;
            },
            getSelection: () => selection,
            setSelection: (next) => {
                selection = next;
            },
            subscribe: (next) => {
                listener = next;
                return () => {
                    listener = undefined;
                };
            },
        };

        expect(readEditorState(adapter)).toEqual({ value: "hello", selection: { from: 1, to: 3 } });
        expect(writeEditorState(adapter, { value: "ok", selection: { from: 9, to: -2 } })).toEqual({
            value: "ok",
            selection: { from: 0, to: 2 },
        });
        const received: unknown[] = [];
        const disconnect = connectEditorAdapter(adapter, (state) => received.push(state));
        listener?.({ value, selection });
        expect(received).toHaveLength(1);
        disconnect();
        expect(listener).toBeUndefined();
    });
});
