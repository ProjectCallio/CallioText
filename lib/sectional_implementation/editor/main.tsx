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
    onFocusChange   ?: (editor?: EditorComponent)=>void
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
    let init_parameters = init_property?.parameters || {}

    return <Box sx={{
        marginY: "1rem", 
        border: "1px solid", 
        marginX: "0.5rem", 
        display: "flex",
        flexDirection: "column",
    }}>
        <AppBar position="static" elevation={0} sx={{
            borderBottom: "1px solid",
            borderColor: "divider"
        }}>
            <Toolbar variant="dense">
                <EditorStructureTypography variant="subtitle1">
                    小节
                </EditorStructureTypography>
            </Toolbar>
        </AppBar>
        <EditorComponentEditingBox><EditorComponent
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
    </Box>
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
class SectionalEditorComponent extends React.Component <SectionalEditorComponentprops, {
    sections: AbstractNode[]
    cur_editor: EditorComponent | undefined
}> {    
    onUpdate: (newval: Node[]) => void
    onFocusChange: ()=>void
    onSave: ()=> void

    constructor(props: SectionalEditorComponentprops) {
        super(props)

        this.onUpdate       = props.onUpdate || ((newval: Node[])=>{})
        this.onFocusChange  = props.onFocusChange || (()=>{})
        this.onSave         = props.onSave || (()=>{})

        this.state = {
            sections: props.init_sections || [], 
            cur_editor: undefined , 
        }
    }

    // TODO 应该添加一个组件来增加小节
    render() {
    
        let me                  = this
        let config              = make_editorconfig(this.props.config)

        let init_sections = me.props.init_sections || []

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
                    init_node           = {init_sections.find(n=>n.idx === section.idx)}

                    onUpdate            = {me.props.onUpdate}
                    onKeyPress          = {me.props.onKeyPress}
                    onFocusChange       = {(editor?: EditorComponent)=>{
                        if(editor && editor !== me.state.cur_editor){
                            me.setState({
                                cur_editor: editor
                            })
                        }
                        me.onFocusChange()
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
}
