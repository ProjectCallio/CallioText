/** 各个一级概念的印刷渲染器。改编自项目内部的测试环境，编号和括号按语言本地化。 */
import React from "react"
import * as Slate from "slate"

import {
    Box , Link , Typography , Divider , Grid ,
} from "@mui/material"

import {
    TextNode ,
    AutoStack ,
    ProcessedParameterList ,
    PrinterRenderer ,
    GroupNode ,
    StructNode ,
    SupportNode ,
    InlineNode ,
    PrinterRenderFunctionProps ,

    get_default_group_renderer ,
    get_default_paragraph_renderer ,
    get_default_inline_renderer ,
    get_default_abstract_renderer ,
    get_default_structure_renderer ,

    OrderContexter ,
    ReferenceContexter ,

    PreprocessInformation ,

    auto_renderer ,

    PrinterWeakenText ,
    PrinterDisplayText ,
    PrinterStructureBoxText ,
    PrinterParagraphBox ,
    PrinterPartBox ,
    PrinterNewLevelBox ,
    PrinterOldLevelBox ,
    PrinterConfigContext ,

    usePrinterAllCaches ,
    usePrinterComponent ,
} from "@project-callio/calliotext"

import { LANG } from "../lang"
import {
    make_order_str ,
    make_section_ref ,
    remtimes ,
} from "../utils"
import {
    MathJaxInline ,
    MathJaxBlock ,
} from "../math"

export {
    renderers ,
    default_renderers ,
}

function wrap_prefix(prefix: string){
    return LANG == "zh" ? `（${prefix}）` : `(${prefix})`
}

/** primary：一段需要突出展示的话，比如定理。题头带编号，前缀（比如定理名）跟在题头后。 */
const primary_printer = (()=>{
    const orderer_gene = (info: PreprocessInformation<GroupNode>)=>new OrderContexter<GroupNode>(info.parameters.label)
    const reference_gene = ()=>(new ReferenceContexter<GroupNode>((info)=>{
        const order = orderer_gene(info).get_context(info.context)
        const order_str = make_order_str(order, info.parameters.ordering)
        return `${info.parameters.title} ${order_str}`
    }))

    return get_default_group_renderer({
        contexters: [
            orderer_gene ,
            reference_gene ,
        ],
        pre_element: (info: PreprocessInformation<GroupNode>) => {
            const {context, parameters} = info

            const order = orderer_gene(info).get_context(context)
            const order_str = make_order_str(order, parameters.ordering)

            let inject_content = `${parameters.title}`
            if(order_str){
                inject_content = inject_content + ` ${order_str}`
            }
            if(parameters.prefix){
                inject_content = inject_content + ` ${wrap_prefix(parameters.prefix)}`
            }

            return <PrinterStructureBoxText inline>{inject_content}</PrinterStructureBoxText>
        },
        outer: (props) => {
            return <PrinterPartBox subtitle_like>{props.children}</PrinterPartBox>
        },
    })
})()

/** attached：附属于上文的一段话，比如证明。整体缩进并弱化。 */
const attached_printer = (()=>{
    const orderer_gene = (info: PreprocessInformation<GroupNode>)=>new OrderContexter<GroupNode>(info.parameters.label)

    const make_title_content = (info: PreprocessInformation<GroupNode>) => {
        const {parameters, context} = info
        const order = orderer_gene(info).get_context(context)
        const order_str = make_order_str(order, parameters.ordering)

        let title_content = `${parameters.title}`
        if(order_str){
            title_content = title_content + ` ${order_str}`
        }
        return title_content
    }

    return get_default_group_renderer({
        contexters: [
            orderer_gene ,
        ],
        pre_element: (info: PreprocessInformation<GroupNode>) => {
            const prefix = info.parameters.prefix
            return prefix && <PrinterStructureBoxText inline>{prefix}</PrinterStructureBoxText>
        },
        inner: (props: PrinterRenderFunctionProps<GroupNode>) => {
            const {node, parameters, context} = props

            const close = parameters.close
            const title_content = make_title_content({node, parameters, env: {}, context})

            return <AutoStack force_direction="column">
                {title_content ? <PrinterStructureBoxText>{title_content}</PrinterStructureBoxText> : <></>}
                <PrinterNewLevelBox><PrinterWeakenText>{props.children}</PrinterWeakenText></PrinterNewLevelBox>
                {close ? <PrinterStructureBoxText align="right">{close}</PrinterStructureBoxText> : <></>}
            </AutoStack>
        },
    })
})()

