/** 
 * 这个文件提供一些实用按钮。
 * @module
 */

import * as React from "react"

import { 
    IconButton, 
    IconButtonProps, 
} from "@mui/material"

import { AutoTooltip } from "../../../uibase"

export {    
    AutoIconButton, 
}

/** 这个函数是一个语法糖，用于自动创建带tooltip的按钮。 */
const AutoIconButton = React.memo(({
    onClick, 
    size = "small", 
    title, 
    icon, 
    component = "button", 
    icon_props = {}, 
}:{
    onClick?: IconButtonProps["onClick"]
    size?: IconButtonProps["size"]
    title?: string
    icon?: any
    component?: "button" | "span"
    icon_props?: IconButtonProps
})=>{
    const {sx, ...rest} = icon_props
    const Icon = icon
    
    return <AutoTooltip title={title}>
        <IconButton 
            onClick     = {onClick} 
            component   = {component} 
            sx          = {{
                ...(size == "small" ? {
                    paddingX: "0.05rem",
                    transform: "scale(0.8)",
                    transformOrigin: "center center", 
                } : {}),
                
                ...(sx || {})
            }}
            {...rest} 
        >
            <Icon/>
        </IconButton>
    </AutoTooltip>
})
