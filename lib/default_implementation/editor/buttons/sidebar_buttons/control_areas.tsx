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
    useTexts ,
} from "../../../../implbase"

export {
    ParamAreaControlButton,
    ConceptAreaControlButton,
}

const ParamAreaControlButton = React.memo(() => {
    const texts    = useTexts()
    const open     = useAreaStore(state => state.open)
    const set_open = useAreaStore(state => state.set_open)

    return <AutoIconButton 
        onClick = {React.useCallback(() => set_open("param", !open.param), [open.param])} 
        icon    = {Columns3CogIcon}
        title   = {texts.buttons.parameter_area}
        size    = "large" 
        activate = {open.param}
    />
})

const ConceptAreaControlButton = React.memo(() => {
    const texts    = useTexts()
    const open     = useAreaStore(state => state.open)
    const set_open = useAreaStore(state => state.set_open)

    return <AutoIconButton 
        onClick = {React.useCallback(() => set_open("concep", !open.concep), [open.concep])} 
        icon    = {PuzzleIcon}
        title   = {texts.buttons.concept_area}
        size    = "large" 
        activate = {open.concep}
    />
})
