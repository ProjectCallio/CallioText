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

export {
    ButtonGroup , 
    AutoStackedPopperButtonGroupMouseless , 
    MouselessParameterEditor , 
}

function ButtonGroup({
    buttons, 
    node,
    autostack = false,
    simple = false,
}:{
    buttons: React.ReactNode[]
    node: Slate.Node & ConceptNode
    autostack?: boolean
    simple?: boolean
}){

    const button_cnt = buttons.length
    const [space, position] = useSpaceNavigatorState()
    const [sel_button, set_sel_button] = React.useState<number | undefined>(undefined)
    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    const refs = React.useRef<HTMLDivElement[]>([])

    // 设置当前选中的按钮
    React.useEffect(()=>{   
        if(space != SPACE_NAME || !position){
            set_sel_button(undefined)
            return 
        }

        const [node_idx, button_idx] = decode_position(position)
        if(node_idx != node.idx){
            set_sel_button(undefined)
            return 
        }

        const act_but_idx = (button_idx % button_cnt + button_cnt) % button_cnt
        set_sel_button(act_but_idx)

    } , [space, position, button_cnt, node.idx])

    // 设置选中按钮的行为
    React.useEffect(()=>{
        const handler = ()=>{
            if(sel_button == undefined || !refs.current[sel_button]){
                return 
            }
            // refs.current[sel_button].click()
            console.log("now click", sel_button)
        }

        add_handler(HOLDING, KeyNames.enter, false, handler)
        return ()=>{
            del_handler(HOLDING, KeyNames.enter, false, handler)
        }
    } , [
        add_handler, 
        del_handler, 
        sel_button , 
    ])

    const ret = <React.Fragment>
        {buttons.map((button, idx)=>{
            return <div 
                key = {idx} 
                ref = {(el: HTMLDivElement)=>{refs.current[idx] = el}}
                style={{
                    border: sel_button == idx ? "2px solid" : "none" , 
                }}
            >{button}</div>
        })}
    </React.Fragment>

    if(autostack){
        return <AutoStack simple={simple}>{ret}</AutoStack>
    }
    return ret
}


/** 折叠起来的按钮组的`props`。 */
interface AutoStackedPopperButtonGroupMouselessProps {
    /** 用来展开菜单的按钮的类型。 */
    outer_button: any 

    /** 用来展开菜单的按钮的`props`。 */
    outer_props?: any 
    
    /** 传递给弹出框的`props` */
    poper_props?: any

    /** 鼠标移上去显示的字样。 */
    label?: string 

    /** 是否在点击其他位置时关闭。 */
    close_on_otherclick?: boolean

    /** 关闭时的其他行为。 */
    onExit?: ()=>void 

    /** `children`会被渲染在按钮之前。 */
    children?: any , 

    /** 所服务的节点。 */
    node: Slate.Node & ConceptNode 

    /** 所要用的按钮组。 */
    buttons: ButtonDescription[]

    /** 自身以及按钮组的编号。如果没有提供，就默认从`0`开始，如果没有提供完全，就默认从最大的开始依次`+1`。 */
    idxs?: number []
}


// TODO fix below
// TODO 也许需要一个可以动态变化nodelist的mouseless？

/**
 * 这个组件定义一个折叠起来的按钮组，并可以通过无鼠标的方式操作。
 * 在使用时，不仅需要传入一系列按钮的定义，还需要传入一系列编号，包括这个容器本身的编号和每个组件的编号。
 */
