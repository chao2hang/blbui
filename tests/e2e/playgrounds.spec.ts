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
    test(`${playground.name} playground preserves the parity contract at runtime`, async ({ page }) => {
        const pageErrors: string[] = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        await page.goto(playground.url);

        const root = page.locator("[data-parity-page]");
        await expect(root).toHaveAttribute("data-parity-page", "1");
        await expect(root).toHaveAttribute("data-parity-dialog", "false");
        await expect(page.locator("aui-table")).toContainText("gateway-prod");

        await page.getByRole("textbox").fill("edge");
        await expect(page.locator("aui-table")).toContainText("gateway-edge");
        await expect(page.locator("aui-table")).not.toContainText("gateway-prod");

        await page.getByRole("tab", { name: "Healthy" }).click();
        await expect(root).toHaveAttribute("data-parity-active-tab", "healthy");
        await expect(page.locator("aui-table")).not.toContainText("gateway-edge");

        await page.getByRole("button", { name: "Create channel" }).click();
        await expect(root).toHaveAttribute("data-parity-dialog", "true");
        await expect(page.locator("aui-dialog")).toContainText("confirm the new channel");
        await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
        await expect(root).toHaveAttribute("data-parity-dialog", "false");

        await page.getByRole("button", { name: "NEXT" }).click();
        await expect(root).toHaveAttribute("data-parity-page", "2");
        await expect(page.locator("#business-table")).toContainText("Gateway");
        await page.locator("#business-table").getByRole("checkbox", { name: /Select row/ }).first().check();
        await expect(page.locator("[data-parity-business-selection]")).toHaveAttribute("data-parity-business-selection", "1");
        expect(pageErrors).toEqual([]);
    });
}

test("Web Components playground updates a DataGrid through DOM properties and events", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("http://127.0.0.1:4177");

    await expect(page.locator("aui-page")).toContainText("Operations");
    await expect(page.locator("aui-data-grid")).toContainText("Gateway / Production");
    await page.getByRole("textbox", { name: "Filter services" }).fill("edge");
    await expect(page.locator("aui-data-grid")).toContainText("Gateway / Edge");
    await expect(page.locator("aui-data-grid")).not.toContainText("Gateway / Production");
    await expect(page.locator("#business-table")).toContainText("Gateway");
    await page.locator("#business-table").getByRole("checkbox", { name: /Select row/ }).first().check();
    await expect(page.locator("[data-parity-business-selection]")).toHaveAttribute("data-parity-business-selection", "1");
    expect(pageErrors).toEqual([]);
});
