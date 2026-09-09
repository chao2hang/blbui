/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const matrix = JSON.parse(await readFile(`${root}/tests/e2e/visual-matrix.json`, "utf8"));
const profile = process.env.VISUAL_MATRIX_PROFILE;
const source = process.env.VISUAL_MATRIX_ARTIFACT_DIR;
const expectedProfiles = new Set(matrix.platformProfiles);
const expectedFiles = matrix.viewports.flatMap((viewport) =>
    matrix.themes.flatMap((theme) =>
        matrix.modes.flatMap((mode) =>
            matrix.scenes.map((scene) =>
                `${profile}-${viewport.id}-${theme}-${mode}-${scene.id}.png`,
            ),
        ),
    ),
);

if (process.env.VISUAL_MATRIX_PROMOTE !== "1") {
    throw new Error("Refusing to promote visual goldens without VISUAL_MATRIX_PROMOTE=1");
}
if (!profile || !expectedProfiles.has(profile)) {
    throw new Error(`VISUAL_MATRIX_PROFILE must be one of ${[...expectedProfiles].join(", ")}`);
}
if (!source) throw new Error("VISUAL_MATRIX_ARTIFACT_DIR is required");

const sourceDir = resolve(source);
const targetDir = resolve(root, `tests/e2e/golden/${profile}`);
const sourceNames = new Set((await readdir(sourceDir)).filter((name) => name.endsWith(".png")));
const expectedNames = new Set(expectedFiles);
const missing = expectedFiles.filter((name) => !sourceNames.has(name));
const unexpected = [...sourceNames].filter((name) => !expectedNames.has(name));
if (missing.length || unexpected.length) {
    throw new Error(
        `Visual artifact contract failed: missing ${missing.length}, unexpected ${unexpected.length}`,
    );
}

await mkdir(targetDir, { recursive: true });
let promoted = 0;
let unchanged = 0;
for (const name of expectedFiles) {
    const sourcePath = resolve(sourceDir, name);
    const targetPath = resolve(targetDir, name);
    let differs = true;
    try {
        const actual = PNG.sync.read(await readFile(sourcePath));
        const expected = PNG.sync.read(await readFile(targetPath));
        if (actual.width === expected.width && actual.height === expected.height) {
            const diff = new PNG({ width: actual.width, height: actual.height });
            differs = pixelmatch(
                actual.data,
                expected.data,
                diff.data,
                actual.width,
                actual.height,
                { threshold: 0.1 },
            ) !== 0;
        }
    } catch {
        differs = true;
    }
    if (differs) {
        await copyFile(sourcePath, targetPath);
        promoted += 1;
    } else {
        unchanged += 1;
    }
}

console.log(
    `Promoted ${promoted} ${profile} visual goldens; ${unchanged} pixel-identical files retained.`,
);
