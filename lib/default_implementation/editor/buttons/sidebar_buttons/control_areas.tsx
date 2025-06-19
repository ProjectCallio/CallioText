import React from "react"
import {
    Box , 
} from "@mui/material"

import {
    Build as BuildIcon,
    Category as CategoryIcon,
} from "@mui/icons-material"

import {
    useAreaStore,
} from "../../../areas"

import {
    AutoIconButton,
} from "../base"

export {
    ParamAreaControlButton,
    ConceptAreaControlButton,
}

function ParamAreaControlButton(){
    const open     = useAreaStore(state => state.open)
    const set_open = useAreaStore(state => state.set_open)

    return <AutoIconButton 
        onClick = {() => set_open("param", !open.param)} 
        icon    = {BuildIcon}
        title   = "参数区域"
        size    = "medium" 
        icon_props = {{
            sx: {
                color: open.param ? "white" : "inherit",
                backgroundColor: open.param ? "primary.main" : "transparent",
                "&:hover": {
                    backgroundColor: open.param ? "primary.dark" : "action.hover"
                }
            }
        }}
    />
}

function ConceptAreaControlButton(){
    const open     = useAreaStore(state => state.open)
    const set_open = useAreaStore(state => state.set_open)

    return <AutoIconButton 
        onClick = {() => set_open("concep", !open.concep)} 
        icon    = {CategoryIcon}
        title   = "概念区域"
        size    = "medium" 
        icon_props = {{
            sx: {
                color: open.concep ? "white" : "inherit",
                backgroundColor: open.concep ? "primary.main" : "transparent",
                "&:hover": {
                    backgroundColor: open.concep ? "primary.dark" : "action.hover"
                }
            }
        }}
    />
}
