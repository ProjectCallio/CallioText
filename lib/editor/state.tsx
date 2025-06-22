/** 这个模块提供当前正在编辑的editor的信息。 */

import React from "react"
import * as Slate from "slate"

import {
    create , 
} from "zustand"

import {
    ConceptNode , 
} from "../core"

import {
    EditorComponent , 
} from "./main"

export {
    useEditorState , 
    useCurEditor , 
    useCurConceptNode , 
    useCurConceptNodeIdxParam , 
}

export type {
    EditorState , 
}

const editor_ref = React.createRef<EditorComponent>()
const cur_conceptnode_ref = React.createRef<ConceptNode & Slate.Node>()

interface EditorState{
    editor_version: number
    flush_editor: ()=>void
    get_editor: ()=>EditorComponent | undefined
    set_editor: (editor: EditorComponent)=>void

    cur_conceptnode_version: number // 这个版本考虑整个节点
    cur_conceptnode_idxparam_version: number // 这个版本只考虑idx和参数
    flush_cur_conceptnode: (editor?: EditorComponent)=>void
    get_cur_concept_node: ()=>(ConceptNode & Slate.Node) | undefined
}


const useEditorState = create<EditorState>((set)=>({
    editor_version: 0,
    flush_editor: ()=>{
        set(state=>({editor_version: state.editor_version + 1}))
    },

    get_editor: ()=>editor_ref.current ?? undefined,
    set_editor: (editor)=>{
        if(editor_ref.current === editor){
            return
        }
        editor_ref.current = editor
        set(state=>({editor_version: state.editor_version + 1})) // flush一下
    },

    cur_conceptnode_version: 0,
    cur_conceptnode_idxparam_version: 0,
    flush_cur_conceptnode: (editor?: EditorComponent)=>{
        const my_editor = editor ?? editor_ref.current
        if(!my_editor){
            return
        }

        const last_node = cur_conceptnode_ref.current
        const new_node = my_editor.get_cur_concept_node()
        
        // 完全相等，啥都不干
        if((!new_node) || last_node === new_node){
            return
        }
        cur_conceptnode_ref.current = new_node //更新ref

        // 只有idx和参数变化，刷新idxparam版本
        if(last_node?.idx == new_node?.idx && last_node?.parameters == new_node?.parameters){
            set(state=>({
                cur_conceptnode_idxparam_version: state.cur_conceptnode_idxparam_version + 1
            }))
            return
        }

        // 其他情况，刷新整个节点版本
        set(state=>({
            cur_conceptnode_version: state.cur_conceptnode_version + 1,
            cur_conceptnode_idxparam_version: state.cur_conceptnode_idxparam_version + 1
        }))
    },

    get_cur_concept_node: ()=>{
        const editor = editor_ref.current
        if(!editor){
            return undefined
        }
        return editor.get_cur_concept_node()
    },
}))

function useCurEditor(){
    const editor  = useEditorState.getState().get_editor()
    const version = useEditorState(state=>state.editor_version) // 只依赖version刷新
    return editor
}
useCurEditor.current = ()=>(useEditorState.getState().get_editor())

function useCurConceptNode(){
    const node    = useEditorState.getState().get_cur_concept_node()
    const version = useEditorState(state=>state.cur_conceptnode_version) // 只依赖version刷新
    return node
}
useCurConceptNode.current = ()=>(useEditorState.getState().get_cur_concept_node())


function useCurConceptNodeIdxParam(){
    const node    = useEditorState.getState().get_cur_concept_node()
    const version = useEditorState(state=>state.cur_conceptnode_idxparam_version) // 只依赖idxparam版本刷新
    return node
}
