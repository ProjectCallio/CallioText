/** 这个模块提供一个开箱即用的印刷器。
 * @module
 */

import React from "react"

import { 
    GroupNode , 
    AbstractNode , 
} from "../../core"


import {
    Printer , 
    PrinterComponent , 
    PrinterCache , 
} from "../../printer"

import {
    PrinterBackgroundPaper , 
    PrinterConfigContext , 
    PrinterConfig , 
    make_printerconfig , 
    PartialPrinterConfig , 
} from "../../default_implementation/printer/uibase"

import {
    verify_root , 
} from "../predefined"

export {
    SectionalPrinterComponent , 
}

export type {
    SectionalPrinterProps
}

/** 这是默认印刷器实现的props。 */
interface SectionalPrinterProps {
    printer : Printer
    root    : AbstractNode
    config? : PartialPrinterConfig

    onUpdateCache?: (cache: PrinterCache) => void
    onDidMount   ?: (printer_comp: PrinterComponent, me: SectionalPrinterComponent)=>void
}

/** 这个类提供一个默认的印刷器实现。 */
class SectionalPrinterComponent extends React.Component<SectionalPrinterProps>{
    printer_ref: React.RefObject<PrinterComponent | null>
    
    /**
     * 默认印刷器的构造函数。
     * @param props.printer 要使用的印刷器。
     * @param props.root 要印刷的树。
     * @param props.config 要使用的主题设置。可以只设置一部分配置，剩下的会被默认选项填充。
     */
    constructor(props: SectionalPrinterProps){
        super(props)
        this.printer_ref = React.createRef()

        let {printer, root, config} = props

        if(!(
               printer.get_first_concept ("group" , "section" )
            && printer.get_second_concept("group" , "section" )
            && verify_root(root)
        )){
            throw new Error("printer: 根节点必须是一个section节点。")
        }
    }

    get_component(){
        if(this.printer_ref && this.printer_ref.current){
            return this.printer_ref.current
        }
        return undefined
    }

    render(){
        let me = this

        let config = make_printerconfig(this.props.config)

        return <PrinterConfigContext.Provider value = {config}>
            <PrinterBackgroundPaper>
                <PrinterComponent 
                    ref     = {(printer_comp: PrinterComponent)=>{
                        this.printer_ref.current = printer_comp
                        if(this.props.onDidMount){
                            this.props.onDidMount(printer_comp, this)
                        }
                    }}
                    printer       = {me.props.printer}
                    root          = {me.props.root}
                    onUpdateCache = {me.props.onUpdateCache}
                />
            </PrinterBackgroundPaper>
        </PrinterConfigContext.Provider>
    }
}