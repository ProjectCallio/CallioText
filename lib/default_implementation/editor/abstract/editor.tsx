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
    DefaultAbstractEditor,
}

/** 这个组件提供默认的Abstract编辑页面。 
 * 这个组件会提供一个完整的文档编辑器，因为每个抽象节点都可以视为一个新文档。
*/
function DefaultAbstractEditor(props: { father: ConceptNode, sonidx: number, open: boolean, onClose?: (e: any) => void }) {

    const subeditor_ref = React.useRef<DefaultEditorComponent | null>(null)
    const [enter_selection, set_enter_selection] = React.useState<Slate.Location | undefined | null>(undefined)

    const get_editor = () => {
        if (!(subeditor_ref && subeditor_ref.current && subeditor_ref.current.get_editor()))
            return undefined
        return subeditor_ref.current.get_editor()
    }

    let son = props.father.abstract[props.sonidx]
    if (!son) {
        return null
    }
    let [son_children, son_but_children] = (() => {
        let { children, ...son_but_children } = son
        return [children, son_but_children]
    })()

    return <EditorGlobalInfo.Consumer>{globalinfo => {
        let father_editor = globalinfo.editor as EditorComponent
        return <Drawer
            anchor={"left"}
            open={props.open}
            onClose={props.onClose}
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: "60%" } }}
            SlideProps={{
                onEnter: () => {
                    let subeditor = get_editor()
                    if (!subeditor) {
                        return
                    }

                    set_enter_selection(father_editor.get_slate().selection)

                    setTimeout(() => { // 稍微延迟一点，然后focus在新编辑器上。延迟一点是为了等抽屉弹出来。
                        SlateReact.ReactEditor.focus(subeditor.get_slate())
                    }, 1000)
                },
                onExited: () => {
                    let subeditor = get_editor()
                    if (!subeditor) {
                        return
                    }

                    // 更新抽象。
                    let root = subeditor.get_root()
                    let father = props.father
                    let father_abstract_list = father.abstract
                    let new_abstract_list = produce(father_abstract_list, alis => {
                        alis[props.sonidx].children = root.children
                    })
                    father_editor.set_node(father, { abstract: new_abstract_list })

                    // 还原父编辑器的焦点。
                    SlateReact.ReactEditor.focus(father_editor.get_slate())
                    if (enter_selection && (
                        (enter_selection as any)["anchor"] && (enter_selection as any)["anchor"]["path"]
                    )) {
                        Slate.Transforms.select(father_editor.get_slate(), enter_selection) // 设置为保存的selection。
                    }
                },
            }}
        >
            <ForceContain.Provider value={true}>
                <DefaultEditorComponent
                    ref={subeditor_ref}
                    editorcore={father_editor.get_editorcore()}
                    init_rootchildren={son_children}
                    init_rootproperty={son_but_children}

                    sidebar_extras={[() => { // 添加一个额外的退出按钮，方便在编辑抽象时退出。
                        return <IconButton onClick={e => {
                            props.onClose?.(e)
                            e.preventDefault()
                        }}>
                            <ArrowRightAltIcon />
                        </IconButton>
                    }]}

                />
            </ForceContain.Provider>
        </Drawer>
    }}</EditorGlobalInfo.Consumer>
}
