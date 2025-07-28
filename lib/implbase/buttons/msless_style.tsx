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
    autoel_props,
    className,
}: {
    is_activated: boolean,
    children: React.ReactNode,
    auto_element?: boolean,
    ref?: React.Ref<HTMLDivElement>,
    autoel_props?: Partial<React.ComponentProps<typeof AutoElement>>,
    className?: string,
}) => {

    const children_comp = React.useMemo(()=>{
        if(auto_element){
            return <AutoElement {...autoel_props}>{children}</AutoElement>
        }
        return children
    }, [auto_element, children])

    return <MouselessSelect.Provider value={is_activated}>
        <Box ref = {ref} className = {className}>
            {children_comp}
        </Box>
    </MouselessSelect.Provider>
})

