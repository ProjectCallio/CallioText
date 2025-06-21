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
import { create } from "zustand"
import { persist } from "zustand/middleware"


export {
    useAreaStore , 
    DraggerBox , 
    drag_offset_ref , 
    area_container_ref , 
}

export type {
    AreaName , 
}

type AreaName = "param" | "concep"

const drag_offset_ref = {current: {x: 0, y: 0}}
const area_container_ref   = React.createRef<HTMLDivElement | null>()

interface AreaStore{
    editor    : EditorComponent | null
    set_editor    : (editor: EditorComponent) => void

    nodeparam_version   : number
    nodeparam_flush     : () => void // 当前节点被编辑触发的强制刷新

    container_version   : number
    container_flush     : () => void // 容器触发的强制刷新
    
    dragging      : AreaName | null
    set_dragging  : (dragging: AreaName | null) => void

    positions     : {[name in AreaName]: {x: number, y: number}}
    set_positions : (positions: Partial<{[name in AreaName]: {x: number, y: number}}>) => void

    sizes     : {[name in AreaName]: {width: number, height: number}}
    set_sizes : (sizes: Partial<{[name in AreaName]: {width: number, height: number}}>) => void

    open: {[name in AreaName]: boolean}
    set_open: (name: AreaName, open: boolean) => void
}

const useAreaStore = create<AreaStore>()(persist((set)=>({
    editor        : null,
    set_editor    : (editor) => set({editor: editor }),

    nodeparam_version  : 0,
    nodeparam_flush    : () => set(state => ({nodeparam_version: state.nodeparam_version + 1 })),

    container_version   : 0,
    container_flush     : () => set(state => ({container_version: state.container_version + 1 })),

    dragging      : null,
    set_dragging  : (dragging) => set({ dragging: dragging }),

    positions     : {param :{x: 0,y: 0} , concep:{x: 0,y: 0}},
    set_positions : (positions) => set(state => ({ positions: {
        ...state.positions,
        ...positions
    }})),

    open: {param: false, concep: false},
    set_open: (name, open) => set(state => ({ open: {
        ...state.open,
        [name]: open
    }})),

    sizes: {param: {width: 100, height: 100}, concep: {width: 100, height: 100}},
    set_sizes: (sizes) => set(state => ({ sizes: {
        ...state.sizes,
        ...sizes
    }})),
}), {
    name: "area-positions",
    partialize: (state) => ({
        positions: state.positions,
        open: state.open,
        sizes: state.sizes,
    }),
}))


function DraggerBox(props: BoxProps & {
    father_name: AreaName
    onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void
    onSetSize  ?: (size: {width: number, height: number}) => void
    dragging_me?: boolean
    father_ref?: React.RefObject<HTMLDivElement | null>
}){
    let {
        dragging_me , 
        father_ref  , 
        father_name , 
        ...rest_props
    } = props

    const {set_dragging, set_sizes} = useAreaStore.getState()

    const positions = useAreaStore(state => state.positions[father_name])

    return <Box
        {...rest_props}
        sx={{
            cursor: "move",
            width: "100%",
            height: "0.5rem",
            minHeight: "0.5rem" , 
            bgcolor: dragging_me ? "grey.400" : "grey.300",
            borderRadius: "4px",
            mb: 1,
            "&:hover": {
                bgcolor: "grey.400"
            }
        }}
        onMouseDown = {(e: React.MouseEvent<HTMLDivElement>)=>{

            // 设置当前拖动区域尺寸为父节点的尺寸
            if(father_ref?.current){
                const rect = father_ref.current.getBoundingClientRect()
                set_sizes({[father_name]: {
                    width : rect.width,
                    height: rect.height,
                }})
            }

            // 设置当前拖动区域为父节点
            set_dragging(father_name)
            drag_offset_ref.current = {
                x: e.clientX - positions.x,
                y: e.clientY - positions.y,
            }
            e.preventDefault()
            e.stopPropagation()
        }}
    />
}
