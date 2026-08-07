import { describe, it, expect } from "vitest"
import { createEditor } from "slate"
import type { Editor } from "slate"
import { tree_op_mixin } from "../../lib/editor/treeopmixin"
import { UnexpectedParametersError } from "../../lib/uibase/exceptions"

// 构造一个最小的块节点。
function block(text: string){
    return {kind: "block", children: [{text}]} as any
}

// 构造一个裸的 Slate 编辑器，以及一个只提供 get_slate 的 EditorComponent 桩。
// delete_nodes_by_paths 只用到 editor.get_slate()，桩足够了。
function make_editor(children: any[]): {slate: Editor, editor: any}{
    const slate = createEditor()
    slate.children = children
    return {slate, editor: {get_slate: () => slate}}
}

function texts(slate: Editor){
    return (slate.children as any[]).map(c => c.children[0].text)
}

describe("delete_nodes_by_paths", () => {
    it("没有选区也能删除（不再依赖当前选区）", () => {
        const {slate, editor} = make_editor([block("A"), block("B"), block("C")])
        expect(slate.selection).toBe(null)

        tree_op_mixin.delete_nodes_by_paths(editor, [[1]])
        expect(texts(slate)).toEqual(["A", "C"])
    })

    it("批量删除时正确处理路径移动", () => {
        // 删掉 [0] 之后，原来的 [2] 会移动到 [1]，pathRef 应当跟上。
        const {slate, editor} = make_editor([block("A"), block("B"), block("C"), block("D")])
        tree_op_mixin.delete_nodes_by_paths(editor, [[0], [2]])
        expect(texts(slate)).toEqual(["B", "D"])
    })

    it("路径乱序给出，结果相同", () => {
        const {slate, editor} = make_editor([block("A"), block("B"), block("C"), block("D")])
        tree_op_mixin.delete_nodes_by_paths(editor, [[2], [0]])
        expect(texts(slate)).toEqual(["B", "D"])
    })

    it("无效路径被静默忽略", () => {
        const {slate, editor} = make_editor([block("A"), block("B")])
        tree_op_mixin.delete_nodes_by_paths(editor, [[5], [0]])
        expect(texts(slate)).toEqual(["B"])
    })

    it("重复路径只删一次", () => {
        const {slate, editor} = make_editor([block("A"), block("B")])
        tree_op_mixin.delete_nodes_by_paths(editor, [[0], [0]])
        expect(texts(slate)).toEqual(["B"])
    })

    it("支持嵌套路径", () => {
        const parent = {kind: "block", children: [block("x"), block("y"), block("z")]} as any
        const {slate, editor} = make_editor([parent, block("B")])
        tree_op_mixin.delete_nodes_by_paths(editor, [[0, 1]])
        const inner = (slate.children[0] as any).children.map((c: any) => c.children[0].text)
        expect(inner).toEqual(["x", "z"])
    })

    it("空路径列表抛出 UnexpectedParametersError", () => {
        const {editor} = make_editor([block("A")])
        expect(() => tree_op_mixin.delete_nodes_by_paths(editor, [])).toThrow(UnexpectedParametersError)
    })

    it("struct 编辑器收缩子节点的场景：无焦点时删除末尾的连续子节点", () => {
        // 对应 struct.tsx 的 effect：列数从 4 减到 2 时，删除路径 [0,2] 和 [0,3]。
        const struct = {kind: "struct", children: [block("c0"), block("c1"), block("c2"), block("c3")]} as any
        const {slate, editor} = make_editor([struct])
        expect(slate.selection).toBe(null)

        tree_op_mixin.delete_nodes_by_paths(editor, [[0, 2], [0, 3]])
        const inner = (slate.children[0] as any).children.map((c: any) => c.children[0].text)
        expect(inner).toEqual(["c0", "c1"])
    })
})
