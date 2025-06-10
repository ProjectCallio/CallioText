/** 这个模块定义editor的组件。
 * @module
 */
import React from "react"
import * as Slate from "slate"
import * as SlateReact from "slate-react"
import { withHistory } from "slate-history"
import produce from "immer"

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

    find_node_by_path , 
} from "../core"

import {
    slate_is_concept , 
} from "./utils"

import {
    EditorPlugin , 
    with_ytext_plugins , 
    set_normalize_status , 
    get_normalize_status , 
} from "./plugins"

import {
    tree_op_mixin
} from "./treeopmixin"
import { UnexpectedParametersError } from "../uibase/exceptions"

import {
    EditorGlobalInfo , 
} from "./globalinfo"

import {
    handle_copy , 
    handle_paste , 
} from "./handle_copypaste"

import {
    EditorCore  ,
} from "./editorcore"

export {
    EditorComponent , 
}
export type {
    EditorComponentProps , 
}

/**
 * 这个函数给slate编辑器添加一个应用操作之后触发回调的功能。
 * @param editor 
 */
function with_apply_callbacks(
    editor: SlateReact.ReactEditor  & { __next_apply_callbacks?: (() => void)[] }
){
    const originalApply = editor.apply

    editor.__next_apply_callbacks = []
  
    editor.apply = (op) => {
        originalApply(op)
        if(!editor.__next_apply_callbacks?.length){
            return
        }

        while (editor.__next_apply_callbacks!.length > 0) {
            const cb = editor.__next_apply_callbacks!.shift()
            if (cb) cb()
        }
    }
  
    return editor
}

type TreeOpeationsMixins = {
    set_node            : <NT extends Slate.Node & ConceptNode>                         (node: NT, new_val: Partial<NT>         ) => void
    set_node_by_path    : <NT extends Slate.Node & ConceptNode>                         (path:number[] , new_val: Partial<NT>   ) => void
    auto_set_parameter  : <NT extends Slate.Node & ConceptNode>                         (node: NT, parameters: ParameterList    ) => void
    delete_concept_node : <NT extends Slate.Node & ConceptNode>                         (node: NT                               ) => void
    delete_node_by_path : <NT extends Slate.Node              >                         (path: number[]                         ) => void
    delete_nodes_by_paths:<NT extends Slate.Node              >                         (paths: number[][]                      ) => void
    move_concept_node   : <NT extends Slate.Node & ConceptNode>                         (node_from: NT, posto: number[]         ) => void
    unwrap_node         : <NT extends Slate.Node & ConceptNode>                         (node: NT                               ) => void
    move_node_by_path   : <NT extends Slate.Node              >                         (posf: number[], posto: number[]        ) => void
    add_nodes           : <NT extends Slate.Node              >                         (nodes: (NT[]) | NT, path: number[]     ) => void
    add_nodes_before    : <NT extends Slate.Node, TT extends Slate.Node & ConceptNode>  (nodes: (NT[]) | NT, target_node: TT    ) => void
    add_nodes_after     : <NT extends Slate.Node, TT extends Slate.Node & ConceptNode>  (nodes: (NT[]) | NT, target_node: TT    ) => void
    add_nodes_here      : <NT extends Slate.Node              >                         (nodes: (NT[]) | NT                     ) => void
    replace_nodes       : <NT extends Slate.Node & ConceptNode, ST extends Slate.Node>  (father_node: NT, nodes: ST[]           ) => void
    wrap_selected_nodes : <NT extends Slate.BaseElement       >                         (node: NT, options:{
                                                                                            match?: (n:Slate.Node)=>boolean , 
                                                                                            split?: boolean , 
                                                                                        }) => void
    wrap_nodes          : <NT extends Slate.BaseElement       >                         (node: NT, from: Slate.Point, to: Slate.Point, 
                                                                                        options:{
                                                                                            match?: (n:Slate.Node)=>boolean , 
                                                                                            split?: boolean , 
                                                                                        }) => void
}

interface EditorComponentProps{
    editorcore: EditorCore 

    plugin?: EditorPlugin

    init_rootchildren?: (SlateReact.ReactEditor & AbstractNode)["children"] 

    init_rootproperty?: Omit<AbstractNode , "children">

    /** 节点树更新时的回调。 */
    onUpdate?: (v: any) => void

    /** 按键按下的回调。 */
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 按键弹起的回调。 */
    onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 改变光标位置的回调。 */
    onFocusChange?: (editor?: EditorComponent)=>void
    
}
interface EditorComponent extends TreeOpeationsMixins{

    /** 节点树更新时的回调。 */
    onUpdate: (v: any) => void

    /** 按键按下的回调。 */
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 按键弹起的回调。 */
    onKeyUp: (e: React.KeyboardEvent<HTMLDivElement>) => void

    /** 改变光标位置的回调。 */
    onFocusChange: (editor?: EditorComponent)=>void
}

/**
 * 因为slate实际上是编辑`root`的`children`，所以`root`的property要单独处理。
 */
