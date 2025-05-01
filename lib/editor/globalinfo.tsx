import * as React from "react"
import * as SlateReact from "slate-react"

import {
    AbstractNode , 
} from "../core"

import {
    EditorComponent , 
    EditorCore , 
} from "./main"

export {
    EditorGlobalInfo , 
}

export type {
    EditorGlobalInfoType , 
}

interface EditorGlobalInfoType{
    "editor" ?: EditorComponent , 
    "slate"  ?: SlateReact.ReactEditor , 
    "core"   ?: EditorCore ,                         // 这一项提供所有节点的环境。
}

let EditorGlobalInfo = React.createContext<EditorGlobalInfoType>({})

