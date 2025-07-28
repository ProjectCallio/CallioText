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
    area_container_ref , 
}

export type {
    AreaName , 
}

type AreaName = "param" | "concep"

const area_container_ref   = React.createRef<HTMLDivElement | null>()

interface AreaStore{
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
    container_version   : 0,
    container_flush     : () => set(state => ({container_version: state.container_version + 1 })),

    dragging      : null,
    set_dragging  : (dragging) => set({ dragging: dragging }),

    positions     : {param :{x: 0,y: 0} , concep:{x: 0,y: 0}},
    set_positions : (positions) => set(state => ({ positions: {
        ...state.positions,
        ...positions
    }})),

    open: {param: true, concep: true},
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


