/** 这个模块定义所有修改文档的外部行为。 
 * 所有修改文档的外部行为都要靠slate api来实现。
 * @module
*/

import * as Slate from "slate"
import {
    slate_is_concept , 
    slate_is_paragraph , 
    slate_is_text , 
    slate_is_same_concept_node , 
    slate_concept_node2path , 
} from "./utils"

import {
    set_normalize_status , 
} from "./plugins"

import {
    ConceptNode , 
    ParameterList ,   
    AbstractNode ,   
} from "../core"

import {
    EditorComponent, 
} from "./main"
import { BadNodeError , UnexpectedParametersError} from "../uibase/exceptions"

export { tree_op_mixin }

// XXX 话说，为啥要定义这些？为啥不直接用`slate`的`Transforms`....？
/** 这个混入对象提供所有跟节点树操作有关的函数。
 * 基本上就是`slate`的`Transforms`的代理。
 */
const tree_op_mixin = {
    


    /** 这个函数修改节点的某个属性。相当于`slate.Transforms.setNodes`。 */
    set_node<NT extends Slate.Node & ConceptNode>(editor: EditorComponent, node: NT, new_val: Partial<NT>){

        let path = slate_concept_node2path(editor.get_root() , node)
        if(!path){
            throw new UnexpectedParametersError("这这不能")
        }
        if(path.length == 0){ // 对于根节点的属性设置，单独处理。
            // console.log(node)
            let val = new_val as Partial<AbstractNode>
            delete val.children // XXX 直接无视了children，不知道有没有问题...
            editor.set_root(val)
            return 
        }

        Slate.Transforms.setNodes<NT>(editor.get_slate() , new_val, {at: path})
    } , 

    /** 这个函数修改节点的某个属性。相当于`slate.Transforms.setNodes`。 */
    set_node_by_path<NT extends Slate.Node & ConceptNode>(editor: EditorComponent, path:number[] , new_val: Partial<NT>){
        if(path.length == 0){ // 对于根节点的属性设置，单独处理。
            let val = new_val as Partial<AbstractNode>
            delete val.children // XXX 直接无视了children，不知道有没有问题...
            editor.set_root(val)
            return 
        }
        Slate.Transforms.setNodes<NT>(editor.get_slate() , new_val, {at: path})
    } , 

    /** 如果一个节点有代理，这个函数就修改代理，同时修改参数，否则只修改参数。 */
    auto_set_parameter<NT extends Slate.Node & ConceptNode>(editor: EditorComponent, node: NT, parameters: ParameterList){
        let params = {parameters: {...node.parameters , ...parameters}} as Partial<NT> & {children: undefined} // 有他妈的毛病
        tree_op_mixin.set_node<NT>(editor, node , params)
    } , 

    /** 这个函数删除一个节点。 */
    delete_concept_node<NT extends Slate.Node & ConceptNode>(editor: EditorComponent, node: NT){
        let path = slate_concept_node2path(editor.get_root() , node)
        if(!path || path.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }
        Slate.Transforms.removeNodes<NT>(editor.get_slate() , {at: path})
    } , 

    /** 这个函数删除一个节点。 */
    delete_node_by_path<NT extends Slate.Node>(editor: EditorComponent, path: number[]){
        if(path.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }
        Slate.Transforms.removeNodes<NT>(editor.get_slate() , {at: path})
    } , 

    /** 这个函数按路径批量删除节点。
     * 按显式路径删除，不依赖当前选区，因此在编辑器没有焦点时（比如在effect里）也能正常工作。
     * 无效或已失效的路径会被静默忽略。
    */
    delete_nodes_by_paths<NT extends Slate.Node>(editor: EditorComponent, paths: number[][]){
        if(paths.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }
        const slate = editor.get_slate()

        // 用pathRef追踪路径：前面的删除会使后面的路径移动，pathRef会自动跟随。
        // 用withoutNormalizing打包：避免逐个删除的中途触发规范化，干扰后续删除。
        Slate.Editor.withoutNormalizing(slate, () => {
            const refs = paths.map(p => Slate.Editor.pathRef(slate, p))
            for(const ref of refs){
                const p = ref.unref()
                if(p && Slate.Node.has(slate, p)){
                    Slate.Transforms.removeNodes<NT>(slate, {at: p})
                }
            }
        })
    } ,
    
    /** 这个函数把一个节点移动到另一个位置。 */
    move_concept_node<NT extends Slate.Node & ConceptNode>(editor: EditorComponent, node_from: NT, position_to: number[]){
        let path = slate_concept_node2path(editor.get_root() , node_from)
        if(!path || path.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }

        Slate.Transforms.moveNodes(editor.get_slate() , {
            at: path , 
            to: position_to , 
        })
    } , 

    /** 这个组件把节点的子节点提升到顶层。 */
    unwrap_node<NT extends Slate.Node & ConceptNode>(editor: EditorComponent, node: NT){
        let path = slate_concept_node2path(editor.get_root() , node)
        if(!path || path.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }

        Slate.Transforms.unwrapNodes<NT>(editor.get_slate() , {at: path})
    } , 

    move_node_by_path<NT extends Slate.Node>(editor: EditorComponent, position_from: number[], position_to: number[]){
        if(position_from.length == 0 || position_to.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }

        Slate.Transforms.moveNodes<NT>(editor.get_slate() , {
            at: position_from , 
            to: position_to , 
        })
    } , 
        
    /** 这个函数插入一个或者系列节点。 */
    add_nodes<NT extends Slate.Node>(editor: EditorComponent, nodes: (NT[]) | NT, path: number[]){
        if(path.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }

        Slate.Transforms.insertNodes<NT>(editor.get_slate() , nodes, {at: path})
    } , 

    /** 这个函数在某个节点前面插入一个或者系列节点。 */
    add_nodes_before<NT extends Slate.Node, TT extends Slate.Node & ConceptNode>(editor: EditorComponent, nodes: (NT[]) | NT, target_node: TT){
        let path = slate_concept_node2path(editor.get_root() , target_node)
        if(!path || path.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }

        Slate.Transforms.insertNodes(editor.get_slate() , nodes, {at: path})
    } , 

    /** 这个函数在某个节点后面插入一个或者系列节点。 */
    add_nodes_after<NT extends Slate.Node, TT extends Slate.Node & ConceptNode>(editor: EditorComponent, nodes: (NT[]) | NT, target_node: TT){
        let path = slate_concept_node2path(editor.get_root() , target_node)
        if(!path || path.length == 0){
            throw new UnexpectedParametersError("这这不能")
        }
        path[path.length-1] ++ 
        Slate.Transforms.insertNodes<NT>(editor.get_slate() , nodes, {at: path})
    } , 

    /** 这个函数在选中位置插入节点。 */
    add_nodes_here<NT extends Slate.Node>(editor: EditorComponent, nodes: (NT[]) | NT){
        Slate.Transforms.insertNodes(editor.get_slate() , nodes)
    } , 

    /** 把当前选择的区域打包成一个节点。 
     * @param options.match 判断子节点中哪些要打包的函数。
     * @param options.split 是否允许分裂父节点。
    */
    wrap_selected_nodes<NT extends Slate.BaseElement>(
        editor: EditorComponent , 
        node: NT, 
        options:{
            match?: (n:Slate.Node)=>boolean , 
            split?: boolean , 
        }
    ){
        // 分裂节点有可能造成多个相同`idx`的节点，因此虽然这里不是在复制粘贴，但是也需要开启复制粘贴的特殊检查。
        if(options.split){ // 
            set_normalize_status({pasting: true})
        }
        
        Slate.Transforms.wrapNodes<NT>(
            editor.get_slate() , 
            node , 
            {
                ...(options.match ? {match: options.match} : {}) , 
                split: options.split , 
            }
        )
    } , 

    /** 把当前选择的区域打包成一个节点。 
     * @param options.match 判断子节点中哪些要打包的函数。
     * @param options.split 是否允许分裂父节点。
    */
    wrap_nodes< NT extends Slate.BaseElement>(
        editor: EditorComponent , 
        node: NT, 
        from: Slate.Point , 
        to: Slate.Point , 
        options:{
            match?: (n:Slate.Node)=>boolean , 
            split?: boolean , 
        }
    ){
        // 分裂节点有可能造成多个相同`idx`的节点，因此虽然这里不是在复制粘贴，但是也需要开启复制粘贴的特殊检查。
        if(options.split){ 
            set_normalize_status({pasting: true})
        }
        
        Slate.Transforms.wrapNodes<NT>(
            editor.get_slate() , 
            node , 
            {
                at: {
                    anchor: from , 
                    focus: to , 
                } , 
                ...(options.match ? {match: options.match} : {}) , 
                split: options.split , 
            }
        )
    } , 


    /** 这个函数把某个节点的全部子节点替换成给定节点。 */
    replace_nodes<NT extends Slate.Node & ConceptNode, ST extends Slate.Node>(editor: EditorComponent, father_node: NT, nodes: ST[]){

        let father_path = slate_concept_node2path(editor.get_root() , father_node)
        if(!father_path){
            throw new UnexpectedParametersError("这这不能")
        }

        let numc = father_node.children.length

        //把整个father删了
        if(numc > 0){
            Slate.Transforms.removeNodes<NT>(editor.get_slate(), {
                at: {
                    anchor: {path: [...father_path,0] , offset: 0} , 
                    focus: {path: [...father_path,numc-1] , offset: 0} , 
                }
            })
        }

        // 替换成新节点
        Slate.Transforms.insertNodes<NT>( editor.get_slate() , nodes , {at: [...father_path , 0]} )
    } , 

}
