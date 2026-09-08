/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const themes = [
    "obsidian",
    "rounded",
    "enterprise",
    "modern",
    "minimal",
    "premium",
    "chinese",
    "atmospheric",
    "glass",
] as const;

test.describe("BLBUI documentation quality matrix", () => {
    test("renders every catalog card without page-level overflow", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("[data-catalog-id]")).toHaveCount(119);
        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        document.documentElement.scrollWidth <=
                        document.documentElement.clientWidth,
                ),
            )
            .toBe(true);
        await expect(page.locator("#preview-data-grid table")).toBeVisible();
        await expect(page.locator("#preview-schema-form")).toBeVisible();
        await expect(page.locator("#preview-export-button")).toBeVisible();
        await expect(page.locator("#preview-bulk-actions")).toBeVisible();
    });

    test("covers all nine themes in light and dark modes", async ({ page }) => {
        await page.goto("/");
        for (const theme of themes) {
            await page.locator("#theme-select").selectOption(theme);
            for (const mode of ["light", "dark"] as const) {
                const currentMode = await page.evaluate(
                    () => document.documentElement.dataset.auiMode,
                );
                if (currentMode !== mode) await page.locator("#mode-toggle").click();
                await expect(page.locator("#theme-select")).toHaveValue(theme);
                await expect(page.locator("#preview-data-grid")).toBeVisible();
                await expect(page.locator("#preview-schema-form")).toBeVisible();
                expect(await page.evaluate(() => document.documentElement.dataset.auiMode)).toBe(
                    mode,
                );
                expect(
                    await page.evaluate(
                        () =>
                            document.documentElement.scrollWidth <=
                            document.documentElement.clientWidth,
                    ),
                ).toBe(true);
            }
        }
    });

    test("passes the page accessibility scan and keyboard dialog flow", async ({ page }) => {
        await page.goto("/");
        const results = await new AxeBuilder({ page })
            .include("#preview-schema-form")
            .include("#preview-data-grid")
            .include("#preview-column-settings")
            .disableRules(["color-contrast"])
            .analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

        const dialogTrigger = page.locator("#dialog #btn-demo-dialog");
        await dialogTrigger.click();
        const dialog = page.locator("#dialog aui-dialog");
        await expect(dialog.locator("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog.locator("dialog")).not.toBeVisible();
    });

    test("captures representative desktop and mobile visual baselines", async ({
        page,
    }, testInfo) => {
        await page.goto("/");
        await page.screenshot({ path: testInfo.outputPath("docs-desktop.png"), fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        document.documentElement.scrollWidth <=
                        document.documentElement.clientWidth,
                ),
            )
            .toBe(true);
        await page.screenshot({ path: testInfo.outputPath("docs-mobile-390.png"), fullPage: true });
    });

    test("keeps a deterministic visual render for pixel-level gating", async ({ page }, testInfo) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/");
        await page.addStyleTag({
            content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
        });
        await page.evaluate(() => document.fonts?.ready);
        const first = await page.screenshot({ fullPage: true });
        await page.reload();
        await page.addStyleTag({
            content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
        });
        await page.evaluate(() => document.fonts?.ready);
        const second = await page.screenshot({ fullPage: true });
        const firstPng = PNG.sync.read(first);
        const secondPng = PNG.sync.read(second);
        expect(secondPng.width).toBe(firstPng.width);
        expect(secondPng.height).toBe(firstPng.height);
        const diff = new PNG({ width: firstPng.width, height: firstPng.height });
        const differentPixels = pixelmatch(
            firstPng.data,
            secondPng.data,
            diff.data,
            firstPng.width,
            firstPng.height,
            { threshold: 0.1 },
        );
        await testInfo.attach("visual-diff.png", { body: PNG.sync.write(diff), contentType: "image/png" });
        expect(differentPixels, "repeated docs render must be pixel-stable").toBe(0);
    });

    test("holds at 320px with reduced motion and forced-colors", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
        await page.setViewportSize({ width: 320, height: 720 });
        await page.goto("/");
        await expect
            .poll(() =>
                page.evaluate(
                    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
                ),
            )
            .toBe(true);
        expect(await page.locator("[data-catalog-id]").count()).toBe(119);
        await expect(page.locator("#preview-data-grid")).toBeVisible();
        await expect(page.locator("#preview-permission-matrix")).toBeVisible();
    });

    test("stays within the docs render budget", async ({ page }) => {
        await page.goto("/");
        const budget = await page.evaluate(() => ({
            nodes: document.querySelectorAll("*").length,
            cards: document.querySelectorAll("[data-catalog-id]").length,
        }));
        expect(budget.cards).toBe(119);
        expect(budget.nodes).toBeLessThan(20_000);
    });
});
