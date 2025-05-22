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
    EditorComponent , 
} from "../editor"

export {
    DefaultParameterContainer , 
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

    /** 更新的回调。 */
    onUpdate?: (val: string | boolean | number)=>void
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
            type: type , 
            ...other_items
        } 
        return ret as ParameterValue
    }
    
    componentDidUpdate(
        prev_props: ParameterItemComponentProps,
        prev_state: {val: string | boolean | number}
    ){
        // 如果props里面的初始值更新了，那么就以新的初始值开始。
        if (JSON.stringify(prev_props.parameter_item.val) != JSON.stringify(this.props.parameter_item.val)) {
            this.setState({
                val: this.props.parameter_item.val
            })
            return  // 添加return，避免后续的onUpdate调用
        }
    }

    render(){
        let me = this
        let name = this.props.name
        let type = this.props.parameter_item.type
        let val = this.state.val
        let onUpdate = this.props.onUpdate || (()=>{})

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
                        onUpdate(e.target.value)
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
                    onUpdate(e.target.value)
                }}
                {...standard_props}
                sx = {standard_sx}
            />
        }
        if(type == "number"){
            return <TextField 
                onChange = {e=>{
                    me.setState({val: Number(e.target.value)})
                    onUpdate(Number(e.target.value))
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
                        onUpdate(e.target.checked)
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
    node: Slate.Node & ConceptNode
    onSave  ?: (parameters: ParameterList)=>void
}

/** 这个类定义一个菜单组件，作为默认的参数更新器。 
 * 注意，这个类是一个菜单，不包含打开菜单的逻辑。
 */
class DefaultParameterContainer extends React.Component <DefaultParameterContainerProps, {
    parameters: ParameterList
}>{

    /**
     * 参数菜单的构造函数。
     * @param props.parameters 所有参数的初始值。
     */
    constructor(props: DefaultParameterContainerProps){
        super(props)

        this.state = {
            parameters: props.node.parameters
        }
    }
    componentDidUpdate(
        prev_props: DefaultParameterContainerProps,
    ){
        // 如果props里面的初始值更新了，那么就以新的初始值开始。
        if( JSON.stringify(prev_props.node) != JSON.stringify(this.props.node) ){
            this.setState({
                parameters: this.props.node.parameters
            })
        }
    }

    /** 这个函数向外界提供一个完整的更新后的参数列表。 */
    get_parameters(){
        return this.state.parameters
    }

    /**
     * 渲染函数。
     * 注意，这个组件必须被包裹在一个 non_selectable_prop 的元素内部。
     */ 
    render(){
        let me = this
        let init_parameters = this.props.node.parameters

        let node_str = JSON.stringify(this.props.node)
        let onSave = this.props.onSave || (()=>{})

        return <React.Fragment>
        <List>{Object.keys(init_parameters).map((key,idx)=>{
            return <ListItem key = {`param-${node_str}-${key}`}>
                <ParameterItemComponent
                    key = {`param-${node_str}-${key}`}
                    name            = {key}
                    parameter_item  = {init_parameters[key]}
                    onUpdate = {(v: string | boolean | number)=>{
                        me.setState((cur_state => {
                            let cur_param = cur_state.parameters
                            let { val, type, ...other_items } = cur_param[key]

                            let new_param = {
                                ...cur_param , 
                                [key]: {
                                    val: v, 
                                    type: init_parameters[key].type , 
                                    ...other_items
                                } as ParameterValue
                            }
                            console.log("new_param", new_param)
                            return {parameters: new_param}
                        }))
                    }}
                />
            </ListItem>
        })}</List>
        <Button onClick = {()=>{
            onSave(me.get_parameters())
        }}>保存</Button>
        </React.Fragment>
    }
}
