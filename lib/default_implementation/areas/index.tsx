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
    set_editor    : (editor: EditorComponent) => void

    selection : Slate.Selection | null
    set_selection : (selection: Slate.Selection | null) => void

    version   : number
    flush         : () => void // 强制刷新

    top_barriers  : string[] // 如果存在障碍物，则不占据顶部区域
    add_topbarrier    : (barrier: string) => void
    del_topbarrier : (barrier: string) => void

    area_visible : boolean
}>()((set)=>({
    editor        : null,
    set_editor    : (editor) => set(state => ({ ...state , editor: editor })),

    selection     : null,
    set_selection : (selection) => set(state => ({ ...state , selection: selection })),

    version       : 0,
    flush         : () => set(state => ({ ...state , version: state.version + 1 })),

    top_barriers  : [],
    add_topbarrier : (barrier: string) => set(state => (
        { ...state , top_barriers: [...state.top_barriers, barrier] }
    )),
    del_topbarrier : (barrier: string) => set(state => (
        { ...state , top_barriers: state.top_barriers.filter(b => b != barrier) }
    )),

    area_visible  : true,
}))

function Area({
    sx , 
}:{
    sx?: BoxProps["sx"]
}){
    const editor    = UseAreaStore(state => state.editor)
    const selection = UseAreaStore(state => state.selection)
    const version   = UseAreaStore(state => state.version) // 用于强制刷新
    const area_visible = UseAreaStore(state => state.area_visible)
    const top_barriers = UseAreaStore(state => state.top_barriers)

    const [cur_concepts, set_cur_concepts] = React.useState<ConceptNode[]>([])
    const [cur_level, set_cur_level] = React.useState(0)

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
    }, [version])

    const concept_num = cur_concepts.length
    const cur_node    = concept_num > 0 ? cur_concepts[cur_level % concept_num] : null

    const occupy_top = top_barriers.length <= 0

    return <Box>
    <AnimatePresence mode="wait">{(
        editor && selection && concept_num > 0 && cur_node && area_visible 
    ) && (
        <motion.div
            key         = {cur_node.idx}
            initial     = {{ opacity: 0, x: -50 }}
            animate     = {{ 
                opacity: 1, 
                x: 0,
                top     : occupy_top ? "0" : "20%",
                height  : occupy_top ? "100%" : "80%"
            }}
            exit        = {{ opacity: 0, x: -50 }}
            transition  = {{ 
                duration: 0.2,
                transition: "easeInOut"
            }}
            style={{
                position: "absolute",
                top     : occupy_top ? "0" : "20%",
                height  : occupy_top ? "100%" : "80%" , 
                width: "100%",
                opacity: 1,
                zIndex: 1000
            }}
        ><Paper 
            elevation={3} 
            sx={{
                p: 2,
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
