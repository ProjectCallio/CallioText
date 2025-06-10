/**
 * 这个模块提供一个按钮，这个按钮点击之后展开一个buttongroup。
 */

import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"

import {
    useSpaceNavigatorOnMoveRegister ,
    useKeyHoldingState , 
    useSpaceNavigatorState,  
    useKeyEventsHandlerRegister,
    KeyNames, 
} from "@ftyyy/mouseless"

import {
    ConceptNode , 
    ParameterList , 
    ParameterValue, 
} from "../../core"

import {
    EditorComponent ,
    EditorGlobalInfo ,
} from "../../editor"

import {
    get_position , 
    decode_position , 
    SPACE_NAME , 
    HOLDING , 
} from "./mouseless"

import { 
    AutoTooltip , 
    Direction , 
    AutoStack , 
    AutoStackedPopper , 
    AutoStackedPopperProps , 
} from "../../uibase"
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
} from "@mui/material"

import {
    EditorButtonInformation , 
    ButtonDescription , 
    AutoStackedPopperWithButtonProps , 
    AutoStackedPopperWithButton , 
} from "./components"

import { produce } from "immer"

import {
    ButtonGroup , 
} from "./buttongroup"

export {
    FoldedButtonGroup , 
}

function FoldedButtonGroup({
    buttons, 
    node,

    level , 
}:{
    buttons : React.ReactNode[]
    node    : Slate.Node & ConceptNode

    level   : number
}){
    const direction = React.useContext(Direction)
    const [menu_open, set_menu_open] = React.useState(false)

    const [cur_space , cur_position]   = useSpaceNavigatorState()
    const [cur_selected, set_cur_selected] = React.useState<number | undefined>(undefined)

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()
    
    const button_cnt = buttons.length // 作为组件的按钮数量
    const button_refs = React.useRef<HTMLDivElement[]>([])

    const anchor_ref = React.useRef<HTMLButtonElement>(null)

    // 设置当前选中的按钮
    React.useEffect(()=>{
        if(cur_space != SPACE_NAME || !cur_position || !menu_open){
            set_cur_selected(undefined)
            return 
        }

        // 在纵向排列的时候，要交换level跟button_idx。
        let [node_idx, level_idx, button_idx] = decode_position(cur_position)
        if(direction == "column"){
            let swap = level
            level = button_idx
            button_idx = swap
        }

        if(node_idx != node.idx || level_idx != level){
            set_cur_selected(undefined)
            return 
        }

        const act_but_idx = (button_idx % button_cnt + button_cnt) % button_cnt
        set_cur_selected(act_but_idx)

    } , [cur_space, cur_position, level, button_cnt, node.idx ])

    // 设置选中按钮的行为
    React.useEffect(()=>{
        const handler = ()=>{
            if(cur_selected == undefined || !button_refs.current[cur_selected]){
                return 
            }
            // refs.current[sel_button].click()
            console.log("now click", cur_selected)
        }

        add_handler(HOLDING, KeyNames.enter, false, handler)
        return ()=>{
            del_handler(HOLDING, KeyNames.enter, false, handler)
        }
    } , [
        add_handler, 
        del_handler, 
        cur_selected , 
    ])

    return <ClickAwayListener onClickAway={()=>{set_menu_open(false)}}><React.Fragment>
        <Button
            ref = {anchor_ref}
            onClick = {()=>{set_menu_open(!menu_open)}}
        >
            open
        </Button>
        <Popper
            open     = {menu_open}
            anchorEl = {anchor_ref.current}
            placement = "bottom-start"
        >
            <ButtonGroup
                buttons = {buttons}
                node    = {node}
                level   = {level}
                autostack 
                simple
            />
        </Popper>
    </React.Fragment></ClickAwayListener>
}

