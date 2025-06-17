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
    KeyEventManager , 
    KeyNames , 
    useKeyEventsHandlerRegister,
    useKeyEvents , 
    useKeyHoldingState,
    useUpDownHandlers , 
    useKeyDownUpProxy , 
} from "@ftyyy/mouseless"

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
    mod_scrollbar , 
} from "../../uibase"

import {
    get_mouseless_space as buttons_get_mouseless_space, 
    HOLDING as buttons_holding,
} from "../../implbase/buttons/mouseless"

import {
    ActivateKeys as extras_keys,
} from "../../implbase/extras/mouseless"

import {
    useAreaStore, 
    parameterarea_space , 
    Areas , 
} from "../areas"

import { 
    EditorBackgroundPaper , 
    EditorComponentEditingBox  ,
    EditorConfigContext , 
    make_editorconfig , 
    EditorConfig , 
    PartialEditorConfig , 
} from "./uibase"

import {
    DefaultSidebar , 
    SPACE as sidebar_space , 
} from "./sidebar"

import {
    IdxConflictSolver , 
} from "./idxconflict_solver"

export { DefaultEditorComponent }

type DefaultEditorComponentprops = EditorComponentProps & {
    config?: PartialEditorConfig
    onSave?: ()=>void // 保存时操作。

    sidebar_extras?: (({editor}: {editor: EditorComponent}) => React.ReactNode)[]
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

    editor_ref       : React.RefObject<EditorComponent | null>

    constructor(props: DefaultEditorComponentprops) {
        super(props)


        this.onUpdate = props.onUpdate || ((newval: Node[])=>{})
        this.onFocusChange  = props.onFocusChange || (()=>{})
        this.onSave = props.onSave || (()=>{})

        this.editor_ref         = React.createRef<EditorComponent | null>()

        this.state = {
            editor_ready: false,
        }

        this.get_editor       = this.get_editor.bind(this)
    }

    get_editor(){
        return this.editor_ref?.current || undefined
    }

    render() {
        const me                  = this
    
        const paper_widths  = {xs: "88%" , md: "91%" , xl: "93%"} // 纸张的宽度，
        const paper_right   = {xs: "89%" , md: "92%" , xl: "94%"} // 纸张的宽度，
        const toolbar_width = {xs: "10%" , md: "7%"  , xl: "5%" } // 工具栏的宽度。

        const config              = make_editorconfig(this.props.config)

        // 当焦点发生变化时，更新parameteredit_ref
        const onFocusChange = ()=>{
            me.props.onFocusChange && me.props.onFocusChange()
        }

        return <EditorConfigContext.Provider value={config}>
        <IdxConflictSolver get_editor={me.get_editor}>{(conflictcheck: ()=>void)=>(
            <EditorBackgroundPaper>
            <KeyEventManager
                spaces = {[
                    buttons_get_mouseless_space(me.get_editor),
                    sidebar_space,
                    parameterarea_space , 
                ]}
                preventing_default = {[
                    [KeyNames.ctrl, KeyNames.s] , 
                    buttons_holding ,
                    extras_keys , 
                    sidebar_space.holding,
                    parameterarea_space.holding,
                ]}
            >{(onkeydown , onkeyup)=>(<React.Fragment>
                <Box ref={mod_scrollbar} tabIndex={0} sx={{ 
                    position: "absolute" , 
                    top: "1%" , 
                    height: "98%", 
                    width: paper_widths, 
                    display: "flex" ,
                    flexDirection: "column" , 
                    borderRight: "1px solid ",
                    left: "1%",
                }}>
                    <EditorComponentEditingBox>
                        <EditorComponent
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

                            onUpdate            = {(v: any)=>{
                                me.props.onUpdate && me.props.onUpdate(v)
                                conflictcheck()
                            }}
                            onFocusChange       = {(e)=>{
                                onFocusChange()

                                let editor = me.get_editor()
                                if(editor){
                                    useAreaStore.getState().set_editor(editor)
                                    useAreaStore.getState().edit_flush() // 刷新一下
                                }
                            }}
                            
                            onKeyDown           = {onkeydown}
                            onKeyUp             = {onkeyup}
                        />
                    </EditorComponentEditingBox>
                </Box>

                <Box key="area-2" sx = {{
                    position: "absolute", 
                    top: "1%" , 
                    height: "99%", 
                    left: paper_right, 
                    width: toolbar_width,
                }}>{(()=>{
                    let editor = me.get_editor()

                    if(!editor){
                        return <></>
                    }
                    return <AutoStack force_direction="column">
                        <DefaultSidebar 
                            editor = {editor}
                            extras = {me.props.sidebar_extras}
                        />
                    </AutoStack>
                })()}</Box>

                <Areas /> 
            </React.Fragment>)}</KeyEventManager>
            </EditorBackgroundPaper>
        )}</IdxConflictSolver>
        </EditorConfigContext.Provider>
    }
}
