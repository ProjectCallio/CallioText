/** 这个模块定义一个印刷器 
 * @module
*/

import React from "react"

import {
    FirstClassConcept , 
    SecondClassConcept , 
} from "../core/concept"
import {
    PrinterRenderer , 
    Env , 
    Context , 
    ProcessedParameterList , 
    PrinterCacheItem , 
    PrinterCache , 
} from "./renderer"
import {
    AbstractNode , 
    ConceptNode, 
    Node , 
    AllNodeTypes , 
    AllConceptTypes , 

	is_paragraphnode , 
	is_textnode, 
    ParameterList,
    is_inlinenode , 
    is_concetnode, 
} from "../core/intermidiate"
import {
    UnexpectedParametersError , 
} from "../uibase/exceptions"
import {
    PrinterGlobalInfo, 
    PrinterGlobalInfoType, 
} from "./globalinfo"

export type {
    FirstClassConceptDict , 
    SecondClassConceptDict , 
    RendererDict , 
    DefaultRendererDict , 
}

export {
    Printer , 
    PrinterComponent , 
}

/** 用来保存概念的字典。 */
interface ConceptDict<T>{
    "group"     : {[name: string] : T} , 
    "inline"    : {[name: string] : T} , 
    "structure" : {[name: string] : T} , 
    "support"   : {[name: string] : T} , 
    "abstract"  : {[name: string] : T} , 
}

/** 用来保存一级概念的列表。 */
type FirstClassConceptList = FirstClassConcept[]

/** 用来保存二级概念的列表。 */
type SecondClassConceptList = SecondClassConcept[]

/** 用来保存一级概念的字典。 */
type FirstClassConceptDict = ConceptDict<FirstClassConcept>

/** 用来保存二级概念的字典。 */
type SecondClassConceptDict = ConceptDict<SecondClassConcept>

/** 用来保存各个一级概念的渲染器的字典。 */
type RendererDict = ConceptDict<PrinterRenderer>

/** 未找到概念时的渲染方案 */
interface DefaultRendererDict{
    "group"     : PrinterRenderer , 
    "inline"    : PrinterRenderer , 
    "structure" : PrinterRenderer , 
    "support"   : PrinterRenderer , 
    "abstract"  : PrinterRenderer , 
    "paragraph" : PrinterRenderer , 
    "text"      : PrinterRenderer , 
}

/** 这个函数判断一个节点是否应该被渲染成行内元素。 */
function should_inline(printer: Printer, node: Node){
    if(is_textnode(node) || is_inlinenode(node)){
        return true
    }
    if(is_paragraphnode(node)){
        return false
    }
    let first_concept = printer.get_node_first_concept(node)
    if(!first_concept){
        return false
    }
    return first_concept.meta_parameters.force_inline
}



/**
 * 印刷器类。
 */
class Printer{
    first_class_concepts: FirstClassConceptDict
    second_class_concepts: SecondClassConceptDict
    renderers: RendererDict 
    default_renderers: DefaultRendererDict 

    constructor(
        first_class_concepts    : FirstClassConceptList , 
        second_class_concepts   : SecondClassConceptList , 
        renderers               : RendererDict , 
        default_renderers       : DefaultRendererDict , 
    ){
        /** 这是一个方便初始化字典的临时变量。 */
        const make_emptydict = ()=>{return {
            "group"     : {} , 
            "inline"    : {} , 
            "structure" : {} , 
            "support"   : {} , 
            "abstract"  : {} , 
        }}


        this.first_class_concepts = make_emptydict()
        for(let x of first_class_concepts){
            this.add_first_concept(x)
        }

        this.second_class_concepts = make_emptydict()
        for(let x of second_class_concepts){
            this.add_second_concept(x)
        }

        this.renderers          = renderers
        this.default_renderers  = default_renderers
    }
    add_renderer(type: AllConceptTypes, name: string, renderer: PrinterRenderer){
        this.renderers[type][name] = renderer
    }

