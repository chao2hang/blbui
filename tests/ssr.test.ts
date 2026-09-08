/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { describe, expect, it } from "vitest";
import {
    adminElementTags,
    getAdminTheme,
    registerAdminElements,
    setAdminTheme,
    whenAdminElementsDefined,
} from "../core/src/index";

describe("SSR and hydration helpers", () => {
    it("does not require customElements during SSR", async () => {
        const descriptor = Object.getOwnPropertyDescriptor(globalThis, "customElements");
        Object.defineProperty(globalThis, "customElements", {
            configurable: true,
            value: undefined,
        });
        try {
            expect(() => registerAdminElements()).not.toThrow();
            await expect(whenAdminElementsDefined()).resolves.toBeUndefined();
        } finally {
            if (descriptor) Object.defineProperty(globalThis, "customElements", descriptor);
        }
    });

    it("defines every public core tag before hydration continues", async () => {
        registerAdminElements();
        await whenAdminElementsDefined();
        expect(adminElementTags).toHaveLength(103);
        for (const tag of adminElementTags) expect(customElements.get(tag)).toBeDefined();
    });

    it("keeps theme APIs safe when no document exists", () => {
        const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
        Object.defineProperty(globalThis, "document", { configurable: true, value: undefined });
        try {
            expect(() => setAdminTheme(undefined, "enterprise", "light")).not.toThrow();
            expect(getAdminTheme()).toEqual({ theme: "obsidian", mode: "dark" });
        } finally {
            if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
        }
    });
});
