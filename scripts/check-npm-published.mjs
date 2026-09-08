/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const packages = ["core", "react", "vue", "svelte", "business", "business-react"];
const registry = (process.env.BLBUI_NPM_REGISTRY ?? "https://registry.npmjs.org").replace(/\/$/, "");
const timeoutMs = Number(process.env.BLBUI_NPM_VERIFY_TIMEOUT_MS ?? 180_000);
const intervalMs = Number(process.env.BLBUI_NPM_VERIFY_INTERVAL_MS ?? 10_000);
const manifests = await Promise.all(
    packages.map(async (directory) =>
        JSON.parse(await readFile(`${root}/${directory}/package.json`, "utf8")),
    ),
);
const version = manifests[0].version;
if (manifests.some((manifest) => manifest.version !== version)) {
    throw new Error("publish verification requires aligned package versions");
}

async function readPublishedVersion(name) {
    const response = await fetch(`${registry}/${encodeURIComponent(name)}`, {
        headers: { accept: "application/json", "cache-control": "no-cache" },
    });
    if (!response.ok) return undefined;
    const metadata = await response.json();
    return metadata.versions?.[version] ? version : undefined;
}

const started = Date.now();
const missing = new Set(manifests.map((manifest) => manifest.name));
while (missing.size > 0) {
    const names = [...missing];
    const results = await Promise.all(
        names.map(async (name) => {
            try {
                return [name, await readPublishedVersion(name)];
            } catch {
                return [name, undefined];
            }
        }),
    );
    for (const [name, published] of results) if (published === version) missing.delete(name);
    if (!missing.size) {
        console.log(`npm publication verified: ${manifests.length} packages at ${version}`);
        break;
    }
    if (Date.now() - started >= timeoutMs) {
        console.error(
            `npm publication verification timed out for ${[...missing].join(", ")} at ${version}`,
        );
        process.exit(1);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
}
