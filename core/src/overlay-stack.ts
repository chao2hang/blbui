/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import type { AdminElement } from "./base";

interface OverlayEntry {
    owner: AdminElement;
    close: () => void;
}

const entries: OverlayEntry[] = [];
let listening = false;

function onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== "Escape") return;
    const top = entries.at(-1);
    if (!top) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    top.close();
}

function syncListener(): void {
    if (entries.length && !listening) {
        document.addEventListener("keydown", onDocumentKeydown, true);
        listening = true;
    } else if (!entries.length && listening) {
        document.removeEventListener("keydown", onDocumentKeydown, true);
        listening = false;
    }
}

/** Register one open overlay. The last registered overlay owns Escape. */
export function registerOverlay(owner: AdminElement, close: () => void): void {
    unregisterOverlay(owner);
    entries.push({ owner, close });
    syncListener();
}

/** Remove an overlay from the nested Escape stack. */
export function unregisterOverlay(owner: AdminElement): void {
    const index = entries.findIndex((entry) => entry.owner === owner);
    if (index >= 0) entries.splice(index, 1);
    syncListener();
}

/** Only the topmost overlay should react to an outside-dismiss gesture. */
export function isTopOverlay(owner: AdminElement): boolean {
    return entries.at(-1)?.owner === owner;
}
