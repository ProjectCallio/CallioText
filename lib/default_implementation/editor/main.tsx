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
    DefaultParameterEditButton , 
    DefaultRootParameterEditButton , 
} from "./buttons"
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
} from "./uibase"
import { 
    ScrollBarBox , 
} from "../../uibase"

import {
    set_normalize_status , 
    get_normalize_status , 
} from "../../editor/plugins"
import {
    slate_is_concept , 
} from "../../editor/utils"

import {
    DefaultSidebar , 
    get_mouseless_space as sidebar_get_mouseless_space , 
} from "./sidebar"
import {
    get_mouseless_space as buttons_get_mouseless_space
} from "../../implbase/buttons"

import {
    ParameterEdit
} from "./editbox"

import {
    UseAreaStore as useAreaStore, 
} from "../areas"

import {
    IdxConflictSolver , 
} from "./idxconflict_solver"

export { DefaultEditorComponent }

type DefaultEditorComponentprops = EditorComponentProps & {
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
class DefaultEditorComponent extends React.Component <DefaultEditorComponentprops, {
    editor_ready: boolean
}> {    
    onUpdate: (newval: Node[]) => void
    onFocusChange: ()=>void
    onSave: ()=> void

    parameteredit_ref: React.RefObject<ParameterEdit | null>
    editor_ref       : React.RefObject<EditorComponent | null>

    constructor(props: DefaultEditorComponentprops) {
        super(props)


        this.onUpdate = props.onUpdate || ((newval: Node[])=>{})
        this.onFocusChange  = props.onFocusChange || (()=>{})
        this.onSave = props.onSave || (()=>{})

        this.parameteredit_ref  = React.createRef<ParameterEdit | null>()
        this.editor_ref         = React.createRef<EditorComponent | null>()

        this.state = {
            editor_ready: false,
        }

        this.get_editor       = this.get_editor.bind(this)
    }

    get_editor(){
        return this.editor_ref?.current || undefined
    }

    get_root(): AbstractNode | undefined{
        return this.get_editor()?.get_root()
    }

    render() {
    
        let paper_widths  = {xs: "88%" , md: "91%" , xl: "93%"} // 纸张的宽度，
        let paper_right   = {xs: "89%" , md: "92%" , xl: "94%"} // 纸张的宽度，
        let toolbar_width = {xs: "10%" , md: "7%"  , xl: "5%" } // 工具栏的宽度。

        let me                  = this
        let config              = make_editorconfig(this.props.config)

        // 当焦点发生变化时，更新parameteredit_ref
        let onFocusChange = ()=>{
            me.props.onFocusChange && me.props.onFocusChange()
            me.parameteredit_ref?.current?.try_update()
        }

        return <EditorConfigContext.Provider value={config}>
        <IdxConflictSolver get_editor={me.get_editor}>{(conflictcheck: ()=>void)=>{
            return <EditorBackgroundPaper>
            <KeyEventManager
                spaces = {[
                    sidebar_get_mouseless_space() , 
                    buttons_get_mouseless_space(me.get_editor) , 
                ]}
                non_space_oprations = {[
                    {
                        key: "s" , 
                        on_activate: ()=>{me.onSave()}
                    }
                ]}
            >
                <Box key="area-1" sx = {{ 
                    position: "absolute" , 
                    top: "1%" , 
                    height: "98%", 
                    width: paper_widths, 
                    display: "flex" ,
                    flexDirection: "column" , 
                    border: "1px solid ",
                    left: "1%",
                }}>
                    <ScrollBarBox key="area-scroll-1" sx = {{ 
                        overflow: "auto" , 
                        width: "100%" , 
                        paddingRight: "1%" , 
                        flex: 1 , 
                    }}><EditorComponentEditingBox>
                        <KeyDownUpFunctionProxy.Consumer>{([onkeydown , onkeyup])=>{
                            return <EditorComponent
                                ref 		        = {(editor: EditorComponent)=>{
                                    me.editor_ref.current = editor
                                    if(!me.state.editor_ready){
                                        // 强制刷新一下
                                        me.setState({editor_ready: true})
                                    }
                                }} 

                                editorcore          = {me.props.editorcore}
                                plugin              = {me.props.plugin}
                                init_rootchildren   = {me.props.init_rootchildren}
                                init_rootproperty   = {me.props.init_rootproperty}

                                onKeyPress          = {me.props.onKeyPress}
                                onUpdate            = {(v: any)=>{
                                    me.props.onUpdate && me.props.onUpdate(v)
                                    conflictcheck()
                                }}
                                onFocusChange       = {(e)=>{
                                    onFocusChange()

                                    let editor = me.get_editor()
                                    if(editor){
                                        let slate = editor.get_slate()    
                                        useAreaStore.getState().set_selection(slate.selection)
                                        useAreaStore.getState().set_editor(editor)
                                    }
                                }}
                                
                                onKeyDown           = {onkeydown}
                                onKeyUp             = {onkeyup}
                            />
                        }}
                        </KeyDownUpFunctionProxy.Consumer>
                    </EditorComponentEditingBox></ScrollBarBox>
                </Box>

                <Box key="area-2" sx = {{
                    position: "absolute", 
                    top: "1%" , 
                    height: "99%", 
                    left: paper_right, 
                    width: toolbar_width,
                }}>{(()=>{
                    let root   = me.get_root()
                    let editor = me.get_editor()

                    if(!(editor && root)){
                        return <></>
                    }
                    return <AutoStack force_direction="column">
                        <DefaultRootParameterEditButton root={root} editor={editor}/>
                        <Divider />
                        <DefaultSidebar 
                            editor = {me.get_editor() as EditorComponent}
                            extra  = {me.props.sidebar_extra}
                        />
                        {me.props.extra_buttons?.length > 0 ? <Divider /> : <></>}
                        {me.props.extra_buttons}
                    </AutoStack>
                })()}</Box>

            </KeyEventManager>
            </EditorBackgroundPaper>
        }}</IdxConflictSolver>
        </EditorConfigContext.Provider>
    }
}
