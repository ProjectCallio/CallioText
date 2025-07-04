/** 这个模块提供默认的抽象节点的渲染方式。
 * @module
 */

import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"
import { produce } from "immer"

import {
    Button,
    Box,
    Menu,
    MenuItem,
    Drawer,
    IconButton,
    ThemeOptions,
} from "@mui/material"
import {
    AddBox as AddBoxIcon,
    FilterNone as FilterNoneIcon,
    ArrowRightAlt as ArrowRightAltIcon
} from "@mui/icons-material"

import { AutoTooltip, ForceContain, AutoStackedPopper } from "../../../uibase"
import {
    ConceptNode,
    AllNodeTypes,
    AllConceptTypes,
    AbstractNode,
    GroupNode,
} from "../../../core"
import {
    EditorComponent,
    EditorGlobalInfo,
} from "../../../editor"
import {
    DefaultEditorComponent
} from "../main"
import type { EditorRendererProps, EditorRenderer } from "../../../editor"

import {
    EditorNodeInfoFunction,
    useNode,
    useEditor,
} from "../../../implbase"

export {
    DefaultEditAbstractButton,
} from "./edit_button"

export {
    DefaultNewAbstractButton,
} from "./add_button"

export {
    AbstractManageBox,
} from "./manage_box"

export {
    get_default_abstract_editor,
}


/**
 * 这个函数是向编辑器提供的，抽象节点的渲染函数。注意因为抽象节点只能作根，因此这个函数只会作为根节点渲染。
 * @param params.get_label 给定节点，获取标签的函数。
 * @returns 
 */
function get_default_abstract_editor({
    get_label = (n, p) => p.label,
}: {
    get_label?: EditorNodeInfoFunction<AbstractNode, string>,
}) {
    return (props: EditorRendererProps<Slate.Node & AbstractNode>) => {
        let editor = React.useContext(EditorGlobalInfo).editor as EditorComponent
        let node = props.node
        let parameters = editor.get_core().get_printer().process_parameters(node)
        let label = get_label(node, parameters)

        return <Box sx={{
            height: "100%",
            width: "100%",
        }}>
            {props.children}
        </Box>
    }
}