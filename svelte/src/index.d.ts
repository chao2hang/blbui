/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

declare namespace svelte.JSX {
    interface HTMLAttributes<T> {
        "on:aui-input"?: (event: CustomEvent<{ value: string }>) => void;
        "on:aui-change"?: (event: CustomEvent<{ value: string }>) => void;
        "on:aui-close"?: (event: CustomEvent<{ open: boolean }>) => void;
        "on:aui-page-change"?: (event: CustomEvent<{ page: number }>) => void;
        "on:aui-tab-change"?: (event: CustomEvent<{ id: string }>) => void;
        "on:aui-nav-change"?: (event: CustomEvent<{ id: string }>) => void;
        "on:aui-cascader-change"?: (
            event: CustomEvent<{ value: string[]; options: unknown[] }>,
        ) => void;
        "on:aui-transfer-change"?: (
            event: CustomEvent<{ values: string[]; added: string[]; removed: string[] }>,
        ) => void;
        "on:aui-menu-select"?: (event: CustomEvent<{ id: string; item: unknown }>) => void;
        "on:aui-open-change"?: (event: CustomEvent<{ open: boolean }>) => void;
        "on:aui-notification-close"?: (event: CustomEvent<{ id: string }>) => void;
        "on:aui-notification-action"?: (event: CustomEvent<{ id: string; item: unknown }>) => void;
        "on:aui-notifications-change"?: (event: CustomEvent<{ notifications: unknown[] }>) => void;
        "on:aui-notifications-clear"?: (event: CustomEvent<{ ids: string[] }>) => void;
        "on:aui-upload-remove"?: (event: CustomEvent<{ id: string; file: unknown }>) => void;
        "on:aui-upload-retry"?: (event: CustomEvent<{ id: string; file: unknown }>) => void;
        "on:aui-upload-preview"?: (event: CustomEvent<{ id: string; file: unknown }>) => void;
        "on:aui-upload-change"?: (event: CustomEvent<{ files: unknown[] }>) => void;
        "on:aui-retry"?: (
            event: CustomEvent<{ source: string; reason: "error" | "permission-denied" }>,
        ) => void;
        "on:aui-sort-change"?: (event: CustomEvent<{ key: string; direction: string }>) => void;
        "on:aui-filter-change"?: (
            event: CustomEvent<{ filters: Record<string, string>; key: string; value: string }>,
        ) => void;
        "on:aui-selection-change"?: (event: CustomEvent<{ keys: Array<string | number> }>) => void;
        "on:aui-batch-action"?: (event: CustomEvent<unknown>) => void;
        "on:aui-column-settings-change"?: (event: CustomEvent<unknown>) => void;
        "on:aui-file-preview-close"?: (event: CustomEvent<{ file: unknown }>) => void;
        "on:aui-file-download"?: (event: CustomEvent<{ file: unknown }>) => void;
        items?: unknown;
        options?: unknown;
        values?: unknown;
        notifications?: unknown;
    }
}
