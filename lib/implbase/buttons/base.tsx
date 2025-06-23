/** 
 * 这个文件提供一些实用按钮。
 * @module
 */

import * as React from "react"

import { 
    IconButton, 
    IconButtonProps, 
} from "@mui/material"

import { AutoTooltip } from "../../uibase"

export {    
    AutoIconButton, 
}

/** 这个函数是一个语法糖，用于自动创建带tooltip的按钮。 */
const AutoIconButton = React.memo(({
    onClick, 
    size = "small", 
    title, 
    icon, 
    activate = false,
    component = "button", 
    icon_props = {}, 
}:{
    onClick?: IconButtonProps["onClick"]
    size?: "small" | "very-small" | "large" | "medium"
    title?: string
    icon?: any
    activate?: boolean
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
                    paddingY: "0.05rem" , 
                    width: "1.25rem",
                    height: "1.25rem",
                    transformOrigin: "center center", 
                } : {}),
                ...(size == "very-small" ? {
                    paddingX: "0.05rem",
                    paddingY: "0.05rem" , 
                    width: "1.1rem",
                    height: "1.1rem",
                    transformOrigin: "center center", 
                } : {}),
                ...(size == "medium" ? {
                    paddingX: "0.15rem",
                    paddingY: "0.15rem" , 
                    width: "1.5rem",
                    height: "1.5rem",
                    transformOrigin: "center center", 
                } : {}),
                ...(size == "large" ? {
                    paddingX: "0.05rem",
                    paddingY: "0.05rem" , 
                    width: "2.25rem",
                    height: "2.25rem",
                    transformOrigin: "center center", 
                    marginX: "0.07rem", 
                    marginY: "0.07rem", 
                } : {}),
                borderRadius: "0.5rem",
                ...(activate ? {
                    backgroundColor: "gray",
                    color: "white",
                } : {}),
                ...(sx || {})
            }}
            {...rest} 
        >
            <Icon />
        </IconButton>
    </AutoTooltip>
})
