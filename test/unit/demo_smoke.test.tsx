// @vitest-environment jsdom
/** demo 应用的冒烟测试：在 jsdom 中完整挂载 App，
 * 走通「构造概念、构造文档、编辑器初始化、印刷器预处理与渲染」的整条链路。
 * 语言由 URL 决定且在模块加载时固定，所以每个用例先设置 URL 再动态导入。
*/
import { describe, it, expect, vi } from "vitest"
import * as React from "react"
import { createRoot } from "react-dom/client"
import { act } from "react"
import { SnackbarProvider } from "notistack"

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

async function render_app(lang: "en" | "zh"){
    vi.resetModules()
    window.history.replaceState({}, "", lang == "zh" ? "/?lang=zh" : "/")

    const { default: App } = await import("../../demo/src/App")

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
        root.render(
            <SnackbarProvider>
                <App />
            </SnackbarProvider>
        )
    })
    return {
        container,
        cleanup: () => {
            act(() => root.unmount())
            container.remove()
        },
    }
}

describe("demo 应用冒烟", () => {
    it("英文版完整挂载，编辑器和印刷器都渲染出文档内容", async () => {
        const { container, cleanup } = await render_app("en")
        const text = container.textContent ?? ""

        // 印刷器一侧：定理题头（label 函数参数求值）、小节引用、证明结尾。
        expect(text).toContain("Theorem")
        expect(text).toContain("Proof")
        expect(text).toContain("∎")
        expect(text).toContain("John von Neumann")
        // 正文内容本身。
        expect(text).toContain("differentiable")
        // 自动标号的引用链接：渲染成按钮，文字由被引节点（定理）的编号自动生成。
        const ref_buttons = [...container.querySelectorAll("button")].filter(b => b.textContent == "Theorem 1")
        expect(ref_buttons.length).toBeGreaterThan(0)
        cleanup()
    }, 30000)

    it("中文版切换整套词汇和文档", async () => {
        const { container, cleanup } = await render_app("zh")
        const text = container.textContent ?? ""

        expect(text).toContain("定理")
        expect(text).toContain("证明")
        expect(text).toContain("乘积法则")
        expect(text).toContain("华罗庚")
        const ref_buttons = [...container.querySelectorAll("button")].filter(b => b.textContent == "定理 一")
        expect(ref_buttons.length).toBeGreaterThan(0)
        cleanup()
    }, 30000)
})
