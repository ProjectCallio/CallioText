import { describe, it, expect } from "vitest"
import { FirstClassConcept, SecondClassConcept } from "../../lib/core"

describe("FirstClassConcept", () => {
    it("保存构造参数", () => {
        const c = new FirstClassConcept({
            type: "inline" ,
            name: "strong" ,
            parameter_prototype: {level: {type: "number", val: 1}} ,
            meta_parameters: {force_inline: true} ,
        })
        expect(c.type).toBe("inline")
        expect(c.name).toBe("strong")
        expect(c.parameter_prototype).toEqual({level: {type: "number", val: 1}})
        expect(c.meta_parameters).toEqual({force_inline: true})
    })

    it("缺省的参数原型和元参数为为空对象", () => {
        const c = new FirstClassConcept({type: "group", name: "chapter"})
        expect(c.parameter_prototype).toEqual({})
        expect(c.meta_parameters).toEqual({})
    })
})

describe("SecondClassConcept", () => {
    it("保存构造参数", () => {
        const c = new SecondClassConcept({
            type: "group" ,
            first_concept: "chapter" ,
            name: "appendix" ,
            default_override: {title: {type: "string", val: "附录"}} ,
            fixed_override: {numbered: {type: "boolean", val: false}} ,
        })
        expect(c.type).toBe("group")
        expect(c.first_concept).toBe("chapter")
        expect(c.name).toBe("appendix")
        expect(c.default_override).toEqual({title: {type: "string", val: "附录"}})
        expect(c.fixed_override).toEqual({numbered: {type: "boolean", val: false}})
    })

    it("缺省的重写列表为空对象", () => {
        const c = new SecondClassConcept({type: "inline", first_concept: "strong", name: "em"})
        expect(c.default_override).toEqual({})
        expect(c.fixed_override).toEqual({})
    })
})
