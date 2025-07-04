/**
 * 这个模块提供一个按钮，这个按钮点击之后展开一个buttongroup。
 */

import React from "react"
import { 
    ClickAwayListener  , 
    Box, 
    Button, 
    Popper , 
    PopperProps , 
    Paper , 
    Divider , 
    useTheme, 
    alpha, 
} from "@mui/material"
import { AnimatePresence, motion } from "framer-motion"

import {
    useSpaceNavigatorState,  
    useSpaceNavigatorRawState , 
    useKeyEventsHandlerRegister,
    KeyNames, 
} from "@ftyyy/mouseless"


import {
    decode_position , 
    SPACE_NAME , 
    HOLDING , 
} from "./mouseless"

import { 
    AutoTooltip , 
    Direction , 
} from "../../uibase"

import {
    ButtonGroup , 
} from "./buttongroup"

import {
    useNode ,
    useEditor,
} from "../hooks"

import {
    MouselessHint
} from "../msls_hint"

export {
    FoldedButtonGroup , 
}

const FoldedButtonGroup = React.memo(({
    buttons, 

    level , 
    max_level , 
    popper_props , 
    button_comp , 
    children = <></>,
}:{
    buttons : React.ReactNode[]

    level   : number
    max_level: number
    popper_props ?: Omit<PopperProps, "open" | "anchorEl" | "children">
    button_comp  ?: React.ComponentType<{
        onClick: (e: any)=>void, 
    }>
    children ?: React.ReactNode
})=>{
    const node = useNode((prev, next) => (prev.idx == next.idx))
    const direction  = React.useContext(Direction)

    const [menu_open, set_menu_open] = React.useState(false) // 手动打开
    const [mouseless_open, set_mouseless_open] = React.useState(false) // 键盘操作打开
    const theme = useTheme()
    const palette = theme.palette

    const button_idx: number | "_irrelv" | "_other" = useSpaceNavigatorRawState(React.useCallback(state=>{
        const {space, node: position} = state
        if(space != SPACE_NAME || !position){
            return "_irrelv" // 在这个组件中，需要区分没有进入空间和在其他区域进入空间的情况
        }
        let [node_idx, level_idx, button_idx] = decode_position(position)
        if(direction == "column"){
            let swap = level_idx
            level_idx = button_idx
            button_idx = swap
        }
        const M = Math.max(max_level  + 1, 1)
        level_idx = ((level_idx % M) + M) % M 

        if(node_idx != node.idx || level_idx != level){
            if((!menu_open) && (!mouseless_open)){
                return "_irrelv" // 这个时候尽量不改变状态
            }
            return "_other"
        }
        return button_idx
    }, [direction, max_level, node.idx, level, mouseless_open, menu_open]))
    
    const anchor_ref = React.useRef<HTMLDivElement>(null)
    const [version, set_version] = React.useState(0)

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    React.useEffect(()=>{
        const handler = ()=>{
            if(mouseless_open && !menu_open){ // 按下按钮的时候持久化打开状态
                set_menu_open(true)
            }
        }
        add_handler(HOLDING, KeyNames.Enter, false, handler)
        return ()=> del_handler(HOLDING, KeyNames.Enter, false, handler)
    }, [mouseless_open && !menu_open])

    // 设置当前选中的按钮
    React.useEffect(()=>{
        if(button_idx == "_other"){
            set_menu_open(false)
            set_mouseless_open(false)
            return 
        }
        const flag = (button_idx != "_irrelv") // 是数字
        if(flag){
            set_mouseless_open(true)
            set_menu_open(false)
        }
        else{
            set_mouseless_open(false)
        }
    } , [button_idx])

    const ButtonComp = React.useMemo(()=>(button_comp || Button), [button_comp])

    return <ClickAwayListener onClickAway={()=>{set_menu_open(false)}}>
    <Box>
        <MouselessHint 
            get_anchor_el={()=> anchor_ref.current} 
            ctrl_key={KeyNames.Alt} 
            keys={HOLDING} 
            info = "↑ ↓ ⏎" 
        />
        <Box 
            ref = {(el)=>{
                if(!el || el === anchor_ref.current){
                    return 
                }
                anchor_ref.current = el as HTMLDivElement
                set_version(version + 1)
            }}
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "auto",
                height: "auto",
                marginTop: "0.1rem",
            }}
        >
            <ButtonComp
                onClick = {()=>{set_menu_open(!menu_open)}}
            />
        </Box>
        <AnimatePresence>{(menu_open || mouseless_open) && (
            // 不知道为什么，现在这个popper一打开，内容就会凭空变宽
            <Popper
                open     = {menu_open || mouseless_open} // open在前面设置了。
                anchorEl = {anchor_ref.current}
                placement = "bottom-start"
                {...popper_props}
                disablePortal
                
                sx={{
                    zIndex: 2000,
                }}
            >
            <motion.div
                animate    = {{ opacity: 1, scale: 1, y: 0 }}
                initial    = {{ opacity: 0, scale: 0.95, y: -20 }}
                exit       = {{ opacity: 0, scale: 0.95, y: -20 }}
                transition = {{ 
                    duration: 0.2, 
                    ease: "easeOut" 
                }}
            >
                <Paper 
                    elevation={3}
                    sx={{
                        border: "1px solid" , 
                        backgroundColor: alpha(palette.background.paper, 0.75),
                        backdropFilter: "blur(1px)",
                    }}
                >
                    {children}
                    <Divider />
                    <ButtonGroup
                        buttons = {buttons}
                        level   = {level}
                        max_level = {max_level}
                        direction = "column"
                    />
                </Paper>
            </motion.div>
            </Popper>
        )}</AnimatePresence>
    </Box>
    </ClickAwayListener>
})
// FoldedButtonGroup.whyDidYouRender = true