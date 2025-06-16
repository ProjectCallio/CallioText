import * as Slate from "slate"
import {
    ConceptNode , 
    ParameterList , 
    ParameterValue, 
} from "../core"

import {
    EditorComponent , 
} from "../editor"
import {
    ProcessedParameterList , 
} from "../printer"

export type {
    EditorNodeInfoFunction , 
}

type EditorNodeInfoFunction<NodeType extends ConceptNode = ConceptNode, ValueType = any> = (
    node: NodeType & Slate.Node, parameters: ProcessedParameterList
) => ValueType
