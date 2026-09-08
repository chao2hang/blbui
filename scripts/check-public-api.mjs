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

const [rootPackage, ...packages] = await Promise.all([
  json("package.json"),
  ...["core", "react", "vue", "svelte", "business", "business-react", "docs-site"].map(
    (directory) => json(`${directory}/package.json`),
  ),
]);

const errors = [];
const versions = new Set(packages.map((pkg) => pkg.version));
if (versions.size !== 1) errors.push(`workspace package versions differ: ${[...versions].join(", ")}`);

const coreRegister = await read("core/src/register.ts");
const coreTypes = await read("core/src/custom-elements.d.ts");
const coreTags = [...coreRegister.matchAll(/defineOnce\("(aui-[a-z0-9-]+)"/g)].map((match) => match[1]);
const typedCoreTags = [...coreTypes.matchAll(/"(aui-[a-z0-9-]+)":/g)].map((match) => match[1]);
const toExport = (tag) => `Admin${tag
  .replace(/^aui-/, "")
  .split("-")
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join("")}`;
const expectedCoreExports = new Set(coreTags.map(toExport));

const reactSource = (await read("react/src/index.tsx")) + (await read("react/src/advanced.tsx"));
const vueSource = await read("vue/src/index.ts");
const reactExports = new Set(reactSource.matchAll(/export (?:function|const) (Admin\w+)/g).map((match) => match[1]));
const vueExports = new Set(vueSource.matchAll(/export const (Admin\w+) = /g).map((match) => match[1]));
for (const [name, actual] of [["React", reactExports], ["Vue", vueExports]]) {
  for (const expected of expectedCoreExports) if (!actual.has(expected)) errors.push(`${name} is missing ${expected}`);
  for (const exported of actual) if (!expectedCoreExports.has(exported)) errors.push(`${name} exports unexpected ${exported}`);
}

const businessRegister = await read("business/src/register.ts");
const businessTypes = await read("business/src/custom-elements.d.ts");
const businessTags = [...businessRegister.matchAll(/defineOnce\("(aui-[a-z0-9-]+)"/g)].map((match) => match[1]);
const typedBusinessTags = [...businessTypes.matchAll(/"(aui-[a-z0-9-]+)":/g)].map((match) => match[1]);
const businessReactSource = await read("business-react/src/index.tsx");
const businessReactExports = new Set(businessReactSource.matchAll(/export function (Admin\w+)/g).map((match) => match[1]));
const expectedBusinessExports = new Set(businessTags.map(toExport));
for (const expected of expectedBusinessExports) if (!businessReactExports.has(expected)) errors.push(`Business React is missing ${expected}`);

const svelteSource = await read("svelte/src/components.ts");
const svelteComponents = new Set([...svelteSource.matchAll(/export \{ default as (Admin\w+) \}/g)].map((match) => match[1]));
if (!svelteComponents.has("AdminToastManager")) errors.push("Svelte is missing AdminToastManager");

const unique = (label, values) => {
  if (new Set(values).size !== values.length) errors.push(`${label} contains duplicate entries`);
};
unique("core register", coreTags);
unique("core element types", typedCoreTags);
unique("business register", businessTags);
unique("business element types", typedBusinessTags);
if (coreTags.length !== typedCoreTags.length) errors.push("core register/types counts differ");
if (businessTags.length !== typedBusinessTags.length) errors.push("business register/types counts differ");
if (rootPackage.private !== true) errors.push("root package must remain private");

if (errors.length) {
  console.error(JSON.stringify({ errors, core: coreTags.length, business: businessTags.length, svelte: svelteComponents.size }, null, 2));
  process.exit(1);
}

console.log(`Public API check passed: ${coreTags.length} core, ${businessTags.length} business, ${reactExports.size} react, ${vueExports.size} vue, ${svelteComponents.size} svelte components; version ${packages[0].version}`);
