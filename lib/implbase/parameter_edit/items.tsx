/** 
 * 这个文件提供一个通用的参数编辑器。
 * @module
 */

import React from "react"

import { 
    TextField ,
    Select , 
    Switch , 
    MenuItem  , 
    FormControlLabel  , 
    Box , 
    Typography , 
    Divider , 
    useTheme
} from "@mui/material"
import {
    ArrowBigRightDash as ArrowBigRightDashIcon, 
} from "lucide-react"

import {
    useResetSelection , 
} from "../hooks"

import {
    useEditorConfig , 
} from "../editorconfig"

import {
    ParameterValue , 
} from "../../core"

export type {
    ParameterItemComponentRef , 
}

export {
    ParameterItemComponent , 
}

interface ParameterItemComponentRef{
    get_formel: ()=> HTMLInputElement | null
}

const ParameterItemSelect = React.forwardRef(({
    name , 
    init_val , 
    choices , 
    onUpdate, 
    autoblur,
    onAutoBlur , 
}:{
    name    : string
    init_val: any
    choices : any[]
    onUpdate?: (val: any)=>void
    autoblur?: (e: React.KeyboardEvent)=>boolean
    onAutoBlur?: ()=>void
}, ref: React.Ref<ParameterItemComponentRef>)=>{

    const [val, set_val] = React.useState<any>(init_val)
    const [set_selection, reset_selection] = useResetSelection()
    const select_ref = React.useRef<HTMLInputElement>(null)
    const input_ref  = React.useRef<HTMLInputElement>(null)

    const [is_focus, set_is_focus] = React.useState<boolean>(false)
    const palette = useTheme().palette

    const handle_keydown = React.useCallback((e: KeyboardEvent)=>{
        if(autoblur?.(e as any)){
            select_ref.current?.blur()
            reset_selection()
            onAutoBlur?.()
        }
    }, [])

    React.useEffect(()=>{
        set_val(init_val)   
    }, [init_val])
    
    React.useImperativeHandle(ref, ()=>({
        get_formel: ()=>{
            const inp_el = input_ref.current
            const sel_el = select_ref.current
            if(inp_el && sel_el){
                inp_el.scrollIntoView = sel_el.scrollIntoView.bind(sel_el)
            }

            return inp_el
        }
    }))

    return <Box sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",

        border: is_focus ? `1px solid ${palette.primary.main}` : "none",
        borderRadius: "0.5rem",
        padding: is_focus ? "0.5rem" : "0",
        transition: "all 0.2s ease-in", 
    }}>
        <Select 
            variant = "standard"
            name = {name}
            value = {val}
            label = {name}
            onChange = {e=>{
                set_val(e.target.value)
                onUpdate?.(e.target.value)
            }}
            sx = {{
                marginLeft: "5%" , 
                marginRight: "5%",
                fontFamily: "Dengxian",
            }}
            inputRef = {input_ref}
            ref      = {select_ref}

            onFocus = {()=>{
                autoblur && (set_selection())
                window.addEventListener("keydown", handle_keydown)
                set_is_focus(true)
            }}
            onBlur = {()=>{
                window.removeEventListener("keydown", handle_keydown)
                set_is_focus(false)
            }}
        >
            {choices.map((c,idx)=>(
                <MenuItem key={idx} value={c}>{c}</MenuItem>
            ))}
        </Select>
        <Divider orientation="vertical" flexItem />
        <Typography sx={{
                marginLeft: "5%",
                marginRight: "5%",
                fontFamily: "Dengxian",
            }}>{name}</Typography>

    </Box>
})
const ParameterItemString = React.forwardRef(({
    name , 
    init_val , 
    onUpdate,
    autoblur,
    onAutoBlur , 
}:{
    name: string
    init_val: string
    onUpdate?: (val: string)=>void
    autoblur?: (e: React.KeyboardEvent)=>boolean
    onAutoBlur?: ()=>void
}, ref: React.Ref<ParameterItemComponentRef>)=>{
    const [val, set_val] = React.useState<string>(init_val)
    const [set_selection, reset_selection] = useResetSelection()
    const textfield_ref = React.useRef<HTMLInputElement>(null)
    
    const [is_focus, set_is_focus] = React.useState<boolean>(false)
    const palette = useTheme().palette

    React.useEffect(()=>{
        set_val(init_val)
    }, [init_val])

    React.useImperativeHandle(ref, ()=>({
        get_formel: ()=>textfield_ref.current
    }))

    return <Box sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",

        border: is_focus ? `1px solid ${palette.primary.main}` : "none",
        borderRadius: "0.5rem",
        padding: is_focus ? "0.5rem" : "0",
        transition: "all 0.2s ease-in", 
    }}><TextField 
        variant = "standard"
        value = {val}
        label = {name}
        onChange = {e=>{
            set_val(e.target.value)
            onUpdate?.(e.target.value)
        }}
        sx = {{
            marginLeft: "5%" , 
        }}        
        slotProps = {{
            input: {
                onFocus: (e)=>{
                    autoblur && (set_selection())
                    set_is_focus(true)
                },
                onKeyDown: (e)=>{
                    if(autoblur?.(e)){
                        textfield_ref.current?.blur()
                        reset_selection()
                        onAutoBlur?.()
                    }
                },
                sx: {
                    fontFamily: "Dengxian",
                },
                onBlur: ()=>{
                    set_is_focus(false)
                }
            },
        }}

        inputRef = {textfield_ref}
    /></Box>
})

