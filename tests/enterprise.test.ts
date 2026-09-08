/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { registerAdminElements } from "../core/src/register";
import { registerBusinessElements } from "../business/src/register";
import type {
    AdminAuditLogElement,
    AdminFormWizardElement,
    AdminPermissionMatrixElement,
} from "../business/src/enterprise";
import type { AdminToastManagerElement } from "../core/src/notifications";
import type {
    AdminBulkActionsToolbarElement,
    AdminExportButtonElement,
    AdminImportDialogElement,
} from "../business/src/operations";
import type { AdminLineChartElement } from "../business/src/analytics";

type ElementWithUpdate = HTMLElement & { updateComplete: Promise<unknown> };

async function element<T extends HTMLElement>(tag: string): Promise<T & ElementWithUpdate> {
    const node = document.createElement(tag) as T & ElementWithUpdate;
    document.body.append(node);
    await node.updateComplete;
    return node;
}

beforeAll(() => {
    registerAdminElements();
    registerBusinessElements();
});

afterEach(() => {
    localStorage.clear();
    document.body.replaceChildren();
});

describe("application notification manager", () => {
    it("queues, limits, persists and closes notifications", async () => {
        const manager = await element<AdminToastManagerElement>("aui-toast-manager");
        manager.max = 2;
        manager.persistKey = "test-toasts";
        const changed = vi.fn();
        manager.addEventListener("aui-toast-manager-change", (event) =>
            changed((event as CustomEvent).detail),
        );

        const first = manager.push({ title: "One", message: "First" });
        manager.push({ title: "Two", message: "Second" });
        const third = manager.push({ title: "Three", message: "Third" });
        await manager.updateComplete;

        expect(manager.items.map((item) => item.title)).toEqual(["Two", "Three"]);
        expect(JSON.parse(localStorage.getItem("test-toasts") ?? "[]")).toHaveLength(2);
        expect(changed).toHaveBeenCalled();

        manager.close(first);
        manager.close(third);
        await manager.updateComplete;
        expect(manager.items).toHaveLength(1);
        expect(manager.items[0].title).toBe("Two");
    });

    it("restores persisted items for a new manager instance", async () => {
        localStorage.setItem(
            "restored-toasts",
            JSON.stringify([{ id: "saved", title: "Saved", message: "Restored", variant: "info" }]),
        );
        const manager = document.createElement("aui-toast-manager") as AdminToastManagerElement &
            ElementWithUpdate;
        manager.persistKey = "restored-toasts";
        document.body.append(manager);
        await manager.updateComplete;
        expect(manager.items).toEqual([
            { id: "saved", title: "Saved", message: "Restored", variant: "info" },
        ]);
    });
});

