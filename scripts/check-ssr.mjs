/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const source = `
  import { registerAdminElements, whenAdminElementsDefined, getAdminTheme, setAdminTheme } from './core/src/index.ts';
  registerAdminElements();
  await whenAdminElementsDefined();
  setAdminTheme(undefined, 'enterprise', 'light');
  if (getAdminTheme().theme !== 'obsidian') throw new Error('SSR theme fallback changed');
  console.log('SSR check passed');
`;
const windowsBun = process.env.APPDATA
  ? join(process.env.APPDATA, "npm", "node_modules", "bun", "bin", "bun.exe")
  : "";
const command = process.platform === "win32" && existsSync(windowsBun) ? windowsBun : "bun";
const result = spawnSync(command, ["-e", source], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  encoding: "utf8",
});
if (result.status !== 0) {
  console.error(result.stdout ?? "");
  console.error(result.stderr ?? "");
  process.exit(result.status || 1);
}
