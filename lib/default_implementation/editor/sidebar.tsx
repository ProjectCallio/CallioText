/** 这个模块描述默认实现的按钮栏。
 * 无鼠标操作的约定：所有位置用 JSON.stringify([number, number]) 表示，其中前一个表示行（0/1/2/3=组/行内/支持/结构），后一个表示第几个对象。
 * @module
 */
import React  from "react"

import {
    Divider , 
} from "@mui/material"

import {
    SpaceDefinition , 
    KeyNames , 
    NodeName, 
    useSpaceNavigatorState, 
    useKeyEventsHandlerRegister , 
} from "@ftyyy/mouseless"

import {
    useEditor ,  
} from "../../editor"

import { 
    DefaultRootParameterEditButton , 
    ParamAreaControlButton,
    ConceptAreaControlButton,
} from "./buttons"

import { 
    click_all , 
    AutoStack , 
} from "../../uibase"

import {
    MouselessButton,
    MouselessHint,
    ShowHintControlButton,
} from "../../implbase"

export {
    DefaultSidebar , 
    SPACE , 
}

const SPACE: SpaceDefinition = {
    name: "sidebar",
    holding: [KeyNames.alt, KeyNames.e],
    nodes: [] , 
    
    onStart: (last?: NodeName)=> last ?? "0" , 
    edges: [
        {pressing: KeyNames.ArrowDown, onMove: (from?:NodeName)=>{
            return (! from) ? ("0") : ( parseInt(from) + 1 ).toString()
        }} , 
        {pressing: KeyNames.ArrowUp, onMove: (from?:NodeName)=>{
            return (! from) ? ("0") : ( parseInt(from) - 1 ).toString()
        }}
    ]
}


/** 这个组件是编辑器的右边工具栏的组件按钮部分。 
 * @param props.editor 所服务的编辑器。
 * @param props.extra 所要额外添加的按钮列表。
*/
const DefaultSidebar = React.memo(({
    extras = [],
}: {
    extras?: ( React.ComponentType<{}> )[]
})=>{
    const [cur_space, cur_node] = useSpaceNavigatorState(SPACE.name)

    const button_cnt = React.useMemo(()=>(extras.length + 4), [extras])

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()
    const refs = React.useRef<HTMLDivElement[]>([])

    const cur_activated = React.useMemo(()=>{
        if(cur_space != SPACE.name){
            return undefined
        }
        const val = cur_node ? parseInt(cur_node) : undefined
        if(val == undefined || isNaN(val)){
            return undefined
        }
        return ((val % button_cnt) + button_cnt) % button_cnt
    }, [cur_space, cur_node, button_cnt])

    React.useEffect(()=>{
        const handler = ()=>{
            if(
                cur_space != SPACE.name 
                || cur_activated == undefined 
                || !refs.current[cur_activated]
            ){
                return 
            }
            const div = refs.current[cur_activated]
            click_all(div)
        }

        add_handler(SPACE.holding, KeyNames.enter, false, handler)
        return ()=>{
            del_handler(SPACE.holding, KeyNames.enter, false, handler)
        }
    } , [cur_activated])


    return <AutoStack 
        force_direction="column"
        sx={{
            alignItems: "center",
            paddingLeft: "0.15rem",
        }}
    >
        <MouselessHint 
            get_anchor_el={()=> refs.current[0]} 
            ctrl_key={KeyNames.Alt} 
            keys={SPACE.holding} 
            placement = "top"
            info = "↑ ↓ ⏎"
        />

        <MouselessButton 
            is_activated={cur_activated == 0}
            ref = {(el: HTMLDivElement)=>{refs.current[0] = el}}
            className = "calliotext-sidebarbuttons-rootedit"
        >
            <DefaultRootParameterEditButton />
        </MouselessButton>

        <MouselessButton 
            is_activated={cur_activated == 1}
            ref = {(el: HTMLDivElement)=>{refs.current[1] = el}}
            className = "calliotext-sidebarbuttons-paramarea"
        >
            <ParamAreaControlButton/>
        </MouselessButton>

        <MouselessButton 
            is_activated={cur_activated == 2}
            ref = {(el: HTMLDivElement)=>{refs.current[2] = el}}
            className = "calliotext-sidebarbuttons-conceptarea"
        >
            <ConceptAreaControlButton/>
        </MouselessButton>
        <MouselessButton 
            is_activated={cur_activated == 3}
            ref = {(el: HTMLDivElement)=>{refs.current[3] = el}}    
            className = "calliotext-sidebarbuttons-showhint"
        >
            <ShowHintControlButton/>
        </MouselessButton>
        
        <Divider flexItem sx={{
            width: "calc(100% + 0.15rem)",
            marginY: "0.5rem",
            marginLeft: "-0.15rem",
        }}/>
        {extras.map((extra, exidx)=>{
            const Ex = extra
            return <MouselessButton 
                is_activated={cur_activated == exidx + 4}
                key = {exidx}
                ref = {(el: HTMLDivElement)=>{refs.current[exidx + 4] = el}}
            >
                <Ex />
            </MouselessButton>
        })}
    </AutoStack>
})