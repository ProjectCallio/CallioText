/** 这个模块定义editor的组件。
 * @module
 */
import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"

import {
    Node , 
    GroupNode , 
    InlineNode , 
    StructNode ,
    AbstractNode , 
    SupportNode , 
    ParagraphNode , 
    TextNode , 
    ParameterList,
    ConceptNode, 
    AllNodeTypes, 
    NonLeafNode, 

    AllConceptTypes, 
} from "../core"

import {
    Printer, 
} from "../printer"

import {
    EditorRenderer , 
} from "./editor_renderer"

import {
    slate_is_paragraph , 
    slate_is_text , 
} from "./utils"


import {
    gene_idx , 
} from "../utils"

export {
    EditorCore , 
}
export type {
    EditorRendererDict , 
    EditorDefaultRendererDict , 
}

/** 用来保存概念的编辑器渲染。 */
interface EditorRendererDict{
    "group"     : {[name: string] : EditorRenderer<GroupNode>} , 
    "inline"    : {[name: string] : EditorRenderer<InlineNode>} , 
    "support"   : {[name: string] : EditorRenderer<SupportNode>} , 
    "structure" : {[name: string] : EditorRenderer<StructNode>} , 
    "abstract"  : {[name: string] : EditorRenderer<AbstractNode>} , 
}

/** 编辑器的默认渲染。 */
interface EditorDefaultRendererDict{
    "group"     : EditorRenderer , 
    "inline"    : EditorRenderer , 
    "support"   : EditorRenderer , 
    "structure" : EditorRenderer , 
    "abstract"  : EditorRenderer , 
    "paragraph" : EditorRenderer , 
    "text"      : EditorRenderer , 
}

/** 编辑器核心。
 * 要创建一个编辑器，需要对每个一级概念指定一个渲染器。
 */
class EditorCore{
    renderers        : EditorRendererDict 
    default_renderers: EditorDefaultRendererDict 
    printer          : Printer

    constructor(params: {
        renderers: EditorRendererDict , 
        default_renderers: EditorDefaultRendererDict, 
        printer: Printer , 
    }){
        this.renderers          = params.renderers 
        this.default_renderers  = params.default_renderers 
        this.printer            = params.printer 
    }

    get_sec_concept_list(type: AllConceptTypes){
        return Object.keys( this.printer.second_class_concepts[type] )
    }

    get_fst_concept_list(type: AllConceptTypes){
        return Object.keys( this.printer.first_class_concepts[type] )
    }

    get_printer(){
        return this.printer
    }


    /** 从一级概念查询一个渲染器。
     * @param type 查找的节点类型。
     * @param fst_concept 查找的概念名称。
     * 如果`type == "paragraph" || "text"`，那么`fst_concept`将会被忽略。
     * 反之，如果`type != "paragraph" && type != "text"`，那么`name`必须提供。
     */
    get_first_renderer(type: AllNodeTypes , fst_concept?: string): EditorRenderer{
        if(type == "paragraph" || type == "text"){
            return this.default_renderers[type]
        }
        if(!fst_concept){
            return this.default_renderers[type]
        }

        let ret = this.renderers[type][fst_concept]
        if(!ret){ // 如果没有找到这个概念的渲染器，就返回一个这个概念类型的默认渲染器。
            ret = this.default_renderers[type]
        }
        return ret as EditorRenderer
    }
    /** 从二级概念查询一个渲染器。
     * @param type 查找的节点类型。
     * @param sec_concept 查找的概念名称。
     * 如果`type == "paragraph" || "text"`，那么`sec_concept`将会被忽略。
     * 反之，如果`type != "paragraph" && type != "text"`，那么`sec_concept`必须提供。
     */
    get_second_renderer(type: AllNodeTypes , sec_concept?: string): EditorRenderer{
        if(type == "paragraph" || type == "text"){
            return this.get_first_renderer(type, sec_concept)
        }
        if(!sec_concept){
            return this.default_renderers[type]
        }
        let printer  = this.get_printer()
        let sec_ccpt = printer.get_second_concept(type, sec_concept)
        if(!sec_ccpt){
            return this.default_renderers[type]
        }

        let first_concept_name  = sec_ccpt.first_concept
        let fst_ccpt            = printer.get_first_concept(type, first_concept_name)
        if(!fst_ccpt){
            return this.default_renderers[type]
        }
        return this.get_first_renderer(type, fst_ccpt.name)
    }

