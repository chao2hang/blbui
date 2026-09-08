import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelteTesting(),
    react(),
    vue(),
    svelte({ compilerOptions: { compatibility: { componentApi: 4 } } }),
  ],
  resolve: {
    alias: [
      // Unit tests run against source, never against a stale dist build.
      {
        find: "@chaos_team/blbui-core/register",
        replacement: resolve(root, "core", "src", "register.ts"),
      },
      {
        find: "@chaos_team/blbui-core/styles.css",
        replacement: resolve(root, "core", "src", "styles.css"),
      },
      {
        find: "@chaos_team/blbui-core/tokens.css",
        replacement: resolve(root, "core", "src", "tokens.css"),
      },
      { find: "@chaos_team/blbui-core", replacement: resolve(root, "core", "src", "index.ts") },
    ],
  },
  test: {
    environment: "jsdom",
    clearMocks: true,
    restoreMocks: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
