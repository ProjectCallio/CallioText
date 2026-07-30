import { describe, it, expect } from "vitest"
import { gene_idx, object_foreach, merge_object } from "../../lib/utils"

describe("gene_idx", () => {
    it("返回纯数字字符串", () => {
        for(let i = 0; i < 100; i++){
            const idx = gene_idx()
            expect(typeof idx).toBe("string")
            expect(idx).toMatch(/^\d+$/)
            expect(Number(idx)).toBeLessThan(233333333)
        }
    })
})

describe("object_foreach", () => {
    it("对每个值应用函数并返回新对象", () => {
        const src = {a: 1, b: 2}
        const ret = object_foreach(src, (x: number) => x * 2)
        expect(ret).toEqual({a: 2, b: 4})
        expect(src).toEqual({a: 1, b: 2})
    })

    it("空对象返回空对象", () => {
        expect(object_foreach({}, (x: any) => x)).toEqual({})
    })
})

describe("merge_object", () => {
    it("一方为 undefined 时返回另一方", () => {
        expect(merge_object(undefined, {a: 1})).toEqual({a: 1})
        expect(merge_object({a: 1}, undefined)).toEqual({a: 1})
    })

    it("叶子值冲突时以第二个对象为准", () => {
        expect(merge_object({a: 1}, {a: 2})).toEqual({a: 2})
    })

    it("递归合并嵌套对象", () => {
        const ret = merge_object(
            {a: {x: 1}, b: 1} ,
            {a: {y: 2}, c: 3} ,
        )
        expect(ret).toEqual({a: {x: 1, y: 2}, b: 1, c: 3})
    })

    it("第二个参数为叶子值时直接覆盖", () => {
        expect(merge_object({a: 1}, 5)).toBe(5)
    })

    it("第一个参数为叶子值且第二个为对象时保留第一个（当前行为）", () => {
        expect(merge_object(5, {a: 1})).toBe(5)
    })
})
