import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const source = (path: string) => new URL(path, import.meta.url).pathname;

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: [
            { find: "@chaos_team/blbui-core/register", replacement: source("../../core/src/register.ts") },
            { find: "@chaos_team/blbui-core/styles.css", replacement: source("../../core/src/styles.css") },
            { find: "@chaos_team/blbui-core", replacement: source("../../core/src/index.ts") },
            { find: "@chaos_team/blbui-vue", replacement: source("../../vue/src/index.ts") },
            { find: "@chaos_team/blbui-business/register", replacement: source("../../business/src/register.ts") },
            { find: "@chaos_team/blbui-business/styles.css", replacement: source("../../business/src/styles.css") },
            { find: "@chaos_team/blbui-business", replacement: source("../../business/src/index.ts") },
        ],
    },
});