    add_first_concept(x: FirstClassConcept){
        this.first_class_concepts[x.type][x.name] = x
    }

    add_second_concept(x: SecondClassConcept){
        this.second_class_concepts[x.type][x.name] = x
    }

    /** 查询一个二级概念。
     * @param type 查找的节点类型。
     * @param name 查找的概念名称。
     * 如果没有找到，就返回`undefined`。
     */
    get_second_concept(type: AllConceptTypes, name: string): SecondClassConcept | undefined{
        return this.second_class_concepts?.[type]?.[name]
    }
    /** 查询一个一级概念。
     * @param type 查找的节点类型。
     * @param name 查找的概念名称。
     * 如果没有找到，就返回`undefined`。
     */
    get_first_concept(type: AllConceptTypes, name: string): FirstClassConcept | undefined{
        return this.first_class_concepts[type][name]
    }

    /** 根据一个节点查询其二级概念。 */
    get_node_second_concept(node: ConceptNode): SecondClassConcept | undefined{
        let sec_concept_name = node.concept // 节点的二级概念名。
        return this.get_second_concept(node.type , sec_concept_name)
    }

    /** 根据一个节点查询其一级概念。 */
    get_node_first_concept(node: ConceptNode): FirstClassConcept | undefined{
        let sec_ccpt = this.get_node_second_concept(node)
        if(sec_ccpt == undefined){
            return undefined
        }
        let first_concept_name = sec_ccpt.first_concept // 节点的一级概念名。
        return this.get_first_concept(node.type , first_concept_name)
    }
    

    /** 查询一个渲染器。
     * @param type 查找的节点类型。
     * @param name 查找的概念名称。
     * 如果`type == "paragraph" || "text"`，那么`name`将会被忽略。
     * 反之，如果`type != "paragraph" && type != "text"`，那么`name`必须提供。
     */
    get_renderer(type: AllNodeTypes , name?: string): PrinterRenderer{
        if(type == "paragraph" || type == "text"){
            return this.default_renderers[type]
        }

        if(!name){
            return this.default_renderers[type]
        }

        let ret = this.renderers?.[type]?.[name]
        if(!ret){ // 如果没有找到这个概念的渲染器，就返回一个这个概念类型的默认渲染器。
            ret = this.default_renderers[type]
        }
        return ret
    }

    /** 这个函数直接从一个节点查询渲染器。 */
    get_node_renderer(node: Node): PrinterRenderer{
        let me = this
        if(is_textnode(node)){ // 如果是文本节点，直接按类型查询。
            return me.get_renderer("text")
        }
        else if(is_paragraphnode(node)){ // 如果是段落节点，直接按类型查询。
            return me.get_renderer("paragraph")
        }
        let concept      = me.get_node_first_concept(node)
        let concept_name = concept ? concept.name : undefined
        return me.get_renderer(node.type , concept_name) // 如果是概念节点，按类型和一级概念名查询。
    }

    /** 这个函数将节点的参数列表还原成一级概念的参数列表。 
    */
    process_parameters(node: ConceptNode): ProcessedParameterList{
        let sec_ccpt = this.get_node_second_concept(node)
        let frt_ccpt = this.get_node_first_concept(node)

        // 如果没有找到概念，就直接返回空。
        if(!sec_ccpt || !frt_ccpt){
            return {}
        }

        // 应用二级概念的默认参数。
        let sec_parameters = {
            ...sec_ccpt.default_override , 
            ...node.parameters , 
        }

        // 保存固定值参数的处理结果。
        let processed_fixedparams: any = {}

        // 处理二级概念的固定值参数（主要是处理函数值参数）。
        for(let x in sec_ccpt.fixed_override){
            if(frt_ccpt.parameter_prototype[x] == undefined){ // 不处理没有被原型定义的参数
                continue
            }
            let v = sec_ccpt.fixed_override[x]
            if(v.type != "function"){
                processed_fixedparams[x] = v
            }
            else{
                let val = Function(`return ${v.val}`)()(sec_parameters) // 将先前处理好的非固定参数作为参数

                processed_fixedparams[x] = {
                    type: frt_ccpt.parameter_prototype[x].type , 
                    val: val , 
                }
            }
        }

        // 应用一级概念的原型，形成最终的参数列表。
        let _final_parameters = {
            ...frt_ccpt.parameter_prototype ,   // 先应用默认列表。
            ...sec_parameters ,                 // 然后是可修改列表。
            ...processed_fixedparams ,          // 然后是固定列表。
        }

        // 最后再去除所有项的类型，只保留值。
        let final_parameters: any = {}
        for(let x in _final_parameters){
            final_parameters[x] = _final_parameters[x].val
        }
        
        return final_parameters
    }

