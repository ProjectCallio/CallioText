// @vitest-environment jsdom
/** 这组测试覆盖概念区按钮 ref 的采集机制。
 * 背景：上下键的几何导航依赖每个按钮的 DOM ref。曾经把 ref 挂在
 * AnimatePresence（popLayout 模式）的直接子元素 motion.div 上，
 * 而 popLayout 会克隆直接子元素并覆盖其 ref（framer-motion 的 PopChild 实现），
 * 导致 ref 永远收不到、上下键完全失效。修复方式是把 ref 挂到内层的普通 div 上。
 * 这里同时钉住「坏结构收不到 ref」和「正确结构收得到 ref」两个事实。
*/
import { describe, it, expect } from "vitest"
import * as React from "react"
import { createRoot } from "react-dom/client"
import { act } from "react"
import { AnimatePresence, motion } from "framer-motion"

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

function render(element: React.ReactElement){
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)
    act(() => {
        root.render(element)
    })
    return () => {
        act(() => root.unmount())
        container.remove()
    }
}

describe("popLayout 模式下的 ref 采集", () => {
    it("挂在直接子元素上的 ref 会被 popLayout 覆盖，收不到回调（这曾是上下键失效的原因）", () => {
        const refs: {[key: string]: HTMLElement | null} = {}
        const cleanup = render(
            <AnimatePresence mode="popLayout">
                <motion.div key="a" ref={(el: HTMLDivElement | null) => {refs["a"] = el}}>
                    <button>a</button>
                </motion.div>
            </AnimatePresence>
        )
        // 如果这条断言开始失败，说明 framer-motion 改变了 popLayout 的克隆行为，
        // 届时可以重新评估 ref 的挂法。
        expect(refs["a"]).toBeUndefined()
        cleanup()
    })

    it("挂在内层普通 div 上的 ref 正常收到（修复后的结构）", () => {
        const refs: {[key: string]: HTMLElement | null} = {}
        const cleanup = render(
            <AnimatePresence mode="popLayout">
                {["a", "b", "c"].map(key => (
                    <motion.div key={key} layout>
                        <div ref={el => {refs[key] = el}}>
                            <button>{key}</button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        )
        expect(refs["a"]).toBeInstanceOf(HTMLElement)
        expect(refs["b"]).toBeInstanceOf(HTMLElement)
        expect(refs["c"]).toBeInstanceOf(HTMLElement)
        cleanup()
    })

    it("元素卸载后 ref 回调收到 null，不会留下悬空引用", () => {
        const refs: {[key: string]: HTMLElement | null} = {}
        const cleanup = render(
            <AnimatePresence mode="popLayout">
                <motion.div key="a">
                    <div ref={el => {refs["a"] = el}}>
                        <button>a</button>
                    </div>
                </motion.div>
            </AnimatePresence>
        )
        expect(refs["a"]).toBeInstanceOf(HTMLElement)
        cleanup()
        expect(refs["a"]).toBe(null)
    })
})
