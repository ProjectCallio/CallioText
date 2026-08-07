import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// 这个配置构建公开演示站，产物直接输出到 docs/demo/，
// 由 GitHub Pages（main 分支 /docs 目录）发布。
export default defineConfig({
    root: __dirname,
    base: "./",
    plugins: [react()],
    resolve: {
        alias: {
            // 直接指向库源码，保证演示永远和当前代码一致。
            "@project-callio/calliotext": path.resolve(__dirname, "../lib/index.tsx"),
        },
    },
    build: {
        outDir: path.resolve(__dirname, "../docs/demo"),
        emptyOutDir: true,
    },
})
