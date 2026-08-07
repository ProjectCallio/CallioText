import * as React from "react"

import {
    Box ,
    Paper ,
    BoxProps ,
    Typography ,
    Button ,
    Divider ,
    useTheme,
    alpha,
} from "@mui/material"

import {
    KeyNames ,
    useKeyEventsHandlerRegister,
    useKeyHoldingState,
    KeyName,
} from "@ftyyy/mouseless"

import {
    AnimatePresence ,
    motion ,
} from "framer-motion"

import {
    useAreaStore ,
    AreaName,
    area_container_ref ,
} from "./base"

import {
    AllConceptTypes ,
} from "../../core"

import {
    mod_scrollbar ,
    usePersistedState,
    DraggerBox,
} from "../../uibase"

import {
    MouselessButton ,
    MouselessHint ,
} from "../../implbase"

import {
    useCurEditor ,
} from "../../editor"

import {
    find_vertical_neighbor ,
    move_in_flat_list ,
    move_type ,
    normalize_cursor ,
    clamp ,
    ButtonRect ,
} from "./concept_area_utils"

import {
    Shapes ,
} from "lucide-react"

import {
    AreaTitle ,
} from "./area_title"

export {
    ConceptArea ,
    HOLDING ,
}

const concept_list = [
    "group"     ,
    "inline"    ,
    "support"   ,
    "structure" ,
] as const

const type_labels: {[key in Exclude<AllConceptTypes, "abstract">]: string} = {
    "group"     : "组" ,
    "inline"    : "行内" ,
    "support"   : "支持" ,
    "structure" : "结构" ,
}

const HOLDING = [KeyNames.alt, KeyNames.x]

// 缩放的尺寸限制。
const MIN_WIDTH   = 180
const MIN_HEIGHT  = 100

