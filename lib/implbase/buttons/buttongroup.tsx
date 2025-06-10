/** 
 * 这个模块一个按钮组的组件按。
 * @module
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
} from "@mui/material"

import {
    EditorButtonInformation , 
    ButtonDescription , 
    AutoStackedPopperWithButtonProps , 
    AutoStackedPopperWithButton , 
} from "./components"

import { produce } from "immer"

export {
    ButtonGroup , 
}

function ButtonGroup({
    buttons, 
    node,

    level , 

    autostack = false,
    simple = false,
}:{
    buttons : React.ReactNode[]
    node    : Slate.Node & ConceptNode

    level   : number

    autostack?: boolean
    simple?: boolean
}){
    const direction = React.useContext(Direction)

    const [cur_space , cur_position]   = useSpaceNavigatorState()
    const [cur_selected, set_cur_selected] = React.useState<number | undefined>(undefined)

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()
    
    const button_cnt = buttons.length // 作为组件的按钮数量
    const refs = React.useRef<HTMLDivElement[]>([])

    // 设置当前选中的按钮
    React.useEffect(()=>{   
        if(cur_space != SPACE_NAME || !cur_position){
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
            if(cur_selected == undefined || !refs.current[cur_selected]){
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

    const ret = <React.Fragment>
    {buttons.map((button, idx)=>{
            return <div 
                    ref = {(el: HTMLDivElement)=>{refs.current[idx] = el}}
                    style={{
                        border: cur_selected == idx ? "2px solid" : "none" , 
                    }}
            >{button}</div>
        })}
    </React.Fragment>

    if(autostack){
        return <AutoStack simple={simple}>{ret}</AutoStack>
    }
    return ret
}