/** item：正文中的附属条目，编号靠左展示。 */
const item_printer = (()=>{
    const orderer_gene = (info: PreprocessInformation<GroupNode>)=>new OrderContexter<GroupNode>(
        info.parameters.label,
        info.parameters.clustering || false,
    )
    const reference_gene = ()=>(new ReferenceContexter<GroupNode>((info)=>{
        const order = orderer_gene(info).get_context(info.context)
        return make_order_str(order, info.parameters.ordering)
    }))

    return get_default_group_renderer({
        small_margin_enter: true , // 前面不要空一大段。
        contexters: [
            orderer_gene ,
            reference_gene ,
        ],
        pre_element: (info: PreprocessInformation<GroupNode>) => {
            const prefix = info.parameters.prefix
            return prefix && <PrinterStructureBoxText inline>{prefix}</PrinterStructureBoxText>
        },
        aft_element: (info: PreprocessInformation<GroupNode>) => {
            const suffix = info.parameters.suffix
            return suffix && <PrinterStructureBoxText inline leftmargin>{suffix}</PrinterStructureBoxText>
        },
        inner: (props: PrinterRenderFunctionProps<GroupNode>) => {
            const {node, parameters, context} = props

            const close = parameters.close
            const order = orderer_gene({node, parameters, env: {}, context}).get_context(context)
            const order_str = make_order_str(order, parameters.ordering)

            let title_content = `${parameters.title}`
            if(order_str){
                title_content = title_content ? `${title_content} ${order_str}` : order_str
            }
            let title_jsx = <>{title_content}</>
            if(title_content.length > 5){
                title_jsx = <Typography sx={{fontSize: "0.5rem"}}>{title_content}</Typography>
            }

            return <AutoStack force_direction="column">
                <AutoStack>
                    <PrinterOldLevelBox sx={{position: "relative"}}>
                        {title_content ? <PrinterParagraphBox>{title_jsx}</PrinterParagraphBox> : <></>}
                    </PrinterOldLevelBox>
                    <Box>{props.children}</Box>
                </AutoStack>
                {close ? <PrinterStructureBoxText>{close}</PrinterStructureBoxText> : <></>}
            </AutoStack>
        },
    })
})()

/** mount：正式的整体展示，比如一段引文。短的居中，长的靠左缩进。 */
const mount_printer = (()=>{
    return get_default_group_renderer({
        inner: (props: PrinterRenderFunctionProps<GroupNode>) => {
            const {parameters} = props

            const title = parameters.title
            const close = parameters.close
            const center = !parameters.long as boolean

            let text_jsx = <PrinterDisplayText align="center">{props.children}</PrinterDisplayText>
            if(!center){
                text_jsx = <PrinterNewLevelBox sx={{position: "relative"}}>
                    <PrinterDisplayText align="left">{props.children}</PrinterDisplayText>
                </PrinterNewLevelBox>
            }

            return <AutoStack force_direction="column">
                {title ? <PrinterStructureBoxText>{title}</PrinterStructureBoxText> : <></>}
                {text_jsx}
                {close ? <PrinterStructureBoxText align="right">{close}</PrinterStructureBoxText> : <></>}
            </AutoStack>
        },
    })
})()

/** formatted：有固定格式的文本，比如代码。 */
const formatted_printer = (()=>{
    return get_default_group_renderer({
        inner: (props: PrinterRenderFunctionProps<GroupNode>) => {
            return <pre>{props.children}</pre>
        },
    })
})()

/** display：放大展示一个片段。 */
const display_printer = (()=>{
    return get_default_group_renderer({
        inner: (props: PrinterRenderFunctionProps<GroupNode>) => {
            const config = React.useContext(PrinterConfigContext)
            return <AutoStack force_direction="column">
                <PrinterDisplayText sx={{
                    fontSize  : remtimes(config?.fonts?.structure?.fontSize   as string, 1.4),
                    lineHeight: remtimes(config?.fonts?.structure?.lineHeight as string, 1.4),
                }}>{props.children}</PrinterDisplayText>
            </AutoStack>
        },
    })
})()

