/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import type { AdminAsyncState } from "@chaos_team/blbui-core";

export type AdminDataStatus = "idle" | "loading" | "ready" | AdminAsyncState;

export interface AdminDataSort {
    key: string;
    direction: "asc" | "desc";
}

export interface AdminDataRequest<Query = Record<string, unknown>> {
    query?: Query;
    page?: number;
    pageSize?: number;
    cursor?: string;
    sort?: AdminDataSort;
    filters?: Record<string, string>;
    signal: AbortSignal;
}

export type AdminDataLoadOptions<Query = Record<string, unknown>> = Omit<
    AdminDataRequest<Query>,
    "signal"
>;

export interface AdminDataPage<Row> {
    rows: Row[];
    total?: number;
    nextCursor?: string | null;
}

export type AdminDataLoader<Row, Query = Record<string, unknown>> = (
    request: AdminDataRequest<Query>,
) => Promise<AdminDataPage<Row>>;

export interface AdminDataRetryOptions {
    /** Number of additional attempts after the initial retryable failure. */
    maxRetries?: number;
    /** Delay before the first retry, in milliseconds. */
    delayMs?: number;
    /** Multiplier applied to the delay for each subsequent retry. */
    backoffMultiplier?: number;
}

export interface AdminDataCacheOptions<Query = Record<string, unknown>> {
    /** Cache lifetime in milliseconds. A zero lifetime disables fresh hits. */
    ttlMs?: number;
    /** Serve the last cached page immediately while revalidating it. */
    staleWhileRevalidate?: boolean;
    /** Override the request-key strategy when query identity is domain-specific. */
    key?: (request: AdminDataLoadOptions<Query>) => string;
    /** Observe cache decisions without coupling the resource to a telemetry SDK. */
    onEvent?: (event: AdminDataCacheEvent<Query>) => void;
}

export type AdminDataCacheEventType =
    | "miss"
    | "hit"
    | "stale-hit"
    | "bypass"
    | "write"
    | "invalidate";

export interface AdminDataCacheEvent<Query = Record<string, unknown>> {
    type: AdminDataCacheEventType;
    key?: string;
    request?: AdminDataLoadOptions<Query>;
}

export interface AdminDataCacheStats {
    entries: number;
    hits: number;
    staleHits: number;
    misses: number;
    bypasses: number;
    writes: number;
    invalidations: number;
    revalidations: number;
}

export interface AdminDataErrorMeta {
    status?: number;
    code?: string;
    message: string;
    permissionDenied: boolean;
    retryable: boolean;
    cause: unknown;
}

export interface AdminDataSnapshot<Row, Query = Record<string, unknown>> {
    status: AdminDataStatus;
    rows: Row[];
    total: number;
    nextCursor: string | null;
    requestId: number;
    request: AdminDataLoadOptions<Query>;
    error?: AdminDataErrorMeta;
}

export interface AdminDataResourceOptions<Row, Query = Record<string, unknown>> {
    loader: AdminDataLoader<Row, Query>;
    initialRows?: Row[];
    initialTotal?: number;
    retry?: AdminDataRetryOptions;
    cache?: AdminDataCacheOptions<Query>;
}

export interface AdminDataErrorOptions {
    status?: number;
    code?: string;
    permissionDenied?: boolean;
    retryable?: boolean;
    cause?: unknown;
}

/** A transport-neutral error that preserves HTTP and permission semantics. */
export class AdminDataError extends Error {
    readonly status?: number;
    readonly code?: string;
    readonly permissionDenied?: boolean;
    readonly retryable?: boolean;

    constructor(message: string, options: AdminDataErrorOptions = {}) {
        super(message);
        this.name = "AdminDataError";
        this.status = options.status;
        this.code = options.code;
        this.permissionDenied = options.permissionDenied;
        this.retryable = options.retryable;
        if (options.cause !== undefined) this.cause = options.cause;
    }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    return value !== null && typeof value === "object"
        ? (value as Record<string, unknown>)
        : undefined;
}

function readStatus(value: Record<string, unknown> | undefined): number | undefined {
    return typeof value?.status === "number" && Number.isFinite(value.status)
        ? Math.trunc(value.status)
        : undefined;
}

