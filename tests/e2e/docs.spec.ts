/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const visualMatrix = JSON.parse(
    readFileSync(new URL("./visual-matrix.json", import.meta.url), "utf8"),
) as {
    themes: string[];
    modes: Array<"light" | "dark">;
    viewports: Array<{ id: string; width: number; height: number }>;
    scenes: Array<{ id: string; selector: string }>;
};
const themes = visualMatrix.themes;
const goldenRoot = process.env.VISUAL_MATRIX_GOLDEN_DIR
    ? resolve(process.env.VISUAL_MATRIX_GOLDEN_DIR)
    : undefined;
const goldenRequired = process.env.VISUAL_MATRIX_GOLDEN_REQUIRED === "1";
const viewport = (id: string) => {
    const value = visualMatrix.viewports.find((item) => item.id === id);
    if (!value) throw new Error(`Visual matrix is missing viewport ${id}`);
    return value;
};

test.describe("BLBUI documentation quality matrix", () => {
    test("renders every catalog card without page-level overflow", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("[data-catalog-id]")).toHaveCount(123);
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
            for (const mode of visualMatrix.modes) {
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
        const mobile = viewport("mobile");
        await page.setViewportSize({ width: mobile.width, height: mobile.height });
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

    test("captures the versioned visual matrix artifacts", async ({ page }, testInfo) => {
        test.skip(
            process.env.VISUAL_MATRIX_ARTIFACTS !== "1",
            "The full matrix is collected by the fixed-runner visual workflow.",
        );
        test.setTimeout(300_000);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/");
        await page.addStyleTag({
            content:
                "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
        });
        await page.evaluate(() => document.fonts?.ready);

        const platform =
            process.env.VISUAL_MATRIX_PROFILE ??
            (process.platform === "win32" ? "windows-chromium" : "ubuntu-chromium");
        for (const viewportValue of visualMatrix.viewports) {
            await page.setViewportSize({
                width: viewportValue.width,
                height: viewportValue.height,
            });
            for (const theme of themes) {
                await page.locator("#theme-select").selectOption(theme);
                for (const mode of visualMatrix.modes) {
                    const currentMode = await page.evaluate(
                        () => document.documentElement.dataset.auiMode,
                    );
                    if (currentMode !== mode) await page.locator("#mode-toggle").click();
                    await expect(page.locator("#theme-select")).toHaveValue(theme);
                    await page.evaluate(() => document.fonts?.ready);

                    for (const scene of visualMatrix.scenes) {
                        const target = page.locator(scene.selector).first();
                        await target.scrollIntoViewIfNeeded();
                        await expect(target).toBeVisible();
                        await target.evaluate(async (element) => {
                            const updateComplete = (element as HTMLElement & {
                                updateComplete?: Promise<unknown>;
                            }).updateComplete;
                            if (updateComplete) await updateComplete;
                            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                        });
                        const filename = [platform, viewportValue.id, theme, mode, scene.id].join(
                            "-",
                        );
                        await target.screenshot({
                            path: testInfo.outputPath("visual-matrix", `${filename}.png`),
                            animations: "disabled",
                        });
                        if (goldenRoot) {
                            const goldenPath = resolve(goldenRoot, `${filename}.png`);
                            if (!existsSync(goldenPath)) {
                                if (goldenRequired)
                                    throw new Error(`Missing visual golden: ${goldenPath}`);
                            } else {
                                const actual = PNG.sync.read(
                                    readFileSync(
                                        testInfo.outputPath("visual-matrix", `${filename}.png`),
                                    ),
                                );
                                const expected = PNG.sync.read(readFileSync(goldenPath));
                                expect(actual.width).toBe(expected.width);
                                expect(actual.height).toBe(expected.height);
                                const diff = new PNG({
                                    width: actual.width,
                                    height: actual.height,
                                });
                                const differentPixels = pixelmatch(
                                    actual.data,
                                    expected.data,
                                    diff.data,
                                    actual.width,
                                    actual.height,
                                    { threshold: 0.1 },
                                );
                                await testInfo.attach(`${filename}-golden-diff.png`, {
                                    body: PNG.sync.write(diff),
                                    contentType: "image/png",
                                });
                                expect(
                                    differentPixels,
                                    `visual golden mismatch for ${filename}`,
                                ).toBe(0);
                            }
                        }
                    }
                }
            }
        }
    });

    test("keeps a deterministic visual render for pixel-level gating", async ({
        page,
    }, testInfo) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/");
        await page.addStyleTag({
            content:
                "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
        });
        await page.evaluate(() => document.fonts?.ready);
        const first = await page.screenshot({ fullPage: true });
        await page.reload();
        await page.addStyleTag({
            content:
                "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
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
        await testInfo.attach("visual-diff.png", {
            body: PNG.sync.write(diff),
            contentType: "image/png",
        });
        expect(differentPixels, "repeated docs render must be pixel-stable").toBe(0);
    });

    test("holds at 320px with reduced motion and forced-colors", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
        const narrow = viewport("narrow");
        await page.setViewportSize({ width: narrow.width, height: narrow.height });
        await page.goto("/");
        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        document.documentElement.scrollWidth <=
                        document.documentElement.clientWidth,
                ),
            )
            .toBe(true);
        expect(await page.locator("[data-catalog-id]").count()).toBe(123);
        for (const scene of visualMatrix.scenes.filter((item) => item.id !== "catalog")) {
            await expect(page.locator(scene.selector).first()).toBeVisible();
        }
    });

    test("stays within the docs render budget", async ({ page }) => {
        await page.goto("/");
        const budget = await page.evaluate(() => ({
            nodes: document.querySelectorAll("*").length,
            cards: document.querySelectorAll("[data-catalog-id]").length,
            navigation: performance.getEntriesByType(
                "navigation",
            )[0] as PerformanceNavigationTiming,
        }));
        expect(budget.cards).toBe(123);
        expect(budget.nodes).toBeLessThan(20_000);
        expect(
            budget.navigation.domContentLoadedEventEnd - budget.navigation.startTime,
        ).toBeLessThan(5_000);
    });
});
