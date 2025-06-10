/** 
 * 这个模块提供所有按钮的超类。
 * @module
 */

import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"

import {
    useSpaceNavigatorOnMoveRegister ,
    useKeyHoldingState , 
    useSpaceNavigatorState,  
    useKeyEventsHandlerRegister,
    KeyNames, 
} from "@ftyyy/mouseless"

import {
    ConceptNode , 
    ParameterList , 
    ParameterValue, 
} from "../../core"

import {
    EditorComponent ,
    EditorGlobalInfo ,
} from "../../editor"

import {
    get_position , 
    decode_position , 
    SPACE_NAME , 
    HOLDING , 
} from "./mouseless"

import { 
    AutoTooltip , 
    Direction , 
    AutoStack , 
    AutoStackedPopper , 
    AutoStackedPopperProps , 
} from "../../uibase"
import { 
    Tooltip , 
    IconButton , 
    ClickAwayListener  , 
    Box, 
    Button, 
    Typography , 
    TextField , 
    Input , 
} from "@mui/material"

import {
    EditorButtonInformation , 
    ButtonDescription , 
    AutoStackedPopperWithButtonProps , 
    AutoStackedPopperWithButton , 
} from "./components"

import {
    ButtonGroup , 
} from "./buttongroup"

export { 
    AutoStackedPopperButtonGroupMouseless , 
    MouselessParameterEditor , 
}



// 内联的参数编辑器。占据一个按钮的位置。
function MouselessParameterEditor({
    node,
    parameter_name,
    idx,
    label,
    generate_parameter,
    width,
    input,
}: {
    node: ConceptNode & Slate.Node
    parameter_name: string
    idx: number
    label: string
    generate_parameter?: (arg0: any)=>ParameterList | undefined
    width?: string | number
    input?: boolean // 是否使用input而不是textfield
    variant?: "standard" | "outlined"
}){
    
    const input_ref = React.useRef<HTMLInputElement | null>(null)
    const [active , set_active] = React.useState(false)
    const [enter_selection , set_ec] = React.useState<Slate.BaseSelection | undefined>(undefined)
    const position = get_position(node.idx, idx)

    const [regiester_func, unregister_func] = React.useContext(MouselessRegister)
    
    const editor = React.useContext(EditorGlobalInfo).editor 

    // 聚焦或取消聚焦输入框。
    function focus_blur_input(focus: boolean){
        if(input_ref && input_ref.current){
            if(focus){input_ref.current.focus()}
            else{input_ref.current.blur()}
        }
    }

    // 记录焦点。
    function record_selection(){
        if(!editor){
            return
        }
        set_ec(editor.get_slate().selection) // 记录焦点。
    }

    function apply(){
        if(!input_ref || !input_ref.current || !editor){
            return
        }
        let input = input_ref.current

        let new_param = {[parameter_name]: {
            type: "string" , 
            val: input.value , 
        }} as ParameterList | undefined

        // console.log(new_param)

        if(generate_parameter){
            new_param = generate_parameter(input.value)
        }

        if(new_param){
            editor.auto_set_parameter(node, new_param )
        }
    }

    // 恢复已经记录的焦点。
    function restore_selection(){
        if(!editor){
            return
        }
        SlateReact.ReactEditor.focus(editor.get_slate())
        if(enter_selection && enter_selection["anchor"] && enter_selection["anchor"]["path"]){
            Slate.Transforms.select(editor.get_slate() , enter_selection) // 设置为保存的selection。
        }
    }

    React.useEffect(()=>{
        regiester_func(SPACE, position , 
            ()=>{ // 获得焦点，并记录之前的焦点。
                record_selection()
                focus_blur_input(true)
                set_active(true)
            }  ,  
            () => { // 取消激活后还原焦点
                restore_selection()
                apply()
                focus_blur_input(false)
                set_active(false)
            } , 
            ()=>{} // run则什么也不做
        )

        return ()=>{
            unregister_func(SPACE, position )    
        }
    } , [])

    if(!(node.parameters && node.parameters[parameter_name])){
        return <></>
    }
    let param_init = node.parameters[parameter_name].val

    let onBlur = ()=>{apply()}

    let onKeyDown = (e: React.KeyboardEvent) => {
        if(e.key == "Enter"){
            focus_blur_input(false)
            apply()
            restore_selection()
            e.preventDefault()
            return true
        }
        return false
    }

    if(input){
        return <Box sx={{
            border: active ? "2px solid" : "none" , 
            width: width || "2rem" , 
        }}><Input 
            size = "small" 
            margin = "none"
            defaultValue    = {param_init} 
            inputRef        = {input_ref}

            onBlur          = {onBlur}
            onKeyDown       = {onKeyDown}
        /></Box>
    }

    return <Box sx={{
        border: active ? "2px solid" : "none" , 
        width: width || "2rem" , 
    }}><TextField 
        variant         = "outlined" 
        size = "small" 
        label           = {<Typography sx={{fontSize: "0.7rem"}}>{label}</Typography>} 
        defaultValue    = {param_init} 
        inputRef        = {input_ref}

        onBlur          = {onBlur}
        onKeyDown       = {onKeyDown}
    /></Box>

}
