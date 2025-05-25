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


export {
    UseAreaStore , 
    Area , 
}

const UseAreaStore = create<{
    editor    : EditorComponent | null
    selection : Slate.Selection | null
    version   : number
    area_visible : boolean
    set_editor    : (editor: EditorComponent) => void
    set_selection : (selection: Slate.Selection | null) => void
    flush         : () => void // 强制刷新
}>()((set)=>({
    editor        : null,
    selection     : null,
    version       : 0,
    area_visible  : true,
    set_editor    : (editor) => set(state => ({ ...state , editor: editor })),
    set_selection : (selection) => set(state => ({ ...state , selection: selection })),
    flush         : () => set(state => ({ ...state , version: state.version + 1 })),
}))

function Area({
    sx , 
}:{
    sx?: BoxProps["sx"]
}){
    let editor    = UseAreaStore(state => state.editor)
    let selection = UseAreaStore(state => state.selection)
    let version   = UseAreaStore(state => state.version) // 用于强制刷新
    let area_visible = UseAreaStore(state => state.area_visible)

    let [cur_concepts, set_cur_concepts] = React.useState<ConceptNode[]>([])
    let [cur_level, set_cur_level] = React.useState(0)

    let set_concepts = (set_level: boolean)=>{
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
    }, [version])

    let concept_num = cur_concepts.length
    let cur_node    = concept_num > 0 ? cur_concepts[cur_level % concept_num] : null

    return <Box>
    <AnimatePresence mode="wait">{(
        editor && selection && concept_num > 0 && cur_node && area_visible 
    ) && (
        <motion.div
            key         = {cur_node.idx}
            initial     = {{ opacity: 0, x: -50 }}
            animate     = {{ opacity: 1, x: 0 }}
            exit        = {{ opacity: 0, x: -50 }}
            transition  = {{ 
                duration: 0.2 , 
                transition: "easeInOut" , 
            }}
            style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                opacity: 1 ,
                zIndex: 1000,
            }}
        ><Paper 
            elevation={3} 
            sx={{
                p: 2,
                height: "100%",
                ...sx
            }}
        ><Stack spacing={2}>
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
            <DefaultParameterContainer 
                node = {cur_node}
                onSave = {(parameters: ParameterList) => {
                    editor.auto_set_parameter(cur_node, parameters)
                }}
            />
        </Stack></Paper></motion.div>
    )}</AnimatePresence></Box>
}
