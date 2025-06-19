/** 
 * 这个文件提供一些实用按钮。
 * @module
 */

import * as React from "react"
import * as Slate from "slate"

import { 
    Card, 
    TextField,
    Drawer, 
    Button, 
    Typography, 
    Tooltip, 
    IconButton, 
    ClickAwayListener, 
    Box, 
    Switch, 
    IconButtonProps, 
} from "@mui/material"

import {
    Close as CloseIcon, 
    Settings as SettingsIcon, 
    North as NorthIcon, 
    South as SouthIcon, 
    MoveUp as MoveUpIcon, 
    PhoneMissed as PhoneMissedIcon
} from "@mui/icons-material"

import {
    GroupNode, 
    Node, 
    StructNode, 
    ConceptNode, 
} from "../../../../core"
import { 
    EditorComponent, 
    EditorGlobalInfo, 
    slate_concept_node2path, 
} from "../../../../editor"
import { AutoTooltip } from "../../../../uibase"
import { DefaultParameterWithEditorWithDrawer } from "./param_drawer" 
import { AutoIconButton } from "../base"
import {
    useNode, 
    useParameters, 
    useEditor, 
} from "../../../../implbase"

export {    
    DefaultParameterEditButton, 
    DefaultCloseButton, 
    NewParagraphButtonUp, 
    NewParagraphButtonDown, 
    DefaultSwicth, 
    DefaultSoftDeleteButton, 
    CopyButton, 
}

function MyImg(props: {img_url: string}){
    return <img src={props.img_url}></img>
}

/**
 * 这个组件向具体的编辑器和具体的节点提供 DefaultParameterContainer ，同时还提供一个按钮。
 * @param props.onExit 抽屉关闭时的行为。
 */
const DefaultParameterEditButton = React.memo(({ onExit }: { onExit?: (e: any) => void }) => {
    const [open, set_open] = React.useState(false)
    const node = useNode()

    // 只在parameters变的时候重新渲染
    const subcomp = React.useMemo(()=>{
        return <DefaultParameterWithEditorWithDrawer 
            node = {node} 
            open = {open} 
            onClose = {(e: any) => { 
                onExit?.(e)
                set_open(false)
            }}
        />
    }, [node.parameters, node.idx, open, onExit])

    return <Box sx={{ marginX: "auto" }}>
        <AutoIconButton onClick={()=>{set_open(true)}} title="设置参数" icon={SettingsIcon} />
        {subcomp}
    </Box>
})

/** 这个组件提供一个直接删除节点的按钮。 */
const DefaultCloseButton = React.memo(() => {
    const node = useNode()
    const globalinfo = React.useContext(EditorGlobalInfo)
    const editor = globalinfo.editor

    // 只在node.idx变的时候重新渲染
    const run = React.useCallback(() => {
        if(editor){
            editor.delete_concept_node(node)
        }
    }, [node.idx, editor])

    return <AutoIconButton onClick={run} title="删除组件" icon={CloseIcon} />
})

/** 这个组件提供一个删除节点，但是将其子节点移动到节点外的按钮。 */
const DefaultSoftDeleteButton = React.memo(({ puretext }: { puretext?: boolean }) => {
    const node = useNode()
    const editor = useEditor()

    const run = React.useCallback(() => {
        if(!editor){
            return
        }

        if(puretext){
            const text = Slate.Node.string(node)
            const path = slate_concept_node2path(editor.get_root(), node)
            if(path){
                editor.delete_node_by_path(path)
                editor.add_nodes(editor.get_core().create_paragraph(text), path)
            }
        }
        else{
            editor.unwrap_node(node)
        }
    }, [node.idx, editor])

    return <AutoIconButton onClick={run} title="解除组件" icon={MoveUpIcon} />
})

/** 这个组件提供一个在组件的上新建段落的节点。 */
const NewParagraphButtonUp = React.memo(() => {
    const node = useNode()
    const editor = useEditor()

    const run = React.useCallback(() => {
        if(!editor){
            return
        }
        editor.add_nodes_before(editor.get_core().create_paragraph(), node)    
    }, [node.idx, editor])

    return <AutoIconButton onClick={run} title="向上添加段落" icon={NorthIcon} />
})

/** 这个组件提供一个在组件的下新建段落的节点。 */
const NewParagraphButtonDown = React.memo(() => {
    const node = useNode()
    const editor = useEditor()

    const run = React.useCallback(() => {
        if(!editor){
            return
        }
        editor.add_nodes_after(editor.get_core().create_paragraph(), node)    
    }, [node.idx, editor])

    return <AutoIconButton onClick={run} title="向下添加段落" icon={SouthIcon} />
})

/** 这个按钮在一个概念下方复制此概念，并设置同样的参数。 */
const CopyButton = React.memo(() => {
    const node = useNode()
    const editor = useEditor()

    const run = React.useCallback(() => {
        if(!editor){
            return
        }

        let new_node: ConceptNode | undefined = undefined
        if(node.type == "group"){
            new_node = editor.get_core().create_group(node.concept, "chaining")
            new_node.parameters = JSON.parse(JSON.stringify(node.parameters))
        }
        else if(node.type == "structure"){
            new_node = editor.get_core().create_structure(node.concept, "chaining")
            new_node.parameters = JSON.parse(JSON.stringify(node.parameters))
        }
        else if(node.type == "support"){
            new_node = editor.get_core().create_support(node.concept)
            new_node.parameters = JSON.parse(JSON.stringify(node.parameters))
        }
        if(new_node){
            editor.add_nodes_after(new_node, node)    
        }
    }, [node.idx, node.parameters,editor])

    return <AutoIconButton onClick={run} title="复制此节点" icon={PhoneMissedIcon} />
})

/** 这个组件给一个`Group`或`Struct`组件提供一个开关，用于控制`Group`或`Struct`的`relation`。 */
const DefaultSwicth = React.memo(() => {
    const node = useNode<GroupNode | StructNode>()
    const editor = useEditor()
    const [checked, set_checked] = React.useState(node.relation == "chaining")
    const switchref = React.useRef<HTMLInputElement | null>(null)

    React.useEffect(() => {
        if((node.relation == "chaining") != checked){ 
            set_checked(node.relation == "chaining")
        }
    }, [node])

    const switch_check_change = React.useCallback(() => {
        const checked = switchref.current?.checked
        if(checked == undefined || !editor){
            return
        }
        set_checked(checked)
        editor.set_node(node, { relation: checked ? "chaining" : "separating" })
    }, [node, editor])


    return <AutoTooltip title = "贴贴">
        <Switch 
            checked = {checked} 
            onChange = {switch_check_change} 
            sx = {{
                transform: "scale(0.8)",
                transformOrigin: "center center", 
                marginX: "-0.5rem"
            }}
            slotProps = {{
                input: {
                    ref: switchref
                }
            }}
        />
    </AutoTooltip>
})
