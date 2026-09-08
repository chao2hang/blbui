/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const matrix = JSON.parse(await readFile(`${root}/tests/e2e/visual-matrix.json`, "utf8"));
const golden = JSON.parse(await readFile(`${root}/tests/e2e/visual-golden.json`, "utf8"));
const errors = [];
const expectedProfiles = ["windows-chromium", "ubuntu-chromium"];
if (golden.schemaVersion !== 1) errors.push("visual golden schemaVersion must be 1");
if (!["evidence-only", "active"].includes(golden.status)) {
    errors.push("visual golden status must be evidence-only or active");
}
if (JSON.stringify(golden.profiles) !== JSON.stringify(expectedProfiles)) {
    errors.push("visual golden profiles must match fixed Windows and Ubuntu runners");
}
if (JSON.stringify(matrix.platformProfiles) !== JSON.stringify(golden.profiles)) {
    errors.push("visual golden profiles must match visual matrix profiles");
}
const expectedFiles =
    matrix.viewports.length * matrix.themes.length * matrix.modes.length * matrix.scenes.length;
if (golden.expectedFilesPerProfile !== expectedFiles) {
    errors.push(`visual golden expectedFilesPerProfile must be ${expectedFiles}`);
}
if (!golden.filePattern?.includes("{profile}") || !golden.filePattern?.endsWith(".png")) {
    errors.push("visual golden filePattern must be profile-aware PNG naming");
}
if (golden.diff?.maxDifferentPixels !== 0 || golden.diff?.threshold !== 0.1) {
    errors.push("visual golden diff policy must remain pixel-exact at threshold 0.1");
}
if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
}
console.log(
    `Visual golden contract passed: ${golden.status}, ${golden.profiles.length} profiles × ${expectedFiles} PNGs`,
);
