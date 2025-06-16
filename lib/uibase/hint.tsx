/** 这个模块提供关于快捷键的提示。 */
import * as React from "react"

import {
    Chip , 
    Box , 
} from "@mui/material"

import {
    KeyName , 
} from "@ftyyy/mouseless"

export {
}

function shortname(key: KeyName){
    if(key == "Enter"){
        return "↵"
    }
    if(key == "Backspace"){
        return "⌫"
    }
    if(key == "ArrowUp"){
        return "↑"
    }
    if(key == "ArrowDown"){
        return "↓"
    }
    if(key == "ArrowLeft"){
        return "←"
    }
    if(key == "ArrowRight"){
        return "→"
    }
    return key.toLowerCase()
}

// TODO ...