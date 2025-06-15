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
    KeyboardArrowDown as KeyboardArrowDownIcon , 
} from "@mui/icons-material"

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
    ConceptSubcomponentInformation , 
} from "../../implbase"

import { DefaultEditAbstractButton, DefaultNewAbstract, DefaultNewAbstractButton } from "./abstract"
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
    EditorNodeInfoFunction , 
} from "./base"

import {
    with_partial_props,
} from "../../uibase"
import { motion } from "framer-motion"

export { get_default_inline_editor }

/** 默认的内联样式渲染器。
 */
function get_default_inline_editor({
    get_label       = (n,p)=>p.label, 
    surrounder      = (props) => <React.Fragment>{props.children}</React.Fragment> , 
    rightbar_extra  = (props) => <></> , 
}: {
    get_label       ?: EditorNodeInfoFunction<InlineNode, string> , 
    surrounder      ?: (props: ConceptSubcomponentInformation & {children: any}) => any , 
    rightbar_extra  ?: (props: ConceptSubcomponentInformation) => any  , 

}): EditorRenderer<InlineNode>{
    let subcomp = (props: EditorRendererProps<InlineNode>) => {
        const editor      = props.editor
        const node        = props.node
        const parameters  = editor.get_core().get_printer().process_parameters(node)

        const label   = get_label(node, parameters)
        const Extra = rightbar_extra
        const SUR = surrounder

        return <ComponentPaper is_inline><AutoStack force_direction="row">
            <ComponentEditorBox>
                <SUR node={node}>{props.children}</SUR>
            </ComponentEditorBox>
            <UnselecableBox>
                <AutoStack force_direction="row" gap="0.25rem">
                    <Extra node={node}/>
                    <FoldedButtonGroup
                        popper_props = {{
                            sx:{
                                opacity: "80%" , 
                            }
                        }}
                        node = {node}
                        button_comp = {with_partial_props(IconButton, {
                            sx: {
                                height: "1.25rem" , 
                                width: "1.25rem" , 
                                padding: "0" , 
                                margin: "0",
                            } , 
                            children: <KeyboardArrowDownIcon sx={{height: "1.25rem"}}/> ,
                        })} 
                        // label = {"展开" + (label ? ` / ${label}` : "") }
                        label = {"展开"}
                        buttons = {[
                            <DefaultParameterEditButton node={node} /> , 
                            <DefaultCloseButton         node={node} /> , 
                            <DefaultSoftDeleteButton    node={node} /> , 
                            <DefaultNewAbstractButton   node={node} /> , 
                            <DefaultEditAbstractButton node={node} /> , 
                        ]}
                        level = {1}
                        max_level = {1}
                    >
                        <StructureTypography sx={{
                            marginY: "0.2rem", 
                            marginX: "auto", 
                            paddingX: "0.25rem"
                        }}>{label}</StructureTypography>
                    </FoldedButtonGroup>
                </AutoStack>
            </UnselecableBox>
        </AutoStack>
        </ComponentPaper>
    }
    return subcomp
}
