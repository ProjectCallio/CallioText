/** 一级概念定义。
 * 一级概念是机制：它规定一类节点有哪些参数、如何渲染。
 * 具体的词汇（Theorem、定理这些）由二级概念提供，见 second_concepts.ts。
*/
import {
    FirstClassConcept ,
    ParameterValue ,
    ParameterList ,
} from "@project-callio/calliotext"

export {
    first_concepts ,

    primary_style ,
    attached_style ,
    item_style ,
    mathblock_style ,
    mount_style ,
    display_style ,
    formatted_style ,
    subsection_style ,
    strong_style ,
    delete_style ,
    link_style ,
    mathinline_style ,
    image_style ,
    sectioner_style ,
    ender_style ,
    columns_style ,
    note_style ,
}

/** 自动为原始值添加参数类型标注。 */
function make_param(parameters: {[key: string]: string | number | boolean | ParameterValue}): ParameterList{
    const ret: ParameterList = {}
    for(const x in parameters){
        const v = parameters[x]
        if(typeof v == "string"){
            ret[x] = {type: "string", val: v}
        }
        else if(typeof v == "number"){
            ret[x] = {type: "number", val: v}
        }
        else if(typeof v == "boolean"){
            ret[x] = {type: "boolean", val: v}
        }
        else{
            ret[x] = v
        }
    }
    return ret
}

/** 大部分组概念共享的参数：题头、前后缀与编号格式。
 * `title`附着在文本之外（比如定理的题头），`prefix`则是接在文本开头的一小段。
*/
const words_params = {
    prefix: "",
    suffix: "",
    title:  "",
    close:  "",
    ordering: {
        val: "none",
        type: "string" as const,
        choices: [
            "head" ,                // 一 / 1
            "list-chaining" ,       // 1)
            "list-separating" ,     // [1]
            "discuss" ,             // ①
            "title" ,               // 【一】 / 1.
            "none" ,
        ],
    },
}

/** 一段需要突出展示的话，比如定理或者定义。 */
const primary_style = new FirstClassConcept({type: "group", name: "primary",
    parameter_prototype: make_param({
        ...words_params,
        label: "primary",
    }),
})

/** 附属于上文的一段话，比如证明或者注记。 */
const attached_style = new FirstClassConcept({type: "group", name: "attached",
    parameter_prototype: make_param({
        ...words_params,
        label: "attached",
    }),
})

/** 正文中处于附属地位的条目，通常带编号，比如列举的条件。 */
const item_style = new FirstClassConcept({type: "group", name: "item",
    parameter_prototype: make_param({
        ...words_params,
        label: "item",
        clustering: false , // 是否对分离的节点连续编号。
    }),
})

/** 块级数学公式。 */
const mathblock_style = new FirstClassConcept({type: "group", name: "mathblock",
    parameter_prototype: make_param({
        ...words_params,
        label: "mathblock",
        environ: "align" , // 默认的 LaTeX 环境。
    }),
})

/** 正式的整体展示，比如引用一段话。 */
const mount_style = new FirstClassConcept({type: "group", name: "mount",
    parameter_prototype: make_param({
        ...words_params,
        label: "mount",
        long: false , // 长文本靠左，短文本居中。
    }),
})

/** 放大展示一个片段，以供剖析。 */
const display_style = new FirstClassConcept({type: "group", name: "display",
    parameter_prototype: make_param({
        ...words_params,
        label: "display",
    }),
})

/** 有固定格式的文本，比如代码。 */
const formatted_style = new FirstClassConcept({type: "group", name: "formatted",
    parameter_prototype: make_param({
        ...words_params,
        label: "formatted",
        format: "",
    }),
})

/** 小节内部的小小节。 */
const subsection_style = new FirstClassConcept({type: "group", name: "subsection",
    parameter_prototype: make_param({
        label: "subsection",
        title: "",
        ordering: words_params.ordering,
    }),
})

const strong_style = new FirstClassConcept({type: "inline", name: "strong",
    parameter_prototype: make_param({
        label: "strong",
    }),
})

const delete_style = new FirstClassConcept({type: "inline", name: "delete",
    parameter_prototype: make_param({
        label: "delete",
    }),
})

/** 链接。target 是 URL 时是普通外链；是文档内节点的 idx 时是内部引用，
 * 点击滚动到目标，autotext 为真时文字由被引节点的编号自动生成。
*/
const link_style = new FirstClassConcept({type: "inline", name: "link",
    parameter_prototype: make_param({
        label: "link",
        target: "",
        autotext: false,
    }),
})

/** 行内数学公式。 */
const mathinline_style = new FirstClassConcept({type: "inline", name: "math",
    parameter_prototype: make_param({
        label: "math",
    }),
})

const image_style = new FirstClassConcept({type: "support", name: "image",
    parameter_prototype: make_param({
        label: "image",
        target: "",
        width: 10,
        height: -1,
    }),
    meta_parameters: {force_inline: true},
})

/** 小节线：开启一个新的小节。 */
const sectioner_style = new FirstClassConcept({type: "support", name: "sectioner",
    parameter_prototype: make_param({
        label: "sectioner",
        title: "",
        alone: false , // 唯一的小节不显示编号。
    }),
})

/** 章节线：标记全文的结尾。 */
const ender_style = new FirstClassConcept({type: "support", name: "ender",
    parameter_prototype: make_param({
        label: "ender",
    }),
})

/** 多栏排版。 */
const columns_style = new FirstClassConcept({type: "structure", name: "columns",
    parameter_prototype: make_param({
        label: "columns",
        widths: "1,1" , // 各栏的宽度比。
    }),
})

/** 抽象节点：附着在概念节点上的隐藏内容，比如脚注。 */
const note_style = new FirstClassConcept({type: "abstract", name: "note",
    parameter_prototype: make_param({
        label: "note",
    }),
})

const first_concepts = [
    primary_style ,
    attached_style ,
    item_style ,
    mathblock_style ,
    mount_style ,
    display_style ,
    formatted_style ,
    subsection_style ,
    strong_style ,
    delete_style ,
    link_style ,
    mathinline_style ,
    image_style ,
    sectioner_style ,
    ender_style ,
    columns_style ,
    note_style ,
]
