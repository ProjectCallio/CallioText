import * as Slate from "slate"
import {
    ConceptNode , 
} from "../core"
import {
    ProcessedParameterList , 
} from "../printer"

export type {
    EditorNodeInfoFunction , 
}

type EditorNodeInfoFunction<NodeType extends ConceptNode = ConceptNode, ValueType = any> = (
    node: NodeType & Slate.Node, parameters: ProcessedParameterList
) => ValueType
