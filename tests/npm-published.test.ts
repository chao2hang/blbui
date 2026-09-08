/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const temporaryPaths: string[] = [];

afterEach(async () => {
    await Promise.all(
        temporaryPaths.splice(0).map((path) => rm(path, { recursive: true, force: true })),
    );
});

describe("npm publication verification", () => {
    it("writes a missing-package summary when registry propagation times out", async () => {
        const server = createServer((_request, response) => {
            response.statusCode = 404;
            response.end("not found");
        });
        await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
        const address = server.address();
        if (!address || typeof address === "string") throw new Error("test registry did not bind");

        const directory = await mkdtemp(join(tmpdir(), "blbui-npm-summary-"));
        temporaryPaths.push(directory);
        const summary = join(directory, "summary.md");
        try {
            await expect(
                execFileAsync("node", ["scripts/check-npm-published.mjs"], {
                    cwd: process.cwd(),
                    env: {
                        ...process.env,
                        BLBUI_NPM_REGISTRY: `http://127.0.0.1:${address.port}`,
                        BLBUI_NPM_VERIFY_TIMEOUT_MS: "0",
                        BLBUI_NPM_VERIFY_INTERVAL_MS: "0",
                        GITHUB_STEP_SUMMARY: summary,
                    },
                }),
            ).rejects.toBeDefined();
            const content = await readFile(summary, "utf8");
            expect(content).toContain("Status: **timed out**");
            expect(content).toContain("@chaos_team/blbui-core");
            expect(content).toContain("❌ missing");
        } finally {
            await new Promise<void>((resolve, reject) =>
                server.close((error) => (error ? reject(error) : resolve())),
            );
        }
    });
});
