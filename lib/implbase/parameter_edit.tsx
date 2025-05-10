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
} from "../core"

import {
    EditorButtonInformation , 
} from "./buttons"

export {
    DefaultParameterContainer , 
    DefaultParameterWithEditor , 
}

export type {
    ParameterItemComponentProps , 
}

/** 参数项更新组件的`props`。 */
interface ParameterItemComponentProps{
    /** 要更新的参数项的初始值。 */
    parameter_item: ParameterValue

    /** 这个参数项的名称。 */
    name: string
}

/** 
 * 这个组件负责一个参数项的更新操作。
 */
class ParameterItemComponent extends React.Component <ParameterItemComponentProps , {
    val: string | boolean | number
}>{
    constructor(props: ParameterItemComponentProps){
        super(props)

        this.state = {
            val: props.parameter_item.val
        }
    }
    
    /** 当外界询问时，这个函数向外提供修改过的参数。 */
    public get_item(): ParameterValue{
        let {val, type, ...other_items} = this.props.parameter_item
        let ret = {
            val: this.state.val , 
            type: this.props.parameter_item.type , 
            ...other_items
        } 
        return ret as ParameterValue
    }
    
    componentDidUpdte(prev_props: ParameterItemComponentProps){

        // 如果props里面的初始值更新了，那么就以新的初始值开始。
        if( JSON.stringify(prev_props.parameter_item.val) != JSON.stringify(this.props.parameter_item.val) ){
            this.setState({
                val: this.props.parameter_item.val
            })
        }
    }

    render(){
        let me = this
        let name = this.props.name
        let type = this.props.parameter_item.type
        let val = this.state.val

        let standard_props = {
            value: val ,
            label: name, 
            variant: "standard" as "standard" , // ts有毛病
            sx: {marginLeft: "5%"} , 
        }        
        let standard_sx = {
            marginLeft: "5%" , 
        }

        if(this.props.parameter_item.choices){ // 如果有额外的一项choices
            let choices = this.props.parameter_item.choices as (typeof val [])

            return <FormControl sx = {{...standard_sx , width: "100%"}}>
                <FormLabel key="form">{name}</FormLabel>
                <RadioGroup
                    key = "ratio"
                    value = {val}
                    onChange = {e=>{
                        me.setState({val: e.target.value})
                    }}
                >
                    {choices.map((c,idx)=><FormControlLabel sx={{marginLeft: "5%"}} key={idx} value={c} label={c} control={<Radio />}/>)}
                </RadioGroup>
            </FormControl>        
        }
        if(type == "string"){
            return <TextField 
                onChange = {e=>{
                    me.setState({val: e.target.value})
                }}
                {...standard_props}
                sx = {standard_sx}
            />
        }
        if(type == "number"){
            return <TextField 
                onChange = {e=>{
                    me.setState({val: Number(e.target.value)})
                }}
                type = "number"
                {...standard_props}
                sx = {standard_sx}
            />
        }
        if(type == "boolean"){
            return <FormControlLabel 
                label = {name} 
                control = {<Switch 
                    checked = {val as boolean}
                    onChange = {e=>{
                        me.setState({val: e.target.checked})          
                    }}
                />} 
                sx = {standard_sx}
            />
        }
        return <></>
    }
}

/** 参数菜单的`props`。 */
interface DefaultParameterContainerProps{
    parameters: ParameterList
}

/** 这个类定义一个菜单组件，作为默认的参数更新器。 
 * 注意，这个类是一个菜单，不包含打开菜单的逻辑。
 */
class DefaultParameterContainer extends React.Component <DefaultParameterContainerProps>{
    /** 所有子项的`ref`。 */
    item_refs: {[key: string] : React.RefObject<ParameterItemComponent>}

    /**
     * 参数菜单的构造函数。
     * @param props.parameters 所有参数的初始值。
     */
    constructor(props: DefaultParameterContainerProps){
        super(props)

        this.item_refs = Object.keys(this.props.parameters).reduce((obj , key)=>{
            obj[key] = React.createRef<ParameterItemComponent>()
            return obj
        } , {} as any)
    }

    /** 这个函数向外界提供一个完整的更新后的参数列表。 */
    public get_parameters(){
        let me = this
        let ret: any = {}
        for(let key in this.props.parameters){
            if(!(me.item_refs[key] && me.item_refs[key].current)){
                ret[key] = this.props.parameters[key] // 如果这个`ref`还没创建，返回初始值。
            }
            else {
                ret[key] = me.item_refs[key].current.get_item()
            }
        }
        return ret
    }

    /**
     * 渲染函数。
     * 注意，这个组件必须被包裹在一个 non_selectable_prop 的元素内部。
     * @returns 一个菜单，提供各个参数的编辑项。
     */
    render(){
        let me = this

        return <List>{Object.keys(me.props.parameters).map((key,idx)=>{
            return <ListItem key = {idx}>
                <ParameterItemComponent
                    ref = {this.item_refs[key]}
                    name = {key}
                    parameter_item = {me.props.parameters[key]}
                />
            </ListItem>
        })}</List>
    }
}



/** 这个组件向具体的编辑器和具体的节点提供`DefaultParameterContainer`。
 * 注意，这个组件不包含打开菜单的逻辑。
 * @param props.editor 这个组件所服务的编辑器。
 * @param props.element 这个组件所服务的节点。
 */
class DefaultParameterWithEditor extends React.Component<EditorButtonInformation>{

    /** 参数菜单的引用。 */
    container_ref: React.RefObject<DefaultParameterContainer | null>

    constructor(props: EditorButtonInformation){
        super(props)

        this.container_ref = React.createRef()
    }

    get_parameters(){
        let container = this.get_container()
        if(container){ // 如果引用已经建立，就直接询问
            return container.get_parameters()
        }
        // 如果引用还未建立，就返回初始值。
        return this.props.node.parameters
    }

    get_container(){
        if(this.container_ref && this.container_ref.current){
            return this.container_ref.current
        }
        return undefined
    }

    render(){
        let me = this

        return <DefaultParameterContainer
            ref = { me.container_ref }
            parameters = { me.props.node.parameters }
        />
    }
}