/** subsection：小节内部的小小节，只有一个带编号的标题。 */
const subsection_printer = (()=>{
    const orderer_gene = (info: PreprocessInformation<GroupNode>)=>new OrderContexter<GroupNode>(info.parameters.label)

    return get_default_group_renderer({
        contexters: [orderer_gene],
        outer: (props: PrinterRenderFunctionProps<GroupNode>) => {
            const {node, context, parameters, children} = props

            const order = orderer_gene({node, parameters, context, env: {}}).get_context(context)
            let order_str = make_order_str(order, parameters.ordering)
            order_str = order_str ? order_str + " " : order_str

            return <PrinterPartBox>
                <PrinterPartBox subtitle_like>{order_str}{parameters.title}</PrinterPartBox>
                {children}
            </PrinterPartBox>
        },
    })
})()

/** sectioner：小节线。 */
const sectioner_printer = (()=>{
    const orderer_gene = (info: PreprocessInformation<SupportNode>)=>new OrderContexter<SupportNode>(info.parameters.label)
    const reference_gene = ()=>(new ReferenceContexter<SupportNode>((info)=>{
        const order = orderer_gene(info).get_context(info.context)
        return make_section_ref(order)
    }))

    return auto_renderer<SupportNode>({
        contexters: [orderer_gene, reference_gene],
        render_function: (props: PrinterRenderFunctionProps<SupportNode>)=>{
            const {node, parameters, context} = props
            const order = orderer_gene({node, parameters, context, env: {}}).get_context(context)
            const title = parameters.title
            const alone = parameters.alone

            // 唯一的小节不显示编号。
            const order_word = alone ? <></> : <PrinterStructureBoxText inline>{make_section_ref(order)}</PrinterStructureBoxText>
            const title_word = title ? <PrinterStructureBoxText inline sx={{marginRight: 0}}>{title}</PrinterStructureBoxText> : <></>
            return <Divider>{order_word}{title_word}</Divider>
        },
    })
})()

/** ender：章节线。 */
const ender_printer = (()=>{
    return auto_renderer<SupportNode>({
        render_function: () => {
            return <Divider />
        },
    })
})()

const strong_printer = (()=>{
    return get_default_inline_renderer({
        outer: (props: PrinterRenderFunctionProps<InlineNode>) => {
            return <strong>{props.children}</strong>
        },
    })
})()

const delete_printer = (()=>{
    return get_default_inline_renderer({
        outer: (props: PrinterRenderFunctionProps<InlineNode>) => {
            return <del>{props.children}</del>
        },
    })
})()

/** 链接：target 是文档内节点的 idx 时渲染成内部引用（autotext 为真则文字取
 * 被引节点在 ReferenceContexter 里登记的引用名，点击滚动到目标），否则当作外链。
*/
const link_printer = (()=>{
    return get_default_inline_renderer({
        outer: (props: PrinterRenderFunctionProps<InlineNode>) => {
            const {parameters, children} = props
            const target = parameters.target as string
            const autotext = parameters.autotext as boolean

            const caches = usePrinterAllCaches()
            const printer_component = usePrinterComponent()

            const reference = target ? caches[target]?.["__reference"] : undefined
            if(reference != undefined){
                return <Link
                    component="button"
                    sx={{verticalAlign: "baseline"}}
                    onClick={()=>printer_component.scroll_to_idx(target)}
                >{autotext ? reference : children}</Link>
            }
            return <Link href={target || undefined} target="_blank" rel="noopener">{children}</Link>
        },
    })
})()

const mathinline_printer = (()=>{
    return get_default_inline_renderer({
        outer: (props: PrinterRenderFunctionProps<InlineNode>) => {
            // 取消原本的 children、直接将文本序列化：印刷器为了定位元素
            // 添加的空白 span 会阻碍 MathJax 的处理。
            return <Box component="span" sx={{paddingX: "0.1rem"}}>
                <MathJaxInline>{Slate.Node.string(props.node)}</MathJaxInline>
            </Box>
        },
    })
})()

