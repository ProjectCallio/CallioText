/**
 * 在sectional editor中，我们提供一个一直存在的区域来编辑参数。
 */
import * as Slate from "slate"
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
import {
    DefaultParameterContainer , 
} from "../../implbase/parameter_edit"
import {
    ParameterList , 
} from "../../core"


export {
    UseAreaStore , 
    Area , 
}

const UseAreaStore = create<{
    editor    : EditorComponent | null
    selection : Slate.Selection | null
    set_editor    : (editor: EditorComponent) => void
    set_selection : (selection: Slate.Selection | null) => void
}>()((set)=>({
    editor      : null,
    selection   : null,
    set_editor    : (editor) => set(state => ({ ...state , editor: editor })),
    set_selection : (selection) => set(state => ({ ...state , selection: selection })),
}))

function Area({
    sx , 
}:{
    sx?: BoxProps["sx"]
}){
    let editor    = UseAreaStore(state => state.editor)
    let selection = UseAreaStore(state => state.selection)

    if((!editor) || (!selection)){
        return <></>
    }

    let cur_path = selection?.anchor.path
    if(!cur_path){
        return <></>
    }
    
    let concept_nodes = find_concept_nodes_by_path(editor.get_root() , cur_path)
    if(concept_nodes.length == 0){
        return <></>
    }

    let cur_node = concept_nodes[concept_nodes.length - 1]
    
    return <Box sx={{
        ...sx
    }}>
        <DefaultParameterContainer 
            node     = {cur_node}
            onSave = {(parameters: ParameterList)=>{
                console.log(parameters)
                editor.auto_set_parameter(cur_node, parameters)
            }}
        />
    </Box>
}