    /**这个函数在印刷之前生成环境和上下文。 */
    preprocess({
        root, 
        init_env , 
    }:{
        root: AbstractNode, 
        init_env?: Env , 
    }): [Env , {[path: string]: Context} , {[path: string]: ProcessedParameterList}, PrinterCache]{
        let me      = this 
        let printer = me

        /** 这个函数递归地检查整个节点树，并让每个节点对环境做处理。最终的结果被记录在全局变量中。 
         * @param nowenv 当前的环境。
         * @param node 当前节点。
         * @param path 当前节点到根的路径。
         * @param all_contexts 所有节点的上下文的储存。
         * @param all_parameters 所有节点的处理好的参数的储存。
         * @param all_caches 所有概念节点的缓存信息的储存。
         * 注意这个函数对`nowenv`是不改变的，但是对`all_contexts`却是改变的。
        */
        function _preprocess(
            nowenv          : Env , 
            node            : Node , 
            path            : number[] , 
            all_contexts    : {[path: string]: Context} , 
            all_parameters  : {[path: string]: ProcessedParameterList} , 
            all_caches: PrinterCache
        ): [Env , boolean] {
            let renderer = printer.get_node_renderer(node) // 向印刷器请求渲染器。
            let my_path  = JSON.stringify(path)            // 本节点的路径的字符串表示。

            let flag = true // 这个变量表示处理是否结束。只要有一个子节点的处理没有结束那就没有结束。
            
            // 初始化上下文
            let nowcontext: Context = (all_contexts[my_path] || {}) // 使用path来作为每个节点的索引。
            
            // 处理参数
            let my_parameters = all_parameters[my_path] // 首先看看是不是有已经保存的参数。
            if(!my_parameters){
                my_parameters = {} // 注意非概念节点的参数列表直接为空。
                if((!is_textnode(node)) && (!is_paragraphnode(node))){ // 为概念节点处理参数列表。
                    my_parameters = printer.process_parameters(node)
                }
                all_parameters[my_path] = my_parameters // 由于参数列表不会改变，所以这里直接储存。
            }

            renderer.enter(node , path , my_parameters , nowenv , nowcontext)

            // 然后让所有子节点操作环境。
            if (! is_textnode(node)){ // 还有子节点
                for(let c_idx in node.children){
                    let c = node.children[c_idx]

                    // 向下处理子节点。
                    let [env_1 , flag_1] = _preprocess(
                        nowenv                          , 
                        c                               , 
                        [...path , parseInt(c_idx)]     , 
                        all_contexts                    , 
                        all_parameters                  , 
                        all_caches                      , 
                    ) 

                    flag = flag && flag_1 // 只要有一个子节点返回`false`，本节点就返回`false`。
                    nowenv = env_1
                }
            }

            let [cache, flag2] = renderer.exit(node , path , my_parameters , nowenv , nowcontext)
            flag = flag && flag2

            if(is_concetnode(node)){
                all_caches[node.idx] = cache || {}
            }
            all_contexts[my_path] = nowcontext //记录/更新 上下文。
            return [nowenv , flag]
        }

        let env = init_env || {} // 如果指定了初始环境，就使用初始环境。
        let all_contexts    = {}
        let all_caches      = {}
        let all_parameters  = {}
        let flag = false // 处理是否结束。如果为`false`就要继续处理。
        for(let _i = 0; _i < 100; _i++){
            let [newenv , newflag] = _preprocess(
                env , 
                root , 
                [] , 
                all_contexts , 
                all_parameters , 
                all_caches
            )
            env  = newenv 
            flag = newflag
            if(flag){
                break 
            }
            if(_i == 99){
                console.warn("Printer: preprocess loop limit reached.")
            }
        }
        return [env , all_contexts , all_parameters, all_caches]
    }
    
}

