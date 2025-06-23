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
} from "@mui/material"

import {
    useResetSelection , 
} from "../hooks"


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

    React.useEffect(()=>{
        set_val(init_val)   
    }, [init_val])
    
    React.useImperativeHandle(ref, ()=>({
        get_formel: ()=>select_ref.current
    }))

    // TODO 这个元素捕获不到keydown事件
    return <Select 
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
                onFocus: ()=>{
                    autoblur && (set_selection())
                },
                onKeyDown: (e)=>{
                    console.log("select inp:", e.key)
                    if(autoblur?.(e)){
                        select_ref.current?.blur()
                        reset_selection()
                        onAutoBlur?.()
                    }
                },
            },
        }}
        inputRef = {select_ref}
        onKeyDown={(e)=>{
            console.log("select:", e.key)
        }}
    >
        {choices.map((c,idx)=>(
            <MenuItem key={idx} value={c} onKeyDown={(e)=>{
                console.log("item:", c, "keydown:", e.key)
            }}>{c}</MenuItem>
        ))}
    </Select>
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

    React.useEffect(()=>{
        set_val(init_val)
    }, [init_val])

    React.useImperativeHandle(ref, ()=>({
        get_formel: ()=>textfield_ref.current
    }))

    return <TextField 
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
                onFocus: ()=>{
                    autoblur && (set_selection())
                },
            onKeyDown: (e)=>{
                    if(autoblur?.(e)){
                        textfield_ref.current?.blur()
                        reset_selection()
                        onAutoBlur?.()
                    }
                },
            },
        }}

        inputRef = {textfield_ref}
    />
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

    React.useEffect(()=>{
        set_val(init_val)
    }, [init_val])

    React.useImperativeHandle(ref, ()=>({
        get_formel: ()=>textfield_ref.current
    }))

    return <TextField 
        name = {name}
        value = {val}
        onChange = {e=>{
            set_val(Number(e.target.value))
            onUpdate?.(Number(e.target.value))
        }}
        sx = {{
            marginLeft: "5%" , 
        }}
        slotProps = {{
            input: {
                onFocus: ()=>{
                    autoblur && (set_selection())
                },
            onKeyDown: (e)=>{
                    if(autoblur?.(e)){
                        textfield_ref.current?.blur()
                        reset_selection()
                        onAutoBlur?.()
                    }
                },
            },
        }}
        inputRef = {textfield_ref}
        type = "number"
    />
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
    const [val, set_val] = React.useState<boolean>(init_val)
    const [set_selection, reset_selection] = useResetSelection()
    const switch_ref = React.useRef<HTMLInputElement>(null)

    React.useEffect(()=>{
        set_val(init_val)
    }, [init_val])

    React.useImperativeHandle(ref, ()=>({
        get_formel: ()=>switch_ref.current
    }))

    return <FormControlLabel 
        label = {name} 
        control = {<Switch 
            checked = {val}
            onChange = {e=>{
                set_val(e.target.checked)     
                onUpdate?.(e.target.checked)
            }}
            slotProps = {{
                input: {
                    onFocus: ()=>{
                        autoblur && (set_selection())
                    },
                    onKeyDown: (e)=>{
                        if(autoblur?.(e)){
                            switch_ref.current?.blur()
                            reset_selection()
                            onAutoBlur?.()
                        }
                    },
                },
            }}
        />} 
        sx = {{
            marginLeft: "5%" , 
        }}
    />

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
