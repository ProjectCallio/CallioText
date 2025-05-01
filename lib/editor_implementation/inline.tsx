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
} from "../core"

import {
    EditorRenderer , 
    EditorRendererProps, 
    EditorComponent , 
    EditorGlobalInfo , 
} from "../editor"

import { 
    DefaultParameterEditButton , 
    DefaultCloseButton , 
    AutoStackedPopperWithButton, 
    AutoStackedPopperButtonGroupMouseless, 
} from "./buttons"

import { DefaultEditAbstractButton, DefaultNewAbstract, DefaultNewAbstractButton } from "./abstract"
import { EditorButtonInformation , DefaultSoftDeleteButton } from "./buttons"
import { AutoStackedPopper , SimpleAutoStack , AutoStack , AutoTooltip  } from "../uibase"
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

export { get_default_inline_editor }

/** 默认的内联样式渲染器。
 */
function get_default_inline_editor({
    get_label       = (n,p)=>p.label, 
    surrounder      = (props) => <React.Fragment>{props.children}</React.Fragment> , 
    rightbar_extra  = (props) => <></> , 
}: {
    get_label       ?: EditorNodeInfoFunction<InlineNode, string> , 
    surrounder      ?: (props: EditorButtonInformation & {children: any}) => any , 
    rightbar_extra  ?: (props: EditorButtonInformation) => any  , 

}): EditorRenderer<InlineNode>{
    return (props: EditorRendererProps<InlineNode>) => {
        let editor      = React.useContext(EditorGlobalInfo).editor as EditorComponent
        let node        = props.node
        let parameters  = editor.get_core().get_printer().process_parameters(node)

        let label   = get_label(node, parameters)
        let Extra = rightbar_extra
        let SUR = surrounder

        return <ComponentPaper is_inline>
            <AutoStack force_direction="row">
                <ComponentEditorBox key="edi">
                    <SUR node={node}>{props.children}</SUR>
                </ComponentEditorBox>
                <UnselecableBox key="uns">
                    <AutoStack force_direction="row">
                        <Extra node={node}/>
                        <AutoStackedPopperButtonGroupMouseless
                            poper_props = {{
                                sx:{
                                    opacity: "80%" , 
                                }
                            }}
                            node = {node}
                            idxs = {[0]}
                            close_on_otherclick
                            outer_button = {IconButton}
                            outer_props = {{
                                sx: {
                                    height: "1rem" , 
                                    width: "1rem" , 
                                    margin: "0",
                                } , 
                                children: <KeyboardArrowDownIcon sx={{height: "1rem"}}/> ,
                            }} 
                            label = {"展开" + (label ? ` / ${label}` : "") }
                            buttons = {[
                                DefaultParameterEditButton , 
                                DefaultCloseButton , 
                                DefaultSoftDeleteButton , 
                                DefaultNewAbstractButton , 
                                DefaultEditAbstractButton , 
                            ]}
                        >
                            <StructureTypography sx={{marginY: "0.2rem", marginX: "auto", paddingX: "0.25rem"}}>{label}</StructureTypography>
                        </AutoStackedPopperButtonGroupMouseless>
                    </AutoStack>
                </UnselecableBox>
            </AutoStack>
        </ComponentPaper>
    }
}
