/**
 * 在sectional editor中，我们提供一个一直存在的区域来编辑参数。
 */
import * as React from "react"
import * as Slate from "slate"
import {
    Node , 
    find_concept_nodes_by_path , 
    ConceptNode , 
} from "../../core"
import {
    EditorComponent , 
} from "../../editor"
import {
    Box , 
    BoxProps , 
    Button , 
    Typography , 
    Paper , 
    IconButton , 
    Stack , 
} from "@mui/material"
import {create} from "zustand"


export {
    UseAreaStore , 
    DraggerBox , 
}

const UseAreaStore = create<{
    editor    : EditorComponent | null
    set_editor    : (editor: EditorComponent) => void

    selection : Slate.Selection | null
    set_selection : (selection: Slate.Selection | null) => void

    edit_version   : number
    edit_flush         : () => void // 强制刷新
}>()((set)=>({
    editor        : null,
    set_editor    : (editor) => set(state => ({ ...state , editor: editor })),

    selection     : null,
    set_selection : (selection) => set(state => ({ ...state , selection: selection })),

    edit_version       : 0,
    edit_flush         : () => set(state => ({ ...state , edit_version: state.edit_version + 1 })),
}))

function DraggerBox(props: BoxProps & {
    onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void
    onSetSize  ?: (size: {width: number, height: number}) => void
    dragging_me?: boolean
    father_ref?: React.RefObject<HTMLDivElement | null>
}){
    let {
        onDragStart , 
        onSetSize , 
        dragging_me , 
        father_ref , 
        ...rest_props
    } = props

    return <Box
        {...rest_props}
        sx={{
            cursor: "move",
            width: "100%",
            height: "0.5rem",
            minHeight: "0.5rem" , 
            bgcolor: dragging_me ? "grey.400" : "grey.300",
            borderRadius: "4px",
            mb: 1,
            "&:hover": {
                bgcolor: "grey.400"
            }
        }}
        onMouseDown = {(e: React.MouseEvent<HTMLDivElement>)=>{
            // XXX 在这里调用onSetSize也许并不合理
            if(father_ref?.current){
                const rect = father_ref.current.getBoundingClientRect()
                onSetSize?.({
                    width : rect.width,
                    height: rect.height,
                })
            }
            onDragStart?.(e)
        }}
    />
}
