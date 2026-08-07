import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
    test: {
        include: ["test/unit/**/*.test.{ts,tsx}"],
        environment: "node",
    },
    resolve: {
        alias: {
            // demo/ 下的代码按包名导入库，测试时指到源码。
            "@project-callio/calliotext": path.resolve(__dirname, "lib/index.tsx"),
        },
    },
})
