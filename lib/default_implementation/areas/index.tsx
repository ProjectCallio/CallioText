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
    ParameterArea , 
} from "./parameter_area"
import {
    ConceptArea , 
} from "./concept_area"

import {
    usePersistedState,
} from "../../uibase"

export {
    Area , 
}
export * from "./parameter_area"
export * from "./base"

function Area({area_id = "unique_area"}:{area_id?: string}){

    const [dragging, set_dragging]   = React.useState<string | null>(null)
    const [drag_size, set_drag_size] = React.useState({
        width: 100,
        height: 100,
    })

    const [positions, set_positions] = usePersistedState(`area-${area_id}/positions`,{
        param :{x: 0,y: 0} , 
        concep:{x: 0,y: 0}
    })

    const offset_ref = React.useRef({x: 0, y: 0})
    const area_ref   = React.useRef<HTMLDivElement>(null)

    React.useEffect(()=>{
        const handle_mousemove = (e: MouseEvent) => {
            if (!dragging) return 

            let rect = area_ref.current?.getBoundingClientRect()
            if(!rect) return

            let new_x = e.clientX - offset_ref.current.x
            let new_y = e.clientY - offset_ref.current.y
        
            new_x = Math.max(0, Math.min(new_x, rect.width - drag_size.width))
            new_y = Math.max(0, Math.min(new_y, rect.height- drag_size.height))
                    
            set_positions(state => ({
                ...state,
                [dragging]: {
                    x: new_x,
                    y: new_y,
                }
            }))
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
    }, [dragging])

    const make_ondragstart = (name: keyof typeof positions) => {
        return (e: React.MouseEvent) => {
            set_dragging(name)
            offset_ref.current = {
                x: e.clientX - positions[name].x,
                y: e.clientY - positions[name].y,
            }
            e.preventDefault()
            e.stopPropagation()
        }
    }

    return <Box 
        ref = {area_ref}
        sx={{
            position: "absolute" , 
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
        }}
    >
        <ParameterArea 
            position    = { positions.param           }
            onDragStart = { make_ondragstart("param") }
            onSetSize = { set_drag_size }
            zIndex = {1000}
            area_id = {area_id}
            dragging_me = {dragging == "param"}
        />
        <ConceptArea
            position    = { positions.concep           }
            onDragStart = { make_ondragstart("concep") }
            onSetSize   = { set_drag_size }
            zIndex = {1001}
            area_id = {area_id}
            dragging_me = {dragging == "concep"}
        />
    </Box>
}
