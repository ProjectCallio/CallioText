/** 
 * 这个文件提供一个开箱即用的editor示例。
 * @module
 */
import React  from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"

import {
    Typography , 
    Box , 
} from "@mui/material"


import {
    KeyEventManager , 
    KeyNames , 
    useSpaceNavigatorState, 
    useAllHoldingKeys,
} from "@ftyyy/mouseless"

import {
    SnackbarProvider 
} from "notistack"

import {
    EditorComponent , 
    EditorComponentProps , 
    EditorGlobalInfo,
} from "../../editor"
import {
    Node , 
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
    useAreaStore, 
    parameterarea_space , 
    conceptarea_holding , 
    Areas , 
} from "../areas"

import { 
    EditorBackgroundPaper , 
    EditorComponentEditingBox  ,
} from "./uibase"
import {
    EditorConfigContext , 
    make_editorconfig , 
    PartialEditorConfig , 
} from "../../implbase/editorconfig"

import {
    DefaultSidebar , 
    SPACE as sidebar_space , 
} from "./sidebar"

import {
    AbstractEditorArea , 
} from "./abstract/editor"

import {
    SPACE as abstract_space,
} from "./abstract/mouseless"

import {
    IdxConflictSolver , 
} from "./idxconflict_solver"

export { DefaultEditorComponent }

function Test(){

    const holding_keys = useAllHoldingKeys()

    const [space, node] = useSpaceNavigatorState()

    return <React.Fragment>
        <Box sx={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            width: "15rem",
            height: "5rem",
            backgroundColor: "red",
            zIndex: 1000,
        }}>

            <Typography>holding_keys: {holding_keys.join(", ")}</Typography>
            <Typography>space: {space}</Typography>
            <Typography>node: {node}</Typography>
        </Box>
    </React.Fragment>
}

type DefaultEditorComponentprops = EditorComponentProps & {
    config?: PartialEditorConfig
    onSave?: ()=>void // 保存时操作。

    sidebar_extras?: (() => React.ReactNode)[]
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

    editor_ref: React.RefObject<EditorComponent | null>

    constructor(props: DefaultEditorComponentprops) {
        super(props)

        this.onUpdate = props.onUpdate || ((newval: Node[])=>{})
        this.onFocusChange  = props.onFocusChange || (()=>{})
        this.onSave = props.onSave || (()=>{})

        this.editor_ref = React.createRef<EditorComponent | null>()

        this.state = {
            editor_ready: false,
        }

        this.get_editor       = this.get_editor.bind(this)
    }

    get_editor(){
        return this.editor_ref?.current ?? undefined
    }

    render() {
        const me            = this
    
        const paper_widths  = {xs: "88%" , md: "91%" , xl: "93%"} // 纸张的宽度，
        const paper_right   = {xs: "89%" , md: "92%" , xl: "94%"} // 纸张的宽度，
        const toolbar_width = {xs: "10%" , md: "7%"  , xl: "5%" } // 工具栏的宽度。

        const config        = make_editorconfig(this.props.config)

        // 当焦点发生变化时，更新parameteredit_ref
        const onFocusChange = ()=>{
            me.props.onFocusChange && me.props.onFocusChange()
        }

        // TODO 现在abstracteditor用不了space navigator，因为这里get_editor给出的是父编辑器。
        return <EditorConfigContext.Provider value={config}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{vertical: "top", horizontal: "right"}}>
        <IdxConflictSolver get_editor={me.get_editor}>{(conflictcheck: ()=>void)=>(
            <EditorBackgroundPaper>
            <KeyEventManager
                spaces = {[
                    buttons_get_mouseless_space(),
                    sidebar_space,
                    parameterarea_space , 
                    abstract_space , 
                ]}
                preventing_default = {[
                    [KeyNames.ctrl, KeyNames.s] , 
                    [KeyNames.ctrl, KeyNames.d] , 
                    [KeyNames.Alt] , 
                    buttons_holding ,
                    sidebar_space.holding,
                    parameterarea_space.holding,
                    conceptarea_holding,
                    abstract_space.holding,
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
                {/* <Test /> */}
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
                        onFocusChange       = {onFocusChange}
                        
                        onKeyDown           = {onkeydown}
                        onKeyUp             = {onkeyup}
                    />
                </EditorComponentEditingBox>
                </Box>

                {/* 为其他组件提供editor上下文。 */}
                {me.get_editor() && <EditorGlobalInfo.Provider value={{editor: me.get_editor()}}>

                    <AbstractEditorArea />

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
                                extras = {me.props.sidebar_extras}
                            />
                        </AutoStack>
                    })()}</Box>

                    <Areas /> 
                </EditorGlobalInfo.Provider>}
            </React.Fragment>)}</KeyEventManager>
            </EditorBackgroundPaper>
        )}</IdxConflictSolver>
        </SnackbarProvider>
        </EditorConfigContext.Provider>
    }
}