const mathblock_printer = (()=>{
    return get_default_group_renderer({
        inner: (props: PrinterRenderFunctionProps<GroupNode>) => {
            let value = Slate.Node.string(props.node)
            const suffix = props.parameters.suffix
            const environ = props.parameters.environ
            const environ_enter = environ ? `\\begin{${environ}}` : ""
            const environ_exit  = environ ? `\\end{${environ}}`   : ""

            const suffix_part = suffix ? `\\text{${suffix}}` : ""
            value = `${environ_enter}${value}${suffix_part}${environ_exit}`

            return <React.Fragment>
                {props.context.anchor}
                <MathJaxBlock>{value}</MathJaxBlock>
            </React.Fragment>
        },
    })
})()

const image_printer = (()=>{
    return get_default_inline_renderer({
        outer: (props: PrinterRenderFunctionProps) => {
            const {parameters} = props

            const target = parameters.target
            const width = parameters.width
            const height = parameters.height

            return <img src={target || undefined} style={{
                width : width  > 0 ? `${width}rem`  : "100%",
                height: height > 0 ? `${height}rem` : "100%",
            }}/>
        },
    })
})()

const columns_printer = (()=>{
    function get_widths(node: StructNode, parameters: ProcessedParameterList){
        const widths_str = parameters.widths || ""
        let widths = widths_str.split(",").map(
            (x: string)=>(x == "" ? 1 : parseInt(x))
        ) as number[]
        if(widths.length > node.children.length){
            widths = widths.slice(0, node.children.length)
        }
        while(widths.length < node.children.length){
            widths.push(1)
        }
        return widths
    }
    return get_default_structure_renderer({
        inner(props){
            const {node, parameters} = props
            const widths = get_widths(node, parameters)
            const sum = widths.reduce((s, x)=>s + x, 0)
            return <Grid container columns={sum} sx={{width: "100%"}} spacing={2}>{props.children}</Grid>
        },
        subinner(props){
            const {node, parameters, subidx} = props
            const widths = get_widths(node, parameters)
            const my_width = widths[subidx]
            return <Grid size={{xs: my_width}} sx={{align: "center"}}>{props.children}</Grid>
        },
    })
})()

const note_printer = (()=>{
    return get_default_abstract_renderer({})
})()

const default_renderer_block = new PrinterRenderer({
    renderer(props: PrinterRenderFunctionProps): React.ReactElement<PrinterRenderFunctionProps>{
        return <div>{props.children}</div>
    },
})

const default_renderer_inline = new PrinterRenderer({
    renderer(props: PrinterRenderFunctionProps): React.ReactElement<PrinterRenderFunctionProps>{
        return <span>{props.children}</span>
    },
})

const default_renderer_text = new PrinterRenderer({
    renderer(props: PrinterRenderFunctionProps): React.ReactElement<PrinterRenderFunctionProps>{
        const node = props.node as TextNode
        return <span>{node.text}</span>
    },
})

const renderers = {
    "group": {
        "primary"   : primary_printer ,
        "attached"  : attached_printer ,
        "item"      : item_printer ,
        "mount"     : mount_printer ,
        "display"   : display_printer ,
        "formatted" : formatted_printer ,
        "mathblock" : mathblock_printer ,
        "subsection": subsection_printer ,
    },
    "inline": {
        "strong": strong_printer ,
        "delete": delete_printer ,
        "link"  : link_printer ,
        "math"  : mathinline_printer ,
    },
    "support": {
        "sectioner": sectioner_printer ,
        "ender"    : ender_printer ,
        "image"    : image_printer ,
    },
    "abstract": {
        "note": note_printer ,
    },
    "structure": {
        "columns": columns_printer ,
    },
}

const default_renderers = {
    "group"     : default_renderer_block ,
    "structure" : default_renderer_block ,
    "support"   : default_renderer_block ,
    "abstract"  : default_renderer_block ,
    "paragraph" : get_default_paragraph_renderer({}) ,
    "inline"    : default_renderer_inline ,
    "text"      : default_renderer_text ,
}
