/** 这个模块集中存放默认实现界面上出现的全部文字。
 * 做法和 editorconfig 一致：默认给一套中文，使用者通过 `DefaultEditorComponent` 的
 * `texts` 参数部分覆盖。库本身不引入任何 i18n 框架，
 * 使用者用自己那套 i18n 把翻译好的字符串喂进来即可。
 * @module
*/
import * as React from "react"

import {
    merge_object ,
} from "../utils"
import {
    MyPartial ,
} from "../uibase"

export {
    EditorTextsContext ,
    default_editortexts ,
    make_editortexts ,
    useTexts ,
}
export type {
    EditorTexts ,
    PartialEditorTexts ,
}

interface EditorTexts {
    /** 按钮上的提示文字。 */
    buttons: {
        /** 打开参数抽屉。 */
        edit_parameters: string

        /** 删除节点及其内容。 */
        delete_node: string

        /** 删除节点但保留内容。 */
        unwrap_node: string

        /** 在节点前插入空段落。 */
        add_paragraph_above: string

        /** 在节点后插入空段落。 */
        add_paragraph_below: string

        /** 复制节点及其子树。 */
        copy_node: string

        /** 切换与上一个节点分离还是接排。 */
        chain_switch: string

        /** 给节点挂一个抽象节点。 */
        new_abstract: string

        /** 展开折叠起来的按钮组。 */
        expand: string

        /** 关闭抽屉并应用改动。 */
        close_and_apply: string

        /** 应用参数面板里的改动。 */
        apply_parameters: string

        /** 按键提示的总开关。 */
        show_hint: string

        /** 开关「修改参数」面板。 */
        parameter_area: string

        /** 开关「插入概念」面板。 */
        concept_area: string

        /** 删除一个抽象节点。 */
        delete_abstract: string

        /** 删除抽象节点前的二次确认。 */
        confirm_delete_abstract: string
    }

    /** 两个浮动面板上的文字。 */
    areas: {
        /** 「插入概念」面板的标题。 */
        concept_title: string

        /** 「修改参数」面板的标题。 */
        parameter_title: string

        /** 概念面板里各节的标题，按概念类型分。 */
        concept_types: {
            group: string
            inline: string
            support: string
            structure: string
        }
    }

    /** 操作之后弹出的提示。 */
    messages: {
        /** 抽象编辑器保存成功。 */
        save_success: string

        /** 参数已应用。 */
        parameters_applied: string

        /** 失去焦点后自动应用了参数。 */
        parameters_auto_applied: string

        /** 参数面板保存成功。 */
        parameters_saved: string
    }
}

type PartialEditorTexts = MyPartial<EditorTexts>

const default_editortexts: EditorTexts = {
    buttons: {
        edit_parameters         : "设置参数" ,
        delete_node             : "删除组件" ,
        unwrap_node             : "解除组件" ,
        add_paragraph_above     : "向上添加段落" ,
        add_paragraph_below     : "向下添加段落" ,
        copy_node               : "复制此节点" ,
        chain_switch            : "贴贴" ,
        new_abstract            : "新建抽象" ,
        expand                  : "展开" ,
        close_and_apply         : "关闭并应用" ,
        apply_parameters        : "应用参数修改" ,
        show_hint               : "显示提示" ,
        parameter_area          : "参数区域" ,
        concept_area            : "概念区域" ,
        delete_abstract         : "删除" ,
        confirm_delete_abstract : "确定删除" ,
    } ,
    areas: {
        concept_title  : "插入概念" ,
        parameter_title: "修改参数" ,
        concept_types: {
            group    : "组" ,
            inline   : "行内" ,
            support  : "支持" ,
            structure: "结构" ,
        } ,
    } ,
    messages: {
        save_success           : "保存成功" ,
        parameters_applied     : "已应用参数" ,
        parameters_auto_applied: "已自动应用参数" ,
        parameters_saved       : "修改参数成功" ,
    } ,
}

const EditorTextsContext = React.createContext<EditorTexts>(default_editortexts)

function make_editortexts(texts: PartialEditorTexts = {}): EditorTexts{
    return merge_object(default_editortexts, texts)
}

function useTexts(){
    return React.useContext(EditorTextsContext)
}
