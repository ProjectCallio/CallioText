/**
 * 在sectional editor中，我们提供一个一直存在的区域来编辑参数。
 */
import * as React from "react"
import * as Slate from "slate"
import {
    Node , 
    find_concept_nodes_by_path , 
    ConceptNode , 
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
import {
    DefaultParameterContainer , 
} from "../../implbase/parameter_edit"
import {
    ParameterList , 
} from "../../core"
import {
    NavigateBefore , 
    NavigateNext , 
} from "@mui/icons-material"

import { motion, AnimatePresence } from "framer-motion"
import {
    UseAreaStore , 
    DraggerBox , 
} from "./base"
import {
    mod_scrollbar , 
} from "../../uibase"

export {
    ParameterArea , 
}

const ParameterArea = React.memo(({
    paper_sx , 
    onDragStart , 
    position , 
    onSetSize , 
    zIndex = 1000 , 
    area_id, 
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
    const editor    = UseAreaStore(state => state.editor)
    const selection = UseAreaStore(state => state.selection)
    const edit_version   = UseAreaStore(state => state.edit_version)

    const [cur_concepts , set_cur_concepts] = React.useState<ConceptNode[]>([])
    const [cur_level    , set_cur_level] = React.useState(0)

    const box_ref = React.useRef<HTMLDivElement>(null)

    const set_concepts = (set_level: boolean)=>{
        if(!editor || !selection){
            set_cur_concepts([])
            return 
        }
        let cur_path = selection?.anchor.path
        if(!cur_path){
            set_cur_concepts([])
            return 
        }
        let concept_nodes = find_concept_nodes_by_path(editor.get_root() , cur_path)
        if(concept_nodes.length == 0){
            set_cur_concepts([])
            return 
        }

        let concept_num = concept_nodes.length
        if(set_level){
            set_cur_level(concept_num - 1)
        }
        else{
            set_cur_level(cur_level % concept_num)
        }
        set_cur_concepts(concept_nodes)

    }

    React.useEffect(()=>{
        set_concepts(true)
    }, [editor, selection])

    React.useEffect(()=>{
        set_concepts(false)
    }, [edit_version])

    const concept_num = cur_concepts.length
    const cur_node    = concept_num > 0 ? cur_concepts[cur_level % concept_num] : null

    return <Paper 
        elevation = {3} 
        sx  = {{
            position: "absolute",
            top     : position.y,
            left    : position.x,
            width   : "calc(min(20rem, 20vw))",
            zIndex  : zIndex,
            height  : "auto" , 
            overflow: "auto",
            
            padding: "2rem" , 
            ...paper_sx
        }}
        ref         = {box_ref} 
    >
    <AnimatePresence mode="wait">{(
        editor && selection && concept_num > 0 && cur_node 
    ) && (
        <motion.div
            key         = {cur_node.idx}
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
                height  : "100%" , 
                opacity: 1,

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
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <IconButton 
                    onClick={() => {
                        set_cur_level((cur_level - 1 + concept_num) % concept_num)
                    }}
                >
                    <NavigateBefore />
                </IconButton>
                <Typography variant="h6">
                    {cur_node.concept}
                </Typography>
                <IconButton 
                    onClick={() => {
                        set_cur_level((cur_level + 1) % concept_num)
                    }}
                >
                    <NavigateNext />
                </IconButton>
            </Box>
            <Box ref = {mod_scrollbar} sx={{
                overflow: "auto",
                maxHeight: "calc(min(40rem, 50vh))",
            }}>
                <DefaultParameterContainer 
                    node = {cur_node}
                    onSave = {(parameters: ParameterList) => {
                        editor.auto_set_parameter(cur_node, parameters)
                    }}
                />
            </Box>
        </motion.div>
    )}</AnimatePresence></Paper>
})
