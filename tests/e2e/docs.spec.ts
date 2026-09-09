/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { expect, test, type Locator } from "@playwright/test";
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

const settleVisualTarget = async (target: Locator) => {
    await target.evaluate(async (element) => {
        const elements = [element, ...element.querySelectorAll<HTMLElement>("*")];
        await Promise.all(
            elements
                .map((item) =>
                    (item as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete,
                )
                .filter((updateComplete): updateComplete is Promise<unknown> =>
                    Boolean(updateComplete),
                ),
        );

        const frame = () =>
            new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        let previous = "";
        let stableFrames = 0;
        for (let attempt = 0; attempt < 8 && stableFrames < 2; attempt += 1) {
            await frame();
            const rect = element.getBoundingClientRect();
            const current = [rect.x, rect.y, rect.width, rect.height].join("/");
            stableFrames = current === previous ? stableFrames + 1 : 0;
            previous = current;
        }
    });
};

const isUniformPngRow = (data: Uint8Array, width: number, row: number) => {
    const start = row * width * 4;
    const first = data.slice(start, start + 4);
    for (let offset = start + 4; offset < start + width * 4; offset += 4) {
        if (!data.slice(offset, offset + 4).every((value, index) => value === first[index])) {
            return false;
        }
    }
    return true;
};

const captureVisualTarget = async (target: Locator, path: string) => {
    await target.screenshot({ path, animations: "disabled" });
};

test.describe("BLBUI documentation quality matrix", () => {
    test("renders every catalog card without page-level overflow", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("[data-catalog-id]")).toHaveCount(129);
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

    test("previews the shared async states and recovery actions", async ({ page }) => {
        await page.goto("/");
        const previews = ["table", "data-grid", "advanced-table", "audit-log"];
        for (const preview of previews) {
            const wrapper = page.locator(`[data-async-preview="${preview}"]`);
            const control = (state: string) => wrapper.locator(`[data-async-state="${state}"]`);
            await control("loading").click();
            await expect(wrapper.locator('[role="status"]').filter({ hasText: /LOADING/i })).toBeVisible();

            await control("empty").click();
            await expect(wrapper.locator('[role="status"]').filter({ hasText: /NO DATA|NO AUDIT|NO ITEMS|NO DATA AVAILABLE/i })).toBeVisible();

            await control("error").click();
            await expect(wrapper.locator('[role="alert"]').first()).toBeVisible();
            await wrapper.locator("button").filter({ hasText: "RETRY" }).click();
            await expect(control("ready")).toHaveClass(/is-active/);

            await control("permission-denied").click();
            await expect(wrapper.locator('[role="status"]').filter({ hasText: /PERMISSION/i })).toBeVisible();
            await wrapper.locator("[data-async-request-access]").click();
            await expect(control("ready")).toHaveClass(/is-active/);
        }
    });

    test("checks editor preview safety, responsive layout and overlay keyboard semantics", async ({
        page,
    }) => {
        await page.goto("/");
        const markdown = page.locator("#markdown-editor aui-markdown-editor");
        const viewer = page.locator("#markdown-viewer aui-markdown-viewer");
        const richText = page.locator("#rich-text-editor aui-rich-text-editor");
        await expect(markdown).toBeVisible();
        await expect(viewer).toContainText("Deployment");
        await expect(markdown.locator("h1")).toContainText("Release notes");
        await expect(richText.locator("strong")).toContainText("rich text");

        await markdown.locator("textarea").fill("# Updated\n\n**Safe**");
        await expect(markdown.locator("h1")).toContainText("Updated");
        await expect(markdown.locator("strong")).toContainText("Safe");
        await richText.locator("textarea").fill('<p onclick="bad()">Safe <strong>HTML</strong></p><script>bad()</script>');
        await expect(richText.locator("strong")).toContainText("HTML");
        await expect(richText.locator("script")).toHaveCount(0);
        await expect(richText).not.toContainText("bad()");

        const popoverTrigger = page.locator("#popover aui-popover button").first();
        await popoverTrigger.press("Enter");
        await expect(page.locator("#popover aui-popover")).toHaveAttribute("open", "");
        await page.keyboard.press("Escape");
        await expect(page.locator("#popover aui-popover")).not.toHaveAttribute("open", "");

        await page.setViewportSize({ width: 320, height: 720 });
        await expect
            .poll(() =>
                page.evaluate(
                    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
                ),
            )
            .toBe(true);
        await expect(markdown.locator("textarea")).toBeVisible();
        await expect(richText.locator(".preview")).toBeVisible();
    });

    test("keeps Business analytics charts interactive across themes and narrow screens", async ({ page }) => {
        await page.goto("/");
        const heatmap = page.locator("#preview-heatmap");
        const funnel = page.locator("#preview-funnel-chart");
        const gantt = page.locator("#preview-gantt-chart");
        await expect(heatmap).toBeVisible();
        await expect(funnel).toBeVisible();
        await expect(gantt).toBeVisible();
        await expect(heatmap.locator('[role="gridcell"]')).toHaveCount(12);
        await expect(funnel.locator(".bar")).toHaveCount(4);
        await expect(gantt.locator(".task")).toHaveCount(3);

        const firstCell = heatmap.locator('[role="gridcell"]').first();
        await firstCell.focus();
        await expect(heatmap.locator('[role="tooltip"]')).toBeVisible();
        await funnel.locator(".bar").first().click();
        await expect(funnel.locator('[role="tooltip"]')).toBeVisible();
        await gantt.locator(".task").first().focus();

        await page.locator("#theme-select").selectOption("glass");
        await page.locator("#mode-toggle").click();
        await expect(heatmap).toBeVisible();
        await expect(funnel).toBeVisible();
        await expect(gantt).toBeVisible();

        await page.setViewportSize({ width: 320, height: 720 });
        await expect
            .poll(() =>
                page.evaluate(
                    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
                ),
            )
            .toBe(true);
        await expect(heatmap.locator(".chart")).toHaveCSS("overflow-x", "auto");
        await expect(gantt.locator(".chart")).toHaveCSS("overflow-x", "auto");
        await expect(funnel.locator(".chart")).not.toHaveCSS("overflow-x", "scroll");
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
        const goldenMismatches: string[] = [];
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
                        await settleVisualTarget(target);
                        const filename = [platform, viewportValue.id, theme, mode, scene.id].join(
                            "-",
                        );
                        const goldenPath = goldenRoot
                            ? resolve(goldenRoot, `${filename}.png`)
                            : "";
                        await captureVisualTarget(
                            target,
                            testInfo.outputPath("visual-matrix", `${filename}.png`),
                        );
                        if (goldenRoot) {
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
                                const heightDelta = actual.height - expected.height;
                                expect(
                                    Math.abs(heightDelta),
                                    `visual golden height drift for ${filename}`,
                                ).toBeLessThanOrEqual(1);
                                if (heightDelta < 0) {
                                    expect(
                                        isUniformPngRow(expected.data, expected.width, actual.height),
                                        `non-uniform cropped edge for ${filename}`,
                                    ).toBe(true);
                                } else if (heightDelta > 0) {
                                    expect(
                                        isUniformPngRow(actual.data, actual.width, expected.height),
                                        `non-uniform extra edge for ${filename}`,
                                    ).toBe(true);
                                }
                                const comparableHeight = Math.min(actual.height, expected.height);
                                const diff = new PNG({
                                    width: actual.width,
                                    height: comparableHeight,
                                });
                                const differentPixels = pixelmatch(
                                    actual.data.subarray(0, actual.width * comparableHeight * 4),
                                    expected.data.subarray(0, expected.width * comparableHeight * 4),
                                    diff.data,
                                    actual.width,
                                    comparableHeight,
                                    { threshold: 0.1 },
                                );
                                await testInfo.attach(`${filename}-golden-diff.png`, {
                                    body: PNG.sync.write(diff),
                                    contentType: "image/png",
                                });
                                if (differentPixels !== 0) {
                                    goldenMismatches.push(`${filename}: ${differentPixels} pixels`);
                                }
                            }
                        }
                    }
                }
            }
        }
        expect(goldenMismatches, "visual golden mismatches").toEqual([]);
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
        expect(await page.locator("[data-catalog-id]").count()).toBe(129);
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
        expect(budget.cards).toBe(129);
        expect(budget.nodes).toBeLessThan(20_000);
        expect(
            budget.navigation.domContentLoadedEventEnd - budget.navigation.startTime,
        ).toBeLessThan(5_000);
    });
});
