/**
 * 在sectional editor中，我们提供一个一直存在的区域来编辑参数。
 */
import * as React from "react"
import * as Slate from "slate"
import {
    NavigateBefore , 
    NavigateNext , 
} from "@mui/icons-material"

import {
    KeyNames , 
    KeyName , 
    useKeyHoldingState , 
    NodeName, 
    SpaceDefinition, 
    useSpaceNavigatorState,
    useKeyEventsHandlerRegister , 
    NO_ACTION , 
} from "@ftyyy/mouseless"

import {
    Node , 
    find_concept_nodes_by_path , 
    ConceptNode , 
    find_node_by_path , 
} from "../../core"
import {
    EditorComponent , 
} from "../../editor"
import {
    Box , 
    BoxProps , 
    Button , 
    Typography , 
    Paper , 
    IconButton , 
    Stack , 
} from "@mui/material"
import {
    create , 
} from "zustand"
import { motion, AnimatePresence } from "framer-motion"

import {
    DefaultParameterContainer , 
    DefaultParameterContainerRef, 
} from "../../implbase"
import {
    ParameterList , 
} from "../../core"

import {
    useAreaStore , 
    AreaName, 
    area_container_ref , 
} from "./base"
import {
    mod_scrollbar_nohide , 
    usePersistedState ,  
    DraggerBox, 
} from "../../uibase"

import {
    useCurEditor , 
    useCurConceptNode , 
    useCurConceptNodeIdxParam , 
} from "../../editor"

export {
    ParameterArea , 
    SPACE , 
}

function encode_position(node_idx: string, param_idx: number): string{
    return JSON.stringify([node_idx, param_idx])
}
function decode_position(position: string): [string, number]{
    return JSON.parse(position) as [string, number]
}

