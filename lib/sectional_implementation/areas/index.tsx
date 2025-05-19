/**
 * 在sectional editor中，我们提供一个一直存在的区域来编辑参数。
 */

import * as React from "react"
import {
    Node , 
    find_concept_nodes_by_path , 
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
    UseAreaStore , 
    Area , 
}

let UseAreaStore = create<{
    editor  : EditorComponent | null
    set_editor  : (editor: EditorComponent) => void
}>()((set)=>({
    editor      : null,
    set_editor  : (editor) => set(state => ({ ...state , editor: editor })),
}))

function Area({
    sx , 
}:{
    sx?: BoxProps["sx"]
}){
    let editor = UseAreaStore(state => state.editor)

    if(!editor){
        return <Box sx={{visibility: "hidden"}}></Box>
    }

    let slate = editor.get_slate()
    let cur_path = slate.selection?.anchor.path
    if(!cur_path){
        return <Box sx={{visibility: "hidden"}}></Box>
    }
    
    let concept_nodes = find_concept_nodes_by_path(editor.get_root() , cur_path)

    return <Box sx={{
        backgroundColor: "red" , 
        width: "10rem" , 
        height: "10rem" , 
        ...sx
    }}>
        now path: {concept_nodes.length}
    </Box>
}
