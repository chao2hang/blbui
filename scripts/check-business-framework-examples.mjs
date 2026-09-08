/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFile(`${root}/${path}`, "utf8");

const [register, guide, catalog, vuePlayground, sveltePlayground] = await Promise.all([
    read("business/src/register.ts"),
    read("docs/business-frameworks.md"),
    read("docs-site/src/components-data.ts"),
    read("examples/vue/src/App.vue"),
    read("examples/svelte/src/App.svelte"),
]);

const tags = [...register.matchAll(/defineOnce\("(aui-[a-z0-9-]+)"/g)].map((match) => match[1]);
const errors = [];
const uniqueTags = [...new Set(tags)];
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
if (uniqueTags.length !== tags.length) errors.push("business register contains duplicate tags");

for (const tag of uniqueTags) {
    if (!guide.includes(tag)) errors.push(`guide is missing ${tag}`);
    const safeTag = escapeRegExp(tag);
    if (!new RegExp(`vue:\\s*[^\\n]*<${safeTag}`).test(catalog)) {
        errors.push(`Vue catalog snippet is missing ${tag}`);
    }
    if (!new RegExp(`svelte:\\s*[^\\n]*<${safeTag}`).test(catalog)) {
        errors.push(`Svelte catalog snippet is missing ${tag}`);
    }
}

for (const marker of [
    "registerAdminElements()",
    "registerBusinessElements()",
    ":columns.prop",
    ":rows.prop",
    "@aui-selection-change",
    "@aui-permission-change",
    "@aui-audit-load-more",
]) {
    if (!guide.includes(marker)) errors.push(`Vue guide is missing ${marker}`);
}
for (const marker of [
    "registerAdminElements()",
    "registerBusinessElements()",
    "bind:this={table}",
    "on:aui-selection-change",
    "on:aui-permission-change",
    "on:aui-audit-load-more",
]) {
    if (!guide.includes(marker)) errors.push(`Svelte guide is missing ${marker}`);
}
for (const marker of ["aui-advanced-table", "aui-permission-matrix", "aui-audit-log", "aui-export-button"]) {
    if (!vuePlayground.includes(marker)) errors.push(`Vue playground is missing ${marker}`);
    if (!sveltePlayground.includes(marker)) errors.push(`Svelte playground is missing ${marker}`);
}

if (errors.length) {
    console.error(JSON.stringify({ errors, businessComponents: uniqueTags.length }, null, 2));
    process.exit(1);
}

console.log(`Business framework examples passed: ${uniqueTags.length} elements covered in Vue/Svelte guide and catalog`);
