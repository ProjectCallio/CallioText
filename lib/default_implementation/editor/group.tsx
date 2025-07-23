/** 
 * 这个模块提供一些默认的 Group 的渲染器。
 * @module
 */

import React from "react"
import * as Slate from "slate"


import {
    Box , 
    IconButton , 
    Divider , 
    PaperProps ,
    useTheme ,
    alpha,
} from "@mui/material"

import {
    ChevronDown as ChevronDownIcon, 
} from "lucide-react"


import { GroupNode  } from "../../core"
import { 
    EditorRendererProps , 
    EditorRenderer , 
    slate_is_concept , 
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
    AbstractManageBox , 
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
    AutoStack , 
    SimpleAutoStack , 
    mod_scrollbar , 
    with_partial_props,

    light_grey,
} from "../../uibase"

import {
    ButtonGroup , 
    FoldedButtonGroup , 

    useNode , 
    useParameters , 
    NodeInfoProvider , 
    AutoIconButton,  
} from "../../implbase"

import Color from "color"


export { get_deafult_group_editor_with_appbar , get_default_group_editor_with_rightbar}

/** 为 Group 类型的节点定制的 Paper ，在节点前后相连时会取消前后距离。 */
const GroupPaper = React.memo((props: PaperProps) => {
    const {sx, ...other_props} = props
    const palette = useTheme().palette
    const node_relation = useNode<GroupNode>(
        (prev, next) => (prev.relation == next.relation)
    ).relation
    return <ComponentPaper {...other_props} 
        sx = {{
            boxShadow: `inset 0 0 1.5px ${alpha(palette.divider, 0.3)}`,
            ...(node_relation == "chaining" ? { 
                marginTop: "0" ,
                borderTop: `1px solid ${palette.divider}` ,  
            } : {}),
            ...sx,
        }}
    />
})

// XXX 可以在Toolbar滚动的时候加一个指示...
// TODO 能不能想办法给不可编辑区域弄点花纹啥的...

/** 这个函数返回一个默认的带应用栏的 group 组件。用于比较大的 group 组件。
 * @param params.get_label 从参数列表获得 title 的方法。
 * @param params.appbar_extra 要额外向 appbar 里添加的组件。
 * @param params.surrounder 包裹内容区域的组件。
 * @returns 一个用于渲染group的组件。
 */
function get_deafult_group_editor_with_appbar({
    get_label     = () => useParameters().label, 
    buttons_extra = [] , 
    surrounder    = (props) => <>{props.children}</>
}: {
    get_label       ?: React.ComponentType<{}> ,  
    buttons_extra   ?: ( React.ComponentType<{}> )[] , 
    surrounder      ?: (props: {children: any}) => any ,
}): EditorRenderer<GroupNode>{
    // 渲染器
    const subcomp = React.memo(({
        editor, node, children
    }: EditorRendererProps<Slate.Node & GroupNode>) => {

        const GetLabel = get_label
        const SUR = surrounder

        const theme   = useTheme()
        const bgcolor = React.useMemo(()=>{
            let c = Color(theme.palette.primary.light)
            c = c.alpha(0.2)
            if(theme.palette.mode != "dark"){
                c = light_grey(c)
            }
            return c.toString()
        }, [theme])

        const buttons_comp = React.useMemo(()=>([
            <DefaultParameterEditButton key="param"/> , 
            <DefaultSwicth              key="switch"/> , 
            <CopyButton                 key="copy"/> , 
            <DefaultCloseButton         key="close"/> , 
            <DefaultSoftDeleteButton    key="softdel"/> , 
            <NewParagraphButtonUp       key="up"/> , 
            <NewParagraphButtonDown     key="down"/> , 
            <DefaultNewAbstractButton   key="newabs"/> , 
            ... buttons_extra.map((B, idx) => <B key={idx}/>)
        ]), [])

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
                    }}><AutoStack sx={{
                        gap: "0.75rem",
                    }}>
                        <StructureTypography><GetLabel /></StructureTypography>
                        <Divider orientation="vertical" flexItem />
                        <ButtonGroup 
                            level     = {0}
                            max_level = {0}
                            buttons = {buttons_comp}
                        />
                    </AutoStack></Box>
                </UnselecableBox >
                <ComponentEditorBox autogrow>
                    <SUR>{children}</SUR>
                </ComponentEditorBox>
            </AutoStack>
        </GroupPaper>
        <UnselecableBox>
            <AbstractManageBox />
        </UnselecableBox>
        </NodeInfoProvider>
    })
    return subcomp as EditorRenderer<GroupNode>
}

