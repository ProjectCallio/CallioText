import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        exclude: ["_node_modules", "__node_modules"]
    },
    plugins: [
        react(),
        dts({
            include: ["lib"],
            exclude: ["**/*.test.ts", "**/*.test.tsx"]
        })
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, "lib/index.tsx"),
            name: "calliotext",
            fileName: (format) => `calliotext.${format}.js`
        },
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ["react"],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    react: "React"
                }
            }
        }
    }
})
