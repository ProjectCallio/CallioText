/** 
 * 这个文件提供一个通用的参数编辑器。
 * @module
 */

import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"

import { 
    Button , 
    Box , 
    List , 
    ListItem, 
} from "@mui/material"
import {
    motion, 
    AnimatePresence,
} from "framer-motion"
import {
    Save as SaveIcon,
} from "lucide-react"


import {
    ConceptNode,
    ParameterList , 
    ParameterValue , 
} from "../../core"

import { 
    ParameterItemComponent , 
    ParameterItemComponentRef , 
} from "./items"
import { AutoIconButton } from "../buttons"

export {
    DefaultParameterContainer , 
}

export type {
    DefaultParameterContainerRef , 
}


interface DefaultParameterContainerRef{
    get_parameters: ()=>ParameterList
    get_itemref: (idx?: number)=>HTMLDivElement | null
}


/** 这个函数组件定义一个菜单组件，作为默认的参数更新器。 
 * 注意，这个组件是一个菜单，不包含打开菜单的逻辑。
 */
const DefaultParameterContainer = React.memo(React.forwardRef(({
    node, 
    onSave, 
    select_paramidx, 
    autoblur , 
    onAutoBlur , 
}: {
    node     : Slate.Node & ConceptNode
    onSave  ?: (parameters: ParameterList)=>void
    
    /** 由mouseless选中的参数项。 */
    select_paramidx?: number

    /** 自动失焦条件。如果满足条件，则自动失焦。 */
    autoblur?: (e: React.KeyboardEvent)=>boolean

    /** 如果有自动失焦，那么触发这个回调函数。 */
    onAutoBlur?: ()=>void
}, ref) => {

    // 初始化
    const [parameters, set_parameters] = React.useState<ParameterList>(node.parameters)

    const item_refs = React.useRef<(HTMLInputElement | null)[]>([])

    React.useEffect(() => {
        set_parameters(node.parameters)
    }, [node.parameters])

    React.useEffect(()=>{
        if(select_paramidx == undefined){
            return
        }
        const el = item_refs.current[select_paramidx]
        el?.scrollIntoView?.({behavior: "smooth", block: "center"})
    }, [select_paramidx])

    React.useImperativeHandle(ref, () => ({
        get_parameters: ()=>parameters, 
        get_itemref: (idx?: number)=>idx == undefined ? null : item_refs.current[idx],
    }))

    const init_parameters = React.useMemo(()=>node.parameters, [node.parameters])

    return <Box>
    <List>{Object.keys(init_parameters).map((key, idx) => {
        const is_selected = select_paramidx == idx
        return <ListItem 
            key={`param-${node.idx}-${key}`}
            sx={{
                paddingX: "0.5rem",
            }}
        >
        <motion.div 
            initial={{
                boxShadow: "none",
                scale: 1,
                rotate: 0,
            }}
            animate={{
                boxShadow: is_selected ? "0 0 10px 0 rgba(0, 0, 0, 0.5)" : "none",
                scale    : is_selected ? 1.05 : 1,
                rotate   : is_selected ? [7, 0] : 0,
            }}
            exit={{
                boxShadow: "none",
                scale: 1,
                rotate: 0,
            }}
            transition={{
                duration: 0.3,
            }}
            style={{
                borderRadius: "0.5rem",
                width: "100%",
            }}
        >
        <ParameterItemComponent
            ref={(el: ParameterItemComponentRef | null)=>{
                if(!el){
                    return 
                }
                item_refs.current[idx] = el.get_formel()
            }} 
            name={key}
            parameter_item={init_parameters[key]}
            onUpdate={(v: string | boolean | number) => {
                set_parameters((cur_state) => {
                    let cur_param = cur_state
                    let { val, type, ...other_items } = cur_param[key]

                    let new_param = {
                        ...cur_param,
                        [key]: {
                            val: v,
                            type: init_parameters[key].type,
                            ...other_items
                        } as ParameterValue
                    }
                    return new_param
                })
            }}
            autoblur = {autoblur}
            onAutoBlur = {onAutoBlur}
        /></motion.div></ListItem>
    })}</List>
    </Box>
}), (prev_props, next_props)=>{
    return prev_props.node.idx == next_props.node.idx 
        && prev_props.onSave === next_props.onSave
        && prev_props.autoblur === next_props.autoblur
        && prev_props.onAutoBlur === next_props.onAutoBlur
        && prev_props.select_paramidx == next_props.select_paramidx
        && prev_props.node.parameters === next_props.node.parameters
})
