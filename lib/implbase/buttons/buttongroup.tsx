/** 
 * 这个模块一个按钮组的组件按。
 * @module
 */

import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"

import {
    useSpaceNavigatorState,  
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
} from "../mouseless_style"


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
    const node                         = useNode((prev, next) => (prev.idx == next.idx))

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
            let swap = level_idx
            level_idx = button_idx
            button_idx = swap
        }
        const M = Math.max(max_level  + 1, 1)
        level_idx = ((level_idx % M) + M) % M 

        if(node_idx != node.idx || level_idx != level){
            set_cur_selected(undefined)
            return 
        }

        const act_but_idx = (button_idx % button_cnt + button_cnt) % button_cnt
        set_cur_selected(act_but_idx)

    } , [cur_space, cur_position, level, button_cnt, node.idx, direction ])

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

    const ret = React.useMemo(()=>{
        return <React.Fragment>
        </React.Fragment>
    } , [buttons, cur_selected])

    return <AutoStack direction = {direction}>{
        buttons.map((button, idx)=>{
            return <MouselessButton 
                key = {idx}
                ref = {(el: HTMLDivElement)=>{refs.current[idx] = el}}
                is_activated = {cur_selected == idx}
            >{button}</MouselessButton>
        })
    }</AutoStack>
})

// ButtonGroup.whyDidYouRender = true