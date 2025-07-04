/** 
 * 这个文件提供一些实用按钮。
 * @module
 */

import * as React from "react"
import { motion } from "framer-motion"

import { 
    IconButton, 
    IconButtonProps, 
    useTheme,
    Palette,
    Box , 
} from "@mui/material"
import { darken } from "@mui/material/styles"

import { AutoTooltip } from "../../uibase"

export {    
    AutoIconButton, 
    MouselessSelect , 
    AutoElement , 
    useMouselessSelect , 
}

const MouselessSelect = React.createContext<boolean>(false)

function useMouselessSelect(){
    return React.useContext(MouselessSelect)
}

function get_color_style(activate: boolean, hover: boolean, palette: Palette, use_textcolor: boolean){

    const main_color = use_textcolor ? palette.text.primary : palette.primary.main
    
    return  {
        backgroundColor: (activate && (!hover)) 
            ? palette.primary.light
            : ((activate && hover) 
                ? palette.secondary.dark
                : (hover 
                    ? palette.primary.dark 
                    : "transparent"
                )
            ),

        color: (activate && (!hover)) 
            ? palette.primary.contrastText 
            : ((activate && hover) 
                ? palette.primary.contrastText 
                : (hover 
                    ? palette.primary.contrastText 
                    : main_color
                )
            ),
    }
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
    ignore_mouseless = false,
}:{
    onClick?: IconButtonProps["onClick"]
    size?: "small" | "very-small" | "large" | "medium"
    title?: string
    icon?: React.ComponentType<{}>
    activate?: boolean
    component?: "button" | "span"
    icon_props?: IconButtonProps
    ignore_mouseless?: boolean
})=>{
    const {sx, ...rest} = icon_props
    const Icon = icon
    const palette = useTheme().palette
    const Component = component == "button" ? motion.button : motion.span

    const mouseless_select = useMouselessSelect()
    const [hover, set_hover] = React.useState(false)

    const flag = (!ignore_mouseless && mouseless_select) || hover
    const color_style = get_color_style(activate, flag, palette, false)

    return <AutoTooltip title={title} open={flag}>
        <IconButton 
            disableRipple
            component   = {Component} 
            onClick     = {onClick} 
            onMouseEnter = {() => set_hover(true)}
            onMouseLeave = {() => set_hover(false)}
            animate = {{
                scale     : flag ? 1.1 : 1,
                boxShadow : flag ? `0px 4px 8px ${palette.divider}` : "none",
                rotate    : flag ? [-20, 0] : 0,
            }}
            transition = {{
                scale: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                },
                boxShadow: {
                    duration: 0.2,
                },
                rotate: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                },
            }}

            sx          = {{
                // 不知道为什么好像颜色最好用sx来处理，而不是用animate
                "&:hover": {
                    ...color_style,
                },
                ...color_style,

                transition: "color 0.2s ease-in-out, background-color 0.2s ease-in-out, opacity 0.2s ease-in-out",

                "&:active": { // 鼠标点击
                    ...get_color_style(activate, !flag, palette, false),
                },
                "&.Mui-focusVisible": { // 键盘聚焦（无障碍）
                    backgroundColor: "transparent !important",
                },

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
                ...(sx || {})
            }}    
            {...rest} 
        >
            {Icon && <Icon />}
        </IconButton>
    </AutoTooltip>
})

/** 通用的按钮栏元素包裹器。 */
const AutoElement = React.memo(({
    title, 
    children,
    ref,
    style , 
    use_textcolor = false, // 不使用primary而是用text.primary
    no_animate = false,
}: {
    title?: string,
    children: React.ReactNode,
    ref?: React.Ref<HTMLDivElement>,
    style?: React.CSSProperties
    use_textcolor?: boolean
    no_animate?: boolean
}) => {
    const mouseless_select = useMouselessSelect()
    const [hover, set_hover] = React.useState(false)
    const flag = mouseless_select || hover

    const palette = useTheme().palette
    const color_style = get_color_style(false, flag, palette, use_textcolor)

    return <AutoTooltip title={title} open={flag}>
        <Box 
            component = {motion.div}
            ref = {ref}
            onMouseEnter = {() => set_hover(true)}
            onMouseLeave = {() => set_hover(false)}
            animate = {{
                boxShadow : flag ? `0px 4px 8px ${palette.divider}` : "none",
                ...(!no_animate ? {
                    scale: flag ? 1.1 : 1,
                    rotate: flag ? [-20, 0] : 0,
                } : {}),
            }}
            transition = {{
                type: "spring",
                stiffness: 300,
                damping: 20,
            }}
            sx = {{
                ...color_style,
                ...style,
                "&:active": { // 鼠标点击
                    ...get_color_style(false, !flag, palette, use_textcolor),
                },
            }}
        >
            {children}
        </Box>
    </AutoTooltip>
})
