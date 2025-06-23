import * as React from "react"
import * as SlateReact from "slate-react"
import {
    EditorComponent , 
} from "./main"

export {
    EditorGlobalInfo , 
    useEditor , 
}

export type {
    EditorGlobalInfoType , 
}

interface EditorGlobalInfoType{
    "editor" ?: EditorComponent , 
}

const EditorGlobalInfo = React.createContext<EditorGlobalInfoType>({})

function useEditor(){
    const editor = React.useContext(EditorGlobalInfo).editor
    if(!editor){
        throw new Error("Not in a `EditorGlobalInfo` context.")
    }
    return editor
}