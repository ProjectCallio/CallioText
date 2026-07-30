import { describe, it, expect } from "vitest"
import { ContexterBase } from "../../lib/default_implementation/printer/contexter/base"
import { OrderContexter } from "../../lib/default_implementation/printer/contexter/order"
import { inline, group } from "./helpers"

function enter_and_read(contexter: OrderContexter<any>, node: any, env: any){
    const context: any = {}
    contexter.enter(node, [], {}, env, context)
    return contexter.get_context(context)
}

describe("ContexterBase", () => {
    it("get_env 在环境不存在时创建默认值", () => {
        const c = new ContexterBase("mykey", {a: 1})
        const env: any = {}
        expect(c.get_env(env)).toEqual({a: 1})
        expect(env["mykey"]).toEqual({a: 1})
    })

    it("默认值是深拷贝，不同环境互不影响", () => {
        const c = new ContexterBase("mykey", {list: [1]})
        const env1: any = {} , env2: any = {}
        c.get_env(env1).list.push(2)
        expect(c.get_env(env2)).toEqual({list: [1]})
    })

    it("set_context / get_context 读写同一个键", () => {
        const c = new ContexterBase<any, number>("mykey", {})
        const context: any = {}
        c.set_context(context, 42)
        expect(c.get_context(context)).toBe(42)
    })
})

describe("OrderContexter", () => {
    it("按进入顺序递增编号", () => {
        const c = new OrderContexter("section")
        const env: any = {}
        expect(enter_and_read(c, inline(), env)).toBe(1)
        expect(enter_and_read(c, inline(), env)).toBe(2)
        expect(enter_and_read(c, inline(), env)).toBe(3)
    })

    it("不同 order_key 的编号互相独立", () => {
        const c1 = new OrderContexter("section")
        const c2 = new OrderContexter("figure")
        const env: any = {}
        expect(enter_and_read(c1, inline(), env)).toBe(1)
        expect(enter_and_read(c1, inline(), env)).toBe(2)
        expect(enter_and_read(c2, inline(), env)).toBe(1)
        expect(enter_and_read(c1, inline(), env)).toBe(3)
    })

    it("separate_groups 时遇到 separating 的组会重新编号", () => {
        const c = new OrderContexter("section", true)
        const env: any = {}
        expect(enter_and_read(c, group({relation: "separating"}), env)).toBe(1)
        expect(enter_and_read(c, group({relation: "chaining"}), env)).toBe(2)
        expect(enter_and_read(c, group({relation: "chaining"}), env)).toBe(3)
        expect(enter_and_read(c, group({relation: "separating"}), env)).toBe(1)
        expect(enter_and_read(c, group({relation: "chaining"}), env)).toBe(2)
    })

    it("separate_groups 为 false 时 separating 的组不重置编号", () => {
        const c = new OrderContexter("section")
        const env: any = {}
        expect(enter_and_read(c, group({relation: "separating"}), env)).toBe(1)
        expect(enter_and_read(c, group({relation: "separating"}), env)).toBe(2)
    })
})
