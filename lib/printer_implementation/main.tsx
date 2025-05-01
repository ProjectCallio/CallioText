/** 这个模块提供一个开箱即用的印刷器。
 * @module
 */

import React from "react"

import { 
    GroupNode , 
    AbstractNode , 
    GlobalInfoProvider , 
    PrinterCache , 
} from "../core"

import {
    Printer , 
    PrinterComponent , 
} from "../printer"

import {
    PrinterBackgroundPaper , 
    PrinterConfigContext , 
    PrinterConfig , 
    make_printerconfig , 
    PartialPrinterConfig , 
} from "./uibase"

export {
    DefaultPrinterComponent , 
}

export type {
    DefaultPrinterProps
}

/** 这是默认印刷器实现的props。 */
interface DefaultPrinterProps {
    printer : Printer
    root    : AbstractNode
    config? : PartialPrinterConfig

    onUpdateCache?: (cache: PrinterCache) => void
    onDidMount   ?: (printer_comp: PrinterComponent, me: DefaultPrinterComponent)=>void
}

/** 这个类提供一个默认的印刷器实现。 */
class DefaultPrinterComponent extends React.Component<DefaultPrinterProps>{
    printer_ref: React.RefObject<PrinterComponent | null>
    
    /**
     * 默认印刷器的构造函数。
     * @param props.printer 要使用的印刷器。
     * @param props.root 要印刷的树。
     * @param props.config 要使用的主题设置。可以只设置一部分配置，剩下的会被默认选项填充。
     */
    constructor(props: DefaultPrinterProps){
        super(props)
        this.printer_ref = React.createRef()
    }

    componentDidMount(): void {
        while(!this.get_component()); // TODO 他妈的谁想出来的这种写法

        if(this.props.onDidMount){
            this.props.onDidMount(this.get_component() as PrinterComponent, this)
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
                    ref     = {me.printer_ref}
                    printer = {me.props.printer}
                    root    = {me.props.root}
                    onUpdateCache = {me.props.onUpdateCache}
                />
            </PrinterBackgroundPaper>
        </PrinterConfigContext.Provider>
    }
}