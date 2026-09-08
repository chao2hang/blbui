/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = await readFile(`${root}/docs/migration.md`, "utf8");
const required = [
    "registerAdminElements()",
    "whenAdminElementsDefined()",
    "@chaos_team/blbui-core/styles.css",
    "AdminAreaChart",
    "onValueChange",
    "v-model:value",
    "on:aui-input",
    "320px",
];
const missing = required.filter((marker) => !source.includes(marker));
if (missing.length) {
    console.error(`Migration guide is missing: ${missing.join(", ")}`);
    process.exit(1);
}
console.log("Migration examples check passed: Web Components, React, Vue and Svelte covered");
