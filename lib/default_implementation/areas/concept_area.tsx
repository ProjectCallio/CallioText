import * as React from "react"

import {
    Box , 
    Paper , 
    BoxProps ,
    Typography , 
    Stack , 
    IconButton , 
    Button , 
} from "@mui/material"

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
    AnimatePresence , 
    motion , 
} from "framer-motion"

import {
    useAreaStore , 
    AreaName, 
    area_container_ref , 
} from "./base"

import {
    AllConceptTypes , 
    SecondClassConcept , 
} from "../../core"

import {
    mod_scrollbar , 
    ScrollBarBox , 
    usePersistedState,
    DraggerBox,
} from "../../uibase"

import {
    MouselessButton , 
} from "../../implbase"

import {
    useCurEditor , 
} from "../../editor"

export {
    ConceptArea , 
    SPACE , 
}

const concept_list = [
    "group"     as "group"      , 
    "inline"    as "inline"     , 
    "support"   as "support"    , 
    "structure" as "structure"  , 
]

function encode_position(
    side : number , // 0表示在选type，1表示在选concept
    idx  : number , 
    otherside_idx: number , 
): string{
    return JSON.stringify([side, idx, otherside_idx])
}
function decode_position(position: string): [number, number, number]{
    return JSON.parse(position) as [number, number, number]
}

const SPACE: SpaceDefinition = {
    name: "concept_area",
    holding: [KeyNames.alt, KeyNames.x],
    nodes: [],
    onStart: (last?: NodeName)=> {
        return last ?? encode_position(1, 0, 0)
    } , 
    edges: [
        {pressing: KeyNames.ArrowLeft, onMove: (from?:string)=>{
            if(!from){
                return encode_position(1, 0, 0)
            }
            const [side, idx, otherside_idx] = decode_position(from)
            return encode_position(side ^ 1, otherside_idx, idx)
        }} , 
        {pressing: KeyNames.ArrowRight, onMove: (from?:string)=>{
            if(!from){
                return encode_position(1, 0, 0)
            }
            const [side, idx, otherside_idx] = decode_position(from)
            return encode_position(side ^ 1, otherside_idx, idx)
        }} , 
        {pressing: KeyNames.ArrowUp, onMove: (from?:string)=>{
            if(!from){
                return encode_position(1, 0, 0)
            }
            const [side, idx, otherside_idx] = decode_position(from)
            return encode_position(side, idx - 1, otherside_idx)
        }} , 
        {pressing: KeyNames.ArrowDown, onMove: (from?:string)=>{
            if(!from){
                return encode_position(1, 0, 0)
            }
            const [side, idx, otherside_idx] = decode_position(from)
            return encode_position(side, idx + 1, otherside_idx)
        }} , 
    ]
}


