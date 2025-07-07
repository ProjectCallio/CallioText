/** 这个模块提供默认的抽象节点的渲染方式。
 * @module
 */
// TODO abstract的编辑还没搞完
import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"
import { produce } from "immer"
import { motion, AnimatePresence } from "framer-motion"

import {
    Button,
    Box,
    Menu,
    MenuItem,
    Drawer,
    IconButton,
    ThemeOptions,
    Dialog , 
    Typography,
    Paper,
    useTheme,
    alpha,
} from "@mui/material"
import {
    Save as SaveIcon,
    X as XIcon,
} from "lucide-react"
import {
    create , 
} from "zustand"
import {
    useKeyDownUpProxy , 
    useKeyEventsHandlerRegister , 
    KeyNames , 
} from "@ftyyy/mouseless"
import { throttle } from "lodash"
import { useSnackbar } from "notistack"

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
    EditorComponentEditingBox , 
} from "../uibase"

import {
    EditorNodeInfoFunction,
    useNode,
    useEditor,
    useResetSelection,
    AutoIconButton , 
    MouselessHint , 
} from "../../../implbase"

import {
    DraggerBox,
    drag_offset_ref,
    adjust_position,
    ForceContain , 
    usePersistedState, 
    mod_scrollbar,
    mod_scrollbar_nohide, 
} from "../../../uibase"

import {
    useEditorState,
    useCurEditor , 
} from "../../../editor"

export {
    AbstractEditorArea , 
    useAbstractEditorStore
}

// TODO 也许该有编号冲突检查？
// TODO 目前不支持嵌套abstract editor
// 一个可能的想法是每个editor单独有一个abstract editor area。
const useAbstractEditorStore = create<{
    father_node: ConceptNode | null,
    abs_idx: string | null,
    open: boolean,
    open_editor: (node: ConceptNode, abs_idx: string) => void,
    close_editor: () => void,
    set_open: (open: boolean) => void,
    set_father_node: (node: ConceptNode) => void,
}>((set) => ({
    father_node: null,
    abs_idx    : null,
    open       : false,
    set_open: (open) => set({open}),
    open_editor: (node: ConceptNode, abs_idx: string) => set({father_node: node, abs_idx: abs_idx, open: true}),
    close_editor: () => set({father_node: null, abs_idx: null, open: false}),
    set_father_node: (node: ConceptNode) => set({father_node: node}),
}))


