/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { describe, expect, it, vi } from "vitest";
import {
    AdminDataError,
    AdminDataResource,
    createAdminFetchDataSource,
    getAdminDataErrorMeta,
} from "../business/src/data-source";

type Row = { id: string; label: string };

describe("business data source contract", () => {
    it("transitions through loading, ready, empty and retryable error states", async () => {
        let shouldFail = true;
        const resource = new AdminDataResource<Row>({
            loader: async () => {
                if (shouldFail) throw new AdminDataError("temporary outage", { status: 503 });
                return { rows: [{ id: "a", label: "Gateway" }], total: 4, nextCursor: "next" };
            },
        });
        const statuses: string[] = [];
        resource.subscribe((snapshot) => statuses.push(snapshot.status));

        await resource.load({ page: 1, pageSize: 25 });
        expect(resource.getSnapshot()).toMatchObject({
            status: "error",
            request: { page: 1, pageSize: 25 },
            error: { status: 503, retryable: true, permissionDenied: false },
        });

        shouldFail = false;
        await resource.retry();
        expect(resource.getSnapshot()).toMatchObject({
            status: "ready",
            rows: [{ id: "a", label: "Gateway" }],
            total: 4,
            nextCursor: "next",
        });

        resource.setLoader(async () => ({ rows: [] }));
        await resource.load();
        expect(resource.getSnapshot().status).toBe("empty");
        expect(statuses).toEqual(["idle", "loading", "error", "loading", "ready", "loading", "empty"]);
    });

    it("normalizes permission errors as non-retryable permission-denied state", async () => {
        const resource = new AdminDataResource<Row>({
            loader: async () => {
                throw { status: 403, message: "forbidden" };
            },
        });
        await resource.load();
        expect(resource.getSnapshot()).toMatchObject({
            status: "permission-denied",
            error: { status: 403, permissionDenied: true, retryable: false, message: "forbidden" },
        });
        expect(getAdminDataErrorMeta(new Error("network"))).toMatchObject({
            permissionDenied: false,
            retryable: true,
        });
    });

    it("ignores stale responses and aborts the previous request", async () => {
        let resolveFirst: ((page: { rows: Row[] }) => void) | undefined;
        const first = new Promise<{ rows: Row[] }>((resolve) => {
            resolveFirst = resolve;
        });
        const resource = new AdminDataResource<Row>({
            loader: async ({ page }) =>
                page === 1 ? first : { rows: [{ id: "new", label: "Fresh" }] },
        });
        const firstLoad = resource.load({ page: 1 });
        const secondLoad = resource.load({ page: 2 });
        resolveFirst?.({ rows: [{ id: "old", label: "Stale" }] });
        await Promise.all([firstLoad, secondLoad]);
        expect(resource.getSnapshot().rows).toEqual([{ id: "new", label: "Fresh" }]);
        expect(resource.getSnapshot().request).toEqual({ page: 2 });
    });

    it("maps fetch responses and HTTP failures without a transport dependency", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch");
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ rows: [{ id: "a", label: "API" }], total: 1 }), {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        );
        const source = createAdminFetchDataSource<Row>({ endpoint: "/api/rows" });
        await expect(source({ signal: new AbortController().signal })).resolves.toEqual({
            rows: [{ id: "a", label: "API" }],
            total: 1,
        });

        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ code: "NOPE" }), { status: 429 }));
        await expect(source({ signal: new AbortController().signal })).rejects.toMatchObject({
            status: 429,
            retryable: undefined,
        });
        fetchMock.mockRestore();
    });
});