/** 概念区：把全部概念类型平铺在一个面板里，分节展示，支持键盘导航和鼠标缩放。 */
const ConceptArea = React.memo(({
    paper_sx ,
    zIndex = 1000 ,
    area_id ,
}:{
    paper_sx?: BoxProps["sx"]
    zIndex?: number
    area_id: AreaName
})=>{

    const editor = useCurEditor() // 当前正在编辑的编辑器

    // 订阅container的版本号：container变化时触发重渲染，从而拿到新的container_ref。
    useAreaStore(state => state.container_version)
    const container = area_container_ref.current?.getBoundingClientRect()

    const open        = useAreaStore(state => state.open.concep)
    const position    = useAreaStore(state => state.positions[area_id])
    const dragging_me = useAreaStore(state => state.dragging == area_id)

    const box_ref  = React.useRef<HTMLDivElement>(null)
    const list_ref = React.useRef<HTMLDivElement | null>(null)

    // 每个概念按钮的DOM元素，键是`${类型下标}-${类型内下标}`。上下键的几何导航用它。
    const button_refs = React.useRef<{[key: string]: HTMLDivElement | null}>({})

    // 目标列：连续按上下键时记住出发时的横坐标（类似文本编辑器的光标列记忆），
    // 途经很短的行也不会把水平位置带偏。任何水平移动都会清掉它。
    const goal_x_ref = React.useRef<number | null>(null)

    const palette = useTheme().palette

    // 当前选中的按钮：[类型下标, 类型内下标]。
    const [cur_mouseless, set_cur_mouseless] = usePersistedState<[number, number]>(
        `area-${area_id}/concept/cur_mouseless`,[0, 0]
    )

    // 面板尺寸：null表示使用默认尺寸，否则是用户拖出来的尺寸。
    const [saved_size, set_saved_size] = usePersistedState<{width: number, height: number} | null>(
        `area-${area_id}/concept/size`, null
    )
    const [live_size, set_live_size] = React.useState<{width: number, height: number} | null>(null)
    const eff_size = live_size ?? saved_size

    const holding = useKeyHoldingState(HOLDING)

    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    // 拖拽状态
    const {set_dragging, set_sizes} = useAreaStore.getState()

    const sec_concept_list = React.useMemo(()=>{
        const editorcore = editor?.get_editorcore()
        if(!editorcore){
            return undefined
        }
        return concept_list.reduce((cur, typename) => {
            cur[typename] = editorcore.get_sec_concept_list(typename)
            return cur
        }, {} as {[key in Exclude<AllConceptTypes , "abstract">]: string[]})
    }, [editor])

    // 每个类型下的概念数量。
    const counts = React.useMemo(()=>{
        if(!sec_concept_list){
            return concept_list.map(() => 0)
        }
        return concept_list.map(typename => sec_concept_list[typename].length)
    }, [sec_concept_list])

    const [cur_type, cur_idx] = React.useMemo(
        ()=>normalize_cursor(counts, cur_mouseless),
        [cur_mouseless, counts]
    )
    const cur_type_name = React.useMemo(()=>(concept_list[cur_type]), [cur_type])

    React.useEffect(()=>{

        // 左右键：在拉平的按钮序列上前后移动，可以跨越类型分节。
        const handle_left = ()=>{
            goal_x_ref.current = null
            set_cur_mouseless(move_in_flat_list(counts, [cur_type, cur_idx], -1))
        }
        const handle_right = ()=>{
            goal_x_ref.current = null
            set_cur_mouseless(move_in_flat_list(counts, [cur_type, cur_idx], 1))
        }

        // 上下键：跳到上一行/下一行里视觉位置最接近的按钮。
        // 布局是完全动态的（面板可缩放、按钮宽度不一、随时重新换行），
        // 所以不预设任何行列结构，每次按键时从DOM读当前的真实布局。
        // 用getBoundingClientRect：所有按钮统一在视口坐标系里比较，
        // 不受framer-motion在包装元素上遗留transform的影响。
        const handle_vertical = (dir: "up" | "down")=>{
            const rects: ButtonRect[] = []
            for(const key in button_refs.current){
                const el = button_refs.current[key]
                if(el){
                    const r = el.getBoundingClientRect()
                    rects.push({key, top: r.top, bottom: r.bottom, left: r.left, right: r.right})
                }
            }

            // 出发时记下目标列；连续上下移动沿用它。
            const cur_el = button_refs.current[`${cur_type}-${cur_idx}`]
            if(goal_x_ref.current == null && cur_el){
                const r = cur_el.getBoundingClientRect()
                goal_x_ref.current = (r.left + r.right) / 2
            }

            const target = find_vertical_neighbor(
                rects, `${cur_type}-${cur_idx}`, dir,
                goal_x_ref.current ?? undefined,
            )
            if(target){
                const [t, i] = target.split("-").map(Number)
                set_cur_mouseless([t, i])
            }
            // 找不到目标（面板未渲染，或者全部按钮都在同一行）时不动作：
            // 上下键只做视觉对齐的跳转，绝不退化成顺序移动。
        }
        const handle_up   = ()=>handle_vertical("up")
        const handle_down = ()=>handle_vertical("down")

        const handle_enter = ()=>{
            if(!editor || !sec_concept_list){
                return
            }
            editor.new_concept_node(cur_type_name, sec_concept_list[cur_type_name][cur_idx])
        }

        // .和/：跳到上一个/下一个非空类型的分节。
        const handle_dot = ()=>{
            goal_x_ref.current = null
            set_cur_mouseless(move_type(counts, [cur_type, cur_idx], -1))
        }
        const handle_slash = ()=>{
            goal_x_ref.current = null
            set_cur_mouseless(move_type(counts, [cur_type, cur_idx], 1))
        }

        add_handler(HOLDING, KeyNames.Enter     , false, handle_enter)
        add_handler(HOLDING, KeyNames.ArrowLeft , false, handle_left)
        add_handler(HOLDING, KeyNames.ArrowRight, false, handle_right)
        add_handler(HOLDING, KeyNames.ArrowUp   , false, handle_up)
        add_handler(HOLDING, KeyNames.ArrowDown , false, handle_down)
        add_handler(HOLDING, "." as KeyName, false, handle_dot)
        add_handler(HOLDING, "/" as KeyName, false, handle_slash)
        return ()=>{
            del_handler(HOLDING, KeyNames.Enter     , false, handle_enter)
            del_handler(HOLDING, KeyNames.ArrowLeft , false, handle_left)
            del_handler(HOLDING, KeyNames.ArrowRight, false, handle_right)
            del_handler(HOLDING, KeyNames.ArrowUp   , false, handle_up)
            del_handler(HOLDING, KeyNames.ArrowDown , false, handle_down)
            del_handler(HOLDING, "." as KeyName, false, handle_dot)
            del_handler(HOLDING, "/" as KeyName, false, handle_slash)
        }
    }, [cur_type, cur_idx, cur_type_name, counts, sec_concept_list, editor])

    // 选中的按钮变化时，把它滚动到可见区域。
    React.useEffect(()=>{
        if(!holding){
            return
        }
        const el = button_refs.current[`${cur_type}-${cur_idx}`]
        el?.scrollIntoView({block: "nearest"})
    }, [cur_type, cur_idx, holding])

    // 鼠标缩放：按下手柄后跟踪指针，实时改尺寸，松开时写入本地存储。
    const handle_resize_start = React.useCallback((e: React.MouseEvent)=>{
        e.preventDefault()
        e.stopPropagation()
        const box_rect  = box_ref.current?.getBoundingClientRect()
        const list_rect = list_ref.current?.getBoundingClientRect()
        if(!box_rect || !list_rect){
            return
        }
        const start_x = e.clientX
        const start_y = e.clientY
        const start_w = box_rect.width
        const start_h = list_rect.height
        let last = {width: start_w, height: start_h}

        const on_move = (ev: MouseEvent)=>{
            last = {
                width : clamp(start_w + ev.clientX - start_x, MIN_WIDTH , window.innerWidth  * 0.6),
                height: clamp(start_h + ev.clientY - start_y, MIN_HEIGHT, window.innerHeight * 0.7),
            }
            set_live_size(last)
        }
        const on_up = ()=>{
            window.removeEventListener("mousemove", on_move)
            window.removeEventListener("mouseup"  , on_up)
            set_saved_size(last)
            set_live_size(null)
        }
        window.addEventListener("mousemove", on_move)
        window.addEventListener("mouseup"  , on_up)
    }, [set_saved_size])

    // 全部类型平铺：每个非空类型一节，节与节之间用分割线。
    const concept_sections = React.useMemo(()=>{
        if((!sec_concept_list) || (!editor)){
            return <></>
        }
        const nonempty = concept_list
            .map((typename, type_idx) => ({typename, type_idx}))
            .filter(({typename}) => sec_concept_list[typename].length > 0)

        return nonempty.map(({typename, type_idx}, section_pos) => (
            <React.Fragment key={typename}>
                {section_pos > 0 && <Divider sx={{marginY: "0.5rem"}}/>}
                <Typography variant="caption" sx={{
                    color: palette.text.secondary,
                    fontWeight: 500,
                    display: "block",
                    marginBottom: "0.3rem",
                }}>{type_labels[typename]}</Typography>
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "0.73rem",
                }}><AnimatePresence mode="popLayout">
                    {sec_concept_list[typename].map((sec_ccpt, idx) => (
                        <motion.div
                            key={`${typename}-${sec_ccpt}`}
                            layoutId={`${typename}-${sec_ccpt}`}
                            layout
                            initial = {{ opacity: 0, scale: 0.1}}
                            animate = {{ opacity: 1, scale: 1}}
                            exit    = {{ opacity: 0, scale: 0.1}}
                            transition={{
                                duration: 0.3,
                                ease: "easeOut"
                            }}
                            style={{
                                overflow: "visible",
                            }}
                        >
                        {/* 测量用的ref必须放在这个内层div上，不能放在上面的motion.div上：
                            AnimatePresence的popLayout模式会克隆直接子元素并覆盖其ref
                            （见framer-motion的PopChild实现），放在直接子元素上永远收不到回调。 */}
                        <div ref={el => {button_refs.current[`${type_idx}-${idx}`] = el}}>
                        <MouselessButton
                            key={sec_ccpt}
                            is_activated={(cur_type == type_idx) && (cur_idx == idx) && holding}
                            auto_element
                            autoel_props={{
                                style: {
                                    borderRadius: "8px",
                                },
                                use_textcolor: true,
                            }}
                        >
                            <Button
                                size="small"
                                component = { "span" }
                                onClick={() => {
                                    editor.new_concept_node(typename , sec_ccpt)
                                }}
                                sx={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                    borderRadius: "8px",
                                    border: ((cur_type == type_idx) && (cur_idx == idx))
                                        ? `1px dashed ${palette.divider}` : "none",
                                    textTransform: "none",
                                    color: "inherit",
                                    backgroundColor: "inherit",
                                }}
                            >
                                {sec_ccpt}
                            </Button>
                        </MouselessButton>
                        </div>
                        </motion.div>
                    ))}
                </AnimatePresence></Box>
            </React.Fragment>
        ))
    }, [sec_concept_list, cur_type, cur_idx, holding, editor, palette])

    if(!editor || !container || !sec_concept_list){
        return <></>
    }

    return <Paper
        elevation = {3}
        sx  = {{
            position: "absolute",
            top     : container.y + position.y,
            left    : container.x + position.x,
            width   : eff_size ? `${eff_size.width}px` : "calc(min(20rem, 30vw))",
            zIndex  : zIndex,
            padding: open ? "1rem" : "0",
            transition: "top 0.1s, left 0.1s, padding 0.3s",
            overflow: "hidden",
            backgroundColor: alpha( palette.background.paper, 0.8),
            backdropFilter: "blur(1px)",
            ...paper_sx,
        }}
        ref         = {box_ref}
    >
        <MouselessHint
            get_anchor_el={()=> box_ref.current}
            ctrl_key={KeyNames.Alt}
            keys={HOLDING}
            placement = "top"
            with_portal
            info = "← → ↑ ↓ . / ⏎"
        />
        <AnimatePresence mode="wait">{(
            open
        ) && <motion.div
            initial     = {{ height: 0, opacity: 0 }}
            animate     = {{ height: "fit-content" , opacity: 1  }}
            exit        = {{ height: 0 , opacity: 0 }}
            transition  = {{
                duration: 0.3,
                ease: "easeOut"
            }}
            style={{
                top     : "0"  ,
                width   : "100%",
                opacity: 1,

                maxHeight: "calc(min(40rem, 70vh))",

                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
            }}
        >
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
            }}>
                <AreaTitle icon={Shapes}>插入概念</AreaTitle>
                <DraggerBox
                    my_position = {position}
                    dragging_me = {dragging_me}
                    onDragStart = {()=>{
                        set_dragging(area_id)
                        if(box_ref.current){
                            const rect = box_ref.current.getBoundingClientRect()
                            set_sizes({[area_id]: {
                                width : rect.width,
                                height: rect.height,
                            }})
                        }
                    }}
                />
            </Box>

            {/* 概念列表：全部类型分节平铺。 */}
            <motion.div layout transition={{ duration: 0.3, ease: "easeOut" }}>
            <Box
                ref={el => {
                    mod_scrollbar(el as HTMLElement | null)
                    list_ref.current = el as HTMLDivElement | null
                }}
                sx={{
                    overflow: "auto",
                    flexGrow: 1,
                    minHeight: 0 ,
                    height   : eff_size ? `${eff_size.height}px` : "fit-content",
                    maxHeight: eff_size ? undefined : "calc(min(25rem, 30vh))",
                    padding: "0.2rem",
                }}
            >
                {concept_sections}
            </Box></motion.div>
        </motion.div>}</AnimatePresence>

        {/* 缩放手柄：拖动改变面板大小，松开时保存。 */}
        {open && <Box
            onMouseDown={handle_resize_start}
            sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "16px",
                height: "16px",
                cursor: "nwse-resize",
                background: `linear-gradient(135deg, transparent 0 50%, ${alpha(palette.text.secondary, 0.35)} 50% 100%)`,
                borderTopLeftRadius: "4px",
            }}
        />}
    </Paper>
})

// ConceptArea.whyDidYouRender = true
