import { describe, it, expect } from "vitest"
import { validate, validate_parameters } from "../../lib/core"
import { text, paragraph, inline, group, support, struct, abstract } from "./helpers"

const msg = (s: string) => s

describe("validate_parameters", () => {
    it("接受空参数列表", () => {
        expect(validate_parameters({}, msg)[0]).toBe(true)
    })

    it("接受四种合法类型", () => {
        const [good] = validate_parameters({
            a: {type: "string" , val: "x"} ,
            b: {type: "number" , val: 1} ,
            c: {type: "boolean", val: true} ,
            d: {type: "function", val: "(x)=>x"} ,
        }, msg)
        expect(good).toBe(true)
    })

    it("拒绝非对象", () => {
        expect(validate_parameters(3, msg)[0]).toBe(false)
        expect(validate_parameters("x", msg)[0]).toBe(false)
    })

    it("拒绝未知的参数类型", () => {
        const [good, m] = validate_parameters({a: {type: "date", val: "2024"}}, msg)
        expect(good).toBe(false)
        expect(m).toContain("not standard")
    })

    it("拒绝 type 和 val 不匹配的参数", () => {
        expect(validate_parameters({a: {type: "string" , val: 1}}, msg)[0]).toBe(false)
        expect(validate_parameters({a: {type: "number" , val: "1"}}, msg)[0]).toBe(false)
        expect(validate_parameters({a: {type: "boolean", val: "true"}}, msg)[0]).toBe(false)
        expect(validate_parameters({a: {type: "function", val: 1}}, msg)[0]).toBe(false)
    })
})

describe("validate：合法树", () => {
    it("接受文本节点", () => {
        expect(validate(text())).toEqual([true, ""])
    })

    it("接受段落节点（text / inline / support 子节点）", () => {
        const tree = paragraph([text(), inline(), support()])
        expect(validate(tree)).toEqual([true, ""])
    })

    it("接受完整的 inline 节点", () => {
        expect(validate(inline({parameters: {a: {type: "number", val: 1}}}))).toEqual([true, ""])
    })

    it("接受 group / structure / support / abstract 节点", () => {
        expect(validate(group())).toEqual([true, ""])
        expect(validate(struct())).toEqual([true, ""])
        expect(validate(support())).toEqual([true, ""])
        expect(validate(abstract())).toEqual([true, ""])
    })

    it("接受带 abstract 列表的节点", () => {
        const tree = group({abstract: [abstract()]})
        expect(validate(tree)).toEqual([true, ""])
    })

    it("接受多层嵌套的树", () => {
        const tree = abstract({
            children: [
                paragraph([text("a"), inline({children: [text("b"), inline()]})]) ,
                struct({children: [group({relation: "chaining"}), group()]}) ,
            ] ,
        })
        expect(validate(tree)).toEqual([true, ""])
    })
})

describe("validate：非法树", () => {
    it("拒绝未知的概念类型", () => {
        const [good, m] = validate({type: "banana", children: [text()]})
        expect(good).toBe(false)
        expect(m).toContain("unknown concept type")
    })

    it("拒绝既非文本又非段落的无 type 节点", () => {
        expect(validate({foo: 1})[0]).toBe(false)
    })

    it("拒绝段落中出现 group 子节点", () => {
        const [good, m] = validate(paragraph([group() as any]))
        expect(good).toBe(false)
        expect(m).toContain("not text, inline nor support")
    })

    it("拒绝没有 children 的概念节点", () => {
        const bad = {...inline(), children: undefined}
        expect(validate(bad)[0]).toBe(false)
    })

    it("拒绝空 children 的概念节点", () => {
        const [good, m] = validate(inline({children: []}))
        expect(good).toBe(false)
        expect(m).toContain("at least 1 child")
    })

    it("拒绝 idx 不是字符串的概念节点", () => {
        const [good, m] = validate(inline({idx: 233 as any}))
        expect(good).toBe(false)
        expect(m).toContain(`"idx" should be string`)
    })

    it("拒绝缺少 concept 的概念节点", () => {
        const bad = {...inline(), concept: undefined}
        expect(validate(bad)[0]).toBe(false)
    })

    it("拒绝参数列表非法的概念节点", () => {
        expect(validate(inline({parameters: {a: {type: "number", val: "1"}} as any}))[0]).toBe(false)
    })

    it("拒绝缺少 abstract 列表的概念节点", () => {
        const bad = {...inline(), abstract: undefined}
        expect(validate(bad)[0]).toBe(false)
    })

    it("拒绝 abstract 列表中出现非 abstract 节点", () => {
        const [good, m] = validate(inline({abstract: [group() as any]}))
        expect(good).toBe(false)
        expect(m).toContain("is not an AbstractNode")
    })

    it("拒绝 inline 中出现 group 子节点", () => {
        const [good, m] = validate(inline({children: [group() as any]}))
        expect(good).toBe(false)
        expect(m).toContain("not text nor inline")
    })

    it("拒绝 group 中出现文本或 inline 子节点", () => {
        expect(validate(group({children: [text() as any]}))[0]).toBe(false)
        expect(validate(group({children: [inline() as any]}))[0]).toBe(false)
    })

    it("拒绝 relation 非法的 group / structure", () => {
        expect(validate(group({relation: "banana" as any}))[0]).toBe(false)
        expect(validate(struct({relation: undefined as any}))[0]).toBe(false)
    })

    it("拒绝多于一个子节点的 support", () => {
        const [good, m] = validate(support({children: [{text: ""}, {text: ""}] as any}))
        expect(good).toBe(false)
        expect(m).toContain("only have 1 child")
    })

    it("拒绝 structure 中出现非 group 子节点", () => {
        const [good, m] = validate(struct({children: [paragraph() as any]}))
        expect(good).toBe(false)
        expect(m).toContain("not group")
    })

    it("递归检查子树，错误信息带路径", () => {
        const tree = abstract({
            children: [
                paragraph() ,
                paragraph([inline({children: [group() as any]})]) ,
            ] ,
        })
        const [good, m] = validate(tree)
        expect(good).toBe(false)
        expect(m).toContain("[1,0]")
    })
})
