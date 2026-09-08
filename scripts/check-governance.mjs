/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFile(`${root}/${path}`, "utf8");
const json = async (path) => JSON.parse(await read(path));
const errors = [];

const unique = (label, values) => {
    const seen = new Set();
    for (const value of values) {
        if (seen.has(value)) errors.push(`${label} contains duplicate ${value}`);
        seen.add(value);
    }
    return seen;
};

const packageDirectories = [
    "core",
    "react",
    "vue",
    "svelte",
    "business",
    "business-react",
    "docs-site",
];
const [rootPackage, ...packages] = await Promise.all([
    json("package.json"),
    ...packageDirectories.map((directory) => json(`${directory}/package.json`)),
]);
const version = packages[0].version;
if (new Set(packages.map((pkg) => pkg.version)).size !== 1) {
    errors.push("workspace package versions are not aligned");
}
if (rootPackage.private !== true) errors.push("root package must remain private");

const coreRegister = await read("core/src/register.ts");
const businessRegister = await read("business/src/register.ts");
const catalog = await read("docs-site/src/catalog.ts");
const coreTags = [...coreRegister.matchAll(/defineOnce\("(aui-[a-z0-9-]+)"/g)].map(
    (match) => match[1],
);
const businessTags = [...businessRegister.matchAll(/defineOnce\("(aui-[a-z0-9-]+)"/g)].map(
    (match) => match[1],
);
const documentedTags = [...catalog.matchAll(/item\(\s*"[^"]+",\s*"(aui-[a-z0-9-]+)"/g)].map(
    (match) => match[1],
);
const registeredTags = [...coreTags, ...businessTags];
const registeredSet = unique("registered elements", registeredTags);
const documentedSet = unique("catalog entries", documentedTags);
for (const tag of registeredSet) {
    if (!documentedSet.has(tag)) errors.push(`registered element is missing from catalog: ${tag}`);
}
for (const tag of documentedSet) {
    if (!registeredSet.has(tag)) errors.push(`catalog entry is not registered: ${tag}`);
}
if (registeredSet.size !== documentedSet.size) {
    errors.push(`catalog/register count drift: ${registeredSet.size} vs ${documentedSet.size}`);
}

const tokens = await read("core/src/tokens.css");
const themes = await read("core/src/themes.css");
const tokenNames = new Set([...tokens.matchAll(/(--aui-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
const themeTokenNames = new Set(
    [...themes.matchAll(/(--aui-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
);
for (const token of themeTokenNames) {
    if (!tokenNames.has(token)) errors.push(`theme overrides undeclared token: ${token}`);
}

const utilities = await read("core/src/utilities.css");
const utilitySource = utilities.replace(/\/\*[\s\S]*?\*\//g, "");
const utilitySelectors = [...utilitySource.matchAll(/(?:^|\n)\s*([^@\n{}][^{}]*)\{/g)].map((match) =>
    match[1].trim(),
);
for (const selector of utilitySelectors) {
    if (selector === "from" || selector === "to") continue;
    if (!selector.includes(".aui-root")) {
        errors.push(`utility selector is not scoped by .aui-root: ${selector}`);
    }
}
if (/(?:#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i.test(utilitySource)) {
    errors.push("utility stylesheet contains a hard-coded color; use an --aui-* token");
}
const hostExtensionTokens = new Set([
    "--aui-stack-gap",
    "--aui-grid-columns",
    "--aui-grid-gap",
    "--aui-container-width",
    "--aui-page-padding",
]);
for (const match of utilitySource.matchAll(/var\(\s*(--aui-[a-z0-9-]+)/g)) {
    const token = match[1];
    if (!tokenNames.has(token) && !hostExtensionTokens.has(token)) {
        errors.push(`utility references undeclared token: ${token}`);
    }
}

const changelog = await read("CHANGELOG.md");
const plan = await read("docs/blbui-plan.md");
const longTermPlan = await read("docs/long-term-plan.md");
const visualAudit = await read("docs/visual-audit.md");
const api = await read("docs/api.md");
if (!changelog.includes(`## ${version} —`)) errors.push(`CHANGELOG is missing ${version}`);
if (!plan.includes(`状态（${version} 更新）`)) errors.push(`implementation plan is not marked ${version}`);
if (!longTermPlan.includes(`${version} 已在`)) errors.push(`long-term plan is not marked ${version}`);
if (!visualAudit.includes(`- 版本：${version}`)) errors.push(`visual audit is not marked ${version}`);
if (!api.includes(`**${documentedSet.size} components**`)) {
    errors.push(`generated API docs do not describe ${documentedSet.size} components`);
}

if (errors.length) {
    console.error(JSON.stringify({ errors, version, registered: registeredSet.size, documented: documentedSet.size }, null, 2));
    process.exit(1);
}

console.log(
    `Governance check passed: ${registeredSet.size} registered/catalog components, ${tokenNames.size} root tokens, version ${version}`,
);
