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
    DefaultNewAbstract,
    DefaultNewAbstractButton,
}

/** 这个组件提供一个菜单，菜单的每项是新建一个抽象概念。
 */
function DefaultNewAbstract({
    anchor_element,
    open,
    onClose,
}: { 
    anchor_element: any, 
    open: boolean, 
    onClose?: (e: any) => void 
}) {

    const node = useNode()
    const editor = useEditor()

    // 这个列表罗列所有可选的抽象概念以供选择。
    const abstract_concepts = editor.get_editorcore().get_sec_concept_list("abstract")

    function get_new_abstract_func(idx: number) {
        return (e: any) => {
            onClose?.(e)

            if (idx == undefined || abstract_concepts[idx] == undefined)
                return

            let new_node_abstract = [...node.abstract, editor.get_editorcore().create_abstract(abstract_concepts[idx])]

            editor.set_node(node, { abstract: new_node_abstract })
        }
    }

    return <Menu
        anchorEl={anchor_element}
        open={open}
        onClose={onClose}
    >
        {abstract_concepts.map((name, idx) => {
            return <MenuItem onClick={get_new_abstract_func(idx)} key={name}>{name}</ MenuItem>
        })}
        <MenuItem onClick={e => onClose?.(e)}>算了</MenuItem>
    </Menu>
}


/** 这个组件提供按钮新建抽象。
 * @param props.editor 这个组件所服务的编辑器。
 * @returns 一个渲染了两个 Button 的 
 */
function DefaultNewAbstractButton() {
    const [ae, set_ae] = React.useState<HTMLElement | undefined>(undefined)
    const boxref = React.useRef<HTMLDivElement | null>(null)

    const get_box = () => {
        if (boxref && boxref.current) {
            return boxref.current
        }
        return undefined
    }

    const open = () => {
        set_ae(get_box())
    }
    const close = () => {
        set_ae(undefined)
    }

    let node = useNode()

    return <EditorGlobalInfo.Consumer>{globalinfo => {
        let editor = globalinfo.editor as EditorComponent
        return <React.Fragment>
            <Box sx={{
                marginX: "auto",
            }} ref={boxref}><AutoTooltip title="新建抽象">
                <IconButton onClick={() => open()} sx={{
                    transform: "scale(0.8)",
                    transformOrigin: "center center",
                    paddingX: "0.05rem",
                }}><AddBoxIcon /></IconButton>
            </AutoTooltip></Box>
            <DefaultNewAbstract
                anchor_element={ae}
                open={ae != undefined}
                onClose={() => close()}
            />
        </React.Fragment>
    }}</EditorGlobalInfo.Consumer>
}
