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
        react(({
            babel: {
                plugins:[],
                presets:[[
                    "@babel/preset-react",
                    {
                        runtime: "automatic",
                        development: process.env.NODE_ENV === "development",
                        importSource: "@welldone-software/why-did-you-render",
                    },
                ]]
            }
        })),
        dts({
            include: ["lib"],
            outDir: "dist/types",
            tsconfigPath: "./tsconfig.app.json",
        }),
        // cssInjectedByJsPlugin(),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, "lib/index.tsx"),
            name: "calliotext",
            fileName: (format) => `calliotext.${format}.js`
        },
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ["react", "react-dom", "@mui/material", "@ftyyy/mouseless"],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    react             : "React"     ,
                    "react-dom"       : "ReactDOM"  ,
                    "@mui/material"   : "MaterialUI",
                    "@ftyyy/mouseless": "Mouseless" ,
                },
                // 确保资源文件的正确输出
                assetFileNames: (info) => {
                    if(info.names.some(name => name.endsWith(".css"))){
                        return "styles/[name][extname]"
                    }
                    return "assets/[name][extname]"
                }
            }
        },
        // 确保字体文件被复制到输出目录
        copyPublicDir: false,
        assetsDir: 'assets',
        // 确保字体文件被包含在构建中
        assetsInlineLimit: 0  // 不内联任何资源文件
    },
    assetsInclude: ['**/*.ttf'],
    // resolve: {
    //     alias: {
    //         "@ftyyy/mouseless": path.resolve(__dirname, "./mouseless_lib")
    //     }
    // }
})
