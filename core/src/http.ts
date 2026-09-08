/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

export type AdminHttpStatusTone = "success" | "info" | "warning" | "danger";
export type AdminHttpStatusCategory =
    | "informational"
    | "success"
    | "redirection"
    | "client-error"
    | "server-error"
    | "unknown";

export interface AdminHttpStatusMeta {
    status: number;
    tone: AdminHttpStatusTone;
    category: AdminHttpStatusCategory;
    label: string;
    retryable: boolean;
}

export function getAdminHttpStatusMeta(status: number): AdminHttpStatusMeta {
    const value = Number.isFinite(status) ? Math.trunc(status) : 0;
    const category: AdminHttpStatusCategory =
        value >= 100 && value < 200
            ? "informational"
            : value >= 200 && value < 300
              ? "success"
              : value >= 300 && value < 400
                ? "redirection"
                : value >= 400 && value < 500
                  ? "client-error"
                  : value >= 500 && value < 600
                    ? "server-error"
                    : "unknown";
    const tone: AdminHttpStatusTone =
        category === "success"
            ? "success"
            : category === "server-error"
              ? "danger"
              : category === "client-error"
                ? "warning"
                : "info";
    const labels: Record<AdminHttpStatusCategory, string> = {
        informational: "INFORMATIONAL",
        success: "SUCCESS",
        redirection: "REDIRECTION",
        "client-error": "CLIENT ERROR",
        "server-error": "SERVER ERROR",
        unknown: "UNKNOWN",
    };
    return {
        status: value,
        tone,
        category,
        label: labels[category],
        retryable:
            value === 408 ||
            value === 425 ||
            value === 429 ||
            value === 502 ||
            value === 503 ||
            value === 504 ||
            category === "server-error",
    };
}

export function getAdminHttpStatusTone(status: number): AdminHttpStatusTone {
    return getAdminHttpStatusMeta(status).tone;
}
