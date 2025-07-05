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
    Popper , 
    useTheme,
} from "@mui/material"
import {
    FilePlus2 as FilePlus2Icon,
    X as XIcon,
} from "lucide-react"

import {
    EditorComponent,
    EditorGlobalInfo,
} from "../../../editor"

import {
    EditorNodeInfoFunction,
    useNode,
    useEditor,
    AutoIconButton,
    ButtonGroup , 
} from "../../../implbase"

export {
    NewAbstractMenu , 
    DefaultNewAbstractButton,
}

/** 这个组件提供一个菜单，菜单的每项是新建一个抽象概念。
 */
const NewAbstractMenu = React.memo(({
    anchor_element,
    open,
    onClose,
}: { 
    anchor_element: any, 
    open: boolean, 
    onClose?: (e: any) => void 
}) => {
    const palette = useTheme().palette
    const node = useNode((prev, next) => (
        prev.abstract === next.abstract 
        && prev.idx == next.idx
    ))
    const editor = useEditor()

    // 这个列表罗列所有可选的抽象概念以供选择。
    const abstract_concepts = React.useMemo(()=>{
        return editor.get_editorcore().get_sec_concept_list("abstract")
    }, [editor])

    const handle_click = React.useCallback((idx?: number) => {
        return (e: any) => {
            onClose?.(e)

            if (idx == undefined || !abstract_concepts[idx])
                return
            const new_node_abstract = [
                ...node.abstract, 
                editor.get_editorcore().create_abstract(abstract_concepts[idx])
            ]
            editor.set_node(node, { abstract: new_node_abstract })
        }
    }, [node, editor])

    return <Menu
        anchorEl={anchor_element}
        open={open}
        onClose={onClose}
        anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
        }}
        slotProps={{
            paper: {
                sx: {
                    border: `1px solid ${palette.divider}`,
                    color: palette.primary.dark,
                }
            }
        }}
    >
        {abstract_concepts.map((name, idx) => {
            return <MenuItem onClick={handle_click(idx)} key={name}>{name}</ MenuItem>
        })}
        <MenuItem onClick={e => onClose?.(e)} sx={{
            paddingX: "0",
            justifyContent: "center",
            alignItems: "center",
        }}><XIcon style={{
            width: "1.2rem",
            height: "1.2rem",
        }}/></MenuItem>
    </Menu>
})


/** 这个组件提供按钮新建抽象。
 * @param props.editor 这个组件所服务的编辑器。
 * @returns 一个渲染了两个 Button 的 
 */
const DefaultNewAbstractButton = React.memo(() => {
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

    return <EditorGlobalInfo.Consumer>{globalinfo => {
        let editor = globalinfo.editor as EditorComponent
        return <React.Fragment>
            <Box sx={{
                marginX: "auto",
            }} ref={boxref}>
                <AutoIconButton
                    onClick={() => open()}
                    icon={FilePlus2Icon}
                    title="新建抽象"
                    size="medium"
                />
            </Box>
            <NewAbstractMenu
                anchor_element={ae}
                open={ae != undefined}
                onClose={() => close()}
            />
        </React.Fragment>
    }}</EditorGlobalInfo.Consumer>
})  