const ParameterItemNumber = React.forwardRef(({
    name , 
    init_val , 
    onUpdate,
    autoblur,
    onAutoBlur , 
}:{
    name: string
    init_val: number
    onUpdate?: (val: number)=>void
    autoblur?: (e: React.KeyboardEvent)=>boolean
    onAutoBlur?: ()=>void
}, ref: React.Ref<ParameterItemComponentRef>)=>{
    const [val, set_val] = React.useState<number>(init_val)
    const [set_selection, reset_selection] = useResetSelection()
    const textfield_ref = React.useRef<HTMLInputElement>(null)

    const [is_focus, set_is_focus] = React.useState<boolean>(false)
    const palette = useTheme().palette

    React.useEffect(()=>{
        set_val(init_val)
    }, [init_val])

    React.useImperativeHandle(ref, ()=>({
        get_formel: ()=>textfield_ref.current
    }))

    return <Box sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
    }}><TextField 
        variant = "standard"
        name = {name}
        value = {val}
        onChange = {e=>{
            set_val(Number(e.target.value))
            onUpdate?.(Number(e.target.value))
        }}
        sx = {{
            marginLeft: "5%" , 
        }}
        slotProps = {{input: {
            onKeyDown: (e)=>{
                if(autoblur?.(e)){
                    textfield_ref.current?.blur()
                    reset_selection()
                    onAutoBlur?.()
                }
            },
            onFocus: ()=>{
                autoblur && (set_selection())
                set_is_focus(true)
            },
            onBlur: ()=>{
                set_is_focus(false)
            }
        },}}
        inputRef = {textfield_ref}
        type = "number"
    /></Box>
})

