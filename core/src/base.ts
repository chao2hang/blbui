/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { LitElement } from "lit";

let uidCounter = 0;

/** Unique, predictable-in-SSR-free ids for ARIA references. Hardcoded ids
 * (e.g. "dialog-title") collide when several instances share a page. */
export function nextUid(prefix: string): string {
    uidCounter += 1;
    return `aui-${prefix}-${uidCounter}`;
}

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

export function focusableElements(root: ParentNode): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
}

export class AdminElement extends LitElement {
    // Note: hosts intentionally do NOT receive the `aui-root` class. Adding it
    // to every element painted the whole console skin (background/color/font)
    // onto each component host and leaked into parent layouts. Wrap an app in
    // an explicit `<div class="aui-root">` (see README) for the global chrome.

    protected dispatchDetail<T>(name: string, detail: T): void {
        this.dispatchEvent(
            new CustomEvent(name, {
                bubbles: true,
                composed: true,
                detail,
            }),
        );
    }
}

export function defineOnce(name: string, constructor: CustomElementConstructor): void {
    if (!customElements.get(name)) {
        customElements.define(name, constructor);
    }
}
