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
} from "../../default_implementation/editor/uibase"
import { 
    ScrollBarBox , 
} from "../../uibase"

import {
    set_normalize_status , 
    get_normalize_status , 

    slate_is_concept , 

    EditorPlugin , 
} from "../../editor"


export { SectionalEditorComponent }

function AbstractEditor({
    editorcore,
    plugin,
    init_node,  

    onUpdate,
    onKeyPress,
    onFocusChange,
    onKeyDown,
    onKeyUp,
}:{
    editorcore      :  EditorCore
    plugin          ?: EditorPlugin
    init_node       ?: AbstractNode 

    onUpdate        ?: (newval: Node[]) => void
    onKeyPress      ?: (e: React.KeyboardEvent<HTMLDivElement>) => void
    onFocusChange   ?: ()=>void
    onKeyDown       ?: (e: React.KeyboardEvent<HTMLDivElement>) => void
    onKeyUp         ?: (e: React.KeyboardEvent<HTMLDivElement>) => void
}){
    let init_children: AbstractNode["children"] | undefined = undefined
    let init_property: Omit<AbstractNode , "children"> | undefined = undefined

    if(init_node){
        let {children , ...property} = init_node
        init_children = children
        init_property = property
    }

    return <EditorComponentEditingBox><EditorComponent

        editorcore          = {editorcore}
        plugin              = {plugin}
        init_rootchildren   = {init_children}
        init_rootproperty   = {init_property}

        onUpdate            = {onUpdate}
        onKeyPress          = {onKeyPress}
        onFocusChange       = {onFocusChange}

        onKeyDown           = {onKeyDown}
        onKeyUp             = {onKeyUp}
    /></EditorComponentEditingBox>
}


type SectionalEditorComponentprops = {

    editorcore: EditorCore 

    plugin?: EditorPlugin

    /** 节点树更新时的回调。 */
    onUpdate?: (v: any) => void

    /** 按键按下的回调。 */
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 按键弹起的回调。 */
    onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 按键按下弹起的回调。 */
    onKeyPress?: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 改变光标位置的回调。 */
    onFocusChange?: ()=>void

    init_tree?: AbstractNode[]

    
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
class SectionalEditorComponent extends React.Component <SectionalEditorComponentprops, {
    sections: AbstractNode[]
}> {    
    onUpdate: (newval: Node[]) => void
    onFocusChange: ()=>void
    onSave: ()=> void

    constructor(props: SectionalEditorComponentprops) {
        super(props)

        this.onUpdate = props.onUpdate || ((newval: Node[])=>{})
        this.onFocusChange  = props.onFocusChange || (()=>{})
        this.onSave = props.onSave || (()=>{})


        this.state = {
            sections: props.init_tree || [],
        }
    }

    // TODO 应该添加一个组件来增加小节
    render() {
    
        let me                  = this
        let config              = make_editorconfig(this.props.config)

        let init_tree = me.props.init_tree || []

        return <EditorConfigContext.Provider value={config}><EditorBackgroundPaper>
        <KeyEventManager
            spaces = {[]}
            non_space_oprations = {[
                {
                    key: "s" , 
                    on_activate: ()=>{me.onSave()}
                }
            ]}
        ><ScrollBarBox key="area-scroll-1" sx = {{ 
            overflow: "auto" , 
            width: "100%" , 
            paddingRight: "1%" , 
            flex: 1 , 
        }}><KeyDownUpFunctionProxy.Consumer>{([onkeydown , onkeyup])=>{
            return me.state.sections.map((section: AbstractNode)=>{
                return <AbstractEditor 
                    key = {`abstracteditor-${section.idx}`}

                    editorcore          = {me.props.editorcore}
                    plugin              = {me.props.plugin}
                    init_node           = {init_tree.find(n=>n.idx === section.idx)}

                    onUpdate            = {me.props.onUpdate}
                    onKeyPress          = {me.props.onKeyPress}
                    onFocusChange       = {me.onFocusChange}
                    
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
}
