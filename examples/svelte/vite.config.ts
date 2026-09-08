import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const source = (path: string) => new URL(path, import.meta.url).pathname;

export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: [
            { find: "@chaos_team/blbui-core/register", replacement: source("../../core/src/register.ts") },
            { find: "@chaos_team/blbui-core/styles.css", replacement: source("../../core/src/styles.css") },
            { find: "@chaos_team/blbui-core", replacement: source("../../core/src/index.ts") },
            { find: "@chaos_team/blbui-svelte", replacement: source("../../svelte/src/index.ts") },
            { find: "@chaos_team/blbui-business/register", replacement: source("../../business/src/register.ts") },
            { find: "@chaos_team/blbui-business/styles.css", replacement: source("../../business/src/styles.css") },
            { find: "@chaos_team/blbui-business", replacement: source("../../business/src/index.ts") },
        ],
    },
});
