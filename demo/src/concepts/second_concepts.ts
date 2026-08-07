/** 二级概念定义。
 * 二级概念给一级概念提供的机制配上具体的词汇：固定一部分参数、给其余参数换上默认值。
 * 中英文各有一套词汇表，按当前语言导出其中一套。
*/
import {
    SecondClassConcept ,
    ParameterValue ,
} from "@project-callio/calliotext"
import { LANG } from "../lang"

export {
    second_concepts ,
    CN ,
}

function s(val: string): ParameterValue{
    return {type: "string", val}
}
function b(val: boolean): ParameterValue{
    return {type: "boolean", val}
}
function n(val: number): ParameterValue{
    return {type: "number", val}
}
/** 函数参数：印刷时以处理后的参数列表为入参求值。 */
function fn(src: string){
    return {type: "function" as const, val: src}
}
function choice(val: string, choices: string[]): ParameterValue{
    return {type: "string", val, choices}
}

/** 当前语言下各概念的名称，供构造文档时引用。 */
const names = {
    en: {
        theorem: "Theorem", definition: "Definition", proof: "Proof", remark: "Remark",
        item: "Item", quote: "Quote", code: "Code", mathblock: "Math", subsection: "Subsection",
        emphasis: "Emphasis", strikeout: "Strikeout", link: "Link", math: "Math",
        figure: "Figure", section: "Section", end: "End", columns: "Columns", footnote: "Footnote",
    },
    zh: {
        theorem: "命题", definition: "定义", proof: "证明", remark: "注",
        item: "列项", quote: "引文", code: "代码", mathblock: "数学", subsection: "次节",
        emphasis: "强调", strikeout: "删除", link: "链接", math: "数学",
        figure: "图", section: "小节", end: "章末", columns: "分栏", footnote: "脚注",
    },
} as const

const CN = names[LANG]

const theorem_categories = {
    en: ["Theorem", "Lemma", "Corollary", "Proposition", "Claim"],
    zh: ["定理", "引理", "推论", "命题", "断言"],
}[LANG]

const theorem_default_category = {en: "Theorem", zh: "命题"}[LANG]

const second_concepts: SecondClassConcept[] = [
    // 命题类：题头和编号跟随 category 参数，别名（比如定理的名字）作为前缀展示。
    new SecondClassConcept({type: "group", first_concept: "primary", name: CN.theorem,
        fixed_override: {
            label   : fn("p=>p.category.val"),
            title   : fn("p=>p.category.val"),
            prefix  : fn("p=>p.alias.val"),
            ordering: s("head"),
        },
        default_override: {
            alias   : s(""),
            category: choice(theorem_default_category, [...theorem_categories]),
        },
    }),
    new SecondClassConcept({type: "group", first_concept: "primary", name: CN.definition,
        fixed_override: {
            label   : s(CN.definition),
            title   : s(CN.definition),
            prefix  : fn("p=>p.alias.val"),
            ordering: s("head"),
        },
        default_override: {
            alias: s(""),
        },
    }),
    new SecondClassConcept({type: "group", first_concept: "attached", name: CN.proof,
        fixed_override: {
            label   : s(CN.proof),
            title   : s(CN.proof),
            close   : s("∎"),
            ordering: s("none"),
        },
    }),
    new SecondClassConcept({type: "group", first_concept: "attached", name: CN.remark,
        fixed_override: {
            label   : s(CN.remark),
            title   : s(CN.remark),
            ordering: s("head"),
        },
    }),
    new SecondClassConcept({type: "group", first_concept: "item", name: CN.item,
        fixed_override: {
            label   : s(CN.item),
            ordering: s("discuss"),
        },
    }),
    new SecondClassConcept({type: "group", first_concept: "mount", name: CN.quote,
        fixed_override: {
            label: s(CN.quote),
        },
        default_override: {
            title: s(""),
            close: s(""),
            long : b(false),
        },
    }),
    new SecondClassConcept({type: "group", first_concept: "formatted", name: CN.code,
        fixed_override: {
            label: s(CN.code),
        },
    }),
    new SecondClassConcept({type: "group", first_concept: "mathblock", name: CN.mathblock,
        fixed_override: {
            label: s(CN.mathblock),
        },
        default_override: {
            environ: s("align"),
            suffix : s(""),
        },
    }),
    new SecondClassConcept({type: "group", first_concept: "subsection", name: CN.subsection,
        fixed_override: {
            label: s(CN.subsection),
        },
        default_override: {
            title   : s(""),
            ordering: s("head"),
        },
    }),

    new SecondClassConcept({type: "inline", first_concept: "strong", name: CN.emphasis,
        fixed_override: {label: s(CN.emphasis)},
    }),
    new SecondClassConcept({type: "inline", first_concept: "delete", name: CN.strikeout,
        fixed_override: {label: s(CN.strikeout)},
    }),
    new SecondClassConcept({type: "inline", first_concept: "link", name: CN.link,
        fixed_override: {label: s(CN.link)},
        default_override: {
            target: s(""),
            autotext: b(false),
        },
    }),
    new SecondClassConcept({type: "inline", first_concept: "math", name: CN.math,
        fixed_override: {label: s(CN.math)},
    }),

    new SecondClassConcept({type: "support", first_concept: "image", name: CN.figure,
        fixed_override: {label: s(CN.figure)},
        default_override: {
            target: s(""),
            width : n(10),
            height: n(-1),
        },
    }),
    new SecondClassConcept({type: "support", first_concept: "sectioner", name: CN.section,
        fixed_override: {label: s(CN.section)},
        default_override: {
            title: s(""),
            alone: b(false),
        },
    }),
    new SecondClassConcept({type: "support", first_concept: "ender", name: CN.end,
        fixed_override: {label: s(CN.end)},
    }),

    new SecondClassConcept({type: "structure", first_concept: "columns", name: CN.columns,
        fixed_override: {label: s(CN.columns)},
        default_override: {widths: s("1,1")},
    }),

    new SecondClassConcept({type: "abstract", first_concept: "note", name: CN.footnote,
        fixed_override: {label: s(CN.footnote)},
    }),
]
