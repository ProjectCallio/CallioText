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

import { AutoTooltip, ForceContain, AutoStackedPopper } from "../../uibase"
import {
    ConceptNode,
    AllNodeTypes,
    AllConceptTypes,
    AbstractNode,
    GroupNode,
} from "../../core"
import {
    EditorComponent,
    EditorGlobalInfo,
} from "../../editor"
import {
    DefaultEditorComponent
} from "./main"
import type { EditorRendererProps, EditorRenderer } from "../../editor"

import {
    EditorNodeInfoFunction,
    useNode,
    useEditor,
} from "../../implbase"

export {
    DefaultNewAbstract,
    DefaultAbstractEditor,
    DefaultNewAbstractButton,
    DefaultEditAbstractButton,
    get_default_abstract_editor,
}

/** 这个组件提供一个按钮，让一个概念节点新建一个抽象概念。
 * @param props.editor 这个组件所服务的编辑器。
 * @param props.element 这个组件所服务的节点。注意只有 StyledNode 可以有 hidden 属性。
 */
function DefaultNewAbstract(props: { anchor_element: any, open: boolean, onClose?: (e: any) => void }) {

    let node = useNode()
    let editor = useEditor()

    // 这个列表罗列所有可选的抽象概念以供选择。
    let abstract_concepts = editor.get_editorcore().get_sec_concept_list("abstract")

    let onClose = props.onClose || ((e: any) => { })

    function get_new_abstract_func(idx: number) {
        return (e: any) => {
            onClose(e)

            if (idx == undefined || abstract_concepts[idx] == undefined)
                return

            let new_node_abstract = [...node.abstract, editor.get_editorcore().create_abstract(abstract_concepts[idx])]

            editor.set_node(node, { abstract: new_node_abstract })
        }
    }

    return <Menu
        anchorEl={props.anchor_element}
        open={props.open}
        onClose={onClose}
    >
        {abstract_concepts.map((name, idx) => {
            return <MenuItem onClick={get_new_abstract_func(idx)} key={name}>{name}</ MenuItem>
        })}
        <MenuItem onClick={e => onClose(e)}>算了</MenuItem>
    </Menu>
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

                    sidebar_extras={[(editor) => { // 添加一个额外的退出按钮，方便在编辑抽象时退出。
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

    let node = useNode()

    return <EditorGlobalInfo.Consumer>{globalinfo => {
        let editor = globalinfo.editor as EditorComponent
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
    }}</EditorGlobalInfo.Consumer>
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