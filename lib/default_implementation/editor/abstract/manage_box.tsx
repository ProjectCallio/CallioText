import * as React from "react"

import {
    Box,
    Chip,
    useTheme,
    alpha,
} from "@mui/material"

import {
    useSpaceNavigatorRawState,
    SpaceDefinition , 
    KeyNames , 
    KeyName , 
    useKeyEventsHandlerRegister , 
} from "@ftyyy/mouseless"

import {
    motion, AnimatePresence,
} from "framer-motion"

import {
    X as XIcon,
} from "lucide-react"

import {produce} from "immer"

import {
    AbstractNode,
    ConceptNode,
} from "../../../core"

import {
    useEditor,
    useNode,
    AutoElement , 
    MouselessSelect,
    useMouselessSelect, 
    AutoIconButton, 
    useEditorConfig,
    MouselessHint,
    useTexts ,
} from "../../../implbase"

import {
    AutoStack , 
    click_all , 
} from "../../../uibase"

import {
    SPACE,  
    decode_position , 
    get_position , 
} from "./mouseless"

import {
    useAbstractEditorStore,
} from "./editor"

export {
    AbstractManageBox,
    SPACE , 
}

interface AbstractChipRef{
    click: () => void
    delete: () => void
}
const AbstractChip = React.memo(React.forwardRef(({
    fat_node ,
    abs_node , 
    label,
    onClick,
    onDelete,
}: {
    fat_node: ConceptNode ,
    abs_node: AbstractNode,
    label: string,
    onClick?: () => void,
    onDelete?: () => void,
}, ref: React.Ref<AbstractChipRef>)=>{
    const texts = useTexts()

    const editor = useEditor()
    const config = useEditorConfig()
    
    const cur_fat = useAbstractEditorStore(state => state.father_node)
    const cur_abs = useAbstractEditorStore(state => state.abs_idx)
    const is_open = cur_fat?.idx == fat_node.idx && cur_abs == abs_node.idx

    const palette = useTheme().palette
    const mycolor = {
        backgroundColor: is_open ? palette.primary.dark : palette.primary.main,
        color          : palette.primary.contrastText,
    }
    const deleting_color = {
        backgroundColor: palette.error.main,
        color          : palette.error.contrastText,
    }
    const [deleting, set_deleting] = React.useState(false)

    const selected = useMouselessSelect()

    React.useEffect(()=>{
        set_deleting(false)
    }, [selected])

    const handle_delete = React.useCallback(()=>{
        if(!deleting){
            set_deleting(true)
            return
        }
        const new_abstract = fat_node.abstract.filter(abs=>abs.idx != abs_node.idx)
        editor.set_node(fat_node, {abstract: new_abstract})
        onDelete?.()
    }, [fat_node, abs_node, editor, deleting, onDelete])

    const handle_click = React.useCallback(()=>{
        const state = useAbstractEditorStore.getState()
        if(is_open){
            state.close_editor()
        }else{
            state.open_editor(fat_node, abs_node.idx)
        }
        onClick?.()
    }, [fat_node, abs_node, is_open])

    React.useImperativeHandle(ref, ()=>({
        click: handle_click,
        delete: handle_delete,
    }))

    return <Box
        sx={{
            position: "relative",
            display: "inline-block",
        }}
    >
        <motion.div
            animate={deleting ? {
                rotate: [0, -2, 2, -2, 2, 0],
                transition: {
                    duration: 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            } : {
                rotate: 0,
                transition: {
                    duration: 0.2,
                    ease: "easeInOut"
                }
            }}
        >
            <AutoElement
                title = {`编辑${label}`}
                style = {{
                    backgroundColor: "transparent",
                    borderRadius: "1rem",
                    cursor: "pointer",
                }}
            >
            <Chip
                size="small"
                label={label}
                sx={{
                    ...(deleting ? deleting_color : mycolor),
                    "&:hover": {
                        ...(deleting ? deleting_color : mycolor),
                    },
                    "&:active": {
                        ...(deleting ? deleting_color : mycolor),
                    },
                    "&:focus": {
                        ...(deleting ? deleting_color : mycolor),
                    },
                    "&.Mui-focusVisible": {
                        ...(deleting ? deleting_color : mycolor),
                    },
                    fontFamily: config.fonts.info.fontFamily,
                }}
                onClick = {handle_click}
                onDelete = {handle_delete}  
                onBlur = {()=>{
                    if(deleting){
                        set_deleting(false)
                    }
                }}
                clickable
                deleteIcon = {<AutoIconButton
                    title = {deleting ? texts.buttons.confirm_delete_abstract : texts.buttons.delete_abstract}
                    icon_props = {{sx:{
                        width: "0.95rem",
                        height: "0.95rem",
                        marginRight: "0.25rem",
                        paddingX: "0.1rem",
                        paddingY: "0.1srem",
                        color          : palette.error.contrastText,
                        backgroundColor: alpha(palette.error.main, 0.8),
                        "&:hover": {
                            backgroundColor: palette.error.light,
                        },
                        "&:active": {
                            backgroundColor: palette.error.dark,
                        },
                    }}}
                    icon = {XIcon}
                />}
            />
            </AutoElement>
        </motion.div>
    </Box>
})) 

const AbstractManageBox = React.memo(({
    component = "div",
    style = {},
    direction = "row",
 }: {
    component?: "div" | "span"
    style?: React.CSSProperties
    direction?: "row" | "column"
 }) => {
    const editor = useEditor()
    const node = useNode((prev, next)=> {
        return prev.idx == next.idx && prev.abstract === next.abstract
    })
    const abstract_num = node.abstract?.length ?? 0

    const palette = useTheme().palette

    const [add_handler, remove_handler] = useKeyEventsHandlerRegister()
    const chip_refs = React.useRef<AbstractChipRef[]>([])
    const box_ref = React.useRef<HTMLDivElement>(null)

    const select_idx = useSpaceNavigatorRawState(React.useCallback(state=>{
        const {space, node: position} = state
        if(space != SPACE.name || !position){
            return undefined
        }
        const [node_idx, idx] = decode_position(position)
        if(node_idx != node.idx){
            return undefined
        }
        return ((idx % abstract_num) + abstract_num) % abstract_num
    }, [node.idx, abstract_num]))

    React.useEffect(()=>{
        const handle_enter = ()=>{
            if(select_idx == undefined){
                return 
            }
            const now_chip = chip_refs.current[select_idx]
            if(!now_chip){
                return 
            }
            now_chip.click()
        }
        const handle_slash = ()=>{
            if(select_idx == undefined){
                return 
            }
            const now_chip = chip_refs.current[select_idx]
            if(!now_chip){
                return 
            }
            now_chip.delete()
        }
        add_handler(SPACE.holding, KeyNames.Enter, "down", handle_enter)
        add_handler(SPACE.holding, "/" as KeyName, "down", handle_slash)
        return ()=>{
            remove_handler(SPACE.holding, KeyNames.Enter, "down", handle_enter)
            remove_handler(SPACE.holding, "/" as KeyName, "down", handle_slash)
        }
    }, [select_idx])

    React.useEffect(()=>{
        const state = useAbstractEditorStore.getState()
        // 如果当前节点是父节点，那么就刷新一下父节点。
        if(state.father_node?.idx == node.idx){
            state.set_father_node(node)
        }
    }, [node.idx, node.abstract])

    const Component = React.useMemo(()=>{
        if(component == "div"){
            return motion.div
        }
        return motion.span
    }, [component])

    return <React.Fragment>
    <MouselessHint
        get_anchor_el = {() => box_ref.current as any}
        ctrl_key  = {KeyNames.alt}
        keys      = {SPACE.holding}
        placement = "top-start"
        info = "← → ⏎ /"
    />
    <AnimatePresence>{(abstract_num > 0) && (
        <Component
            ref = {box_ref}
            initial   ={{ height: 0, opacity: 0 }}
            animate   ={{ height: "auto", opacity: 1, }}
            exit      ={{ height: 0, opacity: 0, }}
            transition={{ duration: 0.3, ease: "easeInOut",}}
            style={{
                overflow: "hidden",
            }}
        >
            <AutoStack 
                direction = {direction}
                gap = "0.5rem"
                sx={{
                    width: component == "div" ? "100%" : "fit-content",
                    height: component == "div" ? "auto" : "100%",

                    paddingY: "0.25rem",
                    paddingX: "0.5rem",

                    backgroundColor: alpha(palette.primary.light, 0.3),

                    alignItems: "center",
                    ...style,
                }}
                component = {component}
            >
                <AnimatePresence mode="popLayout">{
                node.abstract.map((abs_node: AbstractNode, idx: number) => {
                    return <Component
                        key={abs_node.idx}
                        initial={{scale: 0, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        exit={{scale: 0, opacity: 0}}
                        transition={{duration: 0.2, ease: "easeInOut"}}
                        layout
                    ><MouselessSelect.Provider value={select_idx == idx}>
                        <AbstractChip
                            fat_node = {node}
                            abs_node = {abs_node}
                            label = {`${abs_node.concept}: ${idx}`}
                            ref = {(el)=>{
                                if(!el){return}
                                chip_refs.current[idx] = el
                            }}
                        />
                    </MouselessSelect.Provider></Component>
                })}</AnimatePresence>
            </AutoStack>
        </Component>
    )}</AnimatePresence>
    </React.Fragment>
})
