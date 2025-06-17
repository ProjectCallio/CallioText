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
} from "@ftyyy/mouseless"

import {
    AnimatePresence , 
    motion , 
} from "framer-motion"

import {
    useAreaStore , 
    DraggerBox,
    AreaName, 
    area_container_ref , 
} from "./base"
import { EditorComponentEditingBox } from "../editor/uibase"

import {
    AllConceptTypes , 
    SecondClassConcept , 
} from "../../core"

import {
    mod_scrollbar , 
    ScrollBarBox , 
    usePersistedState,
} from "../../uibase"


export {
    ConceptArea , 
    HOLDING , 
}


const HOLDING = [KeyNames.alt, KeyNames.d]

const concept_list = [
    "group"     as "group"      , 
    "inline"    as "inline"     , 
    "support"   as "support"    , 
    "structure" as "structure"  , 
]

const ConceptArea = React.memo(({
    paper_sx , 
    zIndex = 1000 , 
    area_id , 
}:{
    paper_sx?: BoxProps["sx"]
    zIndex?: number
    area_id: AreaName
})=>{

    const editor = useAreaStore(state => state.editor)
    const version = useAreaStore(state => state.edit_version)
    
    const position    = useAreaStore(state => state.positions[area_id])
    const dragging_me = useAreaStore(state => state.dragging == area_id)
    
    const container = area_container_ref.current?.getBoundingClientRect()
    const box_ref = React.useRef<HTMLDivElement>(null)

    // 保存当前选中的概念类型。
    const [cur_type, set_cur_type] = usePersistedState<
        Exclude<AllConceptTypes , "abstract">
    >(`area-${area_id}/concept/cur_type`,"group")    

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

    if(!editor || !container || !sec_concept_list){
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
            
            padding: "2rem" , 
            ...paper_sx
        }}
        ref         = {box_ref} 
    >
    <AnimatePresence mode="wait">{(
        editor 
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
                father_name = {area_id}
                dragging_me = {dragging_me} 
                father_ref  = {box_ref}
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
                }}>{concept_list.map((typename) => {
                    return <Button 
                        key={typename}
                        onClick={() => set_cur_type(typename)}
                    >{{
                        "group": "组", 
                        "inline": "行内", 
                        "support": "支持", 
                        "structure": "结构", 
                    }[typename]}</Button>
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
                    <Button key={sec_ccpt}
                        onClick={() => {
                            editor.new_concept_node(cur_type , sec_ccpt)
                        }}
                    >{sec_ccpt}</Button>
                ))}</Box>
                </Box>
            </Box>
        </motion.div>
    )}</AnimatePresence></Paper>
})
