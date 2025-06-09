/** 
 * 这个模块提供所有按钮的超类。
 * @module
 */

import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"

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

export type {
    EditorButtonInformation , 
    ButtonDescription , 
    AutoStackedPopperWithButtonProps , 
}

export {
    AutoStackedPopperWithButton , 
}

/** 折叠起来的按钮组的`props`。 */
interface AutoStackedPopperWithButtonProps {
    /** 用来展开菜单的按钮的类型。 */
    outer_button: any 

    /** 用来展开菜单的按钮的`props`。 */
    outer_props?: any 
    
    /** 传递给弹出框的`props` */
    poper_props?: Omit<Omit<Omit<AutoStackedPopperProps , "ref"> , "anchorEl"> , "open">

    /** 鼠标移上去显示的字样。 */
    label?: string 

    /** 是否在点击其他位置时关闭。 */
    close_on_otherclick?: boolean

    /** 关闭时的其他行为。 */
    onExit?: ()=>void 

    /** 打开时的其他行为。 */
    onEnter?: ()=>void 

    /** 子元素。 */
    children?: any , 
}

/**
 * 这个组件定义一个折叠起来的按钮组。
 */
class AutoStackedPopperWithButton extends React.PureComponent<AutoStackedPopperWithButtonProps, {
    menu_open: boolean
}>{

    static contextType = EditorGlobalInfo
    declare context: React.ContextType<typeof EditorGlobalInfo>

    menu_anchor_ref: React.RefObject<HTMLAnchorElement | null>

    /**
     * 创建一个折叠起来的按钮组，且通过无鼠标的方式来操作。
     * @param props.outer_button 用来展开菜单的按钮的类型。
     * @param props.outer_props 用来展开菜单的按钮的`props`。
     * @param props.poper_props 传递给弹出框的`props`
     * @param props.label 鼠标移上去显示的字样。
     * @param props.close_on_otherclick 是否在点击其他位置时关闭。
     * @param props.onExit 关闭时的其他行为。
     * @param props.onEnter 打开时的其他行为。
     * @param props.children `children`会被渲染在按钮之前。
     */
    constructor(props: AutoStackedPopperWithButtonProps){
        super(props)

        this.state = {
            menu_open: false , 
        }

        this.menu_anchor_ref = React.createRef()
    }

    /** 打开菜单。 */
    set_menu_open(open: boolean){
        this.setState({menu_open: open})
        if(!open){ // 正在关闭
            this.props.onExit && this.props.onExit()
        }
        if(open){ // 正在打开
            this.props.onEnter && this.props.onEnter()
        }
    }

    /** 获得按钮组件，作为菜单组件的定位。 */
    get_anchor(){
        if(this.menu_anchor_ref && this.menu_anchor_ref.current){
            return this.menu_anchor_ref.current
        }
        return undefined
    }

    /** 模拟点击行为，切换菜单的关闭/打开。 
     * @param _ 这是无鼠标操作的接口规定的参数，没有实际意义。
    */
    run(_: any = undefined){
        this.set_menu_open(!this.state.menu_open)
    }

    render(){
        const props = this.props
        const children = props.children || <></>
        const B = props.outer_button

        let poper = <React.Fragment>
            <AutoTooltip title={props.label}><B 
                onClick     = {this.run.bind(this)}
                ref         = {this.menu_anchor_ref}
                {...props.outer_props}
            /></AutoTooltip>
            <AutoStackedPopper 
                anchorEl    = {this.get_anchor()} 
                open        = {this.state.menu_open}
                {...props.poper_props}
            >
                {children}
            </AutoStackedPopper>
        </React.Fragment>
    
        if(props.close_on_otherclick){
            return <ClickAwayListener onClickAway={()=>{this.set_menu_open(false)}}>
                <Box>{poper}</Box>
            </ ClickAwayListener>
        }
        return poper
    }
}


/** 所有按钮组件的通用信息。 */
interface EditorButtonInformation<NodeType extends ConceptNode = ConceptNode>{

    /** 按钮所服务的节点。 */
    node: Slate.Node & NodeType
}

type ButtonDescriptionWithProps<OtherPropsType = {}> = {
    other_props?: OtherPropsType
    component:  React.ComponentType<EditorButtonInformation & OtherPropsType> 

    /** 是否要跳过无鼠标操作的选择。 */
    skip_mouseless?: boolean
} 

/** 描述一个按钮。 */
type ButtonDescription<OtherPropsType = {}> = (
    ButtonDescriptionWithProps<OtherPropsType>
    | React.ComponentType   <EditorButtonInformation & OtherPropsType> 
)
