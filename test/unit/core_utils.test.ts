import { describe, it, expect } from "vitest"
import { find_node_by_path, find_concept_nodes_by_path } from "../../lib/core"
import { text, paragraph, inline, group, struct, abstract } from "./helpers"

describe("find_node_by_path", () => {
    it("空路径返回根节点", () => {
        const root = abstract()
        expect(find_node_by_path(root, [])).toBe(root)
    })

    it("按路径逐层查找", () => {
        const target = inline()
        const root = abstract({children: [paragraph([text("a"), target])]})
        expect(find_node_by_path(root, [0])).toBe(root.children[0])
        expect(find_node_by_path(root, [0, 1])).toBe(target)
    })

    it("越界的路径分量被跳过，返回最后一个可达节点（当前行为）", () => {
        const root = abstract()
        expect(find_node_by_path(root, [99])).toBe(root)
        expect(find_node_by_path(root, [0, 99])).toBe(root.children[0])
    })
})

describe("find_concept_nodes_by_path", () => {
    it("收集路径上的概念节点，跳过段落等非概念节点", () => {
        const target = inline()
        const root = abstract({children: [paragraph([target])]})
        // 路径 [0] 是段落（非概念），[0, 0] 是 inline。
        expect(find_concept_nodes_by_path(root, [0, 0])).toEqual([target])
    })

    it("多层概念节点按顺序收集，不包含根节点", () => {
        const g = group()
        const s = struct({children: [g]})
        const root = abstract({children: [s]})
        // [0] = structure, [0,0] = group, [0,0,0] = paragraph
        expect(find_concept_nodes_by_path(root, [0, 0, 0])).toEqual([s, g])
    })

    it("空路径返回空列表", () => {
        expect(find_concept_nodes_by_path(abstract(), [])).toEqual([])
    })
})
