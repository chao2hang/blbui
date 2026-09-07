/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const roots = [join(root, "core", "src"), join(root, "business", "src")];
const ignored = new Set(["tokens.css", "themes.css"]);
const files = [];

async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await collect(path);
        else if (/\.(css|ts|tsx)$/.test(entry.name) && !ignored.has(entry.name)) files.push(path);
    }
}
for (const directory of roots) await collect(directory);

const colorPattern =
    /(?:^|[;{]\s*)(?:color|background(?:-color)?|border(?:-[a-z-]+)?|outline(?:-[a-z-]+)?|box-shadow|fill|stroke)\s*:\s*(?:#|rgb\(|rgba\(|hsl\(|hsla\()/m;
const errors = [];
for (const path of files) {
    const source = await readFile(path, "utf8");
    const componentStyles = [...source.matchAll(/css`([\s\S]*?)`/g)]
        .map((match) => match[1])
        .join("\n");
    const cssSource = path.endsWith(".css") ? source : componentStyles;
    if (colorPattern.test(cssSource)) errors.push(`${path}: hard-coded color in component style`);
    for (const match of cssSource.matchAll(/border-radius\s*:\s*([^;`}\n]+)/g)) {
        const value = match[1].trim();
    if (!value.startsWith("var(") && !/^0(?:px)?$/.test(value) && value !== "inherit") {
            errors.push(`${path}: fixed radius in component style (${value})`);
            break;
        }
    }
    for (const match of cssSource.matchAll(/box-shadow\s*:\s*([^;`}\n]+)/g)) {
        const value = match[1].trim();
        if (!value.startsWith("var(") && value !== "none") {
            errors.push(`${path}: fixed shadow in component style (${value})`);
            break;
        }
    }
}

if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
}
console.log(`Token lint passed: ${files.length} component source files scanned`);
