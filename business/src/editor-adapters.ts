/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

/** A half-open text selection shared by editor runtimes. */
export interface AdminEditorSelection {
    from: number;
    to: number;
}

export interface AdminEditorState {
    value: string;
    selection: AdminEditorSelection;
}

/** Minimal bridge for CodeMirror, TipTap, Monaco and compatible editors. */
export interface AdminEditorAdapter {
    getValue(): string;
    setValue(value: string): void;
    getSelection?(): AdminEditorSelection | null;
    setSelection?(selection: AdminEditorSelection): void;
    focus?(): void;
    subscribe?(listener: (state: AdminEditorState) => void): () => void;
    destroy?(): void;
}

function clampPosition(value: number, length: number): number {
    return Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), 0), length) : 0;
}

/** Read a stable, clamped state regardless of the editor runtime's selection shape. */
export function readEditorState(adapter: AdminEditorAdapter): AdminEditorState {
    const value = adapter.getValue();
    const length = value.length;
    const selection = adapter.getSelection?.() ?? { from: length, to: length };
    const from = clampPosition(selection.from, length);
    const to = clampPosition(selection.to, length);
    return {
        value,
        selection: from <= to ? { from, to } : { from: to, to: from },
    };
}

/** Apply a controlled editor update and return the normalized state. */
export function writeEditorState(
    adapter: AdminEditorAdapter,
    update: Partial<AdminEditorState> & { value?: string },
): AdminEditorState {
    if (update.value !== undefined) adapter.setValue(update.value);
    if (update.selection && adapter.setSelection) {
        const value = adapter.getValue();
        const length = value.length;
        const from = clampPosition(update.selection.from, length);
        const to = clampPosition(update.selection.to, length);
        adapter.setSelection(from <= to ? { from, to } : { from: to, to: from });
    }
    return readEditorState(adapter);
}

/** Connect an optional runtime subscription to a framework-neutral change callback. */
export function connectEditorAdapter(
    adapter: AdminEditorAdapter,
    onChange: (state: AdminEditorState) => void,
): () => void {
    return adapter.subscribe?.(onChange) ?? (() => undefined);
}

export {
    escapeEditorHtml,
    renderMarkdownToHtml,
    sanitizeRichTextHtml,
    serializeEditorContent,
} from "./content";
export type {
    AdminEditorFormat,
    AdminSanitizeOptions,
    AdminSerializedEditorContent,
} from "./content";