class EditorComponent extends React.Component<EditorComponentProps , {
    root_property: Omit<AbstractNode , "children">
    slate: SlateReact.ReactEditor

}>{

    constructor(props:EditorComponentProps){
        super(props)

        this.onUpdate       = props.onUpdate        ?? (()=>{})
        this.onKeyDown      = props.onKeyDown       ?? (()=>{})
        this.onKeyUp        = props.onKeyUp         ?? (()=>{})
        this.onFocusChange  = props.onFocusChange   ?? (()=>{})
        this.use_tree_op_mixin()
        
        let me = this
        
        let with_outer_plugin = props.plugin || ((x,y)=>y)
        
        let default_root = this.get_core().create_abstract("root") as AbstractNode
        let [default_root_children, default_root_but_children] = (()=>{
            let {children, ..._} = default_root
            return [children, _] // 把默认根节点拆成儿子和非儿子的部分。
        })()
        

        this.state = {
            root_property: props.init_rootproperty || default_root_but_children , 
            slate: with_apply_callbacks(
                with_outer_plugin(me , 
                with_ytext_plugins(me , 
                withHistory(
                    SlateReact.withReact(
                        Slate.createEditor() as SlateReact.ReactEditor
                    ) 
                ))))
        }

        this.renderElement = this.renderElement.bind(this)
        this.renderLeaf    = this.renderLeaf.bind(this)
    }

    /** 添加一个在下一个apply之后执行的回调。 */
    add_apply_callback(cb: ()=>void){
        let slate = this.get_slate()
        if((slate as any).__next_apply_callbacks){
            (slate as any).__next_apply_callbacks.push(cb)
        }
    }
    
    get_core(){
        return this.props.editorcore
    }

    /** 将`root_children`和`root_property`组合成一棵树。 */
    get_root(): Readonly<AbstractNode>{
        let slate = this.get_slate()
        return {
            ...this.state.root_property ,
            children: slate.children as (SlateReact.ReactEditor & AbstractNode)["children"] , 
        }
    }

    get_node_by_path(path: number[]): Node | undefined{
        return find_node_by_path(this.get_root() , path)
    }
    get_cur_node(): Node | undefined{
        let slate = this.get_slate()
        let path = slate.selection?.anchor?.path
        if(path == undefined){
            return undefined
        }
        return find_node_by_path(this.get_root() , path)
    }

    set_root(root_property: Omit<Partial<AbstractNode>, "children">){
        this.setState({root_property: {...this.state.root_property , ...root_property}})
    }

    get_editorcore(){
        return this.get_core()
    }

    get_slate(){
        return this.state.slate
    }

    use_tree_op_mixin(){
        let me = this
        this.set_node               = (node, new_val        ) => tree_op_mixin.set_node             (me , node, new_val)
        this.set_node_by_path       = (path , new_val       ) => tree_op_mixin.set_node_by_path     (me,path, new_val)
        this.auto_set_parameter     = (node, parameters     ) => tree_op_mixin.auto_set_parameter   (me,node, parameters)
        this.delete_concept_node    = (node                 ) => tree_op_mixin.delete_concept_node  (me,node)
        this.delete_node_by_path    = (path                 ) => tree_op_mixin.delete_node_by_path  (me,path)
        this.move_concept_node      = (node_from, posto     ) => tree_op_mixin.move_concept_node    (me,node_from, posto)
        this.unwrap_node            = (node                 ) => tree_op_mixin.unwrap_node          (me,node)
        this.move_node_by_path      = (posfr, posto         ) => tree_op_mixin.move_node_by_path    (me,posfr, posto)
        this.add_nodes              = (nodes, path          ) => tree_op_mixin.add_nodes            (me,nodes, path)
        this.add_nodes_before       = (nodes, target_node   ) => tree_op_mixin.add_nodes_before     (me,nodes,target_node )
        this.add_nodes_after        = (nodes, target_node   ) => tree_op_mixin.add_nodes_after      (me,nodes, target_node)
        this.add_nodes_here         = (nodes                ) => tree_op_mixin.add_nodes_here       (me,nodes)
        this.wrap_selected_nodes    = (node, options        ) => tree_op_mixin.wrap_selected_nodes  (me,node, options)
        this.wrap_nodes             = (node,fr,to,options   ) => tree_op_mixin.wrap_nodes           (me,node, fr, to, options)
        this.replace_nodes          = (father_node, nodes   ) => tree_op_mixin.replace_nodes        (me,father_node, nodes)  
        this.delete_nodes_by_paths  = (paths                ) => tree_op_mixin.delete_nodes_by_paths(me, paths)
    }
    /** 渲染函数
     * @param props.element 当前要渲染的节点。
     * @param props.attributes 当前元素的属性，这是slate要求的。
     * @param props.children 下层节点，这是slate要求的。
     * @private
     */
    renderElement(props: SlateReact.RenderElementProps){
        let me = this
        let node = props.element as Slate.Element & NonLeafNode
                
        // 取得的子渲染器。
        let R = me.get_core().get_node_renderer(node)

        // 需要给 slate 提供的顶层属性。
        let slate_attributes = props.attributes

        // 子渲染器需要的 props 。
        let subprops = {
            editor: me , 
            node: node ,
            children: props.children , 
        }
        
        // 如果这是个 inline 元素，就添加一个额外 style 。
        let isinline = false
        if(slate_is_concept(node)){
            let meta_param = this.get_core().get_meta_param(node)
            if(meta_param && meta_param.force_inline){
                isinline = true
            }
            if(node.type == "inline"){
                isinline = true
            }
        }

        if(isinline){
            return <span {...slate_attributes}><R {...subprops} /></span>
        }
        // return <div {...slate_attributes}><R {...subprops}/></div>
        return <div {...slate_attributes}><R {...subprops} /></div>
        
    }

    renderLeaf(props: SlateReact.RenderLeafProps){
        let me = this

        let R = me.get_core().get_first_renderer("text")

        // 需要给 slate 提供的顶层属性。
        let slate_attributes = props.attributes

        // 子渲染器需要的 props 。
        let subprops = {
            editor: me  , 
            node: props.leaf ,
            children: props.children , 
        }
        return <span {...slate_attributes}><R {...subprops}></R></span>
    }


    render(){    
        let me = this

        let slate = me.get_slate()
        
        let context = {
            editor: me , 
            slate : slate , 
            core  : me.get_core() , 
        }

        let init_root_children = me.props.init_rootchildren || (
            this.get_core().create_abstract("root") as AbstractNode
        ).children

        return <EditorGlobalInfo.Provider value={context}>
            <SlateReact.Slate 
                editor       = {slate} 
                initialValue = {init_root_children} 
                onChange     = {value => {
                    me.onUpdate(value)
                    me.onFocusChange( me )
                }}
            >
                <SlateReact.Editable
                    style = {{
                        outline: "none" , //阻止默认的黑框
                        cursor: "text" , 
                    }}
                    
                    renderElement = {this.renderElement}
                    renderLeaf    = {this.renderLeaf}
                    onClick       = {e=>me.onFocusChange(me)}
                    onBlur        = {e=>me.onFocusChange(me)}
                    onFocus       = {e=>me.onFocusChange(me)}
                    onSelect      = {e=>me.onFocusChange(me)}

                    onCopy = {(e)=>{
                        handle_copy(me, e, true, false)
                        me.onFocusChange(me)
                    }}

                    onPaste = {(e)=>{
                        handle_paste(me, e)
                        me.onFocusChange(me)
                        
                        // 粘贴的时候，开启编号冲突检查。
                        // XXX 这个是跨网也复制粘贴的编号冲突问题的一个备用解决方案...
                        // （大多数情况下应该不会有问题）
                        set_normalize_status({
                            "pasting": true , 
                        })
                    }}
                    onCut = {(e)=>{
                        handle_copy (me, e, false, true)
                        me.onFocusChange(me)
                    }}
    
                    onKeyDown   = {e=>me.onKeyDown(e)}
                    onKeyUp     = {e=>me.onKeyUp(e)}
                />
            </SlateReact.Slate>
        </EditorGlobalInfo.Provider>
    }

    /** 在当前位置新建一个指定概念的节点。 */
    new_concept_node(type: Exclude<AllConceptTypes,"abstract">, sec_ccpt: string){
        let me = this

        if(type == "support"){
            let node = me.get_editorcore().create_support(sec_ccpt)
            me.add_nodes_here(node) // 在当前选中位置插入节点。
            return 
        }
        if(type == "structure"){        
            let node = me.get_editorcore().create_structure(sec_ccpt)
            me.add_nodes_here(node) // 在当前选中位置插入节点。
            return 
        }
        if(type == "group"){
            let selection = me.get_slate().selection
            let flag = true
            if (selection != undefined)
                flag = JSON.stringify(selection.anchor) == JSON.stringify(selection.focus) // 是否没有选择
            
            let node = me.get_editorcore().create_group(sec_ccpt)
            if(flag){ // 没有选东西，直接添加节点
                me.add_nodes_here(node) // 在当前选中位置插入节点。
            }
            else{ // 选了东西，打包节点。
                me.wrap_selected_nodes(node , {split: false})
            }
            return 
        }
        if(type == "inline"){
            let selection = me.get_slate().selection
            let flag = true // 是否没有选择任何东西
            if(selection != undefined)
                flag = JSON.stringify(selection.anchor) == JSON.stringify(selection.focus) // 是否没有选择

            let node = me.get_editorcore().create_inline(sec_ccpt , "")

            if(flag){ // 如果没有选择任何东西，就新建节点。
                me.add_nodes_here(node) // 在当前选中位置插入节点。
            }
            else{ // 如果有节点，就把所有子节点打包成一个inline节点。
                me.wrap_selected_nodes(node  , {split: true}) // 还是应该允许inline节点嵌套的...
            }
            return 
        }

        throw new UnexpectedParametersError("这这不能")
    }
}
