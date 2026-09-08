/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const path = `${root}/tests/e2e/visual-matrix.json`;
const matrix = JSON.parse(await readFile(path, "utf8"));
const expectedThemes = [
  "obsidian",
  "rounded",
  "enterprise",
  "modern",
  "minimal",
  "premium",
  "chinese",
  "atmospheric",
  "glass",
];
const errors = [];
if (matrix.schemaVersion !== 1) errors.push("visual matrix schemaVersion must be 1");
if (JSON.stringify(matrix.platformProfiles) !== JSON.stringify(["windows-chromium", "ubuntu-chromium"])) {
  errors.push("visual matrix must define Windows and Ubuntu Chromium profiles");
}
if (JSON.stringify(matrix.themes) !== JSON.stringify(expectedThemes)) {
  errors.push("visual matrix themes must match the nine registered themes");
}
if (JSON.stringify(matrix.modes) !== JSON.stringify(["light", "dark"])) {
  errors.push("visual matrix must cover light and dark modes");
}
const viewportIds = new Set(matrix.viewports?.map((viewport) => viewport.id));
for (const id of ["desktop", "mobile", "narrow"]) {
  if (!viewportIds.has(id)) errors.push(`visual matrix is missing ${id} viewport`);
}
for (const scene of matrix.scenes ?? []) {
  if (!scene.id || !scene.selector) errors.push("visual matrix scenes require id and selector");
}
if ((matrix.scenes ?? []).length < 5) errors.push("visual matrix needs representative catalog, data and business scenes");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Visual matrix contract passed: ${matrix.platformProfiles.length} platform profiles, ` +
    `${matrix.themes.length} themes × ${matrix.modes.length} modes, ` +
    `${matrix.viewports.length} viewports, ${matrix.scenes.length} scenes`,
);
