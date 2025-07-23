/** 这个模块定义一个上下文工具，用来帮助渲染器自动确定编号。 
 * @module
*/

import { 
    Env , 
    Context , 
    PrinterEnterFunction , 
    PrinterExitFunction , 
    ProcessedParameterList , 
    PrinterCacheItem , 
} from "../../../printer"
import { 
	Node , 
    is_groupnode , 
} from "../../../core"

import {
    ContexterBase
} from "./base"

export { OrderContexter }

class OrderContexter<NT = Node> extends ContexterBase<NT , number , {[order_key: string]: number}>{

    /** 标明排序的对象。 */
    order_key: string

    /** 如果设为true，则对于每组不连续的对象单独标号。 */
    separate_groups: boolean

    constructor(order_key: string, separate_groups: boolean = false){
        super("__order" , {})
        this.order_key = order_key
        this.separate_groups = separate_groups
    }

    enter(
        node: Readonly<NT> , 
        path: Readonly<number[]>, 
        parameters: Readonly<ProcessedParameterList> , 
        env: Env , 
        context: Context
    ){
        let e = this.get_env(env)
        e[this.order_key] = e[this.order_key] || 0 // 初始化这一项的排序
        if(this.separate_groups){
            if(is_groupnode(node as any) && (node as any).relation == "separating"){
                e[this.order_key] = 0
            }
        }
        e[this.order_key] ++
        this.set_context(context , e[this.order_key])
    }
    exit(
        node: Readonly<NT> , 
        path: Readonly<number[]>, 
        parameters: Readonly<ProcessedParameterList> , 
        env: Env , 
        context: Context
    ): [PrinterCacheItem , boolean]{
        return [{} , true]
    }
}
