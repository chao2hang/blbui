/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { readFile } from "node:fs/promises";

const [themeSource, css, tokens, docsCss, coreStyles, utilities] = await Promise.all([
  readFile(new URL("../core/src/theme.ts", import.meta.url), "utf8"),
  readFile(new URL("../core/src/themes.css", import.meta.url), "utf8"),
  readFile(new URL("../core/src/tokens.css", import.meta.url), "utf8"),
  readFile(new URL("../docs-site/src/styles.css", import.meta.url), "utf8"),
  readFile(new URL("../core/src/styles.css", import.meta.url), "utf8"),
  readFile(new URL("../core/src/utilities.css", import.meta.url), "utf8"),
]);

const themes = [...themeSource.matchAll(/^\s+"([a-z-]+)",$/gm)].map((match) => match[1]);
const modes = ["light", "dark"];
const requiredTokens = [
  "--aui-bg",
  "--aui-surface",
  "--aui-border",
  "--aui-header",
  "--aui-text",
  "--aui-text-primary",
  "--aui-primary",
  "--aui-info",
  "--aui-success",
  "--aui-warning",
  "--aui-danger",
];

function blockFor(selector) {
  const start = css.indexOf(selector);
  if (start < 0) return null;
  const open = css.indexOf("{", start);
  if (open < 0) return null;
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, index);
    }
  }
  return null;
}

const errors = [];
for (const theme of themes) {
  for (const mode of modes) {
    const selector = `[data-aui-theme="${theme}"][data-aui-mode="${mode}"]`;
    const block = blockFor(selector);
    if (!block) {
      errors.push(`${selector} is missing`);
      continue;
    }
    for (const token of requiredTokens) {
      if (!block.includes(`${token}:`)) errors.push(`${selector} does not define ${token}`);
    }
  }
}

const definedTokens = new Set(
  [...`${tokens}\n${css}\n${docsCss}`.matchAll(/(--aui-[a-z0-9-]+)\s*:/g)].map(
    (match) => match[1],
  ),
);
const runtimeTokens = new Set([
  "--aui-container-width",
  "--aui-grid-columns",
  "--aui-grid-gap",
  "--aui-stack-gap",
]);
const referencedTokens = new Set(
  [...`${coreStyles}\n${utilities}`.matchAll(/var\((--aui-[a-z0-9-]+)/g)].map(
    (match) => match[1],
  ),
);
for (const token of referencedTokens) {
  if (!definedTokens.has(token) && !runtimeTokens.has(token)) {
    errors.push(`component styles reference undefined token ${token}`);
  }
}

if (
  /(?:^|[;{])\s*(?:color|background(?:-color)?|border(?:-[a-z-]+)?|outline(?:-[a-z-]+)?|box-shadow|fill|stroke)\s*:\s*(?:#|rgb\(|rgba\(|hsl\(|hsla\()/m.test(
    docsCss,
  )
) {
  errors.push("docs-site/src/styles.css contains a hard-coded color; use an --aui-* token");
}

if (themes.length !== 9 || errors.length) {
  console.error(JSON.stringify({ themes, expectedThemeCount: 9, errors }, null, 2));
  process.exit(1);
}

console.log(`Theme check passed: ${themes.length} themes × ${modes.length} modes with ${requiredTokens.length} required tokens`);