const AbstractEditorArea = React.memo(({}:{})=>{
    const { enqueueSnackbar } = useSnackbar()
    const palette = useTheme().palette

    const [position, set_position] = usePersistedState<{x: number, y: number}>(
        "abstracteditor-position",
        {x: 0, y: 0}
    )
    const [dragging, set_dragging] = React.useState(false)
    const fat_editor = useEditor()

    const open = useAbstractEditorStore(state => state.open)

    const father_node = useAbstractEditorStore(state => state.father_node)
    const abs_idx = useAbstractEditorStore(state => state.abs_idx)
    const son_node = (father_node && (abs_idx != null)) 
        ? father_node.abstract.find(abs=>abs.idx == abs_idx) 
        : null

    const [son_children, son_but_children] = React.useMemo(() => {
        if(!son_node) return [undefined, undefined]
        let { children, ...son_but_children } = son_node
        return [children, son_but_children]
    }, [son_node])

    const box_ref = React.useRef<HTMLDivElement | null>(null)
    const son_editor_ref = React.useRef<EditorComponent | null>(null)
    const closebutton_ref = React.useRef<HTMLButtonElement | null>(null)
    const savebutton_ref  = React.useRef<HTMLButtonElement | null>(null)

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    const [onkeydown, onkeyup] = useKeyDownUpProxy()   
    const [set_selection, reset_selection] = useResetSelection()

    const my_set_position = React.useMemo(() => {
        return throttle((pos: { x: number; y: number }) => {
            set_position(pos)
        }, 100) // 每 100ms 最多执行一次
    }, [])

    React.useEffect(()=>{
        const handle_mousemove = (e: MouseEvent) => {
            if (!dragging) return 

            let rect = box_ref.current?.getBoundingClientRect()
            if(!rect) return

            let _x = e.clientX - drag_offset_ref.current.x
            let _y = e.clientY - drag_offset_ref.current.y

            let [new_x, new_y] = adjust_position(
                _x, _y, 
                window.innerWidth, window.innerHeight , 
                rect.width, rect.height, 
            )

            my_set_position({ x: new_x, y: new_y })

            e.preventDefault()
            e.stopPropagation()
        }

        const handle_mouseup = (e: MouseEvent) => {
            set_dragging(false)
        }

        window.addEventListener("mousemove", handle_mousemove)
        window.addEventListener("mouseup", handle_mouseup)
        return ()=>{
            window.removeEventListener("mousemove", handle_mousemove)
            window.removeEventListener("mouseup", handle_mouseup)
        }
    }, [dragging])


    const handle_save = React.useCallback(()=>{

        const subeditor = son_editor_ref.current
        
        const {father_node, abs_idx} = useAbstractEditorStore.getState()
        if (!subeditor || !father_node || abs_idx == null) {
            return
        }

        // 更新抽象。
        let root = subeditor.get_root()
        let father_abstract_list = father_node.abstract
        let new_abstract_list = produce(father_abstract_list, alis => {
            let abs = alis.find(abs=>abs.idx == abs_idx)
            if(!abs) return
            abs.children = root.children
        })
        fat_editor.set_node(father_node, { abstract: new_abstract_list })
        enqueueSnackbar("保存成功", { variant: "success" })

        // 注意这里需要依赖son_node
        // 因为son_node变化会导致son_editor_ref刷新
    }, [fat_editor, father_node, abs_idx, son_node])

    const handle_close = React.useCallback(()=>{
        handle_save()
        reset_selection()
        useAbstractEditorStore.getState().close_editor()
    }, [handle_save])

    React.useEffect(()=>{
        if(open){
            set_selection()
        }
    }, [open])

    React.useEffect(()=>{
        if(open){
            setTimeout(()=>{
                const subeditor = son_editor_ref.current
                if(!subeditor) return
                SlateReact.ReactEditor.focus(subeditor.get_slate())
            }, 0)
        }
    }, [open, son_node])

    React.useEffect(()=>{
        const my_handle_save = ()=>{
            const subeditor = son_editor_ref.current
            if(!subeditor) {return}
            if(SlateReact.ReactEditor.isFocused(subeditor.get_slate())){
                handle_save()
            }
        }
        const my_handle_close = ()=>{
            const subeditor = son_editor_ref.current
            if(!subeditor) return
            if(SlateReact.ReactEditor.isFocused(subeditor.get_slate())){
                handle_close()
            }
        }
        add_handler([KeyNames.ctrl], KeyNames.s, "down", my_handle_save)   
        add_handler([KeyNames.ctrl], KeyNames.d, "down", my_handle_close)
        return ()=>{
            del_handler([KeyNames.ctrl], KeyNames.s, "down", my_handle_save)
            del_handler([KeyNames.ctrl], KeyNames.d, "down", my_handle_close)
        }
    }, [handle_save, handle_close])

    const show = open && son_node

    return <AnimatePresence>{show && (<motion.div
        initial={{ y: -50, opacity: 0, height: 0 }}
        animate={{ y: 0  , opacity: 1, height: "calc(min(20rem, 40vh))" }}
        exit   ={{ y: -50, opacity: 0, height: 0 }}
        transition={{ duration: 0.4 }}
        style={{
            position: "fixed",
            top: `${position.y}px`,
            left: `${position.x}px`,
            zIndex: 999,
        }}
    >
        <Paper 
            sx={{
                width: "calc(min(35rem, 40vw))",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                backgroundColor: alpha(palette.background.paper, 0.9),
                backdropFilter: "blur(1px)",
            }}
            ref = {box_ref}
            elevation = {1}
        >
            <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "0.5rem 1rem",
                borderBottom: `1px solid ${palette.divider}`,
            }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1, 
                }}>
                    <AnimatePresence mode="wait"><motion.div
                        key = {son_node.idx}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit   ={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontSize: "1rem",
                                fontWeight: 500,
                            }}
                        >
                            编辑抽象: {son_node.concept}
                        </Typography>

                        <Typography sx={{
                            fontSize: "0.6rem",
                            color: "text.secondary",
                        }}>{son_node.idx}</Typography>
                    </motion.div>
                </AnimatePresence>
                </Box>
                
                <Box sx={{ 
                    position: "absolute", 
                    right: "50%",
                    top: "1rem",
                }}>
                    <DraggerBox
                        my_position = {position}
                        dragging_me = {dragging}
                        onDragStart = {e=>{
                            set_dragging(true)
                        }}
                    />
                </Box>
                
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <MouselessHint 
                        get_anchor_el = {() => savebutton_ref.current as any}
                        ctrl_key = {[KeyNames.ctrl, KeyNames.alt]}
                        keys = {[KeyNames.ctrl, KeyNames.s]}
                        with_portal 
                        placement = "left"
                    />
                    <MouselessHint 
                        get_anchor_el = {() => closebutton_ref.current as any}
                        ctrl_key = {[KeyNames.ctrl, KeyNames.alt]}
                        keys = {[KeyNames.ctrl, KeyNames.d]}
                        with_portal 
                        placement = "right"
                    />

                    <AutoIconButton 
                        onClick={() => {handle_save()}}
                        size="medium"
                        ignore_mouseless={true}
                        icon={SaveIcon}
                        icon_props={{
                            sx:{
                                color: "primary.main"
                            },
                            ref: savebutton_ref
                        }}
                        
                    />
                    <AutoIconButton 
                        onClick={() => {handle_close()}}
                        size="medium"
                        ignore_mouseless={true}
                        icon={XIcon}
                        icon_props={{
                            sx:{
                                color: "primary.main"
                            },
                            ref: closebutton_ref
                        }}
                    />
                </Box>
            </Box>

            <Box 
                ref = {mod_scrollbar_nohide}
                sx={{ 
                    flexGrow: 1, 
                    overflow: "auto" 
                }}
            >
                <ForceContain.Provider value={true}>
                    <EditorComponentEditingBox>
                        <AnimatePresence><motion.div
                            key = {son_node.idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                        <EditorComponent 
                            key = {son_node.idx}
                            ref = {(e)=>{
                                if(!e){return}
                                son_editor_ref.current = e
                            }}
                            editorcore          = {fat_editor.get_core()}
                            init_rootchildren   = {son_children}
                            init_rootproperty   = {son_but_children}

                            onUpdate            = {(v: any)=>{
                                // conflictcheck()
                            }}
                            
                            onKeyDown           = {onkeydown}
                            onKeyUp             = {onkeyup}
                        >
                        </EditorComponent>
                        </motion.div>
                        </AnimatePresence>
                    </EditorComponentEditingBox>
                </ForceContain.Provider>
            </Box>
        </Paper>
    </motion.div>)}</AnimatePresence>
})

