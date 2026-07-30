import { describe, it, expect } from "vitest"
import {
    is_concetnode ,
    is_inlinenode ,
    is_groupnode ,
    is_supportnode ,
    is_abstractnode ,
    is_structnode ,
    is_paragraphnode ,
    is_textnode ,
    get_node_type ,
} from "../../lib/core"
import { BadNodeError } from "../../lib/uibase/exceptions"
import { text, paragraph, inline, group, support, struct, abstract } from "./helpers"

describe("类型守卫", () => {
    const concept_nodes = [inline(), group(), support(), struct(), abstract()]

    it("is_concetnode 对所有概念节点返回 true", () => {
        for(const node of concept_nodes){
            expect(is_concetnode(node)).toBe(true)
        }
    })

    it("is_concetnode 对文本和段落节点返回 false", () => {
        expect(is_concetnode(text())).toBe(false)
        expect(is_concetnode(paragraph())).toBe(false)
    })

    it("各个具体守卫只认自己的类型", () => {
        const guards = {
            inline: is_inlinenode ,
            group: is_groupnode ,
            support: is_supportnode ,
            structure: is_structnode ,
            abstract: is_abstractnode ,
        } as const
        for(const node of concept_nodes){
            for(const [type, guard] of Object.entries(guards)){
                expect(guard(node)).toBe(node.type == type)
            }
        }
    })

    it("is_paragraphnode / is_textnode", () => {
        expect(is_paragraphnode(paragraph())).toBe(true)
        expect(is_paragraphnode(text())).toBe(false)
        expect(is_paragraphnode(inline())).toBe(false)

        expect(is_textnode(text())).toBe(true)
        expect(is_textnode(paragraph())).toBe(false)
        expect(is_textnode(group())).toBe(false)
    })
})

describe("get_node_type", () => {
    it("识别所有节点类型", () => {
        expect(get_node_type(text())).toBe("text")
        expect(get_node_type(paragraph())).toBe("paragraph")
        expect(get_node_type(inline())).toBe("inline")
        expect(get_node_type(group())).toBe("group")
        expect(get_node_type(support())).toBe("support")
        expect(get_node_type(struct())).toBe("structure")
        expect(get_node_type(abstract())).toBe("abstract")
    })

    it("对既有 text 又有 children 的无 type 节点抛出 BadNodeError", () => {
        expect(() => get_node_type({text: "a", children: []} as any)).toThrow(BadNodeError)
    })

    it("对既无 text 又无 children 的无 type 节点抛出 BadNodeError", () => {
        expect(() => get_node_type({} as any)).toThrow(BadNodeError)
    })
})
