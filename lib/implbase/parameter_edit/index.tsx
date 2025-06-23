/** 
 * 这个文件提供一个通用的参数编辑器。
 * @module
 */

import React, {useEffect, useState} from "react"

import { 
    Typography ,  
    Card , 
    TextField ,
    Button , 
    Drawer , 
    Box , 
    Select , 
    Switch , 
    MenuItem  , 
    Divider, 
    List , 
    FormControlLabel  , 
    ListItem, 
    FormControl , 
    FormLabel  , 
    RadioGroup , 
    Radio  , 
} from "@mui/material"
import { 
    ExpandMore as ExpandMoreIcon , 
    ChevronRight as ChevronRightIcon  , 
} from "@mui/icons-material"

import * as Slate from "slate"
import * as SlateReact from "slate-react"

import {
    ConceptNode,
    ParameterList , 
    ParameterValue , 
} from "../../core"

import { 
    ParameterItemComponent , 
    ParameterItemComponentRef , 
} from "./items"

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
    const [parameters, set_parameters] = useState<ParameterList>(node.parameters)

    const item_refs = React.useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        set_parameters(node.parameters)
    }, [node.parameters])

    React.useImperativeHandle(ref, () => ({
        get_parameters: ()=>parameters, 
        get_itemref: (idx?: number)=>idx == undefined ? null : item_refs.current[idx],
    }))

    const init_parameters = React.useMemo(()=>node.parameters, [node.parameters])

    return <Box>
    <List>{Object.keys(init_parameters).map((key, idx) => {
        return <ListItem key={`param-${node.idx}-${key}`}>
        <Box 
            sx={{
                border: select_paramidx == idx ? "1px solid #000" : "none",
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
        /></Box></ListItem>
    })}</List>
    <Button onClick={()=>{
        onSave?.(parameters)
    }}>保存</Button>
    </Box>
}), (prev_props, next_props)=>{
    return prev_props.node.idx == next_props.node.idx 
        && prev_props.onSave === next_props.onSave
        && prev_props.select_paramidx == next_props.select_paramidx
        && prev_props.node.parameters === next_props.node.parameters
})
