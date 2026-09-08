/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

/** Shared state vocabulary for data-heavy and business components. */
export type AdminAsyncState = "loading" | "empty" | "error" | "permission-denied";

export interface AdminRetryDetail {
    /** Stable component source, for example `data-grid` or `list-view`. */
    source: string;
    /** Why the action was requested. */
    reason: "error" | "permission-denied";
}

/**
 * Common properties consumed by the framework bindings. Components retain
 * their existing state properties and add these fields for incremental
 * adoption of the shared async contract.
 */
export interface AdminAsyncStateProps {
    permissionDenied?: boolean;
    permissionDeniedLabel?: string;
    retryable?: boolean;
    retryLabel?: string;
}

export const adminAsyncStateAttributeNames = [
    "permission-denied",
    "permission-denied-label",
    "retryable",
    "retry-label",
] as const;
