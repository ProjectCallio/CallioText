/** 这个模块描述默认实现的按钮栏。
 * 无鼠标操作的约定：所有位置用 JSON.stringify([number, number]) 表示，其中前一个表示行（0/1/2/3=组/行内/支持/结构），后一个表示第几个对象。
 * @module
 */
import React  from "react"

import {
    IconButton , 
    Button , 
    Paper ,
    Divider , 
    Box, 
    PaperProps, 
    BoxProps , 
} from "@mui/material"

import {
    SpaceDefinition , 
    KeyNames , 
    KeyName , 
    NodeName, 
    useSpaceNavigatorState, 
    useKeyEventsHandlerRegister , 
} from "@ftyyy/mouseless"

import {
    EditorComponent , 
} from "../../editor"
import {
    AllConceptTypes, 
} from "../../core"

import { 
    DefaultParameterEditButton , 
    DefaultRootParameterEditButton , 
} from "./buttons"

import { 
    AutoStackButtons, 
    TextIcon , 
    mod_scrollbar ,  
    click_all , 
} from "../../uibase"

import {
    UseAreaStore,
} from "../areas"

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

function MouselessElement({
    my_id,
    cur_activated,
    children,
    ref,
}: {
    my_id: number,
    cur_activated: number | undefined,
    children: React.ReactNode,
    ref?: React.Ref<HTMLDivElement>,
}){
    const is_activated = cur_activated == my_id
    return <Box 
        sx = {{
            border: is_activated ? "1px solid #000" : "none",
        }} 
        ref = {ref}
    >
        {children}
    </Box>
}


/** 这个组件是编辑器的右边工具栏的组件按钮部分。 
 * @param props.editor 所服务的编辑器。
 * @param props.extra 所要额外添加的按钮列表。
*/
function DefaultSidebar({
    editor,
    extras = [],
}: {
    editor: EditorComponent
    extras?: (({editor}: {editor: EditorComponent}) => React.ReactNode)[]
}){
    const root = editor.get_root()
    const [cur_space, cur_node] = useSpaceNavigatorState()

    const button_cnt = React.useMemo(()=>(extras.length + 1), [extras])

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


    return <React.Fragment>
        <MouselessElement 
            my_id = {0} 
            cur_activated={cur_activated} 
            ref = {(el: HTMLDivElement)=>{refs.current[0] = el}}
        >
        <DefaultRootParameterEditButton root={root} editor={editor}/>
        </MouselessElement>
        <Divider />
        {extras.map((extra, exidx)=>{
            const Ex = extra
            return <MouselessElement 
                my_id={exidx + 1} 
                cur_activated={cur_activated} 
                key = {exidx}
                ref = {(el: HTMLDivElement)=>{refs.current[exidx + 1] = el}}
            >
                <Ex editor={editor}/>
            </MouselessElement>
        })}
    </React.Fragment>
}