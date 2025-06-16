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
    const direction = React.useContext(Direction)
    const my_nodeidx = useNode(node=>node.idx)
    const [menu_open, set_menu_open] = React.useState(false)

    const [cur_space , cur_position]   = useSpaceNavigatorState()
    
    const anchor_ref = React.useRef<HTMLDivElement>(null)
    const [version, set_version] = React.useState(0)

    // 设置当前选中的按钮
    React.useEffect(()=>{
        if(cur_space != SPACE_NAME || !cur_position){
            set_menu_open(false)
            return 
        }

        // 在纵向排列的时候，要交换level跟button_idx。
        let [node_idx, level_idx, button_idx] = decode_position(cur_position)
        const is_column = ( direction == "column")
        if(is_column){
            let swap = level_idx
            level_idx = button_idx
            button_idx = swap
        }
        const M = Math.max(max_level  + 1, 1)
        level_idx = ((level_idx % M) + M) % M 

        const flag = (node_idx == my_nodeidx && level_idx == level)
        if(flag != menu_open){
            set_menu_open(flag)
        }
    } , [cur_space, cur_position, level, my_nodeidx, menu_open ])

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
                open     = {menu_open}
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
