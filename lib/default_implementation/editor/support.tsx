/** 
 * 这个模块提供一些默认的 Support 节点的渲染器。
 * @module
 */
import React from "react"
import {
    Typography , 
    Paper , 
    Card , 
    Box , 
    Stack , 
    Button , 
    Divider , 
    IconButton , 
    Grid , 
    Skeleton  , 
}
from "@mui/material"
import {
    South as SouthIcon , 
    North as NorthIcon , 
    KeyboardArrowDown as KeyboardArrowDownIcon , 
}
from "@mui/icons-material"


import * as Slate from "slate"
import {
    SupportNode , 
    ConceptNode , 
} from "../../core"

import { 
    EditorRenderer , 
    EditorRendererProps  , 
    EditorComponent , 
    EditorGlobalInfo , 
} from "../../editor"

import {  
    AutoStack , 
    AutoTooltip , 
    Direction  , 
    with_partial_props , 
} from "../../uibase"
import {  
    DefaultCloseButton , 
    DefaultParameterEditButton , 
    NewParagraphButtonUp , 
    NewParagraphButtonDown , 
} from "./buttons"
import {
    ButtonGroup , 
    FoldedButtonGroup , 
    EditorNodeInfoFunction , 
    useNode , 
    NodeInfoProvider, 
    useParameters, 
} from "../../implbase"
import { 
    EditorComponentPaper as ComponentPaper , 
    EditorUnselecableBox as UnselecableBox , 
    EditorComponentBox as ComponentBox , 
    EditorStructureTypography as StructureTypography , 
} from "./uibase"

import {
    DefaultNewAbstractButton , 
    DefaultEditAbstractButton , 
} from "./abstract"


export { 
    get_default_spliter_editor , 
    get_default_display_editor , 
}

/** 这个函数返回一个默认的分界符组件。 */
function get_default_spliter_editor({
    get_title = () => useParameters().title
}: {
    get_title?: () => string
}){
    return (props: EditorRendererProps<SupportNode>) => {
        const GetTitle = get_title
        let editor      = props.editor
        let node        = props.node

        return <NodeInfoProvider node={node}>
        <UnselecableBox><ComponentBox>
            <Divider>
                <Paper variant="outlined" sx = {{
                    paddingX: "0.5rem"
                }}>
                    <AutoStack force_direction="row">
                        <StructureTypography><GetTitle /></StructureTypography>
                        <FoldedButtonGroup 
                            level = {0}
                            max_level = {0}
                            button_comp = {with_partial_props(IconButton, {
                                size: "small" , 
                                children: <KeyboardArrowDownIcon fontSize="small"/> , 
                            })}
                            label = "展开"
                            buttons = {[
                                <DefaultParameterEditButton /> , 
                                <DefaultNewAbstractButton /> , 
                                <DefaultEditAbstractButton /> , 
                                <DefaultCloseButton /> , 
                                <NewParagraphButtonUp /> , 
                                <NewParagraphButtonDown /> , 
                            ]}
                        /> 
                    </AutoStack>
                </Paper>
                {props.children /* 对于一个void组件，其children也必须被渲染，否则会报错。*/} 
            </Divider>
        </ComponentBox></UnselecableBox>
        </NodeInfoProvider>
    }
}

/** 这个函数返回一个用来显示元素的 *行内* 组件。 
 * @param params.get_label 获得组件名的方法
 * @param params.is_empty 获得组件是否为空的方法
 * @param params.render_element 渲染内容。
 */
function get_default_display_editor({
    get_label       = () => useParameters().label, 
    is_empty        = (n,p)=>!(p.url) , 
    render_element  = ()=><img src={useParameters().url as string}/>, 
} : {
    get_label       ?: ()=>string , 
    is_empty        ?: EditorNodeInfoFunction<SupportNode , boolean> , 
    render_element  ?: ()=>any , 
}){
    return (props: EditorRendererProps<SupportNode>) => {
        let editor      = props.editor
        let node        = props.node
        let parameters  = editor.get_core().get_printer().process_parameters(node)
        let empty       = is_empty(node, parameters)

        const GetLabel = get_label
        let R = render_element

        return <NodeInfoProvider node={node}>
        <ComponentPaper is_inline>{props.children}<UnselecableBox>
            <AutoStack force_direction = "row">
                <Box sx={{
                    marginX: "0.25rem"
                }}>
                    {empty ? <StructureTypography>EMPTY</StructureTypography> : <R /> }
                </Box>
                <AutoStack force_direction = {empty ? "row" : "column"}>
                    <StructureTypography sx={{marginY: "0.2rem", marginX: "auto"}}>
                        <GetLabel />
                    </StructureTypography>
                    
                    <FoldedButtonGroup 
                        button_comp = {with_partial_props(IconButton, {
                            size: "small" , 
                            children: <KeyboardArrowDownIcon fontSize="small"/> , 
                        })}
                        label = "展开"
                        buttons = {[
                            <DefaultParameterEditButton /> , 
                            <DefaultNewAbstractButton /> , 
                            <DefaultEditAbstractButton /> , 
                            <DefaultCloseButton /> , 
                            <NewParagraphButtonUp /> , 
                            <NewParagraphButtonDown /> , 
                        ]}
                        level = {0}
                        max_level = {0}
                    /> 
                </AutoStack>
            </AutoStack>
        </UnselecableBox></ComponentPaper>
        </NodeInfoProvider>
    }
}
