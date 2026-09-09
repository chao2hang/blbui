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

    it("exposes cache metrics and resilient cache events without changing request behavior", async () => {
        const events: string[] = [];
        const loader = vi.fn(async () => ({ rows: [{ id: "observed", label: "Observed" }] }));
        const resource = new AdminDataResource<Row>({
            loader,
            cache: {
                ttlMs: 60_000,
                onEvent: (event) => {
                    events.push(event.type);
                    throw new Error("telemetry sink unavailable");
                },
            },
        });
        const unsubscribe = resource.subscribeCache((event) => events.push(`sub:${event.type}`));

        await resource.load({ page: 1 });
        await resource.load({ page: 1 });
        await resource.retry();
        resource.clearCache();

        expect(loader).toHaveBeenCalledTimes(2);
        expect(resource.getCacheStats()).toMatchObject({
            entries: 0,
            misses: 1,
            hits: 1,
            bypasses: 1,
            writes: 2,
            invalidations: 1,
            staleHits: 0,
            revalidations: 0,
        });
        expect(events).toEqual([
            "sub:miss",
            "miss",
            "sub:write",
            "write",
            "sub:hit",
            "hit",
            "sub:bypass",
            "bypass",
            "sub:write",
            "write",
            "sub:invalidate",
            "invalidate",
        ]);

        unsubscribe();
        resource.resetCacheStats();
        expect(resource.getCacheStats()).toEqual({
            entries: 0,
            hits: 0,
            staleHits: 0,
            misses: 0,
            bypasses: 0,
            writes: 0,
            invalidations: 0,
            revalidations: 0,
        });
    });

    it("reports stale hits and revalidation separately from fresh hits", async () => {
        let version = 1;
        const events: string[] = [];
        const resource = new AdminDataResource<Row>({
            loader: async () => ({ rows: [{ id: `v${version}`, label: `Version ${version}` }] }),
            cache: { ttlMs: 0, staleWhileRevalidate: true },
        });
        resource.subscribeCache((event) => events.push(event.type));

        await resource.load({ page: 1 });
        version = 2;
        await resource.load({ page: 1 });

        expect(resource.getSnapshot().rows[0]?.id).toBe("v2");
        expect(resource.getCacheStats()).toMatchObject({
            entries: 1,
            misses: 1,
            staleHits: 1,
            revalidations: 1,
            writes: 2,
        });
        expect(events).toEqual(["miss", "write", "stale-hit", "write"]);
    });

    it("exposes redacted request lifecycle telemetry without coupling to an SDK", async () => {
        let attempts = 0;
        const telemetry: Array<Record<string, unknown>> = [];
        const resource = new AdminDataResource<Row, { scope: string }>({
            retry: { maxRetries: 1, delayMs: 0 },
            cache: { ttlMs: 60_000 },
            telemetry: {
                includeRequest: true,
                onEvent: () => {
                    throw new Error("telemetry sink unavailable");
                },
            },
            loader: async () => {
                attempts += 1;
                if (attempts === 1) {
                    throw new AdminDataError("temporary outage", {
                        status: 503,
                        code: "UPSTREAM_TIMEOUT",
                        cause: { authorization: "secret" },
                    });
                }
                return { rows: [{ id: "observed", label: "Observed" }] };
            },
        });
        const unsubscribe = resource.subscribeTelemetry((event) => telemetry.push(event));

        await resource.load({ query: { scope: "ops" } });
        await resource.load({ query: { scope: "ops" } });

        expect(telemetry.map((event) => event.type)).toEqual([
            "load-start",
            "load-retry",
            "load-success",
            "load-start",
            "load-success",
        ]);
        expect(telemetry[0]).toMatchObject({
            requestId: 1,
            request: { query: { scope: "ops" } },
            attempt: 1,
        });
        expect(telemetry[1]).toMatchObject({
            type: "load-retry",
            attempt: 1,
            nextAttempt: 2,
            error: {
                status: 503,
                code: "UPSTREAM_TIMEOUT",
                message: "temporary outage",
                retryable: true,
            },
        });
        expect(telemetry[1]?.error).not.toHaveProperty("cause");
        expect(telemetry[2]).toMatchObject({
            type: "load-success",
            attempt: 2,
            source: "network",
            status: "ready",
            rows: 1,
        });
        expect(telemetry[4]).toMatchObject({
            type: "load-success",
            attempt: 0,
            source: "cache",
            status: "ready",
        });
        for (const event of telemetry) expect(event.durationMs).toBeGreaterThanOrEqual(0);
        expect(resource.getTelemetryStats()).toEqual({
            loads: 2,
            retries: 1,
            successes: 2,
            errors: 0,
            aborts: 0,
        });

        unsubscribe();
        resource.resetTelemetryStats();
        expect(resource.getTelemetryStats()).toEqual({
            loads: 0,
            retries: 0,
            successes: 0,
            errors: 0,
            aborts: 0,
        });
        resource.dispose();
    });

    it("reports superseded requests as aborted and keeps stale work from publishing", async () => {
        let resolveFirst: ((page: { rows: Row[] }) => void) | undefined;
        const telemetry: string[] = [];
        const resource = new AdminDataResource<Row>({
            telemetry: { onEvent: (event) => telemetry.push(`${event.type}:${event.reason ?? ""}`) },
            loader: async ({ page }) =>
                page === 1
                    ? new Promise<{ rows: Row[] }>((resolve) => {
                          resolveFirst = resolve;
                      })
                    : { rows: [{ id: "new", label: "Fresh" }] },
        });

        const firstLoad = resource.load({ page: 1 });
        const secondLoad = resource.load({ page: 2 });
        resolveFirst?.({ rows: [{ id: "old", label: "Stale" }] });
        await Promise.all([firstLoad, secondLoad]);

        expect(telemetry).toContain("load-abort:superseded");
        expect(telemetry).toContain("load-success:");
        expect(resource.getSnapshot().rows).toEqual([{ id: "new", label: "Fresh" }]);
        resource.dispose();
    });

    it("omits request and cache key from telemetry by default", async () => {
        const telemetry: Array<Record<string, unknown>> = [];
        const resource = new AdminDataResource<Row, { scope: string }>({
            cache: { ttlMs: 60_000 },
            loader: async () => ({ rows: [{ id: "private", label: "Private" }] }),
        });
        resource.subscribeTelemetry((event) => telemetry.push(event));

        await resource.load({ query: { scope: "sensitive" } });

        expect(telemetry).toHaveLength(2);
        expect(telemetry[0]?.type).toBe("load-start");
        expect(telemetry[1]?.type).toBe("load-success");
        expect(telemetry[0]).not.toHaveProperty("request");
        expect(telemetry[0]).not.toHaveProperty("key");
        expect(telemetry[1]).not.toHaveProperty("request");
        expect(telemetry[1]).not.toHaveProperty("key");

        resource.dispose();
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
