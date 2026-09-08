/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const catalogSource = await readFile(`${root}/docs-site/src/catalog.ts`, "utf8");
const componentPattern = /item\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*(\[[^\]]*\])(?:,\s*(\[[^\]]*\]))?/g;
const components = [];
for (const match of catalogSource.matchAll(componentPattern)) {
  const parseArray = (source) => JSON.parse(source.replace(/,\s*]/g, "]"));
  const props = parseArray(match[6]);
  const events = match[7] ? parseArray(match[7]) : [];
  components.push({ id: match[1], tag: match[2], name: match[3], category: match[4], description: match[5], props, events });
}
if (!components.length) throw new Error("No catalog entries found");

const escapeCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const lines = [
  "# BLBUI Public API",
  "",
  "> Generated from `docs-site/src/catalog.ts`. Run `bun run api:docs` after changing a component contract.",
  "",
  `The catalog currently describes **${components.length} components** across Core and Business packages.`,
  "",
  "| Component | Custom Element | Category | Properties | Events |",
  "| --- | --- | --- | --- | --- |",
  ...components.map((component) => `| ${escapeCell(component.name)} | \`${component.tag}\` | ${escapeCell(component.category)} | ${component.props.map((prop) => `\`${prop}\``).join(", ") || "—"} | ${component.events.map((event) => `\`${event}\``).join(", ") || "—"} |`),
  "",
  "## Cross-framework contract",
  "",
  "- Web Components receive object/array values through DOM properties and emit composed `aui-*` CustomEvents.",
  "- React bindings map CustomEvents to typed callback props and keep object/array inputs as properties.",
  "- Vue Core bindings expose the same properties and `v-model` mappings; Business-only elements can be registered with `registerBusinessElements()`.",
  "- Svelte wrappers cover the most frequently used Core controls; all other components remain directly consumable as registered Custom Elements.",
  "- Every component uses semantic `--aui-*` tokens, so the nine themes and both color modes share one API contract.",
  "",
  "## Business data adapter contract",
  "",
  "- `fromTable(table)` accepts the small `AdminTableLike` surface and maps columns, current-page rows, sorting, one-based pagination, filtered total, and selected keys.",
  "- `getAdapterSelection(rows, selectedKeys)` returns current-page `keys`, `all`, and `some` state without requiring TanStack Table or any other runtime.",
  "- `virtualizeRows(rows, scrollTop, viewportHeight, rowHeight, overscan)` returns bounded rows plus `start`, `end`, `top`, and `bottom` spacer values.",
  "- TanStack Table / Virtual remain optional integrations; no large table dependency is bundled into Core or Business.",
  "",
];
const output = lines.join("\n");
const target = `${root}/docs/api.md`;
if (process.argv.includes("--check")) {
  const current = await readFile(target, "utf8").catch(() => "");
  if (current !== output) {
    console.error("docs/api.md is stale; run `bun run api:docs`");
    process.exit(1);
  }
} else {
  await writeFile(target, output);
  console.log(`Generated ${target} (${components.length} components)`);
}
