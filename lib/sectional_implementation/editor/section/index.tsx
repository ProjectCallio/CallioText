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
} from "../../../editor"
import {
    ConceptNode , 
    GroupNode , 
    Node , 
    AllConceptTypes , 
    AllNodeTypes, 
    AbstractNode,

    is_concetnode,
} from "../../../core"

import { 
    AutoStack , 
    AutoTooltip , 
    AutoStackedPopper , 
    AutoStackButtons , 
} from "../../../uibase"
import {
    object_foreach , 
    merge_object ,

} from "../../../utils"

import {
    KeyEventManager , 
    MouselessElement , 
    KeyDownUpFunctionProxy , 
    DirectionKey, 
} from "../../../uibase/mouseless"

import { 
    EditorBackgroundPaper , 
    EditorComponentEditingBox  ,
    EditorConfigContext , 
    make_editorconfig , 
    EditorConfig , 
    PartialEditorConfig , 
    EditorStructureTypography , 
} from "../../../default_implementation/editor/uibase"
import {
    ButtonGroup , 
} from "../../../implbase/buttons"
import { 
    ScrollBarBox , 
} from "../../../uibase"

import {
    set_normalize_status , 
    get_normalize_status , 

    slate_is_concept , 

    EditorPlugin , 
} from "../../../editor"
import {
    Area , 
    UseAreaStore , 
} from "../../areas"

export {
    AbstractEditor , 
}

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

    return <Box sx={{
        marginY: "1rem", 
        border: "none", 
        marginX: "0.5rem", 
        display: "flex",
        flexDirection: "column",
        position: "relative",
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

