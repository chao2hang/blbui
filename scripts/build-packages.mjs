/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { spawnSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const license = resolve(root, "LICENSE");
const tscEntry = resolve(root, "node_modules", "typescript", "lib", "tsc.js");

// Order matters: dependents compile against their dependencies' dist d.ts.
const packages = [
  {
    directory: "core",
    entries: ["src/index.ts", "src/register.ts"],
    external: ["lit"],
    copy: ["src/styles.css", "src/tokens.css", "src/themes.css", "src/utilities.css"],
    deps: [],
  },
  {
    directory: "business",
    entries: ["src/index.ts", "src/register.ts"],
    external: ["lit", "@chaos_team/blbui-core"],
    copy: ["src/styles.css"],
    deps: [
      { prefix: "@chaos_team/blbui-core", package: "core" },
    ],
  },
  {
    directory: "react",
    entries: ["src/index.tsx"],
    external: [
      "react",
      "react-dom",
      "@chaos_team/blbui-core",
      "@chaos_team/blbui-core/register",
      "@chaos_team/blbui-core/styles.css",
    ],
    deps: [
      { prefix: "@chaos_team/blbui-core", package: "core" },
    ],
  },
  {
    directory: "vue",
    entries: ["src/index.ts"],
    external: [
      "vue",
      "@chaos_team/blbui-core",
      "@chaos_team/blbui-core/register",
      "@chaos_team/blbui-core/styles.css",
    ],
    deps: [
      { prefix: "@chaos_team/blbui-core", package: "core" },
    ],
  },
  {
    directory: "business-react",
    entries: ["src/index.tsx"],
    external: [
      "react",
      "react-dom",
      "@chaos_team/blbui-business",
      "@chaos_team/blbui-business/register",
      "@chaos_team/blbui-business/styles.css",
    ],
    deps: [
      { prefix: "@chaos_team/blbui-business", package: "business" },
    ],
  },
];

async function copyDeclarations(sourceDir, targetDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const source = join(sourceDir, entry.name);
    const target = join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await mkdir(target, { recursive: true });
      await copyDeclarations(source, target);
    } else if (entry.name.endsWith(".d.ts")) {
      await cp(source, target);
    }
  }
}

/**
 * Emit plain JS first with `useDefineForClassFields: false`.
 *
 * Lit reactive properties live on the prototype as accessors. Native ES2022
 * class fields use [[Define]] semantics and would create own data properties
 * on the instance that shadow those accessors, silently breaking every
 * property update in the shipped bundles. Compiling to ES2020 with
 * constructor-assignment fields preserves the accessor behavior, after which
 * Bun only bundles (it does not re-lower classes in plain JS input).
 *
 * Cross-package imports are resolved against the dependency's emitted
 * declaration files (not its .ts sources) so every package compiles inside
 * its own rootDir.
 */
async function emitJavaScript(config, dist) {
  const directory = dirname(dist);
  const emitDir = join(dist, "emit");
  await rm(emitDir, { recursive: true, force: true });
  await mkdir(emitDir, { recursive: true });

  const paths = { ...config.pathsOverride };
  for (const dep of config.deps ?? []) {
    const depDist = join(root, dep.package, "dist");
    paths[dep.prefix] = [join(depDist, "index.d.ts")];
    paths[`${dep.prefix}/*`] = [join(depDist, "*")];
  }

  const tsconfigPath = join(dist, "tsconfig.emit.json");
  await writeFile(
    tsconfigPath,
    JSON.stringify(
      {
        extends: join(directory, "tsconfig.json"),
        compilerOptions: {
          noEmit: false,
          declaration: true,
          sourceMap: false,
          outDir: emitDir,
          rootDir: join(directory, "src"),
          useDefineForClassFields: false,
          target: "ES2020",
          ...(Object.keys(paths).length > 0 ? { paths } : {}),
        },
      },
      null,
      2,
    ),
  );
  try {
    const result = Bun.spawnSync([process.execPath, tscEntry, "-p", tsconfigPath], {
      cwd: dist,
      stdout: "pipe",
      stderr: "pipe",
    });
    if (result.exitCode !== 0) {
      throw new Error(
        `tsc emit failed for ${config.directory} (exit ${result.exitCode}):\n` +
          `${result.stdout?.toString()}\n${result.stderr?.toString()}`,
      );
    }
  } finally {
    await rm(tsconfigPath, { force: true });
  }
  return emitDir;
}

async function buildPackage(config) {
  const directory = resolve(root, config.directory);
  const dist = join(directory, "dist");
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  const emitDir = await emitJavaScript(config, dist);
  const result = await Bun.build({
    entrypoints: config.entries.map((entry) =>
      join(emitDir, entry.replace(/^src\//, "").replace(/\.(ts|tsx)$/, ".js")),
    ),
    outdir: dist,
    target: "browser",
    format: "esm",
    splitting: false,
    minify: false,
    external: config.external,
  });
  if (!result.success) {
    await rm(emitDir, { recursive: true, force: true });
    throw new Error(`Failed to build ${config.directory}`);
  }
  await copyDeclarations(emitDir, dist);
  await rm(emitDir, { recursive: true, force: true });

  for (const source of config.copy ?? []) {
    const target = source.replace(/^src\//, "");
    await cp(join(directory, source), join(dist, target));
    if (target.endsWith(".css")) {
      await writeFile(
        join(dist, `${target}.d.ts`),
        "declare const stylesheet: string; export default stylesheet;\n",
      );
    }
  }
  await cp(license, join(dist, "LICENSE"));
  console.log(`built ${config.directory}`);
}

for (const config of packages) {
  await buildPackage(config);
}

// Svelte components are intentionally shipped as source .svelte files so the
// consuming Svelte/Vite compiler can optimize them for its own runtime.
const svelteDirectory = resolve(root, "svelte");
const svelteDist = join(svelteDirectory, "dist");
await rm(svelteDist, { recursive: true, force: true });
await cp(join(svelteDirectory, "src"), join(svelteDist, "src"), { recursive: true });
await cp(license, join(svelteDist, "LICENSE"));
// Derive the component export list from the source barrel so dist always
// matches src (a hand-written list drifted before).
const svelteBarrel = await readFile(join(svelteDirectory, "src", "components.ts"), "utf8");
const svelteComponents = [
  ...svelteBarrel.matchAll(/export \{ default as (Admin\w+) \} from "\.(\/[^"]+\.svelte)"/g),
];
if (!svelteComponents.length) throw new Error("No Svelte components found in src/components.ts");
const svelteExports = svelteComponents
  .map(([, name, path]) => `export { default as ${name} } from "${path}";`)
  .join("\n") + "\n";
await writeFile(join(svelteDist, "components.js"), svelteExports);
await writeFile(join(svelteDist, "components.d.ts"), svelteExports);
await writeFile(
  join(svelteDist, "index.js"),
  `export { registerAdminElements } from "@chaos_team/blbui-core/register";
export * from "@chaos_team/blbui-core";

export function adminUi(node) {
  registerAdminElements();
  node.classList.add("aui-root");
  return { destroy: () => node.classList.remove("aui-root") };
}

export * from "./components.js";
`,
);
console.log("built svelte");
