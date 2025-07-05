/** 
 * 这个模块提供一些默认的 Group 的渲染器。
 * @module
 */

import React from "react"


import {
    Grid , 
    IconButton , 
    PaperProps , 
} 
from "@mui/material"

import {
    ChevronDown as ChevronDownIcon
} from "lucide-react"


import * as Slate from "slate"

import { 
    StructNode , 
    ParameterList , 
} from "../../core"
import { 
    EditorRenderer , 
    EditorRendererProps , 
    EditorComponent , 

    slate_concept_node2path , 
    EditorGlobalInfo , 
} from "../../editor"

import { 
    DefaultParameterEditButton , 
    DefaultCloseButton , 
    NewParagraphButtonUp , 
    NewParagraphButtonDown , 
    DefaultSwicth  , 
    DefaultSoftDeleteButton , 

    CopyButton , 
} from "./buttons"

import {
    ButtonGroup , 
    FoldedButtonGroup , 
    EditorNodeInfoFunction , 
    useNode , 
    NodeInfoProvider , 
    useParameters , 
    AutoIconButton , 
    useEditorConfig,
} from "../../implbase"

import { 
    DefaultNewAbstractButton , 
    AbstractManageBox , 
} from "./abstract"

import { 
    AutoTooltip  , 
    AutoStack , 
    Direction , 
    SimpleAutoStack , 
    AutoStackedPopper , 
    UnexpectedParametersError , 
    with_partial_props , 
} from "../../uibase"

import { 
    EditorComponentPaper as ComponentPaper , 
    EditorParagraphBox as ParagraphBox , 
    EditorBackgroundPaper as BackgroundPaper , 
    EditorComponentEditingBox as ComponentEditorBox , 
    EditorUnselecableBox as UnselecableBox , 
    EditorComponentBox as ComponentBox , 
    EditorStructureTypography as StructureTypography , 
} from "./uibase"

export { get_default_struct_editor_with_rightbar }

/** 为 Struct 类型的节点定制的 Paper ，在节点前后相连时会取消前后距离。 */
function StructPaper(props: PaperProps){
    const node = useNode<StructNode>()
    return <ComponentPaper {...props} 
        sx = { node.relation == "chaining" ? { marginTop: "0" } : {} }
    />
}

/** 这个函数返回一个默认的结构节点组件。这个节点需要用户确定其子节点数量以及每个子节点的宽度，并自动创建和删除子节点，使得子节点的
 *  数量和给定的一致，并且自动调整子节点的宽度。
 * 用户给出的宽度会被理解为比例，如果用户给出的宽度不足，则自动用`1`填充。
 * @param params.get_label 从节点获得`label`的方法。
 * @param params.get_numchildren  从节点获得的子节点数量的方法。返回`-1`表示不限制子节点数量。
 * @param params.get_widths  从节点获得每个子节点宽度的方法。
 * @param params.rightbar_extra 要额外向添加的组件。
 * @param params.surrounder 包裹内容区域的组件。
 * @returns 一个用于渲染group的组件。
 */
function get_default_struct_editor_with_rightbar({
    get_label       = () => useParameters().label , 
    get_numchildren = () => 1 ,
    get_widths      = () => [] ,
    rightbar_extra  = undefined , 
    buttons_extra   = [] , 
    surrounder      = (props) => <>{props.children}</> , 
} : {
    get_label       ?: () => string , 
    get_numchildren ?: EditorNodeInfoFunction<StructNode, number> , 
    get_widths      ?: EditorNodeInfoFunction<StructNode, number[]> ,
    rightbar_extra  ?: React.ComponentType<{}> , 
    buttons_extra   ?: ( React.ComponentType<{}> )[] , 
    surrounder      ?: (props: {children: any}) => any , 
}): EditorRenderer<StructNode>{
    
    return (props: EditorRendererProps<StructNode>) => {
        const editor      = props.editor
        const node        = props.node
        const editorcore  = editor.get_core()
        const config      = useEditorConfig()
        const parameters  = React.useMemo(()=>(
            editorcore.get_printer().process_parameters(node)
        ), [editor, node])

        const SUR     = surrounder
        const Extra   = rightbar_extra
        const GetLabel = get_label

        const mychildren = React.useMemo(()=>node.children, [node])
        const mypath = React.useMemo(()=>slate_concept_node2path(editor.get_root() , node), [editor, node])
        if(!mypath){
            throw new UnexpectedParametersError("这这不能")
        }
        let num_children = React.useMemo(()=>{
            let val = get_numchildren(node, parameters)
            val = val < 0 ? mychildren.length : val
            return val
        }, [get_numchildren, node, parameters, mychildren.length])

        // 获得并规范元素的相对长度。
        let [widths, widthsum] = React.useMemo(()=>{
            let val = get_widths(node, parameters)
            val = val.slice(0,num_children)   // 确保widths元素不少
            while(val.length < num_children){ // 确保widths元素不多
                val.push(1)
            }
            let widthsum = val.reduce( (s,x)=>s+x , 0 ) // 求所有元素的和。
            return [val, widthsum]
        }, [get_widths, node, parameters, num_children])

        React.useEffect(()=>{
            // 规范子节点数量。
            if(num_children < mychildren.length){
                let paths = new Array<number[]>()
                for(let x = num_children; x < mychildren.length; x++){
                    paths.push([...mypath, x])
                }
                editor.delete_nodes_by_paths(paths) // 删除最后一个子节点。
            }
            else if(num_children > mychildren.length){
                let new_nodes = new Array<Slate.Node>()
                for(let x = mychildren.length; x < num_children; x++){
                    new_nodes.push(editorcore.create_group("_auxiliary" , "chaining"))
                }

                // 在最后一个节点后面添加节点
                editor.add_nodes(new_nodes, [...mypath, mychildren.length]) 
            }
        } , [editor, num_children, mychildren, mypath, editorcore])


        return <NodeInfoProvider node={node}>
        <StructPaper><AutoStack force_direction="row">
            
            <Grid container columns={widthsum} sx={{width: "100%"}}>
                {widths.map((width,idx)=>{   
                    const child = (props.children as any)?.[idx]
                    if(!child){
                        return <></>
                    }
                    return <Grid key={idx} size={{xs: width}}>
                        <ComponentEditorBox autogrow >
                            <SUR>{child}</SUR>
                        </ComponentEditorBox>
                    </Grid>
                })}
            </Grid>

            {Extra && <UnselecableBox>
                <Extra/>
            </UnselecableBox>}

            <UnselecableBox><AutoStack>
                <StructureTypography sx={{marginX: "auto"}}><GetLabel /></StructureTypography>
                <FoldedButtonGroup 
                    popper_props = {{
                        sx:{
                            opacity: "80%" , 
                        }
                    }}
                    button_comp = {with_partial_props(AutoIconButton, {
                        size: "small" , 
                        icon: ChevronDownIcon , 
                        title: "展开" , 
                    })}
                    buttons = {[
                        <DefaultParameterEditButton /> , 
                        <CopyButton /> , 
                        <DefaultSwicth /> , 
                        <DefaultCloseButton /> , 
                        <DefaultSoftDeleteButton /> , 
                        <NewParagraphButtonUp /> , 
                        <NewParagraphButtonDown /> , 
                        <DefaultNewAbstractButton /> , 
                        ... buttons_extra.map(B => <B/>)
                    ]}
                    level = {0}
                    max_level = {0}
                /> 
            </AutoStack></UnselecableBox>
        </AutoStack></StructPaper>
        <UnselecableBox>
            <AbstractManageBox />
        </UnselecableBox>
        </NodeInfoProvider>
    }
}
