/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { afterEach, describe, expect, it, vi } from "vitest";
import { registerAdminElements } from "../core/src/register";
import {
    getAdminHttpStatusMeta,
    getAdminHttpStatusTone,
    type AdminFilterField,
} from "../core/src/index";

type AnyElement = HTMLElement & Record<string, any>;

async function element(tag: string): Promise<AnyElement> {
    registerAdminElements();
    const item = document.createElement(tag) as AnyElement;
    document.body.append(item);
    await item.updateComplete;
    return item;
}

afterEach(() => {
    document.body.innerHTML = "";
});

describe("complex data components", () => {
    it("expands and selects tree table nodes with semantic events", async () => {
        const tree = await element("aui-tree-table");
        tree.columns = [{ key: "label", label: "NAME" }, { key: "status", label: "STATUS" }];
        tree.nodes = [{ id: "root", label: "ROOT", children: [{ id: "child", label: "CHILD", status: "READY" }] }];
        tree.selectable = true;
        await tree.updateComplete;
        expect(tree.shadowRoot?.querySelectorAll("tbody tr")).toHaveLength(1);
        const toggle = tree.shadowRoot?.querySelector<HTMLButtonElement>(".toggle");
        toggle?.click();
        await tree.updateComplete;
        expect(tree.expanded).toEqual(["root"]);
        expect(tree.shadowRoot?.querySelectorAll("tbody tr")).toHaveLength(2);
        const selected = vi.fn();
        tree.addEventListener("aui-tree-table-select", (event) => selected((event as CustomEvent).detail));
        tree.shadowRoot?.querySelectorAll<HTMLTableRowElement>("tbody tr")[1]?.click();
        expect(selected).toHaveBeenCalledWith(expect.objectContaining({ id: "child" }));
    });

    it("supports list loading, empty, error and selection contracts", async () => {
        const list = await element("aui-list-view");
        list.items = [{ id: "a", title: "Gateway", description: "Healthy", status: "ONLINE" }];
        const selected = vi.fn();
        list.addEventListener("aui-list-view-select", (event) => selected((event as CustomEvent).detail));
        await list.updateComplete;
        list.shadowRoot?.querySelector<HTMLButtonElement>(".item")?.click();
        expect(selected).toHaveBeenCalledWith(expect.objectContaining({ id: "a", selectedKeys: ["a"] }));
        list.loading = true;
        await list.updateComplete;
        expect(list.shadowRoot?.querySelector('[role="status"]')?.textContent).toContain("LOADING");
    });

    it("uses the shared permission-denied and retry contract", async () => {
        const list = await element("aui-list-view");
        list.error = true;
        list.retryable = true;
        const retry = vi.fn();
        list.addEventListener("aui-retry", (event) => retry((event as CustomEvent).detail));
        await list.updateComplete;
        list.shadowRoot?.querySelector<HTMLButtonElement>(".retry")?.click();
        expect(retry).toHaveBeenCalledWith({ source: "list-view", reason: "error" });

        list.error = false;
        list.permissionDenied = true;
        await list.updateComplete;
        expect(list.shadowRoot?.querySelector('[role="status"]')?.textContent).toContain("PERMISSION DENIED");
        expect(list.shadowRoot?.querySelector(".retry")).toBeNull();
    });

    it("creates filter and query rules using property-based schemas", async () => {
        const fields: AdminFilterField[] = [
            { key: "status", label: "Status", type: "select", options: [{ value: "ready", label: "Ready" }] },
            { key: "latency", label: "Latency", type: "number" },
        ];
        const builder = await element("aui-filter-builder");
        builder.fields = fields;
        builder.filters = [];
        const changed = vi.fn();
        builder.addEventListener("aui-filter-builder-change", (event) => changed((event as CustomEvent).detail));
        await builder.updateComplete;
        builder.shadowRoot?.querySelector<HTMLButtonElement>('button:not([aria-label])')?.click();
        await builder.updateComplete;
        expect(builder.filters).toHaveLength(1);
        expect(changed).toHaveBeenCalled();

        const query = await element("aui-query-builder");
        query.fields = fields;
        const submitted = vi.fn();
        query.addEventListener("aui-query-submit", (event) => submitted((event as CustomEvent).detail));
        await query.updateComplete;
        query.shadowRoot?.querySelector<HTMLButtonElement>('button:not([aria-label])')?.click();
        await query.updateComplete;
        expect(query.rules).toHaveLength(1);
        query.shadowRoot?.querySelector<HTMLFormElement>("form")?.requestSubmit();
        expect(submitted).toHaveBeenCalledWith(expect.objectContaining({ logic: "and" }));
    });
});

describe("HTTP status semantics", () => {
    it("maps status classes to token-friendly tones and retry hints", () => {
        expect(getAdminHttpStatusTone(200)).toBe("success");
        expect(getAdminHttpStatusMeta(302)).toMatchObject({ category: "redirection", tone: "info" });
        expect(getAdminHttpStatusMeta(429)).toMatchObject({ category: "client-error", tone: "warning", retryable: true });
        expect(getAdminHttpStatusMeta(503)).toMatchObject({ category: "server-error", tone: "danger", retryable: true });
        expect(getAdminHttpStatusMeta(Number.NaN).category).toBe("unknown");
    });
});