const ParameterItemBoolean = React.forwardRef(({    
    name , 
    init_val , 
    onUpdate,
    autoblur,
    onAutoBlur , 
}:{
    name: string
    init_val: boolean
    onUpdate?: (val: boolean)=>void
    autoblur?: (e: React.KeyboardEvent)=>boolean
    onAutoBlur?: ()=>void
}, ref: React.Ref<ParameterItemComponentRef>)=>{

    const palette = useTheme().palette
    const [is_focus, set_is_focus] = React.useState<boolean>(false)

    const [val, set_val] = React.useState<boolean>(init_val)
    const [set_selection, reset_selection] = useResetSelection()
    const switch_ref = React.useRef<HTMLInputElement>(null)

    React.useEffect(()=>{
        set_val(init_val)
    }, [init_val])

    React.useImperativeHandle(ref, ()=>({
        get_formel: ()=>switch_ref.current
    }))

    return <Box sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",

        border: is_focus ? `1px solid ${palette.primary.main}` : "none",
        borderRadius: "0.5rem",
        padding: is_focus ? "0.5rem" : "0",
        transition: "all 0.2s ease-in",
    }}>
        <FormControlLabel 
            label = {""} 
            control = {<Switch 
                name = {name}
                checked = {val}
                onChange = {e=>{
                    set_val(e.target.checked)     
                    onUpdate?.(e.target.checked)
                }}
                slotProps = {{input: {
                    onFocus: (e)=>{
                        autoblur && (set_selection())
                        set_is_focus(true)
                    },
                    onBlur: ()=>{
                        set_is_focus(false)
                    },
                    onKeyDown: (e)=>{
                        if(autoblur?.(e)){
                            switch_ref.current?.blur()
                            reset_selection()
                            onAutoBlur?.()
                        }
                        if(e.key == "Enter" 
                            || e.key == " " 
                            || e.key == "ArrowLeft" 
                            || e.key == "ArrowRight"
                        ){
                            set_val(v => !v)
                        }
                    },
            
                    ref: switch_ref , 
                },}}
            />} 
            sx = {{
                marginLeft: "5%" , 
                marginRight: "5%"
            }}
        />
        <Divider orientation="vertical" flexItem />
        <Typography sx={{
            marginLeft: "5%",
            fontFamily: "Dengxian",
            fontSize: name.length >= 10 ? "0.8rem" : "1rem",
        }}>{name}</Typography>

    </Box>

})

const ParameterItemComponent = React.memo(React.forwardRef(({
    parameter_item , 
    name , 
    onUpdate,
    autoblur,
    onAutoBlur , 
}:{
    /** 要更新的参数项的初始值。 */
    parameter_item: ParameterValue

    /** 这个参数项的名称。 */
    name: string

    /** 更新的回调。 */
    onUpdate?: (val: string | boolean | number)=>void

    /** 自动失焦条件。如果满足条件，则自动失焦。 */
    autoblur?: (e: React.KeyboardEvent)=>boolean
    
    /** 如果有自动失焦，那么触发这个回调函数。 */
    onAutoBlur?: ()=>void
    
}, ref: React.Ref<ParameterItemComponentRef> )=>{

    const {val, type} = parameter_item

    if(parameter_item.choices){
        return <ParameterItemSelect
            name        = {name}
            init_val    = {val}
            choices     = {parameter_item.choices}
            onUpdate    = {onUpdate}
            ref         = {ref}
            autoblur    = {autoblur}
            onAutoBlur  = {onAutoBlur}
        />
    }

    if(type == "string"){
        return <ParameterItemString
            name     = {name}
            init_val = {val}
            onUpdate = {onUpdate}
            ref      = {ref}
            autoblur = {autoblur}
            onAutoBlur = {onAutoBlur}
        />
    }

    if(type == "number"){
        return <ParameterItemNumber
            name     = {name}
            init_val = {val}
            onUpdate = {onUpdate}
            ref      = {ref}
            autoblur = {autoblur}
            onAutoBlur = {onAutoBlur}
        />
    }

    if(type == "boolean"){
        return <ParameterItemBoolean
            name     = {name}
            init_val = {val}
            onUpdate = {onUpdate}
            ref      = {ref}
            autoblur = {autoblur}
            onAutoBlur = {onAutoBlur}
        />
    }
    return <></>
    
}), (prev_props, next_props)=>{
        return prev_props.name == next_props.name 
        && prev_props.parameter_item.val == next_props.parameter_item.val
        && prev_props.parameter_item.type == next_props.parameter_item.type
        && prev_props.onUpdate === next_props.onUpdate
        && prev_props.autoblur === next_props.autoblur
})
