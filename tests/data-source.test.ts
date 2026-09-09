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
        expect(statuses).toEqual([
            "idle",
            "loading",
            "error",
            "loading",
            "ready",
            "loading",
            "empty",
        ]);
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

        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ code: "NOPE" }), { status: 429 }),
        );
        await expect(source({ signal: new AbortController().signal })).rejects.toMatchObject({
            status: 429,
            retryable: undefined,
        });
        fetchMock.mockRestore();
    });

    it("retries transient failures with a bounded backoff policy", async () => {
        let attempts = 0;
        const resource = new AdminDataResource<Row>({
            retry: { maxRetries: 2, delayMs: 0, backoffMultiplier: 2 },
            loader: async () => {
                attempts += 1;
                if (attempts < 3) throw new AdminDataError("temporary outage", { status: 503 });
                return { rows: [{ id: "fresh", label: "Fresh" }] };
            },
        });

        await resource.load();

        expect(attempts).toBe(3);
        expect(resource.getSnapshot()).toMatchObject({
            status: "ready",
            rows: [{ id: "fresh", label: "Fresh" }],
        });
    });

    it("caches successful pages by request identity and lets retry bypass the cache", async () => {
        const loader = vi.fn(async () => ({ rows: [{ id: "cached", label: "Cached" }] }));
        const resource = new AdminDataResource<Row>({
            loader,
            cache: { ttlMs: 60_000 },
        });

        await resource.load({ page: 1, pageSize: 25 });
        await resource.load({ page: 1, pageSize: 25 });
        expect(loader).toHaveBeenCalledTimes(1);

        await resource.load({ page: 2, pageSize: 25 });
        expect(loader).toHaveBeenCalledTimes(2);

        await resource.retry();
        expect(loader).toHaveBeenCalledTimes(3);

        resource.clearCache();
        await resource.load({ page: 1, pageSize: 25 });
        expect(loader).toHaveBeenCalledTimes(4);
    });

    it("serves stale data while revalidating when explicitly enabled", async () => {
        let version = 1;
        const statuses: string[] = [];
        const resource = new AdminDataResource<Row>({
            loader: async () => ({ rows: [{ id: `v${version}`, label: `Version ${version}` }] }),
            cache: { ttlMs: 0, staleWhileRevalidate: true },
        });
        resource.subscribe((snapshot) => statuses.push(snapshot.status));

        await resource.load({ page: 1 });
        version = 2;
        await resource.load({ page: 1 });

        expect(resource.getSnapshot().rows).toEqual([{ id: "v2", label: "Version 2" }]);
        expect(statuses).toEqual(["idle", "loading", "ready", "ready", "loading", "ready"]);
    });

    it("does not revalidate a fresh stale-while-revalidate cache hit", async () => {
        const loader = vi.fn(async () => ({ rows: [{ id: "cached", label: "Cached" }] }));
        const resource = new AdminDataResource<Row>({
            loader,
            cache: { ttlMs: 60_000, staleWhileRevalidate: true },
        });

        await resource.load({ page: 1 });
        await resource.load({ page: 1 });

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it("cancels a retry backoff when the resource is aborted", async () => {
        let attempts = 0;
        const resource = new AdminDataResource<Row>({
            retry: { maxRetries: 2, delayMs: 50 },
            loader: async () => {
                attempts += 1;
                throw new AdminDataError("temporary outage", { status: 503 });
            },
        });

        const load = resource.load();
        await new Promise((resolve) => setTimeout(resolve, 0));
        resource.abort();
        await load;

        expect(attempts).toBe(1);
        expect(resource.getSnapshot().status).toBe("loading");
    });
});
