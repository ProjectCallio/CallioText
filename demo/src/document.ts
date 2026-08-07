/** 构造初始文档：一篇关于导数的短文，中英文各一个版本。
 * 节点一律通过 EditorCore 的工厂方法创建，保证参数和概念定义一致。
*/
import {
    EditorCore ,
    AbstractNode ,
    GroupNode ,
    SupportNode ,
    InlineNode ,
    ParagraphNode ,
    TextNode ,
    ConceptNode ,
} from "@project-callio/calliotext"

import { LANG } from "./lang"
import { CN } from "./concepts/second_concepts"

export { build_document }

type ParagraphChild = TextNode | InlineNode

function text(t: string): TextNode{
    return {text: t}
}

function paragraph(...children: ParagraphChild[]): ParagraphNode{
    return {children}
}

/** 设置节点的一个参数的值，类型按值推断。 */
function set_param(node: ConceptNode, key: string, val: string | number | boolean){
    node.parameters = {
        ...node.parameters,
        [key]: {
            type: typeof val as "string" | "number" | "boolean",
            val: val,
        } as never,
    }
    return node
}

function build_document(core: EditorCore): AbstractNode{

    function inline(concept: string, t: string): InlineNode{
        return core.create_inline(concept, t)
    }
    function math(t: string): InlineNode{
        return inline(CN.math, t)
    }
    function link(t: string, target: string): InlineNode{
        const node = inline(CN.link, t)
        set_param(node, "target", target)
        return node
    }
    /** 指向文档内节点的引用链接：文字由被引节点的编号自动生成。 */
    function ref_link(t: string, target_idx: string): InlineNode{
        const node = link(t, target_idx)
        set_param(node, "autotext", true)
        return node
    }
    function empty_paragraph(): ParagraphNode{
        return paragraph(text(""))
    }
    function group(concept: string, children: (ParagraphNode | GroupNode)[], relation: "separating" | "chaining" = "separating"): GroupNode{
        const node = core.create_group(concept, relation)
        node.children = children as GroupNode["children"]
        return node
    }
    function mathblock(tex: string): GroupNode{
        return group(CN.mathblock, [paragraph(text(tex))])
    }
    function section(title: string): SupportNode{
        const node = core.create_support(CN.section)
        set_param(node, "title", title)
        return node
    }
    function footnote(t: string): AbstractNode{
        const node = core.create_abstract(CN.footnote)
        node.children = [paragraph(text(t))]
        return node
    }

    const root: AbstractNode = {
        type: "abstract",
        concept: "root",
        idx: "root",
        parameters: {
            title: {type: "string", val: LANG == "zh" ? "导数" : "The Derivative"},
        },
        abstract: [],
        children: LANG == "zh" ? zh_children() : en_children(),
    }
    return root

    function en_children(): AbstractNode["children"]{
        const theorem = group(CN.theorem, [
            paragraph(
                text("If "), math("f"), text(" and "), math("g"),
                text(" are differentiable at "), math("x"),
                text(", then so is their product, and"),
            ),
        ])
        theorem.idx = "thm-product" // 固定 idx，供文中的引用链接指向。
        set_param(theorem, "category", "Theorem")
        set_param(theorem, "alias", "product rule")
        theorem.children.push(mathblock("(fg)'(x) = f'(x)\\,g(x) + f(x)\\,g'(x)."))
        theorem.abstract.push(footnote("Also called the Leibniz rule."))

        return [
            section("How to Use This Demo"),
            paragraph(
                text("This is the live demo of CallioText. The column you are reading is the typeset output; the column on the left is the editor that produces it, and the output updates as you edit."),
            ),
            paragraph(
                text("Below is a preloaded short note on the derivative. Its definitions, theorems and proofs are not styled text but nodes with semantics: numbering and cross references are maintained by the system. Some things to try:"),
            ),
            group(CN.item, [
                paragraph(
                    text("Click into the left column and edit the text; the right column follows."),
                ),
            ]),
            group(CN.item, [
                paragraph(
                    text("Put the cursor in the text and hold "), inline(CN.emphasis, "Alt+X"),
                    text(" to move the cursor onto the Insert Concept panel; pick a concept with the arrow keys and press Enter to insert it. Insert a new theorem before the existing one, and every number behind it updates."),
                ),
            ], "chaining"),
            group(CN.item, [
                paragraph(
                    text("Put the cursor inside a concept and hold "), inline(CN.emphasis, "Alt+Z"),
                    text(" to move the cursor onto the Edit Parameters panel and change that node's parameters, for example turn the theorem into a lemma. Only concepts that carry parameters have anything to change there."),
                ),
            ], "chaining"),
            group(CN.item, [
                paragraph(
                    text("Click the theorem reference in the remark at the end; the page scrolls to the theorem it points to."),
                ),
            ], "chaining"),
            group(CN.item, [
                paragraph(
                    text("Use Export JSON in the top bar to download the document tree and see what the document itself looks like."),
                ),
            ], "chaining"),
            empty_paragraph(),

            section("Definition"),
            paragraph(
                text("The derivative describes how a function changes near a point. Among the ideas of calculus it is the most local one: it looks at nothing but a small neighborhood."),
            ),
            (()=>{
                const definition = group(CN.definition, [
                    paragraph(
                        text("Let "), math("f"), text(" be defined near "), math("x_0"),
                        text(". If the limit"),
                    ),
                ])
                set_param(definition, "alias", "derivative")
                definition.children.push(mathblock("f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h}"))
                definition.children.push(paragraph(
                    text("exists, we say that "), math("f"), text(" is "),
                    inline(CN.emphasis, "differentiable"), text(" at "), math("x_0"),
                    text(", and call the limit the derivative of "), math("f"),
                    text(" at "), math("x_0"), text("."),
                ))
                return definition
            })(),
            paragraph(text("Two immediate observations:")),
            group(CN.item, [
                paragraph(
                    text("Differentiability is stronger than continuity: if "),
                    math("f'(x_0)"), text(" exists, then "), math("f"),
                    text(" is continuous at "), math("x_0"), text("."),
                ),
            ]),
            group(CN.item, [
                paragraph(
                    text("Differentiation is linear: "),
                    math("(af + bg)' = af' + bg'"), text("."),
                ),
            ], "chaining"),
            empty_paragraph(),

            section("The Product Rule"),
            empty_paragraph(),
            theorem,
            group(CN.proof, [
                paragraph(
                    text("Write the difference quotient of "), math("fg"),
                    text(" and add and subtract "), math("f(x+h)\\,g(x)"), text(":"),
                ),
                mathblock("\\frac{f(x+h)g(x+h) - f(x)g(x)}{h} = f(x+h)\\,\\frac{g(x+h)-g(x)}{h} + \\frac{f(x+h)-f(x)}{h}\\,g(x)."),
                paragraph(
                    text("Let "), math("h \\to 0"),
                    text(". The first term tends to "), math("f(x)\\,g'(x)"),
                    text(" and the second to "), math("f'(x)\\,g(x)"),
                    text(", which is the claim."),
                ),
            ], "chaining"),
            empty_paragraph(),
            group(CN.remark, [
                paragraph(
                    text("In Leibniz notation the rule reads "),
                    math("\\mathrm{d}(uv) = u\\,\\mathrm{d}v + v\\,\\mathrm{d}u"),
                    text(". See the "),
                    link("Wikipedia article", "https://en.wikipedia.org/wiki/Product_rule"),
                    text(" for its history."),
                ),
                paragraph(
                    text("Applying "),
                    ref_link("Theorem", "thm-product"),
                    text(" repeatedly gives the rule for a product of any number of functions."),
                ),
            ]),
            empty_paragraph(),
            (()=>{
                const quote = group(CN.quote, [
                    paragraph(text("The calculus was the first achievement of modern mathematics, and it is difficult to overestimate its importance.")),
                ])
                set_param(quote, "close", "John von Neumann")
                set_param(quote, "long", true)
                return quote
            })(),
            empty_paragraph(),
            core.create_support(CN.end),
        ] as AbstractNode["children"]
    }

    function zh_children(): AbstractNode["children"]{
        const theorem = group(CN.theorem, [
            paragraph(
                text("若 "), math("f"), text(" 与 "), math("g"),
                text(" 都在 "), math("x"),
                text(" 处可导，则它们的乘积也在该处可导，且"),
            ),
        ])
        theorem.idx = "thm-product" // 固定 idx，供文中的引用链接指向。
        set_param(theorem, "category", "定理")
        set_param(theorem, "alias", "乘积法则")
        theorem.children.push(mathblock("(fg)'(x) = f'(x)\\,g(x) + f(x)\\,g'(x)."))
        theorem.abstract.push(footnote("也称莱布尼茨法则。"))

        return [
            section("使用说明"),
            paragraph(
                text("这是 CallioText 的在线演示。你正在读的这一栏是印刷出来的成品，左边一栏是产生它的编辑器，编辑之后右边会自动更新。"),
            ),
            paragraph(
                text("下面预置了一篇关于导数的短文。文中的定义、定理、证明不是带样式的文字，而是带语义的节点：编号和交叉引用都由系统维护。可以试试这些操作："),
            ),
            group(CN.item, [
                paragraph(
                    text("点进左边的编辑器修改文字，右边会跟着变化。"),
                ),
            ]),
            group(CN.item, [
                paragraph(
                    text("把光标放进正文，按住 "), inline(CN.emphasis, "Alt+X"),
                    text(" 把光标移到「插入概念」面板上，用方向键选择、回车插入。在现有定理前面插入一个新的定理，后面的编号会全部自动更新。"),
                ),
            ], "chaining"),
            group(CN.item, [
                paragraph(
                    text("把光标放进某个概念节点，按住 "), inline(CN.emphasis, "Alt+Z"),
                    text(" 把光标移到「修改参数」面板上，修改这个节点的参数，比如把定理的类别改成引理。只有本身带参数的概念才有参数可改。"),
                ),
            ], "chaining"),
            group(CN.item, [
                paragraph(
                    text("点击文末注里对定理的引用，页面会滚动到被引用的定理。"),
                ),
            ], "chaining"),
            group(CN.item, [
                paragraph(
                    text("用顶栏的「导出 JSON」下载整棵文档树，看看文档本身长什么样。"),
                ),
            ], "chaining"),
            empty_paragraph(),

            section("定义"),
            paragraph(
                text("导数刻画函数在一点附近的变化。在微积分的诸多概念中，它是最「局部」的一个：它只关心一个很小的邻域。"),
            ),
            (()=>{
                const definition = group(CN.definition, [
                    paragraph(
                        text("设 "), math("f"), text(" 在 "), math("x_0"),
                        text(" 附近有定义。若极限"),
                    ),
                ])
                set_param(definition, "alias", "导数")
                definition.children.push(mathblock("f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h}"))
                definition.children.push(paragraph(
                    text("存在，就说 "), math("f"), text(" 在 "), math("x_0"),
                    text(" 处"), inline(CN.emphasis, "可导"),
                    text("，并把这个极限称为 "), math("f"), text(" 在 "), math("x_0"),
                    text(" 处的导数。"),
                ))
                return definition
            })(),
            paragraph(text("两条直接的观察：")),
            group(CN.item, [
                paragraph(
                    text("可导强于连续：若 "), math("f'(x_0)"),
                    text(" 存在，则 "), math("f"), text(" 在 "), math("x_0"),
                    text(" 处连续。"),
                ),
            ]),
            group(CN.item, [
                paragraph(
                    text("求导是线性的："),
                    math("(af + bg)' = af' + bg'"), text("。"),
                ),
            ], "chaining"),
            empty_paragraph(),

            section("乘积法则"),
            empty_paragraph(),
            theorem,
            group(CN.proof, [
                paragraph(
                    text("写出 "), math("fg"),
                    text(" 的差商，加上再减去 "), math("f(x+h)\\,g(x)"), text("："),
                ),
                mathblock("\\frac{f(x+h)g(x+h) - f(x)g(x)}{h} = f(x+h)\\,\\frac{g(x+h)-g(x)}{h} + \\frac{f(x+h)-f(x)}{h}\\,g(x)."),
                paragraph(
                    text("令 "), math("h \\to 0"),
                    text("，第一项趋于 "), math("f(x)\\,g'(x)"),
                    text("，第二项趋于 "), math("f'(x)\\,g(x)"),
                    text("，这正是要证的结论。"),
                ),
            ], "chaining"),
            empty_paragraph(),
            group(CN.remark, [
                paragraph(
                    text("用莱布尼茨记号，乘积法则写作 "),
                    math("\\mathrm{d}(uv) = u\\,\\mathrm{d}v + v\\,\\mathrm{d}u"),
                    text("。它的来历可以参看"),
                    link("维基百科的条目", "https://zh.wikipedia.org/wiki/%E4%B9%98%E7%A7%AF%E6%B3%95%E5%88%99"),
                    text("。"),
                ),
                paragraph(
                    text("反复应用"),
                    ref_link("定理", "thm-product"),
                    text("，就得到任意多个函数乘积的求导法则。"),
                ),
            ]),
            empty_paragraph(),
            (()=>{
                const quote = group(CN.quote, [
                    paragraph(text("宇宙之大，粒子之微，火箭之速，化工之巧，地球之变，生物之谜，日用之繁，无处不用数学。")),
                ])
                set_param(quote, "close", "华罗庚")
                set_param(quote, "long", true)
                return quote
            })(),
            empty_paragraph(),
            core.create_support(CN.end),
        ] as AbstractNode["children"]
    }
}
