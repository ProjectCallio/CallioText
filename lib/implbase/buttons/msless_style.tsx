import * as React from "react"
import { Box } from "@mui/material"
import { motion } from "framer-motion"
import { MouselessSelect } from "./base"
import { AutoElement } from "./base"

export {
    MouselessButton  ,
}

/** 这个组件用来包裹一个AutoIconButton，为其提供Mouseless支持。 */
const MouselessButton = React.memo(({
    is_activated,
    children,
    auto_element = false,
    ref,
}: {
    is_activated: boolean,
    children: React.ReactNode,
    auto_element?: boolean,
    ref?: React.Ref<HTMLDivElement>,
}) => {

    const children_comp = React.useMemo(()=>{
        if(auto_element){
            return <AutoElement>{children}</AutoElement>
        }
        return children
    }, [auto_element, children])

    return <MouselessSelect.Provider value={is_activated}>
        <Box ref = {ref}>
            {children_comp}
        </Box>
    </MouselessSelect.Provider>
})

