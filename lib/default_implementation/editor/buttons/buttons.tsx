/** 
 * 这个文件提供一些实用按钮。
 * @module
 */

import React, {useEffect, useState} from "react"

import { 
    Card , 
    TextField ,
    Drawer , 
    Button , 
    Typography , 
    Tooltip , 
    IconButton , 
    ClickAwayListener  , 
    Box , 
    Switch , 
} from "@mui/material"
import type { IconButtonProps  } from "@mui/material"

import {
    Close as CloseIcon , 
    Settings as SettingsIcon , 
    North as NorthIcon , 
    South as SouthIcon , 
    MoveUp as MoveUpIcon  , 
    PhoneMissed as PhoneMissedIcon
}
from "@mui/icons-material"


import * as Slate from "slate"
import {
    GroupNode , 
    Node , 
    StructNode , 
    ConceptNode , 
} from "../../../core"
import { 
    EditorComponent , 
    EditorGlobalInfo , 
    slate_concept_node2path , 
} from "../../../editor"
import { AutoTooltip , Direction , AutoStack , AutoStackedPopper , AutoStackedPopperProps } from "../../../uibase"
import { DefaultParameterWithEditorWithDrawer } from "./parameter_edit" 

import {
    EditorButtonInformation , 
    ButtonBase , 
} from "../../../implbase/buttons"

export {    
    DefaultParameterEditButton , 
    DefaultCloseButton , 
    NewParagraphButtonUp , 
    NewParagraphButtonDown , 
    DefaultSwicth , 
    AutoIconButton , 
    DefaultSoftDeleteButton , 
    CopyButton , 
}

/** 这个函数是一个语法糖，用于自动创建带tooltip的按钮。 */
function AutoIconButton({
    onClick , 
    size = "small" , 
    title , 
    icon , 
    component = "button" , 
    icon_props = {}, 
}:{
    onClick?: IconButtonProps["onClick"]
    size?: IconButtonProps["size"]
    title?: string
    icon?: any
    component?: "button" | "span"
    icon_props?: IconButtonProps
}){
    const {sx, ...rest} = icon_props
    const Icon = icon
    
    return <AutoTooltip title={title}>
        <IconButton 
            onClick     = {onClick} 
            component   = {component} 
            sx          = {{
                ...(size == "small" ? {
                    paddingX: "0.05rem",
                    transform: "scale(0.8)",
                    transformOrigin: "center center" , 
                } : {}),
                
                ...(sx || {})
            }}
            {...rest} 
        >
            <Icon/>
        </IconButton>
    </AutoTooltip>
}

function MyImg(props: {img_url: string}){
    return <img src={props.img_url}></img>
}


/**
 * 这个组件向具体的编辑器和具体的节点提供 DefaultParameterContainer ，同时还提供一个按钮。
 * @param props.node 这个组件所服务的节点。
 * @param props.onExit 抽屉关闭时的行为。
 */
class DefaultParameterEditButton extends React.Component <EditorButtonInformation & {
    onExit?: (e:any)=>void , 
}, {
    open: boolean
}> implements ButtonBase {
    constructor(props: EditorButtonInformation & {onExit?: (e:any)=>void}){
        super(props)

        this.state = {
            open: false
        }

        this.run = this.run.bind(this)
    }

    run(){
        this.setState({open:true})
    }

    shouldComponentUpdate(
        nextProps: EditorButtonInformation & {onExit?: (e:any)=>void}, 
        nextState: {open: boolean}
    ): boolean {
        return nextProps.node.parameters !== this.props.node.parameters 
            || nextState.open !== this.state.open
    }

    render(){
        const props = this.props
        const onExit = props.onExit || ((e:any)=>{})
        const me = this

        return <Box sx={{marginX: "auto"}}>
            <AutoIconButton onClick={me.run} title="设置参数" icon={SettingsIcon} />
            <DefaultParameterWithEditorWithDrawer 
                node = {props.node} 
                open = {me.state.open} 
                onClose = {(e:any)=>{ 
                    onExit(e)
                    me.setState({open:false})
                }} 
            />
        </ Box>
    }
}

