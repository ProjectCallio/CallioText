import * as Slate from "slate"
import {
    ConceptNode , 
    ParameterList , 
    ParameterValue, 
} from "../core"

import {
    EditorComponent , 
} from "../editor"

export type {
    ConceptSubcomponentInformation , 
}

interface ConceptSubcomponentInformation{
    node: Slate.Node & ConceptNode , 
    editor: EditorComponent , 
}