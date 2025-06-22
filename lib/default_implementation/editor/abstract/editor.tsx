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
    Dialog , 
    Typography,
    Paper,
} from "@mui/material"
import {
    AddBox as AddBoxIcon,
    FilterNone as FilterNoneIcon,
    ArrowRightAlt as ArrowRightAltIcon,
    Close as CloseIcon
} from "@mui/icons-material"
import {
    useKeyDownUpProxy , 
} from "@ftyyy/mouseless"
import { throttle } from "lodash"

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

import type { EditorRendererProps, EditorRenderer } from "../../../editor"

import {
    EditorNodeInfoFunction,
    useNode,
    useEditor,
} from "../../../implbase"

import {
    DraggerBox,
    drag_offset_ref,
    adjust_position,
    ForceContain , 
} from "../../../uibase"

import {
    useEditorState,
    useCurEditor , 
} from "../../../editor"

export {
    DefaultAbstractEditor ,
    AbstractEditorArea , 
}



function AbstractEditorArea({}:{}){
    const [position, set_position] = React.useState<{x: number, y: number}>({x: 0, y: 0})
    const [dragging, set_dragging] = React.useState(false)
    const fat_editor = useEditor()

    const box_ref = React.useRef<HTMLDivElement | null>(null)
    const son_editor_ref = React.useRef<EditorComponent | null>(null)
    const edit_cache = React.useRef<any | null>(null)

    const [onkeydown, onkeyup] = useKeyDownUpProxy()    

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

    
    return <Paper 
        sx={{
            position: "fixed",
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: "calc(min(350rem, 50vw))",
            height: "calc(min(40rem, 80vh))",
            zIndex: 1000,
        }}
        ref = {box_ref}
    >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography>AbstractEditorArea</Typography>
            <IconButton onClick={() => console.log("关闭按钮被点击")}>
                <CloseIcon />
            </IconButton>
        </Box>
        <DraggerBox
            my_position = {position}
            dragging_me = {dragging}
            onDragStart = {e=>{
                set_dragging(true)
            }}
        />

        <ForceContain.Provider value={true}>
            <EditorComponentEditingBox>
                <EditorComponent 
                    ref = {son_editor_ref}
                    editorcore          = {fat_editor.get_core()}
                    init_rootchildren   = {[{
                        children: [{
                            text: "Hello, world!",
                        }],
                    }]}
                    init_rootproperty   = {{
                        type: "abstract",
                        idx: "123",
                        concept: "abstract",
                        parameters: {},
                        abstract: [],
                    }}

                    onUpdate            = {(v: any)=>{
                        // conflictcheck()
                    }}
                    
                    onKeyDown           = {onkeydown}
                    onKeyUp             = {onkeyup}
                >

                </EditorComponent>
            </EditorComponentEditingBox>
        </ForceContain.Provider>

    </Paper>
}

const  DefaultAbstractEditor = ()=>{}

/** 这个组件提供默认的Abstract编辑页面。 
 * 这个组件会提供一个完整的文档编辑器，因为每个抽象节点都可以视为一个新文档。
*/
// function DefaultAbstractEditor(props: { 
//     father: ConceptNode, sonidx: number, open: boolean, onClose?: (e: any) => void 
// }) {

//     const subeditor_ref = React.useRef<DefaultEditorComponent | null>(null)
//     const [enter_selection, set_enter_selection] = React.useState<Slate.Location | undefined | null>(undefined)

//     const get_editor = () => {
//         if (!(subeditor_ref && subeditor_ref.current && subeditor_ref.current.get_editor()))
//             return undefined
//         return subeditor_ref.current.get_editor()
//     }

//     let son = props.father.abstract[props.sonidx]
//     if (!son) {
//         return null
//     }
//     let [son_children, son_but_children] = (() => {
//         let { children, ...son_but_children } = son
//         return [children, son_but_children]
//     })()

//     return <EditorGlobalInfo.Consumer>{globalinfo => {
//         let father_editor = globalinfo.editor as EditorComponent
//         return <Drawer
//             anchor={"left"}
//             open={props.open}
//             onClose={props.onClose}
//             ModalProps={{ keepMounted: true }}
//             PaperProps={{ sx: { width: "60%" } }}
//             SlideProps={{
//                 onEnter: () => {
//                     let subeditor = get_editor()
//                     if (!subeditor) {
//                         return
//                     }

//                     set_enter_selection(father_editor.get_slate().selection)

//                     setTimeout(() => { // 稍微延迟一点，然后focus在新编辑器上。延迟一点是为了等抽屉弹出来。
//                         SlateReact.ReactEditor.focus(subeditor.get_slate())
//                     }, 1000)
//                 },
//                 onExited: () => {
//                     let subeditor = get_editor()
//                     if (!subeditor) {
//                         return
//                     }

//                     // 更新抽象。
//                     let root = subeditor.get_root()
//                     let father = props.father
//                     let father_abstract_list = father.abstract
//                     let new_abstract_list = produce(father_abstract_list, alis => {
//                         alis[props.sonidx].children = root.children
//                     })
//                     father_editor.set_node(father, { abstract: new_abstract_list })

//                     // 还原父编辑器的焦点。
//                     SlateReact.ReactEditor.focus(father_editor.get_slate())
//                     if (enter_selection && (
//                         (enter_selection as any)["anchor"] && (enter_selection as any)["anchor"]["path"]
//                     )) {
//                         Slate.Transforms.select(father_editor.get_slate(), enter_selection) // 设置为保存的selection。
//                     }
//                 },
//             }}
//         >
//             <ForceContain.Provider value={true}>
//                 <DefaultEditorComponent
//                     ref={subeditor_ref}
//                     editorcore={father_editor.get_editorcore()}
//                     init_rootchildren={son_children}
//                     init_rootproperty={son_but_children}

//                     sidebar_extras={[() => { // 添加一个额外的退出按钮，方便在编辑抽象时退出。
//                         return <IconButton onClick={e => {
//                             props.onClose?.(e)
//                             e.preventDefault()
//                         }}>
//                             <ArrowRightAltIcon />
//                         </IconButton>
//                     }]}

//                 />
//             </ForceContain.Provider>
//         </Drawer>
//     }}</EditorGlobalInfo.Consumer>
// }
