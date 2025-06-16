/**
 * 这个模块规定每个概念节点的按钮栏的无鼠标操作。
 * 约定1：位置用`[节点编号,按钮组层次,按钮编号]`来表示。其中按钮层次以`0`开始。
 * 约定2：每个概念节点都有按钮。按钮编号用整数表示。在实际取得按钮的时候取模。
 * @module
 */

import React from "react"
import * as Slate from "slate"
import {
    ConceptNode,
    Node
} from "../../core"

import {
    KeyNames ,
    
    SpaceDefinition , 
    NodeName , 
    KeyName , 
} from "@ftyyy/mouseless"

export {
    ActivateKeys , 
}

const ActivateKeys = [KeyNames.alt, KeyNames.w]
