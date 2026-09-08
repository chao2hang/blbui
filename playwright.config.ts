/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const windowsChrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const launchOptions =
    process.platform === "win32" && existsSync(windowsChrome)
        ? { executablePath: windowsChrome }
        : undefined;

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
        launchOptions,
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
    },
    webServer: [
        {
            command: "bun run docs:dev",
            url: "http://127.0.0.1:4173",
            reuseExistingServer: true,
            timeout: 30_000,
        },
        ...[
            ["examples/react", 4174],
            ["examples/vue", 4175],
            ["examples/svelte", 4176],
            ["examples/web", 4177],
        ].map(([cwd, port]) => ({
            command: `bun run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
            cwd: cwd as string,
            url: `http://127.0.0.1:${port}`,
            reuseExistingServer: true,
            timeout: 30_000,
        })),
    ],
});
