/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { expect, test } from "@playwright/test";

const frameworkPlaygrounds = [
    { name: "React", url: "http://127.0.0.1:4174" },
    { name: "Vue", url: "http://127.0.0.1:4175" },
    { name: "Svelte", url: "http://127.0.0.1:4176" },
];

for (const playground of frameworkPlaygrounds) {
    test(`${playground.name} playground preserves the parity contract at runtime`, async ({
        page,
    }) => {
        const pageErrors: string[] = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        await page.goto(playground.url);

        const root = page.locator("[data-parity-page]");
        await expect(root).toHaveAttribute("data-parity-page", "1");
        await expect(page.locator("aui-shell")).toHaveCount(1);
        await expect(page.locator("aui-shell aui-page")).toHaveCount(1);
        await expect(root).toHaveAttribute("data-parity-dialog", "false");
        const parityTable = page.locator("aui-table").first();
        await expect(parityTable).toContainText("gateway-prod");
        await expect(root).toHaveAttribute("data-parity-async-state", "ready");
        await expect(page.locator("#telemetry-event")).toHaveAttribute(
            "data-parity-telemetry-event",
            "load-success",
        );
        await expect(page.locator("#telemetry-stats")).toHaveAttribute(
            "data-parity-telemetry-loads",
            "1",
        );
        await expect(page.locator("#telemetry-stats")).toHaveAttribute(
            "data-parity-telemetry-successes",
            "1",
        );
        await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-misses", "1");
        await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-writes", "1");
        await page.getByRole("button", { name: "Refresh cached data" }).click();
        await expect(page.locator("#cache-event")).toHaveAttribute(
            "data-parity-cache-event",
            "hit",
        );
        await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-hits", "1");

        await page.getByRole("button", { name: "Simulate data error" }).click();
        await expect(root).toHaveAttribute("data-parity-async-state", "error");
        await page.getByRole("button", { name: "Retry" }).click();
        await expect(root).toHaveAttribute("data-parity-async-state", "ready");
        await expect(root).toHaveAttribute("data-parity-retry-count", "1");
        await expect(page.locator("#cache-stats")).toHaveAttribute(
            "data-parity-cache-bypasses",
            "1",
        );
        await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-writes", "2");

        await page.getByRole("button", { name: "Simulate permission denial" }).click();
        await expect(root).toHaveAttribute("data-parity-async-state", "permission-denied");
        await expect(page.locator("#async-table")).toContainText("Request access to continue.");
        await page.getByRole("button", { name: "Recover data" }).click();
        await expect(root).toHaveAttribute("data-parity-async-state", "ready");
        await expect(page.locator("#cache-event")).toHaveAttribute(
            "data-parity-cache-event",
            "hit",
        );
        await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-hits", "2");
        await page.getByRole("button", { name: "Clear cache" }).click();
        await expect(page.locator("#cache-event")).toHaveAttribute(
            "data-parity-cache-event",
            "invalidate",
        );
        await expect(page.locator("#cache-stats")).toHaveAttribute(
            "data-parity-cache-entries",
            "0",
        );
        await expect(page.locator("#cache-stats")).toHaveAttribute(
            "data-parity-cache-invalidations",
            "1",
        );

        await page.getByRole("textbox").fill("edge");
        await expect(parityTable).toContainText("gateway-edge");
        await expect(parityTable).not.toContainText("gateway-prod");

        await page.getByRole("tab", { name: "Healthy" }).click();
        await expect(root).toHaveAttribute("data-parity-active-tab", "healthy");
        await expect(parityTable).not.toContainText("gateway-edge");

        await page.getByRole("button", { name: "Create channel" }).click();
        await expect(root).toHaveAttribute("data-parity-dialog", "true");
        await expect(page.locator("aui-dialog")).toContainText("confirm the new channel");
        await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
        await expect(root).toHaveAttribute("data-parity-dialog", "false");

        await page.getByRole("button", { name: "NEXT" }).click();
        await expect(root).toHaveAttribute("data-parity-page", "2");
        await expect(page.locator("#business-table")).toContainText("Gateway");
        await page
            .locator("#business-table")
            .getByRole("checkbox", { name: /Select row/ })
            .first()
            .check();
        await expect(page.locator("[data-parity-business-selection]")).toHaveAttribute(
            "data-parity-business-selection",
            "1",
        );
        if (playground.name !== "React") {
            await expect(page.locator("aui-permission-matrix")).toContainText("Operator");
            await expect(page.locator("aui-audit-log")).toContainText("channel.updated");
            await expect(page.locator("aui-export-button")).toContainText("EXPORT");
        }
        expect(pageErrors).toEqual([]);
    });
}

