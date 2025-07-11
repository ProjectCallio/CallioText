import * as React from "react"

import {
    AbstractNode, 
} from "../core"
import {
    Env, 
    Context, 
    ProcessedParameterList, 
    PrinterCache, 
} from "./renderer"

import {
    Printer, 
    PrinterComponent, 
} from "./main"

export {
    PrinterGlobalInfo, 
    usePrinterGlobalInfo , 
    usePrinter, 
    usePrinterRoot, 
    usePrinterComponent, 
    usePrinterAllEnv, 
    usePrinterAllContexts, 
    usePrinterAllParameters, 
    usePrinterAllCaches, 
}

export type {
    PrinterGlobalInfoType, 
}

interface PrinterGlobalInfoType{
    "printer"           ?: Printer, 
    "root"              ?: AbstractNode, 
    "printer_component" ?: PrinterComponent,
    "env"               ?: Env,                         // 这一项提供所有节点的环境。
    "all_contexts"      ?: {[path: string]: Context},   // 这一项提供所有节点的上下文。
    "all_parameters"    ?: {[path: string]: ProcessedParameterList},  // 这一项提供所有节点的处理好的参数。
    "all_caches"        ?: PrinterCache,                // 这一项提供所有临时缓存结果。
}
const PrinterGlobalInfo = React.createContext<PrinterGlobalInfoType>({})

function usePrinterGlobalInfo(){
    const globalinfo = React.useContext(PrinterGlobalInfo)
    if(!globalinfo){
        throw new Error("PrinterGlobalInfo not found")
    }
    return globalinfo
}

function usePrinter(){
    const globalinfo = React.useContext(PrinterGlobalInfo)
    if(!globalinfo){
        throw new Error("PrinterGlobalInfo not found")
    }
    return globalinfo
}

function usePrinterRoot(){
    const globalinfo = usePrinter()
    if(!globalinfo.root){
        throw new Error("PrinterRoot not found")
    }
    return globalinfo.root
}

function usePrinterComponent(){
    const globalinfo = usePrinter()
    if(!globalinfo.printer_component){
        throw new Error("PrinterComponent not found")
    }
    return globalinfo.printer_component
}

function usePrinterAllEnv(){
    const globalinfo = usePrinter()
    if(!globalinfo.env){
        throw new Error("PrinterEnv not found")
    }
    return globalinfo.env
}

function usePrinterAllContexts(){
    const globalinfo = usePrinter()
    if(!globalinfo.all_contexts){
        throw new Error("PrinterAllContexts not found")
    }
    return globalinfo.all_contexts
}

function usePrinterAllParameters(){
    const globalinfo = usePrinter()
    if(!globalinfo.all_parameters){
        throw new Error("PrinterAllParameters not found")
    }
    return globalinfo.all_parameters
}

function usePrinterAllCaches(){
    const globalinfo = usePrinter()
    if(!globalinfo.all_caches){
        throw new Error("PrinterAllCaches not found")
    }
    return globalinfo.all_caches
}