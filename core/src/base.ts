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
    const result: HTMLElement[] = [];
    const seen = new Set<Node>();
    const collect = (node: Node): void => {
        if (seen.has(node)) return;
        seen.add(node);
        if (node instanceof HTMLElement && node.matches(FOCUSABLE_SELECTOR)) result.push(node);
        if (node instanceof HTMLSlotElement) {
            const assigned = node.assignedNodes({ flatten: true });
            if (assigned.length) assigned.forEach(collect);
        }
        if (node instanceof Element && node.shadowRoot) collect(node.shadowRoot);
        node.childNodes.forEach(collect);
    };
    collect(root as Node);
    return result;
}

export function deepActiveElement(root: Document | ShadowRoot = document): Element | null {
    let active: Element | null = root.activeElement;
    while (active instanceof HTMLElement && active.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement;
    }
    return active;
}

/** Return the first focus target inside an overlay, or its focusable fallback. */
export function firstFocusableElement(root: ParentNode): HTMLElement | null {
    return (
        focusableElements(root)[0] ??
        (root instanceof HTMLElement && root.matches("[tabindex]") ? root : null)
    );
}

/** Keep keyboard focus inside a modal overlay while Tab is moving focus. */
export function trapFocus(event: KeyboardEvent, root: ParentNode): void {
    if (event.key !== "Tab") return;
    const focusable = focusableElements(root);
    const fallback = firstFocusableElement(root);
    if (!focusable.length) {
        event.preventDefault();
        fallback?.focus();
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = deepActiveElement(document);
    const inside = active instanceof HTMLElement && focusable.includes(active);
    if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
    }
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
