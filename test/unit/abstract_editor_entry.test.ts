import { describe, it, expect, beforeEach } from "vitest"
import {
    open_abstract_editor,
    useAbstractEditorStore,
} from "../../lib/default_implementation/editor/abstract/editor"
import { inline, abstract } from "./helpers"

describe("open_abstract_editor", () => {
    beforeEach(() => {
        useAbstractEditorStore.getState().close_editor()
    })

    it("打开抽象编辑器，记录目标节点和抽象的 idx", () => {
        const abs = abstract()
        const node = inline({abstract: [abs]})

        open_abstract_editor(node, abs.idx)

        const state = useAbstractEditorStore.getState()
        expect(state.open).toBe(true)
        expect(state.father_node).toBe(node)
        expect(state.abs_idx).toBe(abs.idx)
    })

    it("close_editor 清空状态", () => {
        open_abstract_editor(inline(), "whatever")
        useAbstractEditorStore.getState().close_editor()

        const state = useAbstractEditorStore.getState()
        expect(state.open).toBe(false)
        expect(state.father_node).toBe(null)
        expect(state.abs_idx).toBe(null)
    })

    it("连续打开时，后一次覆盖前一次", () => {
        const node_a = inline()
        const node_b = inline()
        open_abstract_editor(node_a, "a")
        open_abstract_editor(node_b, "b")

        const state = useAbstractEditorStore.getState()
        expect(state.father_node).toBe(node_b)
        expect(state.abs_idx).toBe("b")
    })
})

describe("open_abstract_editor 的导出链", () => {
    it("从 default_implementation 的出口可达（即包的使用者可以 import 到）", async () => {
        const mod = await import("../../lib/default_implementation")
        expect(mod.open_abstract_editor).toBe(open_abstract_editor)
    })
})