function isAbortError(value: unknown): boolean {
    const record = asRecord(value);
    return record?.name === "AbortError" || record?.code === "ABORT_ERR";
}

function defaultRetryable(status: number | undefined): boolean {
    if (status === undefined) return true;
    return status === 408 || status === 425 || status === 429 || status >= 500;
}

function stableSerialize(value: unknown): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
    if (typeof value === "object") {
        return `{${Object.entries(value as Record<string, unknown>)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
            .join(",")}}`;
    }
    return JSON.stringify(value);
}

function defaultCacheKey<Query>(request: AdminDataLoadOptions<Query>): string {
    return stableSerialize(request);
}

function waitForRetry(delayMs: number, signal: AbortSignal): Promise<void> {
    if (delayMs <= 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            signal.removeEventListener("abort", onAbort);
            resolve();
        }, delayMs);
        const onAbort = () => {
            clearTimeout(timer);
            signal.removeEventListener("abort", onAbort);
            reject(new DOMException("The request was aborted.", "AbortError"));
        };
        signal.addEventListener("abort", onAbort, { once: true });
        if (signal.aborted) onAbort();
    });
}

/** Convert arbitrary fetch/client errors into the shared async-state vocabulary. */
export function getAdminDataErrorMeta(error: unknown): AdminDataErrorMeta {
    const record = asRecord(error);
    const status = readStatus(record);
    const permissionDenied = record?.permissionDenied === true || status === 401 || status === 403;
    const explicitRetryable = typeof record?.retryable === "boolean" ? record.retryable : undefined;
    const message =
        error instanceof Error && error.message
            ? error.message
            : typeof record?.message === "string" && record.message
              ? record.message
              : "Failed to load data.";
    return {
        ...(status === undefined ? {} : { status }),
        ...(typeof record?.code === "string" ? { code: record.code } : {}),
        message,
        permissionDenied,
        retryable: permissionDenied ? false : (explicitRetryable ?? defaultRetryable(status)),
        cause: error,
    };
}

type Listener<Row, Query> = (snapshot: AdminDataSnapshot<Row, Query>) => void;
type CacheListener<Query> = (event: AdminDataCacheEvent<Query>) => void;

const emptyCacheStats = (): Omit<AdminDataCacheStats, "entries"> => ({
    hits: 0,
    staleHits: 0,
    misses: 0,
    bypasses: 0,
    writes: 0,
    invalidations: 0,
    revalidations: 0,
});

/**
 * Small state machine for remote table/list data.
 *
 * A new load aborts the previous request and stale responses are ignored. The
 * resource has no UI dependency, so it can be shared by Web Components,
 * React, Vue, Svelte or a server-side loader.
 */
export class AdminDataResource<Row, Query = Record<string, unknown>> {
    private loader: AdminDataLoader<Row, Query>;
    private readonly listeners = new Set<Listener<Row, Query>>();
    private readonly cacheListeners = new Set<CacheListener<Query>>();
    private readonly retryOptions: Required<AdminDataRetryOptions>;
    private readonly cacheOptions?: {
        ttlMs: number;
        staleWhileRevalidate: boolean;
        key: (request: AdminDataLoadOptions<Query>) => string;
        onEvent?: (event: AdminDataCacheEvent<Query>) => void;
    };
    private readonly cache = new Map<string, { page: AdminDataPage<Row>; expiresAt: number }>();
    private cacheStats = emptyCacheStats();
    private activeController: AbortController | undefined;
    private lastRequest: AdminDataLoadOptions<Query> = {};
    private sequence = 0;
    private disposed = false;
    private snapshot: AdminDataSnapshot<Row, Query>;

    constructor(options: AdminDataResourceOptions<Row, Query>) {
        this.loader = options.loader;
        this.retryOptions = {
            maxRetries: Math.max(0, Math.trunc(options.retry?.maxRetries ?? 0)),
            delayMs: Math.max(0, options.retry?.delayMs ?? 0),
            backoffMultiplier: Math.max(1, options.retry?.backoffMultiplier ?? 2),
        };
        this.cacheOptions = options.cache
            ? {
                  ttlMs: Math.max(0, options.cache.ttlMs ?? 0),
                  staleWhileRevalidate: options.cache.staleWhileRevalidate ?? false,
                  key: options.cache.key ?? defaultCacheKey<Query>,
                  onEvent: options.cache.onEvent,
              }
            : undefined;
        const rows = options.initialRows ?? [];
        this.snapshot = {
            status: "idle",
            rows,
            total: options.initialTotal ?? rows.length,
            nextCursor: null,
            requestId: 0,
            request: {},
        };
    }

