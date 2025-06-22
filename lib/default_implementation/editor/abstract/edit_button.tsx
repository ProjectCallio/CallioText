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

import {
    DefaultAbstractEditor,  
} from "./editor"

export {
    DefaultEditAbstractButton,
}


/** 这个组件是一个菜单，菜单的每项是编辑一个抽象属性的按钮。 */
function DefaultAbstractEditorGroup(props: { anchor_element: any, open: boolean, onClose?: (e: any) => void }) {

    let node = useNode()
    let abstract = node.abstract
    let onClose = props.onClose || ((e: any) => { })

    let [drawer_open, set_drawer_open] = React.useState<undefined | string>(undefined) // 哪个抽屉打开，注意一次只能有一个抽屉打开。

    return <React.Fragment>
        <Menu
            anchorEl={props.anchor_element}
            open={props.open}
            onClose={props.onClose}
        >
            {Object.keys(abstract).map((idx) => {
                return <MenuItem key={idx} onClick={e => { set_drawer_open(idx); onClose(e) }}>
                    {abstract[parseInt(idx)].concept}-{idx}
                </ MenuItem>
            })}
            <MenuItem onClick={e => { onClose(e) }}>算了</MenuItem>
        </Menu>

        {Object.keys(abstract).map((idx) => {
            return <DefaultAbstractEditor
                key={idx}
                father={node}
                sonidx={parseInt(idx)}
                open={drawer_open == idx}
                onClose={(e: any) => { set_drawer_open(undefined) }}
            />
        })}
    </React.Fragment>
}

/** 这个组件提供按钮编辑抽象。
 * @param props.editor 这个组件所服务的编辑器。
 * @returns 
 */
function DefaultEditAbstractButton() {
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


    return <React.Fragment>
        <Box sx={{
            marginX: "auto",
        }} ref={boxref}><AutoTooltip title="编辑抽象">
            <IconButton onClick={() => open()} sx={{
                transform: "scale(0.8)",
                transformOrigin: "center center",
                paddingX: "0.05rem",
            }}><FilterNoneIcon /></IconButton>
        </AutoTooltip></Box>
        <DefaultAbstractEditorGroup
            anchor_element={ae}
            open={ae != undefined}
            onClose={() => close()}
        />
    </React.Fragment>
}

