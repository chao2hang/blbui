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

/**
 * Lifecycle events for production metrics/tracing integrations.
 *
 * The resource never sends these events anywhere by itself. Hosts can attach a
 * listener and add their own redaction, sampling and correlation policy before
 * forwarding the safe event payload to an observability system.
 */
export type AdminDataTelemetryEventType =
    | "load-start"
    | "load-retry"
    | "load-success"
    | "load-error"
    | "load-abort";

export interface AdminDataTelemetryError {
    status?: number;
    code?: string;
    message: string;
    permissionDenied: boolean;
    retryable: boolean;
}

export interface AdminDataTelemetryEvent<Query = Record<string, unknown>> {
    type: AdminDataTelemetryEventType;
    requestId: number;
    /** Included only when `telemetry.includeRequest` is explicitly enabled. */
    request?: AdminDataLoadOptions<Query>;
    key?: string;
    /** One-based loader attempt. Cache-only success events use attempt 0. */
    attempt: number;
    /** Elapsed time from load-start to this event, in milliseconds. */
    durationMs: number;
    status?: AdminDataStatus;
    source?: "cache" | "network";
    rows?: number;
    total?: number;
    nextAttempt?: number;
    reason?: "superseded" | "abort" | "dispose";
    /** Deliberately excludes the original `cause` to avoid leaking transport objects. */
    error?: AdminDataTelemetryError;
}

export interface AdminDataTelemetryOptions<Query = Record<string, unknown>> {
    /** Include the request object in events only after the host accepts its data sensitivity. */
    includeRequest?: boolean;
    /** Observe request lifecycle events without coupling the resource to an SDK. */
    onEvent?: (event: AdminDataTelemetryEvent<Query>) => void;
}