    getSnapshot(): AdminDataSnapshot<Row, Query> {
        return this.snapshot;
    }

    subscribe(listener: Listener<Row, Query>): () => void {
        if (this.disposed) return () => undefined;
        this.listeners.add(listener);
        listener(this.snapshot);
        return () => this.listeners.delete(listener);
    }

    /** Subscribe to cache decisions for metrics, tracing or debugging. */
    subscribeCache(listener: CacheListener<Query>): () => void {
        if (this.disposed) return () => undefined;
        this.cacheListeners.add(listener);
        return () => this.cacheListeners.delete(listener);
    }

    getCacheStats(): AdminDataCacheStats {
        return { ...this.cacheStats, entries: this.cache.size };
    }

    resetCacheStats(): void {
        this.cacheStats = emptyCacheStats();
    }

    setLoader(loader: AdminDataLoader<Row, Query>): void {
        this.loader = loader;
    }

    private publish(next: AdminDataSnapshot<Row, Query>): void {
        this.snapshot = next;
        for (const listener of this.listeners) listener(next);
    }

    private cacheKey(options: AdminDataLoadOptions<Query>): string | undefined {
        return this.cacheOptions?.key(options);
    }

    private emitCacheEvent(event: AdminDataCacheEvent<Query>): void {
        if (!this.cacheOptions) return;
        switch (event.type) {
            case "hit":
                this.cacheStats.hits += 1;
                break;
            case "stale-hit":
                this.cacheStats.staleHits += 1;
                this.cacheStats.revalidations += 1;
                break;
            case "miss":
                this.cacheStats.misses += 1;
                break;
            case "bypass":
                this.cacheStats.bypasses += 1;
                break;
            case "write":
                this.cacheStats.writes += 1;
                break;
            case "invalidate":
                this.cacheStats.invalidations += 1;
                break;
        }
        for (const listener of this.cacheListeners) {
            try {
                listener(event);
            } catch {
                // Observability must never change request state or break recovery.
            }
        }
        try {
            this.cacheOptions.onEvent?.(event);
        } catch {
            // Observability must never change request state or break recovery.
        }
    }

    private publishPage(
        page: AdminDataPage<Row>,
        requestId: number,
        request: AdminDataLoadOptions<Query>,
    ): void {
        const rows = Array.isArray(page.rows) ? page.rows : [];
        this.publish({
            ...this.snapshot,
            status: rows.length ? "ready" : "empty",
            rows,
            total: page.total ?? rows.length,
            nextCursor: page.nextCursor ?? null,
            requestId,
            request: { ...request },
            error: undefined,
        });
    }

