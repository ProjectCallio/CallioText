import React from "react"
import {
    Box , 
} from "@mui/material"

import {
    Columns3Cog as Columns3CogIcon    ,
    Puzzle  as PuzzleIcon ,
} from "lucide-react"

import {
    useAreaStore,
} from "../../../areas"

import {
    AutoIconButton,
} from "../../../../implbase"

export {
    ParamAreaControlButton,
    ConceptAreaControlButton,
}

function ParamAreaControlButton(){
    const open     = useAreaStore(state => state.open)
    const set_open = useAreaStore(state => state.set_open)

    return <AutoIconButton 
        onClick = {() => set_open("param", !open.param)} 
        icon    = {Columns3CogIcon}
        title   = "参数区域"
        size    = "large" 
        activate = {open.param}
    />
}

function ConceptAreaControlButton(){
    const open     = useAreaStore(state => state.open)
    const set_open = useAreaStore(state => state.set_open)

    return <AutoIconButton 
        onClick = {() => set_open("concep", !open.concep)} 
        icon    = {PuzzleIcon}
        title   = "概念区域"
        size    = "large" 
        activate = {open.concep}
    />
}
