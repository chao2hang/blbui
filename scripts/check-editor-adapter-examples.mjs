/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = await readFile(`${root}/docs/editor-adapters.md`, "utf8");
const required = [
    "AdminEditorAdapter",
    "readEditorState",
    "writeEditorState",
    "connectEditorAdapter",
    "CodeMirror 6",
    "EditorView.updateListener",
    "TipTap",
    "editor.on(\"update\"",
    "Monaco",
    "onDidChangeModelContent",
    "React: return disconnect",
    "Vue: call disconnect",
    "Svelte: return disconnect",
    "disconnectedCallback",
];
const missing = required.filter((marker) => !source.includes(marker));
if (missing.length) {
    console.error(`Editor adapter examples are missing: ${missing.join(", ")}`);
    process.exit(1);
}
console.log("Editor adapter example check passed: CodeMirror, TipTap, Monaco and four lifecycles covered");
