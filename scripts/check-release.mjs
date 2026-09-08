/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(`${root}/${path}`, "utf8"));
const errors = [];
const packages = ["core", "react", "vue", "svelte", "business", "business-react"];
const manifests = await Promise.all(packages.map((name) => readJson(`${name}/package.json`)));
const version = manifests[0].version;
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

if (!versionPattern.test(version)) errors.push(`invalid package version: ${version}`);
if (new Set(manifests.map((manifest) => manifest.version)).size !== 1) {
  errors.push("publishable workspace package versions are not aligned");
}
if (manifests.some((manifest) => manifest.private)) errors.push("publishable packages must not be private");

const changelog = await readFile(`${root}/CHANGELOG.md`, "utf8");
if (!changelog.includes(`## ${version} —`)) errors.push(`CHANGELOG is missing ${version}`);

const isTagBuild = process.env.GITHUB_REF_TYPE === "tag" || process.env.GITHUB_REF?.startsWith("refs/tags/");
const tag = process.env.GITHUB_REF_NAME ?? process.env.GITHUB_REF?.replace(/^refs\/tags\//, "");
if (isTagBuild && tag !== `blbui-v${version}`) {
  errors.push(`release tag ${tag ?? "<missing>"} does not match blbui-v${version}`);
}

if (process.env.BLBUI_CHECK_NPM === "1") {
  for (const manifest of manifests) {
    try {
      const result = execFileSync("npm", ["view", `${manifest.name}@${version}`, "version", "--json", "--registry", "https://registry.npmjs.org"], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
      if (result) errors.push(`${manifest.name}@${version} already exists on npm`);
    } catch (error) {
      const output = `${error?.stdout ?? ""}\n${error?.stderr ?? ""}`;
      if (!/E404|\b404\b|not found/i.test(output)) {
        errors.push(`could not verify npm availability for ${manifest.name}@${version}`);
      }
    }
  }
}

if (errors.length) {
  console.error(JSON.stringify({ errors, version, npmCheck: process.env.BLBUI_CHECK_NPM === "1" }, null, 2));
  process.exit(1);
}

console.log(`Release preflight passed: ${packages.length} packages at ${version}${process.env.BLBUI_CHECK_NPM === "1" ? " (npm availability checked)" : ""}`);
