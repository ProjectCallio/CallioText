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
import {
    create , 
} from "zustand"
import {
    DefaultParameterContainer , 
} from "../../implbase/parameter_edit"
import {
    ParameterList , 
} from "../../core"
import {
    NavigateBefore , 
    NavigateNext , 
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"

export {
    UseAreaStore , 
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
