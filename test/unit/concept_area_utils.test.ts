import { describe, it, expect } from "vitest"
import {
    find_vertical_neighbor,
    move_in_flat_list,
    move_type,
    normalize_cursor,
    clamp,
    ButtonRect,
} from "../../lib/default_implementation/areas/concept_area_utils"

// 造一个按钮矩形。
function rect(key: string, top: number, left: number, width: number): ButtonRect {
    return {key, top, bottom: top + 30, left, right: left + width}
}

describe("find_vertical_neighbor", () => {
    // 两行按钮，宽度参差不齐（flex-wrap 的常态）：
    // 第一行：A[0,40] B[50,120] C[130,160]
    // 第二行：D[0,60]  E[70,160]
    const two_rows = [
        rect("A", 0, 0, 40),
        rect("B", 0, 50, 70),
        rect("C", 0, 130, 30),
        rect("D", 40, 0, 60),
        rect("E", 40, 70, 90),
    ]

    it("向下找水平中心最接近的按钮，而不是固定偏移", () => {
        // B 的中心是 85：D 中心 30（距离 55），E 中心 115（距离 30），应选 E。
        expect(find_vertical_neighbor(two_rows, "B", "down")).toBe("E")
        // A 的中心是 20：应选 D（中心 30）。
        expect(find_vertical_neighbor(two_rows, "A", "down")).toBe("D")
    })

    it("向上同理", () => {
        // E 的中心是 115：B 中心 85（距离 30），C 中心 145（距离 30，并列取先到者 B）。
        expect(["B", "C"]).toContain(find_vertical_neighbor(two_rows, "E", "up"))
        // D 的中心是 30：应选 A（中心 20）。
        expect(find_vertical_neighbor(two_rows, "D", "up")).toBe("A")
    })

    it("多行时选最近的一行，而不是跳到最远的行", () => {
        const three_rows = [
            rect("A", 0, 0, 60),
            rect("B", 40, 0, 60),
            rect("C", 80, 0, 60),
        ]
        expect(find_vertical_neighbor(three_rows, "C", "up")).toBe("B")
        expect(find_vertical_neighbor(three_rows, "A", "down")).toBe("B")
    })

    it("到达顶部或者底部之后环绕", () => {
        expect(find_vertical_neighbor(two_rows, "A", "up")).toBe("D")   // 顶行向上，环绕到底行
        expect(find_vertical_neighbor(two_rows, "D", "down")).toBe("A") // 底行向下，环绕到顶行
    })

    it("全部按钮同一行时返回 null", () => {
        const one_row = [rect("A", 0, 0, 40), rect("B", 0, 50, 40)]
        expect(find_vertical_neighbor(one_row, "A", "up")).toBe(null)
        expect(find_vertical_neighbor(one_row, "A", "down")).toBe(null)
    })

    it("当前按钮不存在时返回 null", () => {
        expect(find_vertical_neighbor(two_rows, "nope", "down")).toBe(null)
    })

    it("传入目标列时按目标列对齐，而不是当前按钮的中心", () => {
        // 三行：第一行只有右侧的 A，第二行只有左侧的 B，第三行左右各一个。
        // 从 A 出发向下穿过 B，带着 A 的目标列（250）应该落到右侧的 D 而不是左侧的 C。
        const three_rows = [
            rect("A", 0, 200, 100),   // 中心 250
            rect("B", 40, 0, 80),     // 中心 40
            rect("C", 80, 0, 90),     // 中心 45
            rect("D", 80, 200, 100),  // 中心 250
        ]
        expect(find_vertical_neighbor(three_rows, "A", "down")).toBe("B")
        // 不带目标列：以 B 自己的中心（40）比较，落到 C。
        expect(find_vertical_neighbor(three_rows, "B", "down")).toBe("C")
        // 带目标列 250：落到 D，水平位置得以保持。
        expect(find_vertical_neighbor(three_rows, "B", "down", 250)).toBe("D")
    })
})

describe("move_in_flat_list", () => {
    const counts = [2, 0, 3, 1]

    it("顺序前进，跨过空类型", () => {
        expect(move_in_flat_list(counts, [0, 1], 1)).toEqual([2, 0])
    })

    it("顺序后退，从头环绕到尾", () => {
        expect(move_in_flat_list(counts, [0, 0], -1)).toEqual([3, 0])
    })

    it("从尾环绕到头", () => {
        expect(move_in_flat_list(counts, [3, 0], 1)).toEqual([0, 0])
    })

    it("游标非法时回到第一个按钮", () => {
        expect(move_in_flat_list(counts, [1, 0], 1)).toEqual([0, 0])
    })

    it("全部类型为空时原样返回", () => {
        expect(move_in_flat_list([0, 0], [0, 0], 1)).toEqual([0, 0])
    })
})

describe("move_type", () => {
    const counts = [2, 0, 3, 1]

    it("跳到下一个非空类型，保持类型内下标", () => {
        expect(move_type(counts, [0, 1], 1)).toEqual([2, 1])
    })

    it("目标类型太短时下标取末尾", () => {
        expect(move_type(counts, [2, 2], 1)).toEqual([3, 0])
    })

    it("向前跳，环绕", () => {
        expect(move_type(counts, [0, 0], -1)).toEqual([3, 0])
    })

    it("全部类型为空时原样返回", () => {
        expect(move_type([0, 0], [1, 1], 1)).toEqual([1, 1])
    })
})

describe("normalize_cursor", () => {
    const counts = [2, 0, 3]

    it("合法游标原样返回", () => {
        expect(normalize_cursor(counts, [0, 1])).toEqual([0, 1])
    })

    it("落在空类型上时移到第一个非空类型", () => {
        expect(normalize_cursor(counts, [1, 0])).toEqual([0, 0])
    })

    it("类型内下标越界时收回到末尾", () => {
        expect(normalize_cursor(counts, [2, 5])).toEqual([2, 2])
    })

    it("类型下标越界时回到开头", () => {
        expect(normalize_cursor(counts, [-1, 0])).toEqual([0, 0])
    })

    it("全部为空时回到 [0, 0]", () => {
        expect(normalize_cursor([0, 0], [1, 1])).toEqual([0, 0])
    })
})

describe("clamp", () => {
    it("区间内不变，越界收回", () => {
        expect(clamp(5, 0, 10)).toBe(5)
        expect(clamp(-1, 0, 10)).toBe(0)
        expect(clamp(11, 0, 10)).toBe(10)
    })
})
