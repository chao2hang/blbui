/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const required = {
  react: ["package.json", "index.html", "vite.config.ts", "tsconfig.json", "src/main.tsx"],
  vue: ["package.json", "index.html", "vite.config.ts", "tsconfig.json", "src/main.ts", "src/App.vue"],
  svelte: ["package.json", "index.html", "vite.config.ts", "src/main.ts", "src/App.svelte"],
};
const checks = [
  ["@chaos_team/blbui-core", "@chaos_team/blbui-core/styles.css"],
  ["AdminButton", "AdminInput", "AdminTable", "AdminPagination", "AdminDialog"],
];
let errors = [];
for (const [framework, files] of Object.entries(required)) {
  const directory = join(root, "examples", framework);
  for (const file of files) {
    try {
      await access(join(directory, file));
    } catch {
      errors.push(`${framework}: missing ${file}`);
    }
  }
  const sourceFiles = files.filter((file) => file.startsWith("src/"));
  const source = (await Promise.all(sourceFiles.map((file) => readFile(join(directory, file), "utf8")))).join("\n");
  for (const marker of checks.flat()) if (!source.includes(marker)) errors.push(`${framework}: missing ${marker}`);
  const packageJson = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
  if (!packageJson.scripts?.build) errors.push(`${framework}: package.json has no build script`);
  if (!errors.length) {
    const vite = join(root, "node_modules", ".bin", process.platform === "win32" ? "vite.exe" : "vite");
    const result = spawnSync(vite, ["build"], { cwd: directory, stdio: "inherit" });
    if (result.status !== 0) errors.push(`${framework}: vite build failed`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Playground check passed: React, Vue and Svelte apps are present with build entrypoints");