export interface AdminDataTelemetryStats {
    loads: number;
    retries: number;
    successes: number;
    errors: number;
    aborts: number;
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
    telemetry?: AdminDataTelemetryOptions<Query>;
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
type TelemetryListener<Query> = (event: AdminDataTelemetryEvent<Query>) => void;

interface AdminDataActiveLoad<Query> {
    requestId: number;
    request: AdminDataLoadOptions<Query>;
    key?: string;
    startedAt: number;
    attempt: number;
}

const emptyCacheStats = (): Omit<AdminDataCacheStats, "entries"> => ({
    hits: 0,
    staleHits: 0,
    misses: 0,
    bypasses: 0,
    writes: 0,
    invalidations: 0,
    revalidations: 0,
});

const emptyTelemetryStats = (): AdminDataTelemetryStats => ({
    loads: 0,
    retries: 0,
    successes: 0,
    errors: 0,
    aborts: 0,
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
    private readonly telemetryListeners = new Set<TelemetryListener<Query>>();
    private readonly retryOptions: Required<AdminDataRetryOptions>;
    private readonly cacheOptions?: {
        ttlMs: number;
        staleWhileRevalidate: boolean;
        key: (request: AdminDataLoadOptions<Query>) => string;
        onEvent?: (event: AdminDataCacheEvent<Query>) => void;
    };
    private readonly telemetryOptions?: AdminDataTelemetryOptions<Query>;
    private readonly cache = new Map<string, { page: AdminDataPage<Row>; expiresAt: number }>();
    private cacheStats = emptyCacheStats();
    private telemetryStats = emptyTelemetryStats();
    private activeController: AbortController | undefined;
    private activeLoad: AdminDataActiveLoad<Query> | undefined;
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
        this.telemetryOptions = options.telemetry;
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

    /**
     * Subscribe to snapshots. Subscriber failures are isolated so one view
     * cannot interrupt another framework binding or the resource state.
     */
    subscribe(listener: Listener<Row, Query>): () => void {
        if (this.disposed) return () => undefined;
        this.listeners.add(listener);
        try {
            listener(this.snapshot);
        } catch {
            // A view subscriber must not prevent other subscribers or the
            // resource itself from continuing to publish state.
        }
        return () => this.listeners.delete(listener);
    }

    /** Subscribe to cache decisions for metrics, tracing or debugging. */
    subscribeCache(listener: CacheListener<Query>): () => void {
        if (this.disposed) return () => undefined;
        this.cacheListeners.add(listener);
        return () => this.cacheListeners.delete(listener);
    }

    /** Subscribe to request lifecycle events for metrics, tracing or debugging. */
    subscribeTelemetry(listener: TelemetryListener<Query>): () => void {
        if (this.disposed) return () => undefined;
        this.telemetryListeners.add(listener);
        return () => this.telemetryListeners.delete(listener);
    }

    getTelemetryStats(): AdminDataTelemetryStats {
        return { ...this.telemetryStats };
    }

    resetTelemetryStats(): void {
        this.telemetryStats = emptyTelemetryStats();
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
        for (const listener of this.listeners) {
            try {
                listener(next);
            } catch {
                // A view subscriber must not change the resource state or
                // break another framework subscriber's update.
            }
        }
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

    private emitTelemetryEvent(event: AdminDataTelemetryEvent<Query>): void {
        switch (event.type) {
            case "load-start":
                this.telemetryStats.loads += 1;
                break;
            case "load-retry":
                this.telemetryStats.retries += 1;
                break;
            case "load-success":
                this.telemetryStats.successes += 1;
                break;
            case "load-error":
                this.telemetryStats.errors += 1;
                break;
            case "load-abort":
                this.telemetryStats.aborts += 1;
                break;
        }
        for (const listener of this.telemetryListeners) {
            try {
                listener(event);
            } catch {
                // Observability must never change request state or break recovery.
            }
        }
        try {
            this.telemetryOptions?.onEvent?.(event);
        } catch {
            // Observability must never change request state or break recovery.
        }
    }

    private finishTelemetry(
        context: AdminDataActiveLoad<Query>,
        event: Omit<AdminDataTelemetryEvent<Query>, "requestId" | "request" | "key" | "durationMs">,
    ): void {
        this.emitTelemetryEvent({
            ...event,
            requestId: context.requestId,
            ...(this.telemetryOptions?.includeRequest ? { request: { ...context.request } } : {}),
            ...(this.telemetryOptions?.includeRequest && context.key !== undefined
                ? { key: context.key }
                : {}),
            durationMs: Math.max(0, Date.now() - context.startedAt),
        });
    }

    private abortActiveLoad(reason: "superseded" | "abort" | "dispose"): void {
        const context = this.activeLoad;
        if (context) {
            this.finishTelemetry(context, {
                type: "load-abort",
                attempt: context.attempt,
                reason,
            });
            this.activeLoad = undefined;
        }
        this.activeController?.abort();
        this.activeController = undefined;
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
        this.abortActiveLoad("superseded");
        const controller = new AbortController();
        const requestId = ++this.sequence;
        this.activeController = controller;
        this.lastRequest = { ...options };

        const cacheKey = this.cacheKey(options);
        const context: AdminDataActiveLoad<Query> = {
            requestId,
            request: { ...options },
            ...(cacheKey === undefined ? {} : { key: cacheKey }),
            startedAt: Date.now(),
            attempt: 1,
        };
        this.activeLoad = context;
        this.finishTelemetry(context, { type: "load-start", attempt: 1 });
        const cached = cacheKey === undefined ? undefined : this.cache.get(cacheKey);
        const cacheIsFresh = cached !== undefined && cached.expiresAt > Date.now();
        if (cacheKey !== undefined) {
            if (bypassCache) {
                this.emitCacheEvent({ type: "bypass", key: cacheKey, request: { ...options } });
            } else if (cached && cacheIsFresh) {
                this.emitCacheEvent({ type: "hit", key: cacheKey, request: { ...options } });
                this.publishPage(cached.page, requestId, options);
                this.activeController = undefined;
                this.activeLoad = undefined;
                this.finishTelemetry(context, {
                    type: "load-success",
                    attempt: 0,
                    source: "cache",
                    status: this.snapshot.status,
                    rows: this.snapshot.rows.length,
                    total: this.snapshot.total,
                });
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
            context.attempt = retry + 1;
            try {
                const page = await this.loader({ ...options, signal: controller.signal });
                if (this.disposed || requestId !== this.sequence || controller.signal.aborted) {
                    return this.snapshot;
                }
                this.activeController = undefined;
                this.activeLoad = undefined;
                if (cacheKey !== undefined && this.cacheOptions) {
                    this.cache.set(cacheKey, {
                        page,
                        expiresAt: Date.now() + this.cacheOptions.ttlMs,
                    });
                    this.emitCacheEvent({ type: "write", key: cacheKey, request: { ...options } });
                }
                this.publishPage(page, requestId, options);
                this.finishTelemetry(context, {
                    type: "load-success",
                    attempt: retry + 1,
                    source: "network",
                    status: this.snapshot.status,
                    rows: this.snapshot.rows.length,
                    total: this.snapshot.total,
                });
            } catch (error) {
                if (isAbortError(error) && this.activeLoad?.requestId === requestId) {
                    this.activeController = undefined;
                    this.activeLoad = undefined;
                    this.finishTelemetry(context, {
                        type: "load-abort",
                        attempt: retry + 1,
                        reason: "abort",
                    });
                    return this.snapshot;
                }
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
                    this.finishTelemetry(context, {
                        type: "load-retry",
                        attempt: retry + 1,
                        nextAttempt: retry + 2,
                        error: {
                            ...(meta.status === undefined ? {} : { status: meta.status }),
                            ...(meta.code === undefined ? {} : { code: meta.code }),
                            message: meta.message,
                            permissionDenied: meta.permissionDenied,
                            retryable: meta.retryable,
                        },
                    });
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
                this.activeLoad = undefined;
                this.publish({
                    ...this.snapshot,
                    status: meta.permissionDenied ? "permission-denied" : "error",
                    requestId,
                    request: { ...options },
                    error: meta,
                });
                this.finishTelemetry(context, {
                    type: "load-error",
                    attempt: retry + 1,
                    status: this.snapshot.status,
                    error: {
                        ...(meta.status === undefined ? {} : { status: meta.status }),
                        ...(meta.code === undefined ? {} : { code: meta.code }),
                        message: meta.message,
                        permissionDenied: meta.permissionDenied,
                        retryable: meta.retryable,
                    },
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
        this.abortActiveLoad("abort");
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.sequence += 1;
        this.abortActiveLoad("dispose");
        this.listeners.clear();
        this.cacheListeners.clear();
        this.telemetryListeners.clear();
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
