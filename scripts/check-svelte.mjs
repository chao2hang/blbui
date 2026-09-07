import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../package.json", import.meta.url));
const { compile } = require("svelte/compiler");
const directory = new URL("../svelte/src/components/", import.meta.url);

for (const file of await readdir(directory)) {
  if (!file.endsWith(".svelte")) continue;
  const source = await readFile(new URL(file, directory), "utf8");
  compile(source, { filename: file, generate: "client" });
}

// Verify that the generated dist matches the source barrel so published and
// source trees cannot drift apart.
const root = fileURLToPath(new URL("..", import.meta.url));
const srcBarrel = await readFile(`${root}/svelte/src/components.ts`, "utf8");
const srcNames = [...srcBarrel.matchAll(/export \{ default as (Admin\w+) \}/g)].map((match) => match[1]);
const distComponentsPath = `${root}/svelte/dist/components.js`;
const distIndexPath = `${root}/svelte/dist/index.js`;
if (existsSync(distComponentsPath) && existsSync(distIndexPath)) {
  const distComponents = await readFile(distComponentsPath, "utf8");
  const distNames = [...distComponents.matchAll(/export \{ default as (Admin\w+) \}/g)].map(
    (match) => match[1],
  );
  const missing = srcNames.filter((name) => !distNames.includes(name));
  const extra = distNames.filter((name) => !srcNames.includes(name));
  if (missing.length || extra.length) {
    console.error(
      `Svelte dist/src drift: missing=[${missing.join(", ")}] extra=[${extra.join(", ")}]`,
    );
    process.exit(1);
  }
  const distIndex = await readFile(distIndexPath, "utf8");
  for (const marker of ["adminUi", 'export * from "@chaos_team/blbui-core"', "./components.js"]) {
    if (!distIndex.includes(marker)) {
      console.error(`Svelte dist/index.js is missing: ${marker}`);
      process.exit(1);
    }
  }
} else {
  console.error("Run `bun run build:packages` before check:svelte (dist not found)");
  process.exit(1);
}

console.log("Svelte component syntax check passed");
