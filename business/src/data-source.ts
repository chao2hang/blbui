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
    return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
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

/** Convert arbitrary fetch/client errors into the shared async-state vocabulary. */
export function getAdminDataErrorMeta(error: unknown): AdminDataErrorMeta {
    const record = asRecord(error);
    const status = readStatus(record);
    const permissionDenied =
        record?.permissionDenied === true || status === 401 || status === 403;
    const explicitRetryable =
        typeof record?.retryable === "boolean" ? record.retryable : undefined;
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
    private activeController: AbortController | undefined;
    private lastRequest: AdminDataLoadOptions<Query> = {};
    private sequence = 0;
    private disposed = false;
    private snapshot: AdminDataSnapshot<Row, Query>;

    constructor(options: AdminDataResourceOptions<Row, Query>) {
        this.loader = options.loader;
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

    setLoader(loader: AdminDataLoader<Row, Query>): void {
        this.loader = loader;
    }

    private publish(next: AdminDataSnapshot<Row, Query>): void {
        this.snapshot = next;
        for (const listener of this.listeners) listener(next);
    }

    async load(options: AdminDataLoadOptions<Query> = {}): Promise<AdminDataSnapshot<Row, Query>> {
        if (this.disposed) return this.snapshot;
        this.activeController?.abort();
        const controller = new AbortController();
        const requestId = ++this.sequence;
        this.activeController = controller;
        this.lastRequest = { ...options };
        this.publish({
            ...this.snapshot,
            status: "loading",
            requestId,
            request: { ...options },
            error: undefined,
        });

        try {
            const page = await this.loader({ ...options, signal: controller.signal });
            if (this.disposed || requestId !== this.sequence || controller.signal.aborted) {
                return this.snapshot;
            }
            this.activeController = undefined;
            const rows = Array.isArray(page.rows) ? page.rows : [];
            this.publish({
                ...this.snapshot,
                status: rows.length ? "ready" : "empty",
                rows,
                total: page.total ?? rows.length,
                nextCursor: page.nextCursor ?? null,
                requestId,
                error: undefined,
            });
        } catch (error) {
            if (this.disposed || requestId !== this.sequence || controller.signal.aborted || isAbortError(error)) {
                return this.snapshot;
            }
            this.activeController = undefined;
            const meta = getAdminDataErrorMeta(error);
            this.publish({
                ...this.snapshot,
                status: meta.permissionDenied ? "permission-denied" : "error",
                requestId,
                error: meta,
            });
        }
        return this.snapshot;
    }

    retry(): Promise<AdminDataSnapshot<Row, Query>> {
        return this.load(this.lastRequest);
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
