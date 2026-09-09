/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import {
    AdminDataError,
    AdminDataResource,
    type AdminDataCacheEvent,
    type AdminDataCacheStats,
    type AdminDataSnapshot,
    type AdminDataStatus,
} from "@chaos_team/blbui-business";

export type ParityAsyncMode = "ready" | "error" | "permission-denied";

export interface ParityAsyncRow {
    id: string;
    label: string;
}

export type ParityAsyncQuery = { mode: ParityAsyncMode };
export type ParityCacheEvent = AdminDataCacheEvent<ParityAsyncQuery>;
export type ParityCacheStats = AdminDataCacheStats;

export interface ParityAsyncResource {
    resource: AdminDataResource<ParityAsyncRow, ParityAsyncQuery>;
    setMode: (mode: ParityAsyncMode) => void;
    load: () => Promise<AdminDataSnapshot<ParityAsyncRow, ParityAsyncQuery>>;
    retry: () => Promise<AdminDataSnapshot<ParityAsyncRow, ParityAsyncQuery>>;
    clearCache: () => void;
}

/** Shared playground loader used to prove the same lifecycle in every host. */
export function createParityAsyncResource(): ParityAsyncResource {
    let mode: ParityAsyncMode = "ready";
    const resource = new AdminDataResource<ParityAsyncRow, ParityAsyncQuery>({
        loader: async ({ signal }) => {
            if (signal.aborted) throw new DOMException("The request was aborted.", "AbortError");
            if (mode === "error") {
                throw new AdminDataError("Temporary async data outage.", { status: 503 });
            }
            if (mode === "permission-denied") {
                throw new AdminDataError("Async data access is forbidden.", { status: 403 });
            }
            return { rows: [{ id: "async-ready", label: "Async contract row" }] };
        },
        cache: { ttlMs: 30_000, staleWhileRevalidate: true },
    });
    return {
        resource,
        setMode(nextMode) {
            mode = nextMode;
        },
        load() {
            return resource.load({ query: { mode } });
        },
        retry() {
            return resource.retry();
        },
        clearCache() {
            resource.clearCache();
        },
    };
}

export function parityAsyncState(status: AdminDataStatus): ParityAsyncMode {
    return status === "error" || status === "permission-denied" ? status : "ready";
}
