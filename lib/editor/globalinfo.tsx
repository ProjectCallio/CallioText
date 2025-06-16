import * as React from "react"
import * as SlateReact from "slate-react"

import {
    AbstractNode , 
} from "../core"

import {
    EditorComponent , 
} from "./main"
import {
    EditorCore , 
} from "./editorcore"

export {
    EditorGlobalInfo , 
    useEditor , 
}

export type {
    EditorGlobalInfoType , 
}

interface EditorGlobalInfoType{
    "editor" ?: EditorComponent , 
    "slate"  ?: SlateReact.ReactEditor , 
    "core"   ?: EditorCore ,                         // 这一项提供所有节点的环境。
}

const EditorGlobalInfo = React.createContext<EditorGlobalInfoType>({})

function useEditor(){
    const editor = React.useContext(EditorGlobalInfo).editor
    if(!editor){
        throw new Error("Not in a `EditorGlobalInfo` context.")
    }
    return editor
}