const SPACE: SpaceDefinition = {
    name: "parameter_area",
    holding: [KeyNames.alt, KeyNames.z],
    nodes: [],
    onStart: (last?: NodeName)=> {
        const cur_node = useCurConceptNode.current()
        if(!cur_node){
            return NO_ACTION
        }

        // 如果上一次也停在当前节点，则返回上一次的position
        const [last_node, last_paramidx] = last ? decode_position(last) : [null, -1]
        if(last_node == cur_node.idx && !isNaN(last_paramidx)){
            return last ?? NO_ACTION
        }

        return encode_position(cur_node.idx, 0)
    } , 
    edges: [
        {pressing: KeyNames.ArrowLeft, onMove: (from?:string)=>{
            const cur_node = useCurConceptNode.current()
            if(!cur_node){
                return from ?? NO_ACTION
            }
            const [last_node, last_paramidx] = from ? decode_position(from) : [null, -1]
            if(last_node == cur_node.idx && !isNaN(last_paramidx)){
                return encode_position(cur_node.idx, last_paramidx-1) ?? NO_ACTION
            }
            return encode_position(cur_node.idx, 0)
        }} , 
        {pressing: KeyNames.ArrowRight, onMove: (from?:string)=>{
            const cur_node = useCurConceptNode.current()
            if(!cur_node){
                return from ?? NO_ACTION
            }
            const [last_node, last_paramidx] = from ? decode_position(from) : [null, -1]
            if(last_node == cur_node.idx && !isNaN(last_paramidx)){
                return encode_position(cur_node.idx, last_paramidx+1) ?? NO_ACTION
            }
            return encode_position(cur_node.idx, 0)
        }} , 
        {pressing: KeyNames.ArrowUp, onMove: (from?:string)=>{
            const cur_node = useCurConceptNode.current()
            if(!cur_node){
                return from ?? NO_ACTION
            }
            const [last_node, last_paramidx] = from ? decode_position(from) : [null, -1]
            if(last_node == cur_node.idx && !isNaN(last_paramidx)){
                return encode_position(cur_node.idx, last_paramidx-1) ?? NO_ACTION
            }
            return encode_position(cur_node.idx, 0)
        }} , 
        {pressing: KeyNames.ArrowDown, onMove: (from?:string)=>{
            const cur_node = useCurConceptNode.current()
            if(!cur_node){
                return from ?? NO_ACTION
            }
            const [last_node, last_paramidx] = from ? decode_position(from) : [null, -1]
            if(last_node == cur_node.idx && !isNaN(last_paramidx)){
                return encode_position(cur_node.idx, last_paramidx+1) ?? NO_ACTION
            }
            return encode_position(cur_node.idx, 0)
        }} , 
    ]
}
const ParameterArea = React.memo(({
    paper_sx , 
    zIndex = 1000 , 
    area_id, 
}:{
    paper_sx?: BoxProps["sx"]
    zIndex?: number
    area_id: AreaName
})=>{
    const editor = useCurEditor() // 当前正在编辑的编辑器
    
    // 当前节点。但是只有参数变化才刷新。
    const cur_node = useCurConceptNodeIdxParam()

    // 依赖container_version是为了获得正确的container_ref
    const container = area_container_ref.current?.getBoundingClientRect()
    const container_version = useAreaStore(state => state.container_version)

    const open = useAreaStore(state => state.open.param)
    const position    = useAreaStore(state => state.positions[area_id])
    const dragging_me = useAreaStore(state => state.dragging == area_id)
    
    const box_ref = React.useRef<HTMLDivElement>(null)

    const parametereditor_ref = React.useRef<DefaultParameterContainerRef>(null)

    // 无鼠标状态
    const [navi_space, navi_position] = useSpaceNavigatorState()
    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    // 拖拽状态
    const {set_dragging, set_sizes} = useAreaStore.getState()


    // 当前选中的参数位置
    const navi_paramidx = React.useMemo(()=>{
        if(!navi_position || navi_space != SPACE.name){
            return undefined
        }
        let [nv_node, nv_paramidx] = decode_position(navi_position)
        if(nv_node != cur_node?.idx){
            return undefined
        }
        let M = Object.keys(cur_node.parameters).length
        return ((nv_paramidx % M) + M) % M
    }, [navi_position, navi_space, cur_node])

    // 监听enter键
    React.useEffect(()=>{
        const handler = ()=>{
            const el = parametereditor_ref.current?.get_itemref(navi_paramidx)
            if(!el){
                return
            }
            el.focus()
        }
        add_handler(SPACE.holding, KeyNames.Enter, false, handler)
        return ()=>{
            del_handler(SPACE.holding, KeyNames.Enter, false, handler)
        }
    }, [navi_paramidx])
    
    if(!editor || !container || !cur_node){
        return <></>
    }

    return <Paper 
            elevation = {8} 
            sx  = {{
                position: "absolute",
                top     : container.y + position.y,
                left    : container.x + position.x,
                width   : "calc(min(15rem, 25vw))",
                zIndex  : zIndex,
                overflow: "visible" ,

                padding: open ? "1.5rem" : "0", 
                
                // 现代化样式
                background: "rgba(255, 255, 255, 0.8)",
                
                // 移除 height 过渡，让 framer-motion 处理
                transition: "top 0.1s, left 0.1s",
                            
                ...paper_sx
            }}
            ref = {box_ref} 
        >
        <AnimatePresence mode="sync">{(
            open
        ) && (
            <motion.div
                key         = { cur_node.idx }
                initial     = {{ height: 0, opacity: 0 , y: 50 }}
                animate     = {{ height: "fit-content" , opacity: 1 , y: 0 }}
                exit        = {{ height: 0 , opacity: 0 , y: -50 }}
                transition  = {{ 
                    duration: 0.3,
                    ease: "easeOut"
                }}
                layout     = {true}
                style={{
                    top     : "0"  , 
                    width   : "100%",
                    opacity: 1,

                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                }}
            >
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                }}>
                    <Typography 
                        variant="h6" 
                        sx={{
                            fontWeight: 600,
                            color: "rgba(0, 0, 0, 0.87)",
                            fontSize: "1.1rem",
                            letterSpacing: "0.02em",
                        }}
                    >
                        {cur_node.concept}
                    </Typography>
                    <DraggerBox  
                        my_position = {position}
                        dragging_me = {dragging_me} 
                        onDragStart = {e=>{
                            set_dragging(area_id)
                            if(box_ref.current){
                                const rect = box_ref.current.getBoundingClientRect()
                                set_sizes({[area_id]: {
                                    width : rect.width,
                                    height: rect.height,
                                }})
                            }
                        }}
                    />
                </Box>
                <Box
                    ref = {mod_scrollbar_nohide}
                    key={cur_node.idx}
                    sx={{
                        overflow: "auto",
                        maxHeight: "calc(min(35rem, 35vh))",
                        paddingRight: "0.5rem",
                    }}
                ><DefaultParameterContainer 
                    ref = {parametereditor_ref}
                    node = {cur_node}
                    autoblur = {e=>e.key == KeyNames.z && e.altKey}
                    onSave = {(parameters: ParameterList) => {
                        editor.auto_set_parameter(cur_node, parameters)
                    }}
                    select_paramidx = {navi_paramidx}
                    onAutoBlur = {()=>{
                        const parameters = parametereditor_ref.current?.get_parameters()
                        if(!parameters){
                            return
                        }
                        editor.auto_set_parameter(cur_node, parameters)
                    }}
                /></Box>
            </motion.div>
        )}</AnimatePresence></Paper>
})