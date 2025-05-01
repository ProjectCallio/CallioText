import * as React from "react"

import {
    AbstractNode , 

} from "../core"
import {
    Env , 
    Context , 
    ProcessedParameterList , 
    PrinterCache , 
} from "./renderer"

import {
    Printer , 
    PrinterComponent , 
} from "./main"

export {
    PrinterGlobalInfo , 
}

export type {
    PrinterGlobalInfoType , 
}

interface PrinterGlobalInfoType{
    "printer"           ?: Printer , 
    "root"              ?: AbstractNode , 
    "printer_component" ?: PrinterComponent ,
    "env"               ?: Env ,                         // 这一项提供所有节点的环境。
    "all_contexts"      ?: {[path: string]: Context} ,   // 这一项提供所有节点的上下文。
    "all_parameters"    ?: {[path: string]: ProcessedParameterList} ,  // 这一项提供所有节点的处理好的参数。
    "all_caches"        ?: PrinterCache ,                // 这一项提供所有临时缓存结果。
}

let PrinterGlobalInfo = React.createContext<PrinterGlobalInfoType>({})

