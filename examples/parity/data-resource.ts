/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import {
    AdminDataError,
    AdminDataResource,
    type AdminDataStatus,
} from "@chaos_team/blbui-business";

export type ParityAsyncMode = "ready" | "error" | "permission-denied";

export interface ParityAsyncRow {
    id: string;
    label: string;
}

export interface ParityAsyncResource {
    resource: AdminDataResource<ParityAsyncRow>;
    setMode: (mode: ParityAsyncMode) => void;
}

/** Shared playground loader used to prove the same lifecycle in every host. */
export function createParityAsyncResource(): ParityAsyncResource {
    let mode: ParityAsyncMode = "ready";
    const resource = new AdminDataResource<ParityAsyncRow>({
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
    });
    return {
        resource,
        setMode(nextMode) {
            mode = nextMode;
        },
    };
}

export function parityAsyncState(status: AdminDataStatus): ParityAsyncMode {
    return status === "error" || status === "permission-denied" ? status : "ready";
}
