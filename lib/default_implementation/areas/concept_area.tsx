import * as React from "react"

import {
    Box , 
    Paper , 
    BoxProps ,
    Typography , 
    Stack , 
    IconButton , 
    Button , 
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material"

import {
    KeyNames , 
    useKeyEventsHandlerRegister, 
    useKeyHoldingState, 
    KeyName,
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
    AutoElement , 
} from "../../implbase"

import {
    useCurEditor , 
} from "../../editor"

export {
    ConceptArea , 
    HOLDING , 
}

const concept_list = [
    "group"     as "group"      , 
    "inline"    as "inline"     , 
    "support"   as "support"    , 
    "structure" as "structure"  , 
]


const HOLDING = [KeyNames.alt, KeyNames.x]

// 新的 ConceptArea 组件，使用从左到右布局和 MUI Selector
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
    const [cur_mouseless, set_cur_mouseless] = usePersistedState<[number, number]>(
        `area-${area_id}/concept/cur_mouseless`,[0, 0]
    )
    const holding = useKeyHoldingState(HOLDING)

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


    const [cur_type, cur_idx] = React.useMemo(()=>{
        if(!sec_concept_list){
            return [0, 0]
        }
        const [type, idx] = cur_mouseless
        const M1 = concept_list.length
        const M2 = sec_concept_list[concept_list[type]].length
        return [type, (idx + M2) % M2, (type + M1) % M1]
    }, [cur_mouseless, sec_concept_list])
    const cur_type_name = React.useMemo(()=>(concept_list[cur_type]), [cur_type])

    React.useEffect(()=>{

        const handle_left = ()=>{
            if(!sec_concept_list){
                return
            }
            const M = sec_concept_list[cur_type_name].length
            set_cur_mouseless([cur_type, (cur_idx - 1 + M) % M])
        }
        const handle_right = ()=>{
            if(!sec_concept_list){
                return
            }
            const M = sec_concept_list[cur_type_name].length
            set_cur_mouseless([cur_type, (cur_idx + 1) % M])
        }
        const handle_up = ()=>{
            if(!sec_concept_list){
                return
            }
            const M = sec_concept_list[cur_type_name].length
            set_cur_mouseless([cur_type, (cur_idx - (4 % M) + M) % M])
        }
        const handle_down = ()=>{
            if(!sec_concept_list){
                return
            }
            const M = sec_concept_list[cur_type_name].length
            set_cur_mouseless([cur_type, (cur_idx + 4) % M])
        }
        const handle_enter = ()=>{
            if(!editor || !sec_concept_list){
                return
            }
            editor.new_concept_node(cur_type_name, sec_concept_list[cur_type_name][cur_idx])
        }
        const handle_dot = ()=>{
            if(!sec_concept_list){
                return
            }
            const M1 = concept_list.length
            const M2 = sec_concept_list[cur_type_name].length
            set_cur_mouseless([(cur_type - 1 + M1) % M1, Math.min(cur_idx, M2 - 1)])
        }
        const handle_slash = ()=>{
            if(!sec_concept_list){
                return
            }
            const M1 = concept_list.length
            const M2 = sec_concept_list[cur_type_name].length
            set_cur_mouseless([(cur_type + 1 + M1) % M1, Math.min(cur_idx, M2 - 1)])
        }

        add_handler(HOLDING, KeyNames.Enter     , false, handle_enter)
        add_handler(HOLDING, KeyNames.ArrowLeft , false, handle_left)
        add_handler(HOLDING, KeyNames.ArrowRight, false, handle_right)
        add_handler(HOLDING, KeyNames.ArrowUp   , false, handle_up)
        add_handler(HOLDING, KeyNames.ArrowDown , false, handle_down)
        add_handler(HOLDING, "." as KeyName, false, handle_dot)
        add_handler(HOLDING, "/" as KeyName, false, handle_slash)
        return ()=>{
            del_handler(HOLDING, KeyNames.Enter     , false, handle_enter)
            del_handler(HOLDING, KeyNames.ArrowLeft , false, handle_left)
            del_handler(HOLDING, KeyNames.ArrowRight, false, handle_right)
            del_handler(HOLDING, KeyNames.ArrowUp   , false, handle_up)
            del_handler(HOLDING, KeyNames.ArrowDown , false, handle_down)
            del_handler(HOLDING, "." as KeyName, false, handle_dot)
            del_handler(HOLDING, "/" as KeyName, false, handle_slash)
        }
    }, [cur_type, cur_idx, cur_type_name, sec_concept_list, editor])

    if(!editor || !container || !sec_concept_list){
        return <></>
    }

    return <Paper 
        sx  = {{
            position: "absolute",
            top     : container.y + position.y,
            left    : container.x + position.x,
            width   : "calc(min(20rem, 30vw))",
            
            zIndex  : zIndex,
            
            padding: open ? "1rem" : "0", 
            background: "rgba(255, 255, 255, 0.85)",

            transition: "top 0.1s, left 0.1s, padding 0.3s",
            
            ...paper_sx,

            overflow: "hidden",

        }}
        ref         = {box_ref} 
    >
    <AnimatePresence mode="wait">{(
        open
    ) && (
        <motion.div
            initial     = {{ height: 0, opacity: 0 }}
            animate     = {{ height: "fit-content" , opacity: 1  }}
            exit        = {{ height: 0 , opacity: 0 }}
            transition  = {{ 
                duration: 0.3,
                ease: "easeOut"
            }}
            style={{
                top     : "0"  , 
                width   : "100%",
                opacity: 1,

                maxHeight: "calc(min(40rem, 70vh))", 

                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }}
        >
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "1rem",
                width: "100%",
            }}>

                {/* Concept Type Selector */}
                <FormControl sx={{ 
                    flexGrow: 1,
                }}>
                    <InputLabel sx={{
                        color: "rgba(0, 0, 0, 0.7)",
                        fontWeight: 500,
                    }}>
                        概念类型
                    </InputLabel>
                    <Select
                        value={cur_type_name}
                        label="概念类型"
                        onChange={(e) => {
                            const new_typename = e.target.value as Exclude<AllConceptTypes, "abstract">
                            const new_typeidx = concept_list.indexOf(new_typename)
                            const M = sec_concept_list[new_typename].length
                            const new_idx  = Math.min(cur_idx ?? 0, M - 1)
                            set_cur_mouseless([new_typeidx, new_idx])
                        }}
                        size="small"
                    >
                        {concept_list.map((typename) => (
                            <MenuItem key={typename} value={typename} sx={{
                                borderRadius: "8px",
                                margin: "2px 4px",
                            }}>
                                {{
                                    "group": "组", 
                                    "inline": "行内", 
                                    "support": "支持", 
                                    "structure": "结构", 
                                }[typename]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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

            {/* Concept List */}
            <motion.div layout transition={{ duration: 0.3, ease: "easeOut" }}>
            <Box ref={mod_scrollbar} sx={{
                overflow: "auto",
                height: "fit-content",
                flexGrow: 1,
                minHeight: 0 , 
                maxHeight: "calc(min(25rem, 30vh))",
                padding: "0.2rem",
            }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "0.75rem",
            }}><AnimatePresence mode="popLayout">
                {sec_concept_list[cur_type_name].map((sec_ccpt, idx) => (
                    <motion.div
                        key={`${cur_type_name}-${sec_ccpt}`}
                        layoutId={`${cur_type_name}-${sec_ccpt}`}
                        layout
                        initial = {{ opacity: 0, scale: 0.1}}
                        animate = {{ opacity: 1, scale: 1}}
                        exit    = {{ opacity: 0, scale: 0.1}}
                        transition={{ 
                            duration: 0.3,
                            ease: "easeOut"
                        }}
                        style={{
                            overflow: "visible"
                        }}
                    >
                    <MouselessButton
                        key={sec_ccpt}
                        is_activated={cur_idx == idx && holding}
                        auto_element
                        autoel_style={{
                            borderRadius: "8px",
                        }}
                    >
                        <Button 
                            size="small"
                            component = { "span" }
                            onClick={() => {
                                editor.new_concept_node(cur_type_name , sec_ccpt)
                            }}
                            sx={{
                                minWidth: "fit-content",
                                whiteSpace: "nowrap",
                                borderRadius: "8px",
                                border: (cur_idx == idx) ? "1px solid rgba(0, 0, 0, 0.4)" : "none",
                            }}
                        >
                            {sec_ccpt}
                        </Button>
                    </MouselessButton>
                    </motion.div>
                ))}</AnimatePresence>
            </Box></Box></motion.div>
        </motion.div>
    )}</AnimatePresence></Paper>
})

// ConceptArea.whyDidYouRender = true