const ConceptArea = React.memo(({
    paper_sx , 
    zIndex = 1000 , 
    area_id , 
}:{
    paper_sx?: BoxProps["sx"]
    zIndex?: number
    area_id: AreaName
})=>{

    const editor = useCurEditor() // 当前正在编辑的编辑器
    
    // 为了当container变化的时候获得正确的container_ref
    const container_version = useAreaStore(state => state.container_version)
    const container = area_container_ref.current?.getBoundingClientRect()
    
    const open        = useAreaStore(state => state.open.concep)
    const position    = useAreaStore(state => state.positions[area_id])
    const dragging_me = useAreaStore(state => state.dragging == area_id)
    
    const box_ref = React.useRef<HTMLDivElement>(null)

    // 保存当前选中的概念类型。
    const [cur_type, set_cur_type] = usePersistedState<
        Exclude<AllConceptTypes , "abstract">
    >(`area-${area_id}/concept/cur_type`,"group")

    // 当前无鼠标操作的状态
    const [navi_space, navi_position] = useSpaceNavigatorState()
    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    // 拖拽状态
    const {set_dragging, set_sizes} = useAreaStore.getState()

    const sec_concept_list = React.useMemo(()=>{
        let editorcore = editor?.get_editorcore()
        if(!editorcore){
            return undefined
        }
        return concept_list.reduce((cur, typename) => {
            cur[typename] = editorcore.get_sec_concept_list(typename)
            return cur
        }, {} as {[key in Exclude<AllConceptTypes , "abstract">]: string[]})
    }, [editor])

    const [cur_side, cur_idx] = React.useMemo(()=>{
        if(navi_space != SPACE.name ||!navi_position || !sec_concept_list || !editor){
            return [undefined, undefined]
        }
        let [side, idx, _] = decode_position(navi_position)
        let M = 0
        if(side == 0){
            M = concept_list.length
        }
        if(side == 1){
            M = sec_concept_list[cur_type].length
        }
        idx = M > 0 ? (idx % M + M) % M : 0
        return [side, idx]
    }, [navi_space, navi_position, sec_concept_list, editor, cur_type])

    React.useEffect(()=>{
        if(cur_side == undefined || cur_idx == undefined || !sec_concept_list || !editor){
            return
        }
        const handler = ()=>{
            if(cur_side == 0){
                const M = concept_list.length
                set_cur_type(concept_list[cur_idx])
            } 
            if(cur_side == 1){
                editor.new_concept_node(cur_type , sec_concept_list[cur_type][cur_idx])
            }
        }
        add_handler(SPACE.holding, KeyNames.Enter, false, handler)
        return ()=>{
            del_handler(SPACE.holding, KeyNames.Enter, false, handler)
        }
    }, [cur_side, cur_idx, sec_concept_list, editor])

    if(!editor || !container || !sec_concept_list){
        return <></>
    }

    return <Paper 
        sx  = {{
            position: "absolute",
            top     : container.y + position.y,
            left    : container.x + position.x,
            width   : "calc(min(20rem, 20vw))",
            zIndex  : zIndex,
            
            ...paper_sx,

            padding: open ? "2rem" : "0", 
        }}
        ref         = {box_ref} 
    >
    <AnimatePresence mode="wait">{(
        open
    ) && (
        <motion.div
            initial     = {{ opacity: 0 }}
            animate     = {{ opacity: 1 }}
            exit        = {{ opacity: 0 }}
            transition  = {{ 
                duration: 0.2,
                transition: "easeInOut"
            }}
            style={{
                top     : "0"  , 
                width   : "100%",
                opacity: 1,

                maxHeight: "calc(min(40rem, 70vh))", 
                overflow: "hidden",

                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }}
        >
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

            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",

                overflow: "hidden",
                minHeight: 0 , 
                gap: "1rem",
            }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                }}>{concept_list.map((typename, type_idx) => {
                    return <MouselessButton
                        key={typename}
                        is_activated={(
                            cur_side == 0 && type_idx == cur_idx
                        )}
                    ><Button 
                        onClick={() => set_cur_type(typename)}
                    >{{
                        "group": "组", 
                        "inline": "行内", 
                        "support": "支持", 
                        "structure": "结构", 
                    }[typename]}</Button></MouselessButton>
                })}</Box>

                <Box ref={mod_scrollbar} sx={{
                    overflow: "auto",
                    minHeight: 0 , 
                    height: "auto",
                    flexGrow: 1,
                }}><Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                }}>{sec_concept_list[cur_type].map((sec_ccpt) => (
                    <MouselessButton
                        key={sec_ccpt}
                        is_activated={(
                            cur_side == 1 && cur_idx == sec_concept_list[cur_type].indexOf(sec_ccpt)
                        )}
                    >
                        <Button 
                            onClick={() => {
                                editor.new_concept_node(cur_type , sec_ccpt)
                            }}
                        >{sec_ccpt}</Button>
                    </MouselessButton>
                ))}</Box>
                </Box>
            </Box>
        </motion.div>
    )}</AnimatePresence></Paper>
})

