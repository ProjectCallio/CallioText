/** 编号格式化等纯工具函数。编号随语言变化：中文用汉字数字，英文用阿拉伯数字。 */
import { LANG } from "./lang"

export {
    num2chinese ,
    rem2num ,
    num2rem ,
    remtimes ,
    make_order_str ,
    make_section_ref ,
}

function num2chinese(number: number, map?: string[]){
    if(map == undefined){
        map = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"]
    }
    return `${number}`.split("").map((x: string)=>(map as string[])[Number(x)]).join("")
}

/** 将`xxxrem`形式的字符串转换成数字。 */
function rem2num(rem: string){
    return Number(rem.slice(0, rem.length - 3))
}

/** 将数字转换成`"xxxrem"`形式的字符串。 */
function num2rem(num: number){
    return `${num}rem`
}

/** 将`xxxrem`形式的字符串乘以数字。 */
function remtimes(rem: string, num: number){
    return num2rem(rem2num(rem) * num)
}

const CIRCLED = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳"]

/** 根据给定的编号和编号格式，生成编号字符串。 */
function make_order_str(order: number, ordering: string): string{
    if(ordering == "head"){
        return LANG == "zh" ? num2chinese(order) : `${order}`
    }
    if(ordering == "discuss"){
        if(order > 0 && order <= 20){
            return CIRCLED[order - 1]
        }
        return `(${order})`
    }
    if(ordering == "title"){
        return LANG == "zh" ? `【${num2chinese(order)}】` : `${order}.`
    }
    if(ordering == "list-separating"){
        return `[${order}]`
    }
    if(ordering == "list-chaining"){
        return `${order})`
    }
    return ""
}

/** 小节的编号文本，用于小节线和对小节的引用。 */
function make_section_ref(order: number): string{
    return LANG == "zh" ? `第${num2chinese(order)}节` : `Section ${order}`
}
