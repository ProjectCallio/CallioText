/**
 * 在sectional editor中，我们提供一个一直存在的区域来编辑参数。
 */
import * as React from "react"
import * as Slate from "slate"

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
    Box , 
    BoxProps , 
    Button , 
    Typography , 
    Paper , 
    IconButton , 
    Stack , 
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import {
    HardDriveDownload as HardDriveDownloadIcon,
} from "lucide-react"
import { useSnackbar } from "notistack"

import {
    DefaultParameterContainer , 
    DefaultParameterContainerRef, 
    AutoIconButton , 
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
    const {enqueueSnackbar} = useSnackbar()
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
    const [navi_space, navi_position] = useSpaceNavigatorState(SPACE.name)
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
        sx  = {{
            position: "absolute",
            top     : container.y + position.y,
            left    : container.x + position.x,
            width   : "calc(min(15rem, 25vw))",
            zIndex  : zIndex,
            overflow: "hidden" ,

            padding: open ? "1.5rem" : "0", 

            // opacity: open ? 1 : 0,
            
            background: "rgba(255, 255, 255, 0.8)",
            
            // 移除 height 过渡，让 framer-motion 处理
            transition: "top 0.1s, left 0.1s, opacity 0.3s, padding 0.3s",
                        
            ...paper_sx
        }}
        ref = {box_ref} 
    >            
    
    <AnimatePresence mode="sync">{open && <motion.div
        initial = {{ opacity: 0.1 , y: 50 , height: 0 }}
        animate = {{ opacity: 1 , y: 0 , height: "fit-content" }}
        exit    = {{ opacity: 0.1 , y: -50 , height: 0 }}
        transition = {{ duration: 0.3 }}
    >
    <Box sx={{
        display: "flex",
        alignItems: "space-between",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
        paddingBottom: "0.5rem",
    }}>
        
        <AutoIconButton 
            onClick={()=>{
                const parameters = parametereditor_ref.current?.get_parameters()
                if(!parameters){
                    return
                }
                console.log("cur_node", cur_node)
                editor.auto_set_parameter(cur_node, parameters)
                enqueueSnackbar("修改参数成功", {
                    variant: "success",
                })
            }}
            title = "应用参数"
            icon = {HardDriveDownloadIcon}
            size = "medium"
        />

        <Box sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: "1rem",
        }}>

            <AnimatePresence mode="sync">
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                }}>
                <Typography 
                    sx={{
                        fontWeight: 600,
                        color: "rgba(0, 0, 0, 0.87)",
                        fontSize: "1.05rem",
                        letterSpacing: "0.02em",
                    }}
                ><motion.span
                    initial = {{ opacity: 0 , x: -50  }}
                    animate = {{ opacity: 1 , x: 0   }}
                    exit    = {{ opacity: 0 , x: 50 }}
                    transition = {{ duration: 0.3 }}
                    key = {cur_node.idx}
                    layout = {true}
                >{cur_node.concept}</motion.span>
                </Typography>

                <Typography sx={{
                    fontSize: "0.6rem",
                    color: "rgba(0, 0, 0, 0.5)",
                    marginY: "-0.2rem",
                }}><motion.span
                    initial = {{ opacity: 0 , x: -50  }}
                    animate = {{ opacity: 1 , x: 0   }}
                    exit    = {{ opacity: 0 , x: 50 }}
                    transition = {{ duration: 0.3 }}
                    key = {cur_node.idx}
                    layout = {true}
                >{cur_node.idx}</motion.span></Typography>
                </Box>
            </AnimatePresence>
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
    </Box>
    </motion.div>}</AnimatePresence>


        
    <AnimatePresence mode="sync">{(
        open // 不知道为什么但是这里open && 后面必须立刻接一个motion.div，
             // 哪怕是套一个React.Fragment都不行。
    ) && <motion.div
        key         = { cur_node.idx }
        initial     = {{ height: 0, opacity: 0 , y: 50 }}
        animate     = {{ height: "fit-content" , opacity: 1 , y: 0 }}
        exit        = {{ height: 0 , opacity: 0 , y: -50 }}
        transition  = {{ duration: 0.3 }}
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
                enqueueSnackbar("已自动应用参数", {
                    variant: "success",
                })
            }}
        /></Box>
    </motion.div>}</AnimatePresence>
    
    </Paper>
})