/**
 * 在sectional editor中，我们提供一个一直存在的区域来编辑参数。
 */

import * as React from "react"
import {
    ConceptNode , 
} from "../../core"
import {
    EditorComponent , 
} from "../../editor"
import {
    Box , 
    BoxProps , 
} from "@mui/material"
import {
    create , 
} from "zustand"

export {
    ParameterEditArea , 
}

let ParameterEditAreaStore = create<{
    editor  : EditorComponent | null
    node    : ConceptNode | null
    set_editor  : (editor: EditorComponent) => void
    set_node    : (node: ConceptNode) => void
}>()((set)=>({
    editor      : null,
    node        : null,
    set_editor  : (editor) => set(state => ({ ...state , editor: editor })),
    set_node    : (node)   => set(state => ({ ...state , node: node })),
}))

function ParameterEditArea({
    editor , 
    node, 
    sx , 
}:{
    editor: EditorComponent 
    node?: ConceptNode
    sx?: BoxProps["sx"]
}){
    // TODO

    return <Box sx={{
        backgroundColor: "red" , 
        width: "10rem" , 
        height: "10rem" , 
        ...sx
    }}></Box>
}