    private async loadInternal(
        options: AdminDataLoadOptions<Query>,
        bypassCache: boolean,
    ): Promise<AdminDataSnapshot<Row, Query>> {
        if (this.disposed) return this.snapshot;
        this.activeController?.abort();
        const controller = new AbortController();
        const requestId = ++this.sequence;
        this.activeController = controller;
        this.lastRequest = { ...options };

        const cacheKey = this.cacheKey(options);
        const cached = cacheKey === undefined ? undefined : this.cache.get(cacheKey);
        const cacheIsFresh = cached !== undefined && cached.expiresAt > Date.now();
        if (cacheKey !== undefined) {
            if (bypassCache) {
                this.emitCacheEvent({ type: "bypass", key: cacheKey, request: { ...options } });
            } else if (cached && cacheIsFresh) {
                this.emitCacheEvent({ type: "hit", key: cacheKey, request: { ...options } });
                this.publishPage(cached.page, requestId, options);
                this.activeController = undefined;
                return this.snapshot;
            } else if (cached && this.cacheOptions?.staleWhileRevalidate) {
                this.emitCacheEvent({
                    type: "stale-hit",
                    key: cacheKey,
                    request: { ...options },
                });
                this.publishPage(cached.page, requestId, options);
            } else {
                this.emitCacheEvent({ type: "miss", key: cacheKey, request: { ...options } });
            }
        }

        this.publish({
            ...this.snapshot,
            status: "loading",
            requestId,
            request: { ...options },
            error: undefined,
        });

        for (let retry = 0; ; retry += 1) {
            try {
                const page = await this.loader({ ...options, signal: controller.signal });
                if (this.disposed || requestId !== this.sequence || controller.signal.aborted) {
                    return this.snapshot;
                }
                this.activeController = undefined;
                if (cacheKey !== undefined && this.cacheOptions) {
                    this.cache.set(cacheKey, {
                        page,
                        expiresAt: Date.now() + this.cacheOptions.ttlMs,
                    });
                    this.emitCacheEvent({ type: "write", key: cacheKey, request: { ...options } });
                }
                this.publishPage(page, requestId, options);
            } catch (error) {
                if (
                    this.disposed ||
                    requestId !== this.sequence ||
                    controller.signal.aborted ||
                    isAbortError(error)
                ) {
                    return this.snapshot;
                }
                const meta = getAdminDataErrorMeta(error);
                if (meta.retryable && retry < this.retryOptions.maxRetries) {
                    const delay =
                        this.retryOptions.delayMs * this.retryOptions.backoffMultiplier ** retry;
                    try {
                        await waitForRetry(delay, controller.signal);
                    } catch {
                        return this.snapshot;
                    }
                    continue;
                }
                this.activeController = undefined;
                this.publish({
                    ...this.snapshot,
                    status: meta.permissionDenied ? "permission-denied" : "error",
                    requestId,
                    request: { ...options },
                    error: meta,
                });
            }
            return this.snapshot;
        }
    }

    load(options: AdminDataLoadOptions<Query> = {}): Promise<AdminDataSnapshot<Row, Query>> {
        return this.loadInternal(options, false);
    }

    retry(): Promise<AdminDataSnapshot<Row, Query>> {
        return this.loadInternal(this.lastRequest, true);
    }

    clearCache(key?: string): void {
        if (key === undefined) this.cache.clear();
        else this.cache.delete(key);
        this.emitCacheEvent({ ...(key === undefined ? {} : { key }), type: "invalidate" });
    }

    abort(): void {
        this.sequence += 1;
        this.activeController?.abort();
        this.activeController = undefined;
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.abort();
        this.listeners.clear();
        this.cacheListeners.clear();
        this.cache.clear();
    }
}

export function createAdminDataResource<Row, Query = Record<string, unknown>>(
    options: AdminDataResourceOptions<Row, Query>,
): AdminDataResource<Row, Query> {
    return new AdminDataResource(options);
}

export interface AdminFetchDataSourceOptions<Row, Query = Record<string, unknown>> {
    endpoint: string | URL | ((request: AdminDataRequest<Query>) => string | URL);
    init?: RequestInit | ((request: AdminDataRequest<Query>) => RequestInit);
    map?: (
        payload: unknown,
        response: Response,
        request: AdminDataRequest<Query>,
    ) => AdminDataPage<Row> | Promise<AdminDataPage<Row>>;
}

/** Create a fetch-backed source while keeping response mapping optional. */
export function createAdminFetchDataSource<Row, Query = Record<string, unknown>>(
    options: AdminFetchDataSourceOptions<Row, Query>,
): AdminDataLoader<Row, Query> {
    return async (request) => {
        const endpoint =
            typeof options.endpoint === "function" ? options.endpoint(request) : options.endpoint;
        const init = typeof options.init === "function" ? options.init(request) : options.init;
        const response = await fetch(endpoint, { ...init, signal: request.signal });
        let payload: unknown;
        try {
            payload = await response.json();
        } catch {
            payload = undefined;
        }
        if (!response.ok) {
            throw new AdminDataError(`Request failed with HTTP ${response.status}.`, {
                status: response.status,
                cause: payload,
            });
        }
        if (options.map) return options.map(payload, response, request);
        if (Array.isArray(payload)) return { rows: payload as Row[] };
        const record = asRecord(payload);
        const rows = Array.isArray(record?.rows) ? (record.rows as Row[]) : [];
        return {
            rows,
            ...(typeof record?.total === "number" ? { total: record.total } : {}),
            ...(typeof record?.nextCursor === "string" ? { nextCursor: record.nextCursor } : {}),
        };
    };
}
