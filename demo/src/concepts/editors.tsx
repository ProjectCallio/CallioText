/** 各个一级概念的编辑渲染器。 */
import React from "react"
import { useSnackbar } from "notistack"

import {
    get_deafult_group_editor_with_appbar ,
    get_default_group_editor_with_rightbar ,
    get_default_inline_editor ,
    get_default_abstract_editor ,
    get_default_editors ,
    get_default_struct_editor_with_rightbar ,
    get_default_spliter_editor ,
    get_default_display_editor ,

    useNode ,
    useParameters ,
    UniversalExtra ,
} from "@project-callio/calliotext"

import { LANG } from "../lang"
import { CN } from "./second_concepts"

export {
    editors ,
    default_editors ,
}

const colon = LANG == "zh" ? "：" : ": "

const primary_editor = get_deafult_group_editor_with_appbar({
    get_label: ()=>useParameters().category || useParameters().title,
})
const subsection_editor = get_deafult_group_editor_with_appbar({
    get_label: ()=>`${CN.subsection}${colon}${useParameters().title}`,
})
const attached_editor  = get_default_group_editor_with_rightbar({})
const item_editor      = get_default_group_editor_with_rightbar({})
const mount_editor     = get_default_group_editor_with_rightbar({})
const display_editor   = get_default_group_editor_with_rightbar({})
const formatted_editor = get_default_group_editor_with_rightbar({})

const sectioner_editor = get_default_spliter_editor({get_title: ()=>useParameters().title})
const ender_editor     = get_default_spliter_editor({get_title: ()=>CN.end})

const strong_editor = get_default_inline_editor({})
const delete_editor = get_default_inline_editor({surrounder: (props)=><del>{props.children}</del>})

/** 链接编辑器：右侧的小输入框直接编辑 target 参数。 */
const link_editor = get_default_inline_editor({
    surrounder: (props)=><u>{props.children}</u>,
    rightbar_extra: () => (<UniversalExtra
        variation = "filled"
        width = "7rem"
        extra_small
        onDeactivate={(value, editor, node)=>{
            editor.set_node(node, {parameters: {
                ...node.parameters,
                target: {
                    val: value,
                    type: "string" as const,
                },
            }})
        }}
        onNodeChange={(node, prev_node)=>{
            if(node.parameters === prev_node?.parameters){
                return undefined // 不改变。
            }
            return node.parameters.target.val as string
        }}
    />),
})

const mathinline_editor = get_default_inline_editor({surrounder: (props)=><>{props.children}</>})

/** 块级数学的右侧小输入框编辑 suffix 参数（显示在公式尾部的文字）。 */
function MathExtra(){
    const { enqueueSnackbar } = useSnackbar()
    return (<UniversalExtra width={"4rem"}
        onDeactivate={(value, editor, node)=>{
            editor.set_node(node, {parameters: {
                ...node.parameters,
                suffix: {
                    val: value,
                    type: "string" as const,
                },
            }})
            enqueueSnackbar(LANG == "zh" ? "已自动设置" : "Applied.", {variant: "success"})
        }}
        onNodeChange={(node)=>{
            return node.parameters.suffix.val as string
        }}
    />)
}

const mathblock_editor = get_default_group_editor_with_rightbar({
    rightbar_extra: MathExtra,
})

/** 图片编辑器：右侧的小输入框编辑图片地址，也接受直接粘贴图片。 */
const image_editor = get_default_display_editor({
    get_label: ()=>CN.figure,
    is_empty: (n, p)=>!(p.target),
    rightbar_extra: () => (<UniversalExtra
        variation = "filled"
        width = "7rem"
        extra_small
        accept_image
        onDeactivate={(value, editor, node)=>{
            if(!value){
                return
            }
            editor.set_node(node, {parameters: {
                ...node.parameters,
                target: {
                    val: value,
                    type: "string" as const,
                },
            }})
        }}
        onNodeChange={(node, prev_node)=>{
            if(node.parameters === prev_node?.parameters){
                return undefined // 不改变。
            }
            return node.parameters.target.val as string
        }}
    />),
    render_element: () => {
        useNode()
        const parameters = useParameters()
        const target = parameters.target as string
        const height = parameters.height as number
        const width  = parameters.width as number

        return <img src={target || undefined} style={{
            width : width  > 0 ? `${width}rem`  : "100%",
            height: height > 0 ? `${height}rem` : "100%",
            maxWidth: "100%",
        }}/>
    },
})

const columns_editor = get_default_struct_editor_with_rightbar({
    get_label: ()=>(LANG == "zh" ? "栏" : "column"),
    get_numchildren: (n, p) => {
        const widths_str = p.widths as string
        return widths_str.split(",").length
    },
    get_widths: (n, p) => {
        const widths_str = p.widths as string
        return widths_str.split(",").map(x=>parseInt(x))
    },
})

const note_editor = get_default_abstract_editor({get_label: ()=>CN.footnote})

const editors = {
    "group": {
        "primary"   : primary_editor ,
        "attached"  : attached_editor ,
        "item"      : item_editor ,
        "mathblock" : mathblock_editor ,
        "mount"     : mount_editor ,
        "display"   : display_editor ,
        "formatted" : formatted_editor ,
        "subsection": subsection_editor ,
    },
    "inline": {
        "strong": strong_editor ,
        "delete": delete_editor ,
        "link"  : link_editor ,
        "math"  : mathinline_editor ,
    },
    "structure": {
        "columns": columns_editor ,
    },
    "support": {
        "image"    : image_editor ,
        "sectioner": sectioner_editor ,
        "ender"    : ender_editor ,
    },
    "abstract": {
        "note": note_editor ,
    },
}

const default_editors = get_default_editors()
