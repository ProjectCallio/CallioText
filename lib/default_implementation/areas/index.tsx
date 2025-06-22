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
import { throttle } from "lodash"

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

function adjust_position(
    x: number, y: number, 
    my_width: number, my_height: number, 
    tar_width: number, tar_height: number
){
    x = Math.max(0, Math.min(x, my_width - tar_width))
    y = Math.max(0, Math.min(y, my_height- tar_height))
    return [x, y]
}

// XXX 启用id机制？
const AreaContainer = React.memo(({area_id = "unique_area"}:{area_id?: string})=>{

    const dragging  = useAreaStore(state => state.dragging)

    const {set_dragging, set_positions, container_flush} = useAreaStore.getState()

    // 使用 throttle 包装 set_positions
    const my_set_position = React.useMemo(() => {
        return throttle((id: string, pos: { x: number; y: number }) => {
            set_positions({ [id]: pos })
        }, 100) // 每 100ms 最多执行一次
    }, [])

    React.useEffect(()=>{
        let rect = area_container_ref.current?.getBoundingClientRect()
        if(!rect) return

        const positions = useAreaStore.getState().positions
        const sizes = useAreaStore.getState().sizes
        for(const name of ["param", "concep"] as AreaName[]){
            let [new_x, new_y] = adjust_position(
                positions[name].x, positions[name].y, 
                rect.width, rect.height, 
                sizes[name].width, sizes[name].height
            )
            set_positions({ [name]: { x: new_x, y: new_y } })
        }
    }, [dragging])


    React.useEffect(()=>{
        const handle_mousemove = (e: MouseEvent) => {
            if (!dragging) return 

            let rect = area_container_ref.current?.getBoundingClientRect()
            if(!rect) return

            const sizes = useAreaStore.getState().sizes

            let _x = e.clientX - drag_offset_ref.current.x
            let _y = e.clientY - drag_offset_ref.current.y

            let [new_x, new_y] = adjust_position(
                _x, _y, 
                rect.width, rect.height, 
                sizes[dragging].width, sizes[dragging].height
            )
                    
            my_set_position(dragging, { x: new_x, y: new_y })

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
})


const Areas = React.memo(({})=>{
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
})