class AutoStackedPopperButtonGroupMouseless extends React.Component<AutoStackedPopperButtonGroupMouselessProps, {
    menu_open: boolean
    active: boolean
}>{

    button_ref: React.RefObject<AutoStackedPopperWithButton | null>

    /**
     * 创建一个折叠起来的按钮组，且通过无鼠标的方式来操作。
     * @param props.outer_button 用来展开菜单的按钮的类型。
     * @param props.outer_props 用来展开菜单的按钮的`props`。
     * @param props.poper_props 传递给弹出框的`props`
     * @param props.label 鼠标移上去显示的字样。
     * @param props.close_on_otherclick 是否在点击其他位置时关闭。
     * @param props.onExit 关闭时的其他行为。
     * @param props.children `children`会被渲染在按钮之前。
     * @param props.node 所服务的节点。
     * @param props.buttons 所要用的按钮组。
     * @param props.idxs 自身以及按钮组的编号。如果没有提供，就默认从`0`开始，如果没有提供完全，就默认从最大的开始依次`+1`。
     */
    constructor(props: AutoStackedPopperButtonGroupMouselessProps){
        super(props)

        this.state = {
            menu_open: false , 
            active: false , 
        }

        this.button_ref = React.createRef()
    }

    /** 获得按钮组件，作为菜单组件的定位。 */
    get_button(){
        if(this.button_ref && this.button_ref.current){
            return this.button_ref.current
        }
        return undefined
    }

    /** 将自己设置为激活样式。 */
    set_active(active: boolean){
        this.setState({active: active})
    }

    /** 从`props`传入的`idxs`获得补全的`idxs`。 */
    get_idxs(){
        let idxs = this.props.idxs || []
        if(idxs.length == 0){
            idxs = [1]
        }
        while(idxs.length < this.props.buttons.length + 1){
            idxs = [...idxs, Math.max(...idxs) + 1] // 每次加入最大元素+1。
        }
        return idxs
    }

    get_position(){
        return get_position(this.props.node.idx, this.get_idxs()[0]) // 自己使用idxs[0]作为位置。
    }

    /** 这个函数需要在每个子按钮被取消激活时调用，作用是检测当前位置是否还在节点内，如果不在就自动关闭菜单。 */
    extra_unactive(new_pos?: string){
        let button = this.get_button()
        if(!button){
            return
        }
        if(new_pos != undefined){
            let [new_nodeidx, subidx] = JSON.parse(new_pos)
            if(new_nodeidx != this.props.node.idx){
                button.set_menu_open(false) // 如果激活了一个不是本节点的位置，那么就关闭菜单。
            }
            let my_subidxs = this.get_idxs()
            if(my_subidxs.indexOf(subidx) < 0){
                button.set_menu_open(false) // 如果激活了本节点中的其他按钮，那也关闭菜单。
            }
        }
        if(new_pos == undefined){ // 光标取消聚焦
            button.set_menu_open(false)
        }
    }
    
    componentDidMount(): void {
        let me = this
        let [regiester_func, _] = this.context as [MouselessRegisterFunction, MouselessUnRegisterFunction]
        regiester_func(SPACE, me.get_position() , 
            ()=>{
                let button = me.get_button()
                if(button){
                    button.set_menu_open(true)
                }
                me.set_active(true)
            }  ,  
            (new_pos?: string) => {
                me.extra_unactive(new_pos)
                me.set_active(false)
            } , 
            ()=>{
                let button = me.get_button()
                if(button){
                    button.run()
                }
            }
        )
    }

    componentWillUnmount(): void {
        let [_, unregister_func] = this.context as [MouselessRegisterFunction, MouselessUnRegisterFunction]
        unregister_func(SPACE, this.get_position())
    }

    render(){
        let props = this.props
        let children = props.children || <></>

        let idxs = this.get_idxs().slice(1) // 去掉第一个idx之后剩下的

        return <Box sx={{
            border: this.state.active ? "2px solid" : "none",
            display       : "flex",
            justifyContent: "center" ,
            alignItems    : "center" ,
        }}>
            <AutoStackedPopperWithButton
                outer_button        = {this.props.outer_button}
                outer_props         = {this.props.outer_props}
                poper_props         = {this.props.poper_props}
                label               = {this.props.label}
                close_on_otherclick = {this.props.close_on_otherclick}
                onExit              = {this.props.onExit}

                ref = {this.button_ref}
            >
                {children}
                <Box sx={{marginX: "auto"}}>
                    <ButtonGroup 
                        node    = {props.node}
                        buttons = {props.buttons}
                        idxs    = {idxs}

                        extra_unactivate = {this.extra_unactive.bind(this)}
                    />
                </Box>
            </AutoStackedPopperWithButton>
        </Box>
    }
}


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
