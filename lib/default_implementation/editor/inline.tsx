/** 
 * 这个模块提供一些默认的 Inline 的渲染器。
 * @module
 */

import React from "react"


import {
    Grid , 
    Box , 
    Stack , 
    IconButton , 
    Typography , 
    Paper , 
} from "@mui/material"
import {
    ChevronDown as ChevronDownIcon , 
} from "lucide-react"

import {
    InlineNode , 
    ConceptNode , 
} from "../../core"

import {
    EditorRenderer , 
    EditorRendererProps, 
    EditorComponent , 
    EditorGlobalInfo , 
} from "../../editor"

import { 
    DefaultParameterEditButton , 
    DefaultCloseButton , 
    DefaultSoftDeleteButton , 
} from "./buttons"

import {
    ButtonGroup , 
    FoldedButtonGroup , 
    EditorNodeInfoFunction , 
    useNode , 
    NodeInfoProvider , 
    useParameters , 
    AutoIconButton , 
} from "../../implbase"

import { DefaultEditAbstractButton, DefaultNewAbstractButton } from "./abstract"
import { AutoStackedPopper , SimpleAutoStack , AutoStack , AutoTooltip  } from "../../uibase"
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
    with_partial_props,
} from "../../uibase"
import { motion } from "framer-motion"

export { get_default_inline_editor }

/** 默认的内联样式渲染器。
 */
function get_default_inline_editor({
    get_label       = ()=>(useParameters().label), 
    surrounder      = (props) => <React.Fragment>{props.children}</React.Fragment> , 
    rightbar_extra  = () => <></> , 
    buttons_extra   = [] , 
}: {
    get_label       ?: () => string , 
    surrounder      ?: (props: {children?: any}) => any , 
    rightbar_extra  ?: React.ComponentType<{}> , 
    buttons_extra   ?: ( React.ComponentType<{}> )[] , 
}): EditorRenderer<InlineNode>{
    let subcomp = (props: EditorRendererProps<InlineNode>) => {
        const editor      = props.editor
        const node        = props.node

        const Extra = rightbar_extra
        const SUR   = surrounder
        const GetLabel = get_label

        return <NodeInfoProvider node={node}>
        <ComponentPaper is_inline><AutoStack force_direction="row">
            <ComponentEditorBox>
                <SUR>{props.children}</SUR>
            </ComponentEditorBox>
            <UnselecableBox>
                <AutoStack force_direction="row" gap="0.25rem">
                    <Extra/>
                    <FoldedButtonGroup
                        popper_props = {{
                            sx:{
                                opacity: "80%" , 
                            }
                        }}
                        button_comp = {with_partial_props(AutoIconButton, {
                            size: "very-small" , 
                            icon: ChevronDownIcon , 
                            title: "展开" , 
                        })} 
                        buttons = {[
                            <DefaultParameterEditButton /> , 
                            <DefaultCloseButton /> , 
                            <DefaultSoftDeleteButton /> , 
                            <DefaultNewAbstractButton /> , 
                            <DefaultEditAbstractButton /> , 
                            ... buttons_extra.map(B => <B/>)
                        ]}
                        level = {0}
                        max_level = {0}
                    >
                        <StructureTypography sx={{
                            marginY: "0.2rem", 
                            marginX: "auto", 
                            paddingX: "0.25rem"
                        }}><GetLabel /></StructureTypography>
                    </FoldedButtonGroup>
                </AutoStack>
            </UnselecableBox>
        </AutoStack>
        </ComponentPaper>
        </NodeInfoProvider>
    }
    return subcomp
}
