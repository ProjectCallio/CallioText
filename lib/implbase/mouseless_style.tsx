import * as React from "react"
import { Box } from "@mui/material"

export {
    MouselessButton,
}

function MouselessButton({
    is_activated,
    children,
    ref,
}: {
    is_activated: boolean,
    children: React.ReactNode,
    ref?: React.Ref<HTMLDivElement>,
}){
    return <Box 
        sx = {{
            border: is_activated ? "1px solid #000" : "none",
        }} 
        ref = {ref}
    >
        {children}
    </Box>
}