for (const playground of frameworkPlaygrounds.filter(({ name }) => name !== "React")) {
    test(`${playground.name} direct Business elements remain usable at 320px`, async ({
        page,
    }, testInfo) => {
        await page.setViewportSize({ width: 320, height: 720 });
        await page.goto(playground.url);

        await expect(page.locator("[data-parity-page]")).toHaveAttribute("data-parity-page", "1");
        await expect(page.locator("aui-permission-matrix")).toBeVisible();
        await expect(page.locator("aui-audit-log")).toBeVisible();
        await expect(page.locator("aui-export-button")).toBeVisible();
        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        document.documentElement.scrollWidth <=
                        document.documentElement.clientWidth,
                ),
            )
            .toBe(true);

        const bounds = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            permission:
                document.querySelector("aui-permission-matrix")?.getBoundingClientRect().width ?? 0,
            audit: document.querySelector("aui-audit-log")?.getBoundingClientRect().width ?? 0,
            export: document.querySelector("aui-export-button")?.getBoundingClientRect().width ?? 0,
        }));
        expect(bounds.permission).toBeLessThanOrEqual(bounds.viewport);
        expect(bounds.audit).toBeLessThanOrEqual(bounds.viewport);
        expect(bounds.export).toBeLessThanOrEqual(bounds.viewport);
        await page.screenshot({
            path: testInfo.outputPath(`${playground.name.toLowerCase()}-business-narrow.png`),
            fullPage: true,
        });
    });
}

test("Web Components playground updates a DataGrid through DOM properties and events", async ({
    page,
}) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("http://127.0.0.1:4177");

    await expect(page.locator("aui-shell")).toHaveCount(1);
    await expect(page.locator("aui-shell aui-page")).toHaveCount(1);
    await expect(page.locator("aui-page")).toContainText("Operations");
    const servicesGrid = page.locator("#services");
    await expect(servicesGrid).toContainText("Gateway / Production");
    await expect(page.locator("#async-state")).toHaveAttribute("data-parity-async-state", "ready");
    await expect(page.locator("#telemetry-event")).toHaveAttribute(
        "data-parity-telemetry-event",
        "load-success",
    );
    await expect(page.locator("#telemetry-stats")).toHaveAttribute(
        "data-parity-telemetry-loads",
        "1",
    );
    await expect(page.locator("#telemetry-stats")).toHaveAttribute(
        "data-parity-telemetry-successes",
        "1",
    );
    await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-misses", "1");
    await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-writes", "1");
    await page.locator("#refresh-cache").getByRole("button").click();
    await expect(page.locator("#cache-event")).toHaveAttribute("data-parity-cache-event", "hit");
    await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-hits", "1");
    await page.getByRole("button", { name: "SIMULATE DATA ERROR" }).click();
    await expect(page.locator("#async-state")).toHaveAttribute("data-parity-async-state", "error");
    await page.locator("#async-grid").getByRole("button", { name: "RETRY" }).click();
    await expect(page.locator("#async-state")).toHaveAttribute("data-parity-async-state", "ready");
    await expect(page.locator("#async-state")).toHaveAttribute("data-parity-retry-count", "1");
    await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-bypasses", "1");
    await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-writes", "2");
    await page.getByRole("button", { name: "SIMULATE PERMISSION DENIAL" }).click();
    await expect(page.locator("#async-state")).toHaveAttribute(
        "data-parity-async-state",
        "permission-denied",
    );
    await expect(page.locator("#async-grid")).toContainText("Request access to continue.");
    await page.getByRole("button", { name: "RECOVER DATA" }).click();
    await expect(page.locator("#async-state")).toHaveAttribute("data-parity-async-state", "ready");
    await expect(page.locator("#cache-event")).toHaveAttribute("data-parity-cache-event", "hit");
    await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-hits", "2");
    await page.locator("#clear-cache").getByRole("button").click();
    await expect(page.locator("#cache-event")).toHaveAttribute(
        "data-parity-cache-event",
        "invalidate",
    );
    await expect(page.locator("#cache-stats")).toHaveAttribute("data-parity-cache-entries", "0");
    await expect(page.locator("#cache-stats")).toHaveAttribute(
        "data-parity-cache-invalidations",
        "1",
    );
    await page.getByRole("textbox", { name: "Filter services" }).fill("edge");
    await expect(servicesGrid).toContainText("Gateway / Edge");
    await expect(servicesGrid).not.toContainText("Gateway / Production");
    await expect(page.locator("#business-table")).toContainText("Gateway");
    await page
        .locator("#business-table")
        .getByRole("checkbox", { name: /Select row/ })
        .first()
        .check();
    await expect(page.locator("[data-parity-business-selection]")).toHaveAttribute(
        "data-parity-business-selection",
        "1",
    );
    expect(pageErrors).toEqual([]);
});