/** 这个组件提供一个直接删除节点的按钮。 
 * @param props.node 这个组件所服务的节点。
 */
class DefaultCloseButton extends React.Component<EditorButtonInformation> implements ButtonBase{
    static contextType = EditorGlobalInfo
    declare context: React.ContextType<typeof EditorGlobalInfo>

    constructor(props: EditorButtonInformation){
        super(props)
        this.run = this.run.bind(this)
    }
    shouldComponentUpdate(): boolean {
        return false 
    }

    run(){
        const globalinfo = this.context
        const editor = globalinfo.editor
        if(editor){
            editor.delete_concept_node(this.props.node)
        }
    }
    render(): React.ReactNode {
        return <AutoIconButton onClick={this.run} title="删除组件" icon={CloseIcon} />
    }
}

/** 这个组件提供一个删除节点，但是将其子节点移动到节点外的按钮。 
 * @param props.node 这个组件所服务的节点。
 * @param props.puretext 是否将子组件作为纯文本。
 */
class DefaultSoftDeleteButton extends React.Component<EditorButtonInformation & {puretext?: boolean}> implements ButtonBase{
    static contextType = EditorGlobalInfo
    declare context: React.ContextType<typeof EditorGlobalInfo>

    constructor(props: EditorButtonInformation & {puretext?: boolean}){
        super(props)
        this.run = this.run.bind(this)
    }

    run(){
        let globalinfo = this.context
        let editor = globalinfo.editor
        if(!editor){
            return
        }

        if(this.props.puretext){
            // XXX 可能保留内部样式会比较好...
            const text = Slate.Node.string(this.props.node)
            const path = slate_concept_node2path(editor.get_root() , this.props.node)
            if(path){
                editor.delete_node_by_path(path)
                editor.add_nodes(editor.get_core().create_paragraph(text) , path)
            }
        }
        else{
            editor.unwrap_node(this.props.node)
        }
    }

    shouldComponentUpdate(): boolean {
        return false
    }

    render(): React.ReactNode {
        return <AutoIconButton onClick={this.run} title="解除组件" icon={MoveUpIcon} />
    }
}

/** 这个组件提供一个在组件的上新建段落的节点。 
 * @param props.node 这个组件所服务的节点。
 */
class NewParagraphButtonUp extends React.Component<EditorButtonInformation> implements ButtonBase{
    static contextType = EditorGlobalInfo
    declare context: React.ContextType<typeof EditorGlobalInfo>

    constructor(props: EditorButtonInformation){
        super(props)
        this.run = this.run.bind(this)
    }

    run(){
        let globalinfo = this.context
        let editor = globalinfo.editor
        if(!editor){
            return
        }
        editor.add_nodes_before(editor.get_core().create_paragraph() , this.props.node )    
    }

    shouldComponentUpdate(): boolean {
        return false
    }

    render(): React.ReactNode {
        return <AutoIconButton onClick={this.run} title="向上添加段落" icon={NorthIcon} />
    }
}

/** 这个组件提供一个在组件的下新建段落的节点。 
 * @param props.node 这个组件所服务的节点。
 */
 class NewParagraphButtonDown extends React.Component<EditorButtonInformation> implements ButtonBase{
    static contextType = EditorGlobalInfo
    declare context: React.ContextType<typeof EditorGlobalInfo>

    constructor(props: EditorButtonInformation){
        super(props)
        this.run = this.run.bind(this)
    }

    run(){
        const globalinfo = this.context
        const editor = globalinfo.editor
        if(!editor){
            return
        }
        editor.add_nodes_after(editor.get_core().create_paragraph() , this.props.node )    
    }

    shouldComponentUpdate(): boolean {
        return false
    }

    render(): React.ReactNode {
        return <AutoIconButton onClick={this.run} title="向下添加段落" icon={SouthIcon} />
    }
}


