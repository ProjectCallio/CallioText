/** 
 * 这个模块一个按钮组的组件按。
 * @module
 */

import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"

import {
    Box
} from "@mui/material"

import {
    useSpaceNavigatorState,  
    useSpaceNavigatorRawState,
    useKeyEventsHandlerRegister,
    KeyNames, 
} from "@ftyyy/mouseless"


import {
    get_position , 
    decode_position , 
    SPACE_NAME , 
    HOLDING , 
} from "./mouseless"

import { 
    Direction , 
    AutoStack , 
    click_all , 
} from "../../uibase"

import {
    useNode , 
} from "../hooks"

import {
    MouselessButton , 
} from "./msless_style"

import {
    MouselessHint
} from "../msls_hint"


export {
    ButtonGroup , 
}



const ButtonGroup = React.memo(({
    buttons, 

    level , 
    max_level , 

    direction = "row",
}:{
    buttons  : React.ReactNode[]
    direction?: "row" | "column"

    level   : number
    max_level: number
})=>{
    const node = useNode((prev, next) => (prev.idx == next.idx))

    const button_idx   = useSpaceNavigatorRawState(React.useCallback(state=>{
        const {space, node: position} = state
        if(space != SPACE_NAME || !position){
            return undefined
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
            return undefined
        }
        return button_idx
    }, [direction, max_level, node.idx, level]))

    const [cur_selected, set_cur_selected] = React.useState<number | undefined>(undefined)

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()
    
    const button_cnt = buttons.length // 作为组件的按钮数量
    const refs = React.useRef<HTMLDivElement[]>([])
    const father_ref = React.useRef<HTMLDivElement>(null)

    // 设置当前选中的按钮
    React.useEffect(()=>{   
        if(button_idx == undefined){
            if(cur_selected != undefined){
                set_cur_selected(undefined)
            }
            return 
        }

        const act_but_idx = (button_idx % button_cnt + button_cnt) % button_cnt
        if(cur_selected != act_but_idx){
            set_cur_selected(act_but_idx)
        }
    } , [button_idx, button_cnt, cur_selected])

    // 设置选中按钮的行为
    React.useEffect(()=>{
        const handler = ()=>{
            if(cur_selected == undefined || !refs.current[cur_selected]){
                return 
            }
            const div = refs.current[cur_selected]
            click_all(div)
        }

        add_handler(HOLDING, KeyNames.enter, false, handler)
        return ()=>{
            del_handler(HOLDING, KeyNames.enter, false, handler)
        }
    } , [cur_selected])

    React.useEffect(()=>{
        if(cur_selected == undefined || !refs.current[cur_selected]){
            return 
        }
        const div = refs.current[cur_selected]

        const rect = div.getBoundingClientRect()
        const is_visible = rect.top >= 0 
            && rect.left >= 0 
            && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) 
            && rect.right  <= (window.innerWidth  || document.documentElement.clientWidth )

        if(!is_visible){
            div?.scrollIntoView?.({behavior: "smooth", block: "center"})
        }
    } , [cur_selected])

    return <Box ref={father_ref} > 
        <MouselessHint 
            get_anchor_el = {()=>father_ref.current} 
            ctrl_key    ={KeyNames.Alt} 
            keys        ={HOLDING} 
            placement   = "left"
            info        = "← → ⏎"
        />
        <AutoStack force_direction={direction} sx={{
            alignItems: "center",
            gap: "0.5rem",
            paddingY: "0.5rem",
            paddingX: "0.5rem",
        }}>{
            buttons.map((button, idx)=>{
                return <MouselessButton 
                    key = {idx}
                    ref = {React.useCallback((el: HTMLDivElement)=>{refs.current[idx] = el}, [])}
                    is_activated = { React.useMemo(()=>(cur_selected == idx), [cur_selected, idx]) }
                >{button}</MouselessButton>
            })
        }</AutoStack></Box>
})
