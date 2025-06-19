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
    DraggerBox, 
    AreaName, 
    area_container_ref , 
} from "./base"
import {
    mod_scrollbar ,
    usePersistedState ,  
} from "../../uibase"

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
        const cur_node = useAreaStore.getState().editor?.get_cur_concept_node()
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
            const cur_node = useAreaStore.getState().editor?.get_cur_concept_node()
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
            const cur_node = useAreaStore.getState().editor?.get_cur_concept_node()
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
            const cur_node = useAreaStore.getState().editor?.get_cur_concept_node()
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
            const cur_node = useAreaStore.getState().editor?.get_cur_concept_node()
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
    const editor = useAreaStore(state => state.editor)
    
    // 依赖nodeparam_version是为了当node被外部编辑的时候获得正确的cur_node
    const nodeparam_version = useAreaStore(state => state.nodeparam_version)
    const cur_node = React.useMemo(()=>editor?.get_cur_concept_node(), [nodeparam_version, editor])

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
        elevation = {3} 
        sx  = {{
            position: "absolute",
            top     : container.y + position.y,
            left    : container.x + position.x,
            width   : "calc(min(20rem, 20vw))",
            zIndex  : zIndex,
            height  : "auto" , 
            overflow: "auto" ,

            padding: open ? "2rem" : "0", 
            
            ...paper_sx
        }}
        ref = {box_ref} 
    >
    <AnimatePresence mode="sync">{(
        open
    ) && (
        <motion.div
            key         = { cur_node.idx }
            initial     = {{ opacity: 0 }}
            animate     = {{ opacity: 1 }}
            exit        = {{ opacity: 0 }}
            transition  = {{ 
                duration: 0.15,
                ease: "easeOut"
            }}
            style={{
                top     : "0"  , 
                width   : "100%",
                opacity: 1,

                display: "flex",
                flexDirection: "column",
                gap: "1rem",

                height: open ? "100%" : "0", 
            }}
        >
            <DraggerBox  
                father_name = {area_id}
                dragging_me = {dragging_me} 
                father_ref  = {box_ref}
            />
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <Typography variant="h6">
                    {cur_node.concept}
                </Typography>
            </Box>
            <Box ref = {mod_scrollbar} sx={{
                overflow: "auto",
                maxHeight: "calc(min(40rem, 50vh))",
            }}>
                <DefaultParameterContainer 
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
                />
            </Box>
        </motion.div>
    )}</AnimatePresence></Paper>
})