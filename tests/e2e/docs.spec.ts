/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

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
        await expect(page.locator("[data-catalog-id]")).toHaveCount(108);
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
});