/** 这个按钮在一个概念下方复制此概念，并设置同样的参数。 
 * @param props.node 这个组件所服务的节点。
 */
 class CopyButton extends React.Component<EditorButtonInformation> implements ButtonBase{
    static contextType = EditorGlobalInfo
    declare context: React.ContextType<typeof EditorGlobalInfo>

    constructor(props: EditorButtonInformation){
        super(props)
        this.run = this.run.bind(this)
    }

    shouldComponentUpdate(): boolean {
        return false
    }

    run(){
        const globalinfo = this.context
        const editor = globalinfo.editor
        if(!editor){
            return
        }

        const node = this.props.node
        let new_node: ConceptNode | undefined = undefined
        if(node.type == "group"){
            new_node = editor.get_core().create_group(node.concept, "chaining") // 自动跟上一个节点贴贴
            new_node.parameters = JSON.parse( JSON.stringify(node.parameters) )
        }
        else if(node.type == "structure"){
            new_node = editor.get_core().create_structure(node.concept, "chaining")
            new_node.parameters = JSON.parse( JSON.stringify(node.parameters) )
        }
        else if(node.type == "support"){
            new_node = editor.get_core().create_support(node.concept)
            new_node.parameters = JSON.parse( JSON.stringify(node.parameters) )
        }
        if(new_node){
            editor.add_nodes_after(new_node , this.props.node )    
        }
    }

    render(): React.ReactNode {
        return <AutoIconButton onClick={this.run} title="复制此节点" icon={PhoneMissedIcon} />
    }
}


/** 这个组件给一个`Group`或`Struct`组件提供一个开关，用于控制`Group`或`Struct`的`relation`。 
 * @param props.node 服务的节点。
 */
class DefaultSwicth extends React.Component<EditorButtonInformation<GroupNode | StructNode>, {
    checked: boolean
}> implements ButtonBase{
    static contextType = EditorGlobalInfo
    declare context: React.ContextType<typeof EditorGlobalInfo>

    switchref: React.RefObject<HTMLInputElement | null>

    constructor(props: EditorButtonInformation<GroupNode | StructNode>){
        super(props)

        this.state = {
            checked: props.node.relation == "chaining" , 
        }

        this.switchref = React.createRef<HTMLInputElement>()

        this.switch_check_change = this.switch_check_change.bind(this)
    }

    get_switch(): HTMLInputElement | undefined{
        if(this.switchref && this.switchref.current){
            return this.switchref.current // 反正就是第一个children
        }
        return undefined
    }

    /** 当点击的时候，处理开关的逻辑。 */
    switch_check_change(){
        const globalinfo = this.context
        const editor = globalinfo.editor
        const node = this.props.node

        const checked = this.get_switch()?.checked
        if(checked == undefined || !editor){
            return
        }
        this.setState({checked: checked})

        // constraints会自动处理更改，不用担心
        if(checked){ // 从关到开
            editor.set_node(node , { relation: "chaining" } )
        }
        else{
            editor.set_node(node , { relation: "separating" })
        }
    }

    update(){
        const node = this.props.node
        // 在节点被外部修改的情况下更新组件状态。主要是为了在撤销操作时正确的操作状态
        if( (node.relation == "chaining") != this.state.checked){ 
            this.setState({checked: node.relation == "chaining"})
        }
    }

    componentDidMount(): void {
        this.update()
    }
    componentDidUpdate(): void {
        this.update()
    }
    
    run(){
        const switch_ = this.get_switch()
        if(switch_){
            switch_.click() // 模拟点击。
        }
    }
    render(): React.ReactNode {
        return <AutoTooltip title = "贴贴">
            <Switch 
                checked = {this.state.checked} 
                onChange = {this.switch_check_change} 
                sx = {{
                    transform: "scale(0.8)",
                    transformOrigin: "center center" , 
                    marginX: "-0.5rem"
                }}
                slotProps = {{
                    input: {
                        ref: this.switchref
                    }
                }}
            />
        </AutoTooltip>
    }
}




