/** 
 * 这个文件提供一个开箱即用的editor示例。
 * @module
 */
import React  from "react"

import {
    Accordion , 
    AccordionSummary , 
    Toolbar , 
    Typography , 
    Button , 
    Box , 
    Paper ,
    Divider , 
    Popover , 
    AppBar , 
} from "@mui/material"

import * as Slate from "slate"
import * as SlateReact from "slate-react"
import {
    EditorComponent , 
    EditorCore, 
    EditorComponentProps , 
} from "../../editor"
import {
    ConceptNode , 
    GroupNode , 
    Node , 
    AllConceptTypes , 
    AllNodeTypes, 
    AbstractNode,

    is_concetnode,
} from "../../core"

import { 
    AutoStack , 
    AutoTooltip , 
    AutoStackedPopper , 
    AutoStackButtons , 
} from "../../uibase"
import {
    object_foreach , 
    merge_object ,

} from "../../utils"

import {
    KeyEventManager , 
    MouselessElement , 
    KeyDownUpFunctionProxy , 
    DirectionKey, 
} from "../../uibase/mouseless"

import { 
    EditorBackgroundPaper , 
    EditorComponentEditingBox  ,
    EditorConfigContext , 
    make_editorconfig , 
    EditorConfig , 
    PartialEditorConfig , 
    EditorStructureTypography , 
} from "../../default_implementation/editor/uibase"
import {
    ButtonGroup , 
} from "../../implbase/buttons"
import { 
    ScrollBarBox , 
} from "../../uibase"

import {
    set_normalize_status , 
    get_normalize_status , 

    slate_is_concept , 

    EditorPlugin , 
} from "../../editor"
import {
    Area , 
    UseAreaStore , 
} from "../areas"

import {
    AbstractEditor , 
} from "./section"

export { SectionalEditorComponent }


type SectionalEditorComponentprops = {

    editorcore: EditorCore 

    plugin?: EditorPlugin

    /** 节点树更新时的回调。 */
    onUpdate?: (v: any) => void

    /** 按键按下的回调。 */
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 按键弹起的回调。 */
    onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 改变光标位置的回调。 */
    onFocusChange?: ()=>void

    init_sections?: AbstractNode[]

    
    config?: PartialEditorConfig
    extra_buttons?: any
    onSave?: ()=>void // 保存时操作。

    sidebar_extra?: (editor: EditorComponent)=>{
        button: React.ReactElement
        run: ()=>void
    }[]
}

/** 
 * 这个组件提供一个开箱即用的默认编辑器组件。
 */

function SectionalEditorComponent({
    editorcore,
    plugin,
    onUpdate,
    onKeyDown,
    onKeyUp,
    onFocusChange,
    config,
    extra_buttons,
    onSave,
    sidebar_extra,
    init_sections = [],
}: SectionalEditorComponentprops){

    let myconfig = make_editorconfig(config)

    let [sections, set_sections] = React.useState<AbstractNode[]>(init_sections || [])
    let cur_editor = UseAreaStore(state => state.editor)
    let set_cur_editor = UseAreaStore(state => state.set_editor)


    return <EditorConfigContext.Provider value={myconfig}><EditorBackgroundPaper>
    <KeyEventManager
        spaces = {[]}
        non_space_oprations = {[
            {
                key: "s" , 
                on_activate: ()=>{onSave && onSave()}
            }
        ]}
    ><ScrollBarBox key="area-scroll-1" sx = {{ 
        overflow: "auto" , 
        width: "100%" , 
        paddingRight: "1%" , 
        flex: 1 , 
    }}><KeyDownUpFunctionProxy.Consumer>{([onkeydown , onkeyup])=>{
        return sections.map((section: AbstractNode)=>{
            return <AbstractEditor 
                key = {`abstracteditor-${section.idx}`}

                editorcore          = {editorcore}
                plugin              = {plugin}
                init_node           = {init_sections.find(n=>n.idx === section.idx)}

                onUpdate            = {onUpdate}
                onFocusChange       = {(editor)=>{
                    if(editor && editor !== cur_editor){
                        set_cur_editor(editor)
                    }
                    onFocusChange && onFocusChange()
                }}
                
                onKeyDown           = {onkeydown}
                onKeyUp             = {onkeyup}
            />
        }) 
    }}</KeyDownUpFunctionProxy.Consumer>
    </ScrollBarBox>
    </KeyEventManager>
    </EditorBackgroundPaper>
    </EditorConfigContext.Provider>
}
