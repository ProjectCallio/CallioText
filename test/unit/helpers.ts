/** 单元测试共用的节点构造工具。 */
import type {
    AbstractNode ,
    GroupNode ,
    InlineNode ,
    ParagraphNode ,
    StructNode ,
    SupportNode ,
    TextNode ,
} from "../../lib/core"

export {
    text ,
    paragraph ,
    inline ,
    group ,
    support ,
    struct ,
    abstract ,
}

let counter = 0
function next_idx(){
    counter ++
    return `test-idx-${counter}`
}

function text(t: string = "hello"): TextNode {
    return {text: t}
}

function paragraph(children: ParagraphNode["children"] = [text()]): ParagraphNode {
    return {children}
}

function inline(over: Partial<InlineNode> = {}): InlineNode {
    return {
        type: "inline" ,
        idx: next_idx() ,
        concept: "test-inline" ,
        parameters: {} ,
        children: [text()] ,
        abstract: [] ,
        ...over ,
    }
}

function group(over: Partial<GroupNode> = {}): GroupNode {
    return {
        type: "group" ,
        idx: next_idx() ,
        concept: "test-group" ,
        parameters: {} ,
        children: [paragraph()] ,
        abstract: [] ,
        relation: "separating" ,
        ...over ,
    }
}

function support(over: Partial<SupportNode> = {}): SupportNode {
    return {
        type: "support" ,
        idx: next_idx() ,
        concept: "test-support" ,
        parameters: {} ,
        children: [{text: ""}] ,
        abstract: [] ,
        ...over ,
    }
}

function struct(over: Partial<StructNode> = {}): StructNode {
    return {
        type: "structure" ,
        idx: next_idx() ,
        concept: "test-structure" ,
        parameters: {} ,
        children: [group()] ,
        abstract: [] ,
        relation: "separating" ,
        ...over ,
    }
}

function abstract(over: Partial<AbstractNode> = {}): AbstractNode {
    return {
        type: "abstract" ,
        idx: next_idx() ,
        concept: "test-abstract" ,
        parameters: {} ,
        children: [paragraph()] ,
        abstract: [] ,
        ...over ,
    }
}
