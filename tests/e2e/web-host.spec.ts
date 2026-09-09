/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { expect, test, type Page } from "@playwright/test";

const webUrl = "http://127.0.0.1:4177";

async function expectNoPageOverflow(page: Page) {
    await expect
        .poll(() =>
            page.evaluate(
                () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            ),
        )
        .toBe(true);
}

test.describe("Web Components migration host", () => {
    test("navigates Users, Channels and Usage Logs with filters and pagination", async ({
        page,
    }) => {
        const pageErrors: string[] = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        await page.goto(webUrl);

        await expect(page.locator("aui-page")).toContainText("Operations");
        await page.getByRole("button", { name: "Users", exact: true }).click();
        await expect(page.locator("aui-page")).toContainText("Users");
        await expect(page.locator("#users-grid")).toContainText("Alice Chen");

        await page.getByRole("textbox", { name: "Search users" }).fill("alice");
        await expect(page.locator("#users-grid")).toContainText("Alice Chen");
        await expect(page.locator("#users-grid")).not.toContainText("Bo Wang");
        await page.getByRole("textbox", { name: "Search users" }).fill("");
        await page
            .locator("aui-pagination#users-pagination")
            .getByRole("button", { name: "NEXT" })
            .click();
        await expect(page.locator("#users-grid")).toContainText("Grace Wu");

        await page.getByRole("button", { name: "Channels", exact: true }).click();
        await expect(page.locator("aui-page")).toContainText("Channels");
        await page.getByRole("textbox", { name: "Search channels" }).fill("edge");
        await expect(page.locator("#channels-grid")).toContainText("API / Edge");
        await expect(page.locator("#channels-grid")).not.toContainText("API / Production");
        await page.getByRole("textbox", { name: "Search channels" }).fill("");
        await page
            .locator("#channels-grid")
            .getByRole("checkbox", { name: /Select row/ })
            .first()
            .check();
        await expect(page.locator("#channels-selection")).toHaveAttribute(
            "data-selected-count",
            "1",
        );

        await page.getByRole("button", { name: "Usage Logs", exact: true }).click();
        await expect(page.locator("aui-page")).toContainText("Usage Logs");
        await expect(page.locator("#logs-viewer")).toContainText("request.completed");
        await page.getByRole("textbox", { name: "Search usage logs" }).fill("delivery");
        await expect(page.locator("#logs-viewer")).toContainText("delivery.failed");
        await expect(page.locator("#logs-viewer")).not.toContainText("request.completed");
        expect(pageErrors).toEqual([]);
    });

    test("covers loading, empty, error, permission and retry states", async ({ page }) => {
        await page.goto(webUrl);
        await page.getByRole("button", { name: "Users", exact: true }).click();

        await page.getByRole("button", { name: "EMPTY", exact: true }).click();
        await expect(page.locator("#users-grid")).toContainText("NO USERS MATCH");
        await page.getByRole("button", { name: "ERROR", exact: true }).click();
        await expect(page.locator("#users-grid")).toContainText("FAILED TO LOAD USERS");
        await page.locator("#users-grid").getByRole("button", { name: "RETRY" }).click();
        await expect(page.locator("#users-grid")).toContainText("Alice Chen");
        await page.getByRole("button", { name: "PERMISSION", exact: true }).click();
        await expect(page.locator("#users-grid")).toContainText("directory.read");
        await page.getByRole("button", { name: "LOADING", exact: true }).click();
        await expect(page.locator("#users-grid")).toContainText("LOADING USER DIRECTORY");
    });

    test("switches theme and mode across the host", async ({ page }) => {
        await page.goto(webUrl);
        await page.locator("#theme-select").locator("select").selectOption("glass");
        await expect(page.locator("html")).toHaveAttribute("data-aui-theme", "glass");
        await page.locator("#toggle-mode").getByRole("button").click();
        await expect(page.locator("html")).toHaveAttribute("data-aui-mode", "dark");
        await page.getByRole("button", { name: "Channels", exact: true }).click();
        await expect(page.locator("#channels-grid")).toContainText("API / Production");
        await expect(page.locator("html")).toHaveAttribute("data-aui-theme", "glass");
    });

    for (const route of ["Users", "Channels", "Usage Logs"]) {
        test(`${route} remains usable at 320px without page overflow`, async ({
            page,
        }, testInfo) => {
            await page.setViewportSize({ width: 320, height: 720 });
            await page.goto(webUrl);
            await page.getByRole("button", { name: route, exact: true }).click();
            await expect(page.locator("aui-page")).toContainText(route);
            await expectNoPageOverflow(page);
            await page.screenshot({
                path: testInfo.outputPath(`${route.toLowerCase().replaceAll(" ", "-")}-320.png`),
                fullPage: true,
            });
        });
    }
});