    /** 这个函数直接从一个节点查询渲染器。 */
    get_node_renderer(node: Node & Slate.Node): EditorRenderer{
        let me = this
        if(slate_is_text(node)){ // 如果是文本节点，直接按类型查询。
            return me.get_first_renderer("text")
        }
        else if(slate_is_paragraph(node)){ // 如果是段落节点，直接按类型查询。
            return me.get_first_renderer("paragraph")
        }
        let concept = me.printer.get_node_first_concept(node)
        let concept_name = concept ? concept.name : undefined
        return me.get_first_renderer(node.type , concept_name) // 如果是概念节点，按类型和一级概念名查询。
    }

    /** 新建一个文本节点。 */
    create_text(text: string = ""): TextNode{
        return {
            text: text
        }
    }

    /** 新建一个段落节点。 */
    create_paragraph(text: string = ""): ParagraphNode{
        const me = this
        return {
            children: [this.create_text(text)]
        }
    }

    /** 新建一个组节点。 */
    create_group(name: string, relation: "separating" | "chaining" = "separating"): GroupNode{
        const me = this
        const sec_concept = this.printer.get_second_concept("group" , name)
        const parameters = sec_concept == undefined ? {} : {...sec_concept.default_override}

        return {
            type: "group" , 
            idx: gene_idx() , 
            concept: name , 
            parameters: parameters , 
            relation: relation , 
            children: [me.create_paragraph("")] , 
            abstract: [] , 
        }
    }

    /** 新建一个行内节点。 */
    create_inline(name: string, text: string = ""): InlineNode{
        const me = this
        const sec_concept = this.printer.get_second_concept("inline" , name)
        const parameters = sec_concept == undefined ? {} : {...sec_concept.default_override}

        return {
            type: "inline" , 
            idx: gene_idx() , 
            concept: name , 
            parameters: parameters , 
            children: [me.create_text(text)] , 
            abstract: [] , 
        }
    }

    /** 新建一个支撑节点。 */
    create_support(name: string): SupportNode{
        const me = this
        const sec_concept = this.printer.get_second_concept("support" , name)
        const parameters = sec_concept == undefined ? {} : {...sec_concept.default_override}

        return {
            type: "support" , 
            idx: gene_idx() , 
            concept: name , 
            parameters: parameters , 
            children: [{text: ""}] , 
            abstract: [] , 
        }
    }

    /** 新建一个结构节点。 */
    create_structure(name: string, relation: "separating" | "chaining" = "separating"): StructNode{
        const me = this
        const sec_concept = this.printer.get_second_concept("structure" , name)
        const parameters = sec_concept == undefined ? {} : {...sec_concept.default_override}

        return {
            type: "structure" , 
            idx: gene_idx() , 
            concept: name , 
            parameters: parameters , 
            children: [this.create_group("_auxiliary", "chaining")] , 
            abstract: [] , 
            relation: relation , 
        }
    }

    /** 新建一个抽象节点。 */
    create_abstract(name: string): AbstractNode{
        const me = this
        const sec_concept = this.printer.get_second_concept("abstract" , name)
        const parameters = sec_concept == undefined ? {} : {...sec_concept.default_override}

        return {
            type: "abstract" , 
            idx: gene_idx() , 
            concept: name , 
            parameters: parameters , 
            children: [me.create_paragraph("")] , 
            abstract: [] , 
        }
    }

    get_meta_param(node: Slate.Element & ConceptNode){
        let concpt = this.printer.get_node_first_concept(node)
        return concpt && concpt.meta_parameters
    }

    is_auxiliary_node(node: ConceptNode & Slate.Node): boolean{
        if(node.concept == "root"){
            return false
        }
        const type = node.type
        const printer = this.get_printer()
        let sec_ccpt = printer.get_second_concept(type, node.concept)

        if(!sec_ccpt){ // 找不到对应的第一类概念
            return true
        }
        return false
    }
    
}

