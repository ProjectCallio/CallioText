/** 
 * 这个模块提供一些默认的 Group 的渲染器。
 * @module
 */

import React from "react"
import * as Slate from "slate"


import {
    Typography , 
    Button , 
    Menu , 
    MenuItem , 
    Drawer , 
    AppBar , 
    Box , 
    AccordionDetails , 
    Popper , 
    Tooltip , 
    Switch , 
    Toolbar , 
    Paper , 
    Grid , 
    IconButton , 
    Divider  , 
    Container , 
    Card , 

    PaperProps ,
    useTheme ,
} 
from "@mui/material"

import {
    KeyboardArrowDown as KeyboardArrowDownIcon, Opacity
} from "@mui/icons-material"


import { GroupNode  } from "../../core"
import { 
    EditorRendererProps , 
    EditorRenderer , 
    EditorComponent ,  
    slate_is_concept , 
    EditorGlobalInfo , 
} from "../../editor"

import { 
    DefaultParameterEditButton , 
    DefaultCloseButton , 
    NewParagraphButtonUp , 
    NewParagraphButtonDown , 
    DefaultSwicth ,
    DefaultSoftDeleteButton , 

    CopyButton , 
} from "./buttons"

import {     
    DefaultNewAbstractButton , 
    DefaultEditAbstractButton , 
} from "./abstract"

import { 
    EditorComponentPaper as ComponentPaper , 
    EditorParagraphBox as ParagraphBox , 
    EditorBackgroundPaper as BackgroundPaper , 
    EditorComponentEditingBox as ComponentEditorBox , 
    EditorUnselecableBox as UnselecableBox , 
    EditorComponentBox as ComponentBox , 
    EditorStructureTypography as StructureTypography , 
} from "./uibase"
import { 
    AutoTooltip  , 
    AutoStack , 
    Direction , 
    SimpleAutoStack , 
    AutoStackedPopper , 
    mod_scrollbar , 
    with_partial_props,

    light_grey,
} from "../../uibase"

import {
    ButtonGroup , 
    FoldedButtonGroup , 
    EditorNodeInfoFunction , 

    useNode , 
    useParameters , 
    useEditor , 
    NodeInfoProvider , 

} from "../../implbase"

import Color from "color"


export { get_deafult_group_editor_with_appbar , get_default_group_editor_with_rightbar}

/** 为 Group 类型的节点定制的 Paper ，在节点前后相连时会取消前后距离。 */
let GroupPaper = (props: PaperProps) => {
    let {sx, ...other_props} = props
    const node = useNode<GroupNode>()
    return <ComponentPaper {...other_props} 
        sx = {{
            ...(node.relation == "chaining" ? { 
                marginTop: "0" ,
                borderTop: "1px solid rgba(30, 30, 30, 0.5)" ,
            } : {}),
            ...sx,
        }}
    />
}

// XXX 可以在Toolbar滚动的时候加一个指示...
// TODO 能不能想办法给不可编辑区域弄点花纹啥的...

/** 这个函数返回一个默认的带应用栏的 group 组件。用于比较大的 group 组件。
 * @param params.get_label 从参数列表获得 title 的方法。
 * @param params.appbar_extra 要额外向 appbar 里添加的组件。
 * @param params.surrounder 包裹内容区域的组件。
 * @returns 一个用于渲染group的组件。
 */
function get_deafult_group_editor_with_appbar({
    get_label     = (n,p)=>p.label, 
    appbar_extra  = (n,p) => [] , 
    surrounder    = (props) => <>{props.children}</>
}: {
    get_label       ?: EditorNodeInfoFunction<GroupNode, string> ,  
    appbar_extra    ?: EditorNodeInfoFunction<GroupNode, React.ReactNode[]> , 
    surrounder      ?: (props: {children: any}) => any ,
}): EditorRenderer<GroupNode>{
    // 渲染器
    const subcomp = ({
        editor, node, children
    }: EditorRendererProps<Slate.Node & GroupNode>) => {
        const parameters  = React.useMemo(()=>(
            editor.get_core().get_printer().process_parameters(node)
        ), [editor, node])
        const label       = React.useMemo(()=>get_label(node, parameters), [get_label, node, parameters])

        const SUR = surrounder

        const theme   = useTheme()
        const bgcolor = React.useMemo(()=>light_grey( Color(theme.palette.primary.light) ), [theme])

        return <NodeInfoProvider node={node}>
            <GroupPaper>
                <AutoStack force_direction="column">
                <UnselecableBox sx={{
                    marginX: "0.25rem" , 
                    backgroundColor: bgcolor.toString() , 
                }}>
                    <Box ref={mod_scrollbar} sx={{
                        overflow: "auto" , 
                        paddingX: "1rem" , 
                    }}><AutoStack>
                        <StructureTypography>{label}</StructureTypography>
                        <ButtonGroup 
                            level     = {0}
                            max_level = {0}

                            buttons = {[
                                <DefaultParameterEditButton/> , 
                                <DefaultNewAbstractButton  /> , 
                                <DefaultEditAbstractButton /> , 
                                <DefaultSwicth             /> , 
                                <NewParagraphButtonUp      /> , 
                                <NewParagraphButtonDown    /> , 
                                <DefaultCloseButton        /> , 
                                <DefaultSoftDeleteButton   /> , 
                                <CopyButton                /> , 
                                ... appbar_extra(node, parameters)
                            ]}
                        />
                    </AutoStack></Box>
                </UnselecableBox >
                <ComponentEditorBox autogrow>
                    <SUR>{children}</SUR>
                </ComponentEditorBox>
            </AutoStack>
        </GroupPaper>
        </NodeInfoProvider>
    }
    return subcomp
}