/** 这是印刷器组件的Props类型。 */
interface PrinterComponentProps {
    printer   : Printer
    root      : AbstractNode 
    init_env? : Env

    onUpdateCache?: (cache: PrinterCache) => void
}
/** 这是印刷器组件的State类型。 */
interface PrinterComponentUpdateCache {
    env             ?: Env
    all_contexts    ?: {[path: string]: Context}
    all_parameters  ?: {[path: string]: ProcessedParameterList}
    all_caches      ?: PrinterCache
}

/** 这个类定义印刷器的组件。印刷器组件和印刷器（核心）是分开的，组件只负责绘制，而不储存任何信息，印刷器只负责储存信息，而不负责
 * 绘制。在使用时，将印刷器和节点树一起传入印刷器组件来印刷文章。
 */
class PrinterComponent extends React.Component<PrinterComponentProps>{

    idx2path: {[idx: string]: number[]}
    path_refs: {
        [path_str: string]: React.RefObject<HTMLDivElement | null>
    } // 如果写 HTMLDivElement | SpanElement则div会报错，事儿真多。
    onUpdateCache: (cache: PrinterCache) => void

    update_cache: PrinterComponentUpdateCache

    constructor(props:PrinterComponentProps){
        super(props)

        this.path_refs = {}
        this.idx2path  = {} // 将idx映射成path，每渲染一次就会更改一次。
                            // XXX 其实正确的写法是在componentDidUpdate / componentDidMount里更改，但是我懒得写了，就这样反正也是对的。
        this.onUpdateCache = props.onUpdateCache || (()=>{})

        this.update_cache = {
            env             : undefined, 
            all_contexts    : undefined, 
            all_parameters  : undefined, 
            all_caches      : undefined, 
        }
    }

    get_printer(){
        return this.props.printer
    }

    /** 这个函数为渲染时提供用来绑定的ref对象。如果对象不存在会自动创建。 */
    bind_ref(path: number[]){
        let path_str = JSON.stringify(path)
        if(!this.path_refs[path_str]){
            this.path_refs[path_str] = React.createRef<HTMLDivElement | null>()
        }
        return this.path_refs[path_str]
    }

    get_ref(path: number[]){
        let path_str = JSON.stringify(path)
        return this.path_refs[path_str]?.current
    }

    get_ref_from_idx(idx: number){
        if(this.idx2path[idx] == undefined){
            return undefined
        }
        return this.get_ref(this.idx2path[idx])
    }

    scroll_to_idx(idx: string){ 
        if(this.idx2path[idx] == undefined){
            return
        }
        this.scroll_to(this.idx2path[idx])
    }
    
    scroll_to(path: number[]){ // XXX 似乎有些时候不会滚动到正确的位置...
        let component = this.get_ref(path)
        if(!component){
            return 
        }
        component.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
    }

    preprocess({
        root, 
        init_env
    }:{
        root?: AbstractNode, 
        init_env?: Env} = {}
    ): [Env , {[path: string]: Context} , {[path: string]: ProcessedParameterList}, PrinterCache]{
        let printer = this.props.printer
        return printer.preprocess({
            root    : root     || this.props.root, 
            init_env: init_env || this.props.init_env
        })
    }

