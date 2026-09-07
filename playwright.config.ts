/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    timeout: 45_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL: "http://127.0.0.1:4173",
        browserName: "chromium",
        headless: true,
        launchOptions: {
            executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        },
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
    },
    webServer: {
        command: "bun run docs:dev",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
        timeout: 30_000,
    },
});
