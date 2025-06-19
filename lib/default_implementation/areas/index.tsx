/**
 * 在sectional editor中，我们提供一个一直存在的区域来编辑参数。
 */
import * as React from "react"
import * as Slate from "slate"
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
    NavigateBefore , 
    NavigateNext , 
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"

import {
    ParameterList , 
} from "../../core"
import {
    ParameterArea , 
    SPACE as parameterarea_space , 
} from "./parameter_area"
import {
    ConceptArea , 
    SPACE as conceptarea_space , 
} from "./concept_area"

import {
    usePersistedState,
} from "../../uibase"

import {
    useAreaStore , 
    AreaName , 
    drag_offset_ref , 
    area_container_ref , 
} from "./base"

export {
    AreaContainer , 
    parameterarea_space , 
    conceptarea_space , 
    Areas , 
}
export * from "./base"

// XXX 启用id机制？
function AreaContainer({area_id = "unique_area"}:{area_id?: string}){

    const dragging  = useAreaStore(state => state.dragging)
    const drag_size = useAreaStore(state => state.drag_size)

    const {set_dragging, set_positions, container_flush} = useAreaStore.getState()

    React.useEffect(()=>{
        const handle_mousemove = (e: MouseEvent) => {
            if (!dragging) return 

            let rect = area_container_ref.current?.getBoundingClientRect()
            if(!rect) return

            let new_x = e.clientX - drag_offset_ref.current.x
            let new_y = e.clientY - drag_offset_ref.current.y
        
            new_x = Math.max(0, Math.min(new_x, rect.width - drag_size.width))
            new_y = Math.max(0, Math.min(new_y, rect.height- drag_size.height))
                    
            set_positions({[dragging]: {x: new_x, y: new_y}})
            e.preventDefault()
            e.stopPropagation()
        }

        const handle_mouseup = (e: MouseEvent) => {
            set_dragging(null)
        }
        window.addEventListener("mousemove", handle_mousemove)
        window.addEventListener("mouseup", handle_mouseup)
                return ()=>{
            window.removeEventListener("mousemove", handle_mousemove)
            window.removeEventListener("mouseup", handle_mouseup)
        }
    }, [dragging, drag_size])


    return <Box 
        ref = {(el: HTMLDivElement | null)=>{
            if(el && area_container_ref.current !== el){ 
                area_container_ref.current = el
                container_flush() // 刷新子组件
            }
        }}
        sx={{
            position: "absolute" , 
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
        }}
    />
}

function Areas({}){
    return <>
        <ParameterArea 
            zIndex = {1000}
            area_id = "param"
        />
        <ConceptArea
            zIndex = {1001}
            area_id = "concep"
        />
    </>
}