/** 这个函数返回一个默认的group组件，但是各种选项等都被折叠在右侧的一个小按钮内。用于比较小的group。
 * @param params.get_label 从参数列表获得title的方法。
 * @param params.rightbar_extra 要额外向添加的组件。
 * @param params.surrounder 包裹内容区域的组件。
 * @returns 一个用于渲染group的组件。
 */
function get_default_group_editor_with_rightbar({
    get_label       = (n,p)=>p.label, 
    rightbar_extra  = (n,p) => [] , 
    surrounder      = (props) => <>{props.children}</>
}: {
    get_label       ?: EditorNodeInfoFunction<GroupNode, string> ,  
    rightbar_extra  ?: EditorNodeInfoFunction<GroupNode, React.ReactNode[]> , 
    surrounder      ?: (props: {children: any}) => any ,
}): EditorRenderer<GroupNode>{

    const subcomp = (props: EditorRendererProps<Slate.Node & GroupNode>) => {
        const editor      = props.editor
        const node        = props.node
        const parameters  = React.useMemo(()=>editor.get_core().get_printer().process_parameters(node), [editor, node])
        const mylabel     = React.useMemo(()=>get_label(node, parameters), [get_label, node, parameters])
        
        const extra_buttons = React.useMemo(()=>rightbar_extra(node, parameters), [rightbar_extra, node, parameters])
        
        const SUR = surrounder

        // 根据node子节点数量估计这个组件是长的还是高的。
        const guess_high = (node.children.reduce((s,x)=>s += (slate_is_concept(x , "group") ? 2 : 1) , 0)) >= 3

        const normal_title = React.useMemo(()=>
            <StructureTypography variant = "overline">{mylabel}</StructureTypography>
        , [mylabel])
        const small_title = React.useMemo(()=>
            <StructureTypography 
                variant = "overline"
                sx = {{
                    position: "absolute" , 
                    top: "0" , 
                    right: "0" , 
                    transform: "translate(0, -20%) scale(0.7)" , 
                }}
            >{mylabel}</StructureTypography>
        , [mylabel])

        return <NodeInfoProvider node={node}>
        <GroupPaper>
        <SimpleAutoStack force_direction="row">
            <ComponentEditorBox autogrow key="edit">
                <SUR>{props.children}</SUR>
            </ComponentEditorBox>

            <UnselecableBox sx={{
                position: "relative" , 
            }}><AutoStack // 第二层autostack，把标签名和按钮组纵向排列
                force_direction = {"column"}
                sx = {{
                    paddingX: "0.25rem" , 
                    paddingY: "0.15rem" , 
                    border: "1px solid rgba(30,30,30,0.3)" , 
                }}
            >
                {normal_title}
                
                <FoldedButtonGroup 
                    level     = {0}
                    max_level = {0}
                    popper_props = {{
                        sx:{
                            opacity: "80%" , 
                        }
                    }}
                    button_comp = {React.useMemo(()=>with_partial_props(IconButton, {
                        size: "small" , 
                        children: <KeyboardArrowDownIcon fontSize="small"/> , 
                        sx: {
                            marginY: "auto" , 
                        }
                    }), [extra_buttons])}
                    label = "展开"
                    buttons = {[
                        <DefaultParameterEditButton/> , 
                        <DefaultNewAbstractButton  /> , 
                        <DefaultEditAbstractButton /> , 
                        <DefaultSwicth             /> , 
                        <DefaultCloseButton        /> , 
                        <DefaultSoftDeleteButton   /> , 
                        <NewParagraphButtonUp      /> , 
                        <NewParagraphButtonDown    /> , 
                        <CopyButton                /> , 
                        ... extra_buttons
                    ]}
                /> 
            </AutoStack></UnselecableBox>
        </SimpleAutoStack>
        </GroupPaper>
        </NodeInfoProvider>
    }
    return subcomp
}
