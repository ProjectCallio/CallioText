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
    AnimatePresence , 
    motion , 
} from "framer-motion"

import {
    UseAreaStore , 
    DraggerBox, 
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
}

const concept_list = [
    "group"     as "group"      , 
    "inline"    as "inline"     , 
    "support"   as "support"    , 
    "structure" as "structure"  , 
]

const ConceptArea = React.memo(({
    paper_sx , 
    onDragStart , 
    position , 
    onSetSize , 
    zIndex = 1000 , 
    area_id , 
    dragging_me , 
}:{
    paper_sx?: BoxProps["sx"]
    onDragStart?: (e: React.MouseEvent) => void
    position: {x: number, y: number}
    onSetSize?: (size: {width: number, height: number}) => void
    zIndex?: number
    area_id: string
    dragging_me: boolean
})=>{

    const editor = UseAreaStore(state => state.editor)
    const box_ref = React.useRef<HTMLDivElement>(null)

    let [cur_type, set_cur_type] = usePersistedState<
        Exclude<AllConceptTypes , "abstract">
    >(`area-${area_id}/concept/cur_type`,"group")

    if(!editor){
        return <></>
    }
    const editorcore = editor.get_editorcore()

    const sec_concept_list = concept_list.reduce((cur, typename) => {
        cur[typename] = editorcore.get_sec_concept_list(typename)
        return cur
    }, {} as {[key in Exclude<AllConceptTypes , "abstract">]: string[]})

    return <Paper 
        elevation = {3} 
        sx  = {{
            position: "absolute",
            top     : position.y,
            left    : position.x,
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
            ref         = {box_ref}
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
                onSetSize   = {onSetSize} 
                onDragStart = {onDragStart} 
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

