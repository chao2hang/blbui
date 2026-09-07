/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/
// Verifies that every component imported by the docs-site usage snippets is
// actually exported by the corresponding package, and that every Web
// Component tag used is registered by the core. Catches snippet drift like
// "imports AdminX that does not exist in @chaos_team/blbui-react".

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const read = (path) => readFile(`${root}/${path}`, "utf8");

// --- Collect real exports per package ---
const reactSrc = (await read("react/src/index.tsx")) + (await read("react/src/advanced.tsx"));
const reactExports = new Set(reactSrc.matchAll(/export (?:function|const) (Admin\w+)/g).map((m) => m[1]));
const vueSrc = await read("vue/src/index.ts");
const vueExports = new Set(vueSrc.matchAll(/export const (Admin\w+) = /g).map((m) => m[1]));
const businessReactSrc = await read("business-react/src/index.tsx");
const businessReactExports = new Set(
  businessReactSrc.matchAll(/export function (Admin\w+)/g).map((m) => m[1]),
);
const svelteSrc = await read("svelte/src/components.ts");
const svelteExports = new Set(svelteSrc.matchAll(/export \{ default as (Admin\w+) \}/g).map((m) => m[1]));
const svelteIndexSrc = await read("svelte/src/index.ts");
for (const marker of ["registerAdminElements", "adminUi"]) {
  if (!svelteIndexSrc.includes(marker)) {
    console.error(`svelte/src/index.ts no longer exports ${marker}`);
    process.exit(1);
  }
}
// The svelte index re-exports registerAdminElements and defines adminUi.
svelteExports.add("registerAdminElements");
svelteExports.add("adminUi");
const registerSrc = await read("core/src/register.ts");
const registeredTags = new Set(registerSrc.matchAll(/"(aui-[a-z0-9-]+)"/g).map((m) => m[1]));
// Business elements are registered by the business package, not the core.
const businessRegisterSrc = await read("business/src/register.ts");
for (const m of businessRegisterSrc.matchAll(/"(aui-[a-z0-9-]+)"/g)) {
  registeredTags.add(m[1]);
}

// --- Scan the docs snippets ---
const data = await read("docs-site/src/components-data.ts");
const packageExports = {
  "@chaos_team/blbui-react": reactExports,
  "@chaos_team/blbui-vue": vueExports,
  "@chaos_team/blbui-business-react": businessReactExports,
  "@chaos_team/blbui-svelte": svelteExports,
};

let errors = 0;
for (const importMatch of data.matchAll(/import\s*\{([^}]+)\}\s*from\s*'(@chaos_team\/blbui-[a-z-]+)'/g)) {
  const names = importMatch[1]
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  const pkg = importMatch[2];
  const exports = packageExports[pkg];
  if (!exports) {
    console.error(`Unknown snippet import package: ${pkg}`);
    errors += 1;
    continue;
  }
  for (const name of names) {
    if (!exports.has(name)) {
      console.error(`Snippet imports ${name} from ${pkg}, but it is not exported`);
      errors += 1;
    }
  }
}
for (const tagMatch of data.matchAll(/<(aui-[a-z0-9-]+)/g)) {
  const tag = tagMatch[1];
  if (!registeredTags.has(tag)) {
    console.error(`Snippet uses <${tag}> which is not registered by the core`);
    errors += 1;
  }
}

if (errors) {
  console.error(`Example import check failed with ${errors} error(s).`);
  process.exit(1);
}
console.log(
  `Example import check passed: ${reactExports.size} react, ${vueExports.size} vue, ` +
    `${businessReactExports.size} business-react, ${svelteExports.size} svelte exports verified`,
);
