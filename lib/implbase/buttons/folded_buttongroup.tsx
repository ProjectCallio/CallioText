/**
 * 这个模块提供一个按钮，这个按钮点击之后展开一个buttongroup。
 */

import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"
import { 
    Tooltip , 
    IconButton , 
    ClickAwayListener  , 
    Box, 
    Button, 
    Typography , 
    TextField , 
    Input , 
    Popper , 
    PopperProps , 
    Paper , 
} from "@mui/material"

import {
    Close as CloseIcon,
} from "@mui/icons-material"

import {
    useSpaceNavigatorOnMoveRegister ,
    useKeyHoldingState , 
    useSpaceNavigatorState,  
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
    click_all, 
    Direction , 
} from "../../uibase"

import {
    ButtonGroup , 
} from "./buttongroup"

import {
    useNode ,
    useEditor,
} from "../../implbase"

export {
    FoldedButtonGroup , 
}

const FoldedButtonGroup = React.memo(({
    buttons, 

    level , 
    max_level , 
    popper_props , 
    button_comp , 
    label , 
    children = <></>,
}:{
    buttons : React.ReactNode[]

    level   : number
    max_level: number
    popper_props ?: Omit<PopperProps, "open" | "anchorEl" | "children">
    button_comp  ?: React.ComponentType<{
        onClick: (e: any)=>void, 
    }>
    label ?: string
    children ?: React.ReactNode
})=>{
    const my_nodeidx = useNode((prev, next) => (prev.idx == next.idx)).idx
    const direction  = React.useContext(Direction)

    const [menu_open, set_menu_open] = React.useState(false) // 手动打开
    const [mouseless_open, set_mouseless_open] = React.useState(false) // 键盘操作打开

    const [cur_space , cur_position]   = useSpaceNavigatorState()
    
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
        if(cur_space != SPACE_NAME || !cur_position){
            set_mouseless_open(false)
            return 
        }

        // 在纵向排列的时候，要交换level跟button_idx。
        let [node_idx, level_idx, button_idx] = decode_position(cur_position)
        if(direction == "column"){
            let swap = level_idx
            level_idx = button_idx
            button_idx = swap
        }
        const M = Math.max(max_level + 1, 1) // 设置一个表示关闭的level
        level_idx = ((level_idx % M) + M) % M 

        const flag = (node_idx == my_nodeidx && level_idx == level)
        if(flag != mouseless_open){
            set_mouseless_open(flag)
        }
        if(flag && menu_open){ // 取消持久化的打开状态
            set_menu_open(false)
        }
    } , [cur_space, cur_position, level, my_nodeidx, mouseless_open ])

    const ButtonComp = button_comp || Button

    return <ClickAwayListener onClickAway={()=>{set_menu_open(false)}}>
        <Box>
            <AutoTooltip title={label}>
                <Box ref = {(el)=>{
                        if(!el || el === anchor_ref.current){
                            return 
                        }
                        anchor_ref.current = el as HTMLDivElement
                        set_version(version + 1)
                    }}>
                <ButtonComp
                    onClick = {()=>{set_menu_open(!menu_open)}}
                />
                </Box>
            </AutoTooltip>
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
