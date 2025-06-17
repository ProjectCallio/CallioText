/**
 * 这个模块给editor组件提供一个通用的编辑器，这个编辑器可以用来快速编辑参数。
 */

import * as React from "react"
import * as Slate from "slate"
import * as ReactSlate from "slate-react"
import {
    Box, 
    TextField , 
} from "@mui/material"

import {
    useKeyEventsHandlerRegister,
    KeyNames,
    useKeyDownUpProxy , 
} from "@ftyyy/mouseless"

import {
    EditorComponent,
    slate_is_concept , 
} from "../../editor"

import {
    ConceptNode,
} from "../../core"

import {
    useNode, 
    useParameters, 
    useEditor, 
} from "../hooks"

import {
    ActivateKeys,
} from "./mouseless"

export {
    UniversalExtra , 
}

interface UniversalExtraProps {
    width?: number
}

function is_textend(slate: Slate.Editor, point: Slate.Point): boolean {
    const nodeEntry = Slate.Editor.node(slate, point.path)
    if (!nodeEntry) return false
  
    const [node] = nodeEntry
    return Slate.Text.isText(node) && point.offset === node.text.length
  }
  

function UniversalExtra({
    width = "1rem",
    variation = "standard",
    extra_small = false,
    onActivate   = ()=>{},
    onDeactivate = ()=>{},
    onNodeChange = ()=>undefined,
}: {
    width?: string
    variation?: "standard" | "outlined" | "filled"
    extra_small?: boolean
    onActivate  ?: (value: string, editor: EditorComponent, node: ConceptNode & Slate.Node) => void
    onDeactivate?: (value: string, editor: EditorComponent, node: ConceptNode & Slate.Node) => void
    onNodeChange?: (
        cur_node  : ConceptNode & Slate.Node, 
        prev_node : ConceptNode & Slate.Node | undefined, 
        prev_value: string , 
    ) => string | undefined
}) {
    const node = useNode()
    const editor = useEditor()

    const [value, set_value] = React.useState("")
    const [activated, set_activated] = React.useState(false)

    // 记录selection，以便在失焦时恢复。
    const [selection, set_selection] = React.useState<Slate.Selection | undefined>(undefined)

    const div_ref = React.useRef<HTMLDivElement>(null)

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    const handle_keyevent = React.useCallback(()=>{
        let now_node = editor.get_cur_concept_node()
        if((!now_node) || (node.idx != now_node.idx)){
            return 
        }

        set_activated(activated => !activated)
        set_selection(editor.get_slate().selection)

    }, [editor, node.idx])

    const handle_blur = React.useCallback(()=>{
        onDeactivate(value, editor, node)

        const slate = editor.get_slate()
        
        if(selection){
            setTimeout(() => { // 延迟执行，等待React渲染完毕
                ReactSlate.ReactEditor.focus(slate)
                Slate.Transforms.select(slate, selection)

                
                // XXX 不知道为啥，必须要移动一下光标，不然不能正确focus
                Slate.Transforms.move(slate, { distance: 1, unit: "offset", reverse: true})
                Slate.Transforms.move(slate, { distance: 1, unit: "offset" })

                
                // XXX 现在还是有一个bug，就是他在组件末尾的时候，往后挪动也会导致失焦，要再往前挪一下
                // 这个好像是slate的bug...
                const at_end = is_textend(slate, selection.focus)
                if(at_end){
                    Slate.Transforms.move(slate, { distance: 1, unit: "offset", reverse: true})
                }
              
            }, 0)
        }
        if(activated){
            set_activated(false)
        }
    }, [onDeactivate, editor, value, selection, node])

    const handle_focus = React.useCallback(()=>{
        onActivate(value, editor, node)
        if(!activated){
            set_selection(editor.get_slate().selection)
            set_activated(true)
        }
    }, [onActivate, value, editor, node])

    React.useEffect(()=>{
        add_handler(ActivateKeys, "", false, handle_keyevent)

        return ()=>{
            del_handler(ActivateKeys, "", false, handle_keyevent)
        }
    }, [handle_keyevent])

    React.useEffect(()=>{   
        if(activated){
            div_ref.current?.focus()
        }else{
            div_ref.current?.blur()
        }
    }, [activated])

    // 如果node变化了，则询问如何改变value
    const prev_node = React.useRef<ConceptNode & Slate.Node | undefined>(undefined)
    React.useEffect(()=>{
        if(node !== prev_node.current){
            const new_value = onNodeChange(node, prev_node.current, value)
            if(new_value != undefined && new_value != value){
                set_value(new_value)
            }
            prev_node.current = node
        }
    }, [onNodeChange, node, value])

    return <Box 
        sx = {{
            width: width,
            height: "100%",
            display: "flex",
            flexDirection: "column",
        }}
    >
        <TextField
            variant = {variation}
            inputRef = {div_ref}
            value    = {value}
            onChange = {(e: React.ChangeEvent<HTMLInputElement>) => {
                set_value(e.target.value)
            }}
            size = "small"
            label = "suffix"
            fullWidth

            onBlur    = {handle_blur}
            onFocus   = {handle_focus}

            onKeyDown = {(e)=>{
                if(e.key == "w" && e.altKey){ // XXX 草...
                    set_activated(false)
                }
            }}
            sx={{
                ...(extra_small && {
                    height: "1rem",
                    transform: "translateY(-0.6rem) scale(0.8)",
                }),
            }}
            slotProps={{
                input: {
                    sx: {
                        borderRadius: "0",
                    }
                }
            }}
        />
    </Box>
}