/** 这个函数返回一个默认的group组件，但是各种选项等都被折叠在右侧的一个小按钮内。用于比较小的group。
 * @param params.get_label 从参数列表获得title的方法。
 * @param params.rightbar_extra 要额外向添加的组件。
 * @param params.surrounder 包裹内容区域的组件。
 * @returns 一个用于渲染group的组件。
 */
function get_default_group_editor_with_rightbar({
    get_label       = () => useParameters().label, 
    rightbar_extra  = undefined , 
    buttons_extra   = [] , 
    surrounder      = (props) => <>{props.children}</>
}: {
    get_label       ?: React.ComponentType<{}> ,  
    rightbar_extra  ?: React.ComponentType<{}> , 
    buttons_extra   ?: ( React.ComponentType<{}> )[] , 
    surrounder      ?: (props: {children: any}) => any ,
}): EditorRenderer<GroupNode>{

    const subcomp = React.memo(({
        editor, node, children
    }: EditorRendererProps<Slate.Node & GroupNode>) => {
        const GetLabel    = get_label
        
        const Extra = rightbar_extra 
        const SUR = surrounder

        const palette = useTheme().palette

        const normal_title = React.useMemo(()=>
            <StructureTypography variant = "overline"><GetLabel /></StructureTypography>
        , [])

        const buttons_comp = React.useMemo(()=>([
            <DefaultParameterEditButton key="param"/> , 
            <DefaultSwicth              key="switch"/> , 
            <CopyButton                 key="copy"/> , 
            <DefaultCloseButton         key="close"/> , 
            <DefaultSoftDeleteButton    key="softdel"/> , 
            <NewParagraphButtonUp       key="up"/> , 
            <NewParagraphButtonDown     key="down"/> , 
            <DefaultNewAbstractButton   key="newabs"/> , 
            ... buttons_extra.map((B, idx) => <B key={idx}/>)
        ]), [])

        return <NodeInfoProvider node={node}>
            <GroupPaper>
            <SimpleAutoStack force_direction="row" gap="0.5rem" sx={{
                alignItems: "flex-start",
            }}>

                <ComponentEditorBox autogrow key="edit">
                    <SUR>{children}</SUR>
                </ComponentEditorBox>

                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                }}>

                {Extra && <UnselecableBox>
                    <Extra />
                </UnselecableBox>}

                <UnselecableBox sx={{
                    position: "relative" , 
                    zIndex: 1,
                }}><AutoStack // 第二层autostack，把标签名和按钮组纵向排列
                    force_direction = {"column"}
                    sx = {{
                        paddingX: "0.25rem" , 
                        paddingY: "0.25rem" , 
                        border: `1px solid ${palette.divider}` , 
                    }}
                    gap = "0.25rem"
                >
                    {normal_title}
                    
                    <FoldedButtonGroup 
                        level     = {0}
                        max_level = {0}
                        popper_props = {React.useMemo(()=>({
                            sx:{
                                opacity: "80%" , 
                            }
                        }), [])}
                        button_comp = {React.useMemo(()=>(with_partial_props(AutoIconButton, {
                            size: "medium" , 
                            icon: ChevronDownIcon , 
                            title: "展开" , 
                        })), [])}
                        buttons = {buttons_comp}
                    /> 
                </AutoStack></UnselecableBox>
                </Box>
            </SimpleAutoStack>
            </GroupPaper>
            <UnselecableBox>
                <AbstractManageBox />
            </UnselecableBox>
        </NodeInfoProvider>
    })
    return subcomp as EditorRenderer<GroupNode>
}