describe("enterprise workflow components", () => {
    it("renders line chart gaps as separate segments", async () => {
        const chart = await element<AdminLineChartElement>("aui-line-chart");
        chart.data = [
            { label: "A", value: 10 },
            { label: "B", value: null },
            { label: "C", value: 30 },
        ];
        await chart.updateComplete;
        expect(chart.shadowRoot?.querySelectorAll("polyline")).toHaveLength(2);
        expect(chart.shadowRoot?.querySelector("svg")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
        expect(chart.shadowRoot?.querySelector('[role="img"]')).not.toBeNull();
    });

    it("moves through a linear wizard and emits completion", async () => {
        const wizard = await element<AdminFormWizardElement>("aui-form-wizard");
        wizard.steps = [
            { id: "account", label: "Account" },
            { id: "policy", label: "Policy" },
            { id: "review", label: "Review" },
        ];
        const complete = vi.fn();
        wizard.addEventListener("aui-wizard-complete", (event) =>
            complete((event as CustomEvent).detail),
        );
        await wizard.updateComplete;

        const buttons = () =>
            wizard.shadowRoot?.querySelectorAll<HTMLButtonElement>(".step-button");
        expect(wizard.active).toBe("account");
        wizard.shadowRoot?.querySelector<HTMLButtonElement>(".actions .primary")?.click();
        await wizard.updateComplete;
        expect(wizard.active).toBe("policy");
        expect(wizard.completed).toContain("account");
        expect(buttons()?.[2].disabled).toBe(true);

        wizard.shadowRoot?.querySelector<HTMLButtonElement>(".actions .primary")?.click();
        await wizard.updateComplete;
        wizard.shadowRoot?.querySelector<HTMLButtonElement>(".actions .primary")?.click();
        expect(complete).toHaveBeenCalledWith(expect.objectContaining({ id: "review" }));
    });

    it("cycles permission levels and filters audit entries", async () => {
        const matrix = await element<AdminPermissionMatrixElement>("aui-permission-matrix");
        matrix.roles = [{ id: "ops", label: "OPS" }];
        matrix.resources = [{ id: "routes", label: "Routes" }];
        const permission = vi.fn();
        matrix.addEventListener("aui-permission-change", (event) =>
            permission((event as CustomEvent).detail),
        );
        await matrix.updateComplete;
        matrix.shadowRoot?.querySelector<HTMLButtonElement>(".permission")?.click();
        await matrix.updateComplete;
        expect(permission).toHaveBeenCalledWith(expect.objectContaining({ permission: "read" }));

        const audit = await element<AdminAuditLogElement>("aui-audit-log");
        audit.entries = [
            {
                id: "1",
                time: "10:00",
                actor: "ops",
                action: "Deploy",
                target: "gateway",
                status: "success",
            },
            {
                id: "2",
                time: "10:01",
                actor: "sec",
                action: "Reject",
                target: "policy",
                status: "danger",
            },
        ];
        const loadMore = vi.fn();
        audit.hasMore = true;
        audit.addEventListener("aui-audit-load-more", (event) =>
            loadMore((event as CustomEvent).detail),
        );
        await audit.updateComplete;
        const query = audit.shadowRoot?.querySelector<HTMLInputElement>('input[name="query"]');
        if (!query) throw new Error("audit query input missing");
        query.value = "reject";
        query.dispatchEvent(new Event("input", { bubbles: true }));
        await audit.updateComplete;
        expect(audit.shadowRoot?.querySelectorAll("tbody tr")).toHaveLength(1);
        audit.shadowRoot?.querySelector<HTMLButtonElement>(".more button")?.click();
        expect(loadMore).toHaveBeenCalledWith({ query: "reject", status: "" });
    });

    it("supports import preview, CSV export and guarded bulk actions", async () => {
        const importer = await element<AdminImportDialogElement>("aui-import-dialog");
        importer.open = true;
        const input = importer.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
        const file = new File(["id,name\n1,Gateway\n"], "channels.csv", { type: "text/csv" });
        Object.defineProperty(input, "files", { configurable: true, value: [file] });
        input?.dispatchEvent(new Event("change", { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));
        await importer.updateComplete;
        expect(importer.rows).toEqual([{ id: "1", name: "Gateway" }]);

        const exporter = await element<AdminExportButtonElement>("aui-export-button");
        exporter.data = [{ id: "1", status: "ready" }];
        let exportDetail: unknown;
        exporter.addEventListener(
            "aui-export",
            (event) => (exportDetail = (event as CustomEvent).detail),
        );
        await exporter.updateComplete;
        exporter.shadowRoot?.querySelector<HTMLButtonElement>("button")?.click();
        expect(exportDetail).toMatchObject({ format: "csv", content: "id,status\n1,ready" });

        const bulk = await element<AdminBulkActionsToolbarElement>("aui-bulk-actions-toolbar");
        bulk.selected = 2;
        bulk.actions = [{ id: "archive", label: "ARCHIVE" }];
        const action = vi.fn();
        bulk.addEventListener("aui-bulk-action", (event) => action((event as CustomEvent).detail));
        await bulk.updateComplete;
        bulk.shadowRoot?.querySelector<HTMLButtonElement>("button:not(:last-child)")?.click();
        expect(action).toHaveBeenCalledWith(
            expect.objectContaining({ id: "archive", selected: 2 }),
        );
    });
});
