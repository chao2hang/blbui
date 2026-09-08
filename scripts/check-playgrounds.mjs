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
let errors = [];
const parity = join(root, "examples", "parity", "fixture.json");
try {
  const fixture = JSON.parse(await readFile(parity, "utf8"));
  const assertions = fixture.parityContract?.assertions;
  if (
    fixture.contractVersion !== 2 ||
    !fixture.tabs?.length ||
    !fixture.rows?.length ||
    !fixture.business?.columns?.length ||
    !fixture.business?.rows?.length ||
    !fixture.parityContract?.dialogModel ||
    !fixture.parityContract?.controlledState ||
    assertions?.initialPage !== 1 ||
    assertions?.totalPages !== 3 ||
    assertions?.initialDialog !== false ||
    assertions?.initialQuery !== ""
  ) {
    errors.push("parity fixture must contain the versioned controlled-state contract and assertions");
  }
} catch {
  errors.push("parity fixture is missing or invalid JSON");
}
const required = {
  react: ["package.json", "index.html", "vite.config.ts", "tsconfig.json", "src/main.tsx"],
  vue: ["package.json", "index.html", "vite.config.ts", "tsconfig.json", "src/main.ts", "src/App.vue"],
  svelte: ["package.json", "index.html", "vite.config.ts", "src/main.ts", "src/App.svelte"],
  web: ["package.json", "index.html", "vite.config.ts", "tsconfig.json", "src/main.ts"],
};
const checks = [
  ["@chaos_team/blbui-core", "@chaos_team/blbui-core/styles.css"],
  ["AdminButton", "AdminInput", "AdminTable", "AdminPagination", "AdminDialog"],
];
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
  const frameworkChecks = framework === "web"
    ? ["registerAdminElements", "registerBusinessElements", "setAdminTheme", "aui-data-grid", "aui-advanced-table", "grid.rows", "aui-input"]
    : checks.flat();
  const businessMarkers = framework === "react"
    ? ["@chaos_team/blbui-business-react", "AdminAdvancedTable", "business", "data-parity-business-selection"]
    : ["registerBusinessElements", "business", "aui-advanced-table", "data-parity-business-selection"];
  for (const marker of businessMarkers) {
    if (!source.includes(marker)) errors.push(`${framework}: Business parity is missing ${marker}`);
  }
  for (const marker of frameworkChecks) if (!source.includes(marker)) errors.push(`${framework}: missing ${marker}`);
  if (framework === "web") {
    const packageJson = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
    if (!packageJson.scripts?.build) errors.push("web: package.json has no build script");
    const vite = join(root, "node_modules", ".bin", process.platform === "win32" ? "vite.exe" : "vite");
    const result = spawnSync(vite, ["build"], { cwd: directory, stdio: "inherit" });
    if (result.status !== 0) errors.push("web: vite build failed");
    continue;
  }
  const parityMarkers = [
    "parity/fixture.json",
    "parityContract.assertions",
    "initialPage",
    "initialDialog",
    "totalPages",
    "activeTab",
  ];
  for (const marker of parityMarkers) {
    if (!source.includes(marker)) errors.push(`${framework}: parity contract is missing ${marker}`);
  }
  const frameworkMarkers = {
    react: ["setQuery", "setOpen", "setActiveTab", "onPageChange"],
    vue: ["query.value", "open = true", "activeTab = $event", "@page-change"],
    svelte: ["query =", "open = true", "activeTab =", "onPageChange"],
  }[framework];
  for (const marker of frameworkMarkers) {
    if (!source.includes(marker)) errors.push(`${framework}: parity interaction is missing ${marker}`);
  }
  if (!source.includes("setQuery") && !source.includes("query =") && !source.includes("query.value")) {
    errors.push(`${framework}: parity query state is not controlled`);
  }
  if (!source.includes("setOpen") && !source.includes("open =") && !source.includes("open.value")) {
    errors.push(`${framework}: parity dialog state is not controlled`);
  }
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
