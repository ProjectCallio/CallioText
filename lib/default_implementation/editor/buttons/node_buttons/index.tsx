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
    CircleX  as CircleXIcon, 
    Settings as SettingsIcon, 
    ArrowDownFromLine as ArrowDownFromLineIcon, 
    ArrowUpToLine as ArrowUpToLineIcon, 
    MoveUp as MoveUpIcon, 
    PhoneMissed as PhoneMissedIcon,
} from "lucide-react"

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
import {
    useNode, 
    useParameters, 
    useEditor, 
    AutoIconButton , 
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
    const node = useNode((prev, next) => (
        prev.parameters === next.parameters && prev.idx == next.idx
    ))

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
        <AutoIconButton onClick={()=>{set_open(true)}} title="设置参数" icon={SettingsIcon} size="medium"/>
        {subcomp}
    </Box>
})


/** 这个组件提供一个直接删除节点的按钮。 */
const DefaultCloseButton = React.memo(() => {
    const editor = useEditor()
    const node = useNode((prev, next) => (prev.idx == next.idx))

    // 只在node.idx变的时候重新渲染
    const run = React.useCallback(() => {
        if(editor){
            editor.delete_concept_node(node)
        }
    }, [node.idx, editor])

    return <AutoIconButton onClick={run} title="删除组件" icon={CircleXIcon} size="medium"/>
})

/** 这个组件提供一个删除节点，但是将其子节点移动到节点外的按钮。 */
const DefaultSoftDeleteButton = React.memo(({ puretext }: { puretext?: boolean }) => {
    const editor = useEditor()
    const node = useNode((prev, next) => (prev.idx == next.idx))

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

    return <AutoIconButton onClick={run} title="解除组件" icon={MoveUpIcon} size="medium"/>
})

/** 这个组件提供一个在组件的上新建段落的节点。 */
const NewParagraphButtonUp = React.memo(() => {
    const editor = useEditor()
    const node = useNode((prev, next) => (prev.idx == next.idx))

    const run = React.useCallback(() => {
        if(!editor){
            return
        }
        editor.add_nodes_before(editor.get_core().create_paragraph(), node)    
    }, [node.idx, editor])

    return <AutoIconButton onClick={run} title="向上添加段落" icon={ArrowUpToLineIcon} size="medium"/>
})

/** 这个组件提供一个在组件的下新建段落的节点。 */
const NewParagraphButtonDown = React.memo(() => {
    const editor = useEditor()
    const node = useNode((prev, next) => (prev.idx == next.idx))

    const run = React.useCallback(() => {
        if(!editor){
            return
        }
        editor.add_nodes_after(editor.get_core().create_paragraph(), node)    
    }, [node.idx, editor])

    return <AutoIconButton onClick={run} title="向下添加段落" icon={ArrowDownFromLineIcon} size="medium"/>
})

/** 这个按钮在一个概念下方复制此概念，并设置同样的参数。 */
const CopyButton = React.memo(() => {
    const editor = useEditor()
    const node = useNode((prev, next) => (
        prev.idx == next.idx
        && prev.type == next.type 
        && prev.concept == next.concept 
        && prev.parameters === next.parameters 
    ))

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
    }, [node.idx, node.type, node.concept, node.parameters, editor])

    return <AutoIconButton onClick={run} title="复制此节点" icon={PhoneMissedIcon} size="medium"/>
})

/** 这个组件给一个`Group`或`Struct`组件提供一个开关，用于控制`Group`或`Struct`的`relation`。 */
const DefaultSwicth = React.memo(() => {
    const node = useNode<GroupNode | StructNode>((prev, next) => (
        prev.relation == next.relation && prev.idx == next.idx
    ))
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
            size="small"
            checked = {checked} 
            onChange = {switch_check_change} 
            sx = {{
            }}
            slotProps = {{
                input: {
                    ref: switchref , 
                }
            }}
        />
    </AutoTooltip>
})

// DefaultParameterEditButton.whyDidYouRender = true
// DefaultCloseButton.whyDidYouRender = true
// NewParagraphButtonUp.whyDidYouRender = true
// NewParagraphButtonDown.whyDidYouRender = true
// DefaultSwicth.whyDidYouRender = true
// DefaultSoftDeleteButton.whyDidYouRender = true
// CopyButton.whyDidYouRender = true


