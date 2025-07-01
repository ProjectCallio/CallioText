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
} from "@mui/material"

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

    const button_idx: number | "_unopen" | "_other" = useSpaceNavigatorRawState(React.useCallback(state=>{
        const {space, node: position} = state
        if(space != SPACE_NAME || !position){
            return "_unopen" // 在这个组件中，需要区分没有进入空间和在其他区域进入空间的情况
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
            return "_other"
        }
        return button_idx
    }, [direction, max_level, node.idx, level]))
    
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
            if(menu_open){
                set_menu_open(false)
            }
            if(mouseless_open){
                set_mouseless_open(false)
            }
            return 
        }
        const flag = (button_idx != "_unopen") // 是数字
        if(flag != mouseless_open){
            set_mouseless_open(flag)
        }
        if(flag && menu_open){ // 取消持久化的打开状态
            set_menu_open(false)
        }
    } , [button_idx, level, mouseless_open ])

    const ButtonComp = React.useMemo(()=>(button_comp || Button), [button_comp])

    return <ClickAwayListener onClickAway={()=>{set_menu_open(false)}}>
    <Box>
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
        <Popper
            open     = {menu_open || mouseless_open}
            anchorEl = {anchor_ref.current}
            placement = "bottom-start"
            {...popper_props}
            disablePortal
        ><Paper sx={{
            border: "1px solid" , 
        }}>
            {children}
            <Divider />
            <ButtonGroup
                buttons = {buttons}
                level   = {level}
                max_level = {max_level}
                direction = "column"
            />
        </Paper></Popper>
    </Box>
    </ClickAwayListener>
})
FoldedButtonGroup.whyDidYouRender = true