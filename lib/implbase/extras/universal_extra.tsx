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
    useAllHoldingKeys , 
} from "@ftyyy/mouseless"

import {
    useSnackbar,
} from "notistack"

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
    useResetSelection , 
} from "../hooks"

import {
    MouselessHint,
} from "../msls_hint"

export {
    UniversalExtra , 
}

const ActivateKeys = [KeyNames.alt, KeyNames.w]
  

const UniversalExtra = React.memo(({
    width = "1rem",
    variation = "outlined",
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
}) => {
    const node   = useNode((prev, next) => (
        prev.idx == next.idx
        && prev.parameters === next.parameters
    ))
    const editor = useEditor()

    const [value, set_value] = React.useState("")
    const [activated, set_activated] = React.useState(false)

    const [set_selection, reset_selection] = useResetSelection()

    const div_ref = React.useRef<HTMLDivElement>(null)

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    const handle_keyevent = React.useCallback(()=>{
        let now_node = editor.get_cur_concept_node()
        if((!now_node) || (node.idx != now_node.idx)){
            return 
        }

        set_selection()
        set_activated(activated => !activated)
        
    }, [editor, node.idx])


    const handle_blur = React.useCallback(()=>{
        onDeactivate(value, editor, node)
        
        // XXX 不知道为什么，我发现即使这里不调用这个函数，他也会自动恢复selection。
        // （不过他不会处理node末尾reset会失败的bug...）
        // 不确定为什么，可能是slate的默认行为？
        reset_selection()
        
        if(activated){
            set_activated(false)
        }
    }, [onDeactivate, editor, value, node])

    const handle_focus = React.useCallback(()=>{
        onActivate(value, editor, node)
        if(!activated){
            set_selection()
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
            alignContent: "center" , 
            justifyContent: "center" , 
        }}
    >
        <MouselessHint 
            get_anchor_el={()=>div_ref.current} 
            ctrl_key={KeyNames.Alt} 
            keys={ActivateKeys} 
            placement = "top"
        />
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
                if(e.key == "w" && e.altKey && !e.repeat){ // XXX 草...
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
})

// UniversalExtra.whyDidYouRender = true