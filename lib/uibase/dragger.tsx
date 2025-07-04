import { Box , BoxProps, useTheme } from "@mui/material"
import {
    Grip as GripIcon,
} from "lucide-react"

export {
    drag_offset_ref,    
    DraggerBox,
    adjust_position , 
}

function adjust_position(
    x: number, y: number, 
    container_width: number, container_height: number, 
    target_width: number, target_height: number
){
    x = Math.max(0, Math.min(x, container_width - target_width))
    y = Math.max(0, Math.min(y, container_height- target_height))
    return [x, y]
}


const drag_offset_ref = {current: {x: 0, y: 0}}

function DraggerBox(props: BoxProps & {
    my_position: {x: number, y: number}
    onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void
    dragging_me?: boolean
}){
    const {
        my_position,
        onDragStart,
        dragging_me , 
        ...rest_props
    } = props

    const palette = useTheme().palette


    return <Box
        {...rest_props}
        sx={{
            cursor: "move",
            color    : dragging_me ? palette.text.primary : palette.text.secondary,
            "&:hover": {
                color: palette.text.primary
            },
            transition: "all 0.2s ease-in-out",
        }}
        onMouseDown = {(e: React.MouseEvent<HTMLDivElement>)=>{

            onDragStart?.(e)

            drag_offset_ref.current = {
                x: e.clientX - my_position.x,
                y: e.clientY - my_position.y,
            }
            e.preventDefault()
            e.stopPropagation()
        }}
    >
        <GripIcon/>
    </Box>
}