    should_update(prev_props: PrinterComponentProps, now_props: PrinterComponentProps){
        return prev_props.printer   !== now_props.printer   || 
            prev_props.root         !== now_props.root      || 
            prev_props.init_env     !== now_props.init_env
    }

    update(){
        this.path_refs = {}
        this.idx2path  = {}
        let [env , all_contexts , all_parameters, all_caches] = this.preprocess()
        this.update_cache = {
            env             : env, 
            all_contexts    : all_contexts, 
            all_parameters  : all_parameters, 
            all_caches      : all_caches
        }
        this.onUpdateCache(all_caches)
    }
    
    /** 这个函数渲染一个子节点。 */
    subrender(props: {
        node            : Node , 
        path            : number [] , 
        all_contexts    : {[path: string]: Context} , 
        all_parameters  : {[path: string]: ProcessedParameterList} , 
    }): React.ReactElement{
        let me = this
        let {node, path, all_contexts, all_parameters} = props
        let ThisFunction = me.subrender.bind(this)
        
        let my_path         = JSON.stringify(path)    // 获取本节点的key。
        let my_context      = all_contexts[my_path]   // 本节点的上下文信息。
        let my_parameters   = all_parameters[my_path] // 获取参数列表。

        if(my_parameters == undefined){
            console.log(my_path)
            console.log(path)
            console.log(node)
            // TODO 这里好像有问题
            throw new UnexpectedParametersError(`all_parameters should contain ${my_path} but it doesn't.`)
        }
        if(my_context == undefined){
            throw new UnexpectedParametersError(`contexts should contain ${my_path} but it doesn't.`)
        }

        let renderer = me.props.printer.get_node_renderer(node) // 向印刷器请求渲染器。
        let RR =  renderer.renderer // 真正的渲染函数。

        // 先渲染子节点。
        let children_component = <></>
        if (!is_textnode(node)){
            let mychildren = node.children
            children_component = <React.Fragment>{        
                Object.keys(mychildren).map((subidx) => <ThisFunction
                    key      = {subidx}
                    node     = {mychildren[parseInt(subidx)]} 
                    path     = {[...path , parseInt(subidx)]}
                    all_contexts   = {all_contexts}
                    all_parameters = {all_parameters}
                />)}
            </React.Fragment>
        }

        if(is_concetnode(node)){
            this.idx2path[node.idx] = [...path]
        }

        let node_should_inline = should_inline(me.props.printer, node)
        if(node_should_inline){
            return <span ref={me.bind_ref(path)}><RR 
                context     = {my_context}
                node        = {node}
                parameters  = {my_parameters}
            >{children_component}</RR></span>
        }
        return <div ref={me.bind_ref(path)} ><RR 
            context     = {my_context}
            node        = {node}
            parameters  = {my_parameters}
        >{children_component}</RR></div>
    }

    render(){
        let me = this
        let R = me.subrender.bind(this)
        
        me.update() // XXX 在这里调用似乎很傻逼（但应该是对的）
        let {env, all_contexts, all_parameters, all_caches} = me.update_cache
        if(!(env && all_contexts && all_parameters && all_caches)){
            return <></>
        }

        // 通过React注入器提供给用户定义的渲染器的全局信息。
        let globalinfo: PrinterGlobalInfoType = {
            printer           : me.props.printer , 
            root              : me.props.root , 
            printer_component : me ,
            env               : env , // 这一项提供所有节点的环境。
            all_contexts      : all_contexts , // 这一项提供所有节点的上下文。
            all_parameters    : all_parameters ,  // 这一项提供所有节点的处理好的参数。
            all_caches        : all_caches ,  // 这一项提供所有临时缓存结果。
        }

        return <PrinterGlobalInfo.Provider 
            value = {globalinfo}
        ><R
            node           = {me.props.root} 
            path           = {[]}
            all_contexts   = {all_contexts}
            all_parameters = {all_parameters}
        /></PrinterGlobalInfo.Provider>
    }
}