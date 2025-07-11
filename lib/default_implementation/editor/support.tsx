/** 
 * 这个模块提供一些默认的 Support 节点的渲染器。
 * @module
 */
import React from "react"
import {
    Paper , 
    Box , 
    Divider , 
    IconButton , 
    useTheme , 
}
from "@mui/material"
import {
    ChevronDown as ChevronDownIcon , 
    CircleSlash2 as CircleSlash2Icon , 
}
from "lucide-react"
import  Color  from "color"

import {
    light_grey
} from "../../uibase"

import {
    SupportNode , 
} from "../../core"

import { 
    EditorRendererProps  , 
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
    AutoIconButton, 
    useEditorConfig, 
} from "../../implbase"
import { 
    EditorComponentPaper as ComponentPaper , 
    EditorUnselecableBox as UnselecableBox , 
    EditorComponentBox as ComponentBox , 
    EditorStructureTypography as StructureTypography , 
} from "./uibase"

import {
    DefaultNewAbstractButton , 
    AbstractManageBox , 
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
    return ({editor, node, children}: EditorRendererProps<SupportNode>) => {
        const GetTitle = get_title

        const palette = useTheme().palette
        const bgcolor = React.useMemo(() => {
            let c = Color( palette.primary.main )
            c = light_grey(c).alpha(0.1)
            return c.toString()
        }, [palette])

        const config = useEditorConfig()
    
        return <NodeInfoProvider node={node}>
        <UnselecableBox><ComponentBox>
            <Divider>
                <Paper variant="outlined" sx = {{
                    backgroundColor: bgcolor,
                    paddingX: "0.5rem"
                }}>
                    <AutoStack force_direction="row">
                        <StructureTypography sx={{
                            fontFamily: config.fonts.body.fontFamily
                        }}><GetTitle /></StructureTypography>
                        <FoldedButtonGroup 
                            level = {0}
                            max_level = {0}
                            button_comp = {with_partial_props(AutoIconButton, {
                                size: "small" , 
                                icon: ChevronDownIcon , 
                                title: "展开" , 
                            })}
                            buttons = {[
                                <DefaultParameterEditButton /> , 
                                <DefaultCloseButton /> , 
                                <NewParagraphButtonUp /> , 
                                <NewParagraphButtonDown /> , 
                                <DefaultNewAbstractButton /> , 
                            ]}
                        /> 
                    </AutoStack>
                    <AbstractManageBox 
                        component="span" 
                        direction="column" 
                        style={{
                            marginBottom: "0.25rem"
                        }}
                    />
                </Paper>
                {children /* 对于一个void组件，其children也必须被渲染，否则会报错。*/} 
            </Divider>
        </ComponentBox>
        </UnselecableBox>
        </NodeInfoProvider>
    }
}

// TODO 现在在这个组件不是正确的行内组件
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
    get_label       ?: React.ComponentType<{}> , 
    is_empty        ?: EditorNodeInfoFunction<SupportNode , boolean> , 
    render_element  ?: ()=>any , 
}){
    return ({editor, node, children}: EditorRendererProps<SupportNode>) => {
        const config = useEditorConfig()
        const palette = useTheme().palette

        const parameters  = React.useMemo(()=>(
            editor.get_core().get_printer().process_parameters(node)
        ), [editor, node])

        const empty       = is_empty(node, parameters)

        const GetLabel = get_label
        const R = render_element

        return <NodeInfoProvider node={node}>{children}<UnselecableBox sx={{
            display: "inline-flex",
            flexDirection: "row",
            alignItems: "center",
        }}>
        <ComponentPaper is_inline>
            <AutoStack force_direction = "row">
                <Box sx={{
                    marginX: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {empty ? <CircleSlash2Icon style={{
                        width: "1.2rem",
                        height: "1.2rem",
                        color: palette.text.disabled,
                    }}/> : <R /> }
                </Box>
                <AutoStack force_direction = {empty ? "row" : "column"}>
                    <StructureTypography sx={{marginY: "0.2rem", marginX: "auto"}}>
                        <GetLabel />
                    </StructureTypography>
                    
                    <FoldedButtonGroup 
                        button_comp = {with_partial_props(AutoIconButton, {
                            size: "small" , 
                            icon: ChevronDownIcon , 
                            title: "展开" , 
                        })}
                        buttons = {[
                            <DefaultParameterEditButton /> , 
                            <DefaultCloseButton /> , 
                            <NewParagraphButtonUp /> , 
                            <NewParagraphButtonDown /> , 
                            <DefaultNewAbstractButton /> , 
                        ]}
                        level = {0}
                        max_level = {0}
                    /> 
                </AutoStack>
            </AutoStack>
        </ComponentPaper>

        <Box sx={{
            marginLeft: `-${config.margins.small}`,
            height: "2.5rem" , 
            display: "inline",
        }}>
            <AbstractManageBox component="span"/>
        </Box>

        </UnselecableBox></NodeInfoProvider>
    }
}
