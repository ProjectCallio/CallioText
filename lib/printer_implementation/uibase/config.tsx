import * as React from "react"

import type {
    TypographyConfig , 
} from "../../uibase"

import {
    merge_object , 
} from "../../utils"

import {
    MyPartial , 
} from "../../uibase"
export {
    PrinterConfigContext    , 
    default_printerconfig , 
    make_printerconfig , 
}
export type {
    PrinterConfig , 
    PartialPrinterConfig , 
}

interface PrinterConfig {
    margins: {
        /** 段落之间的上下距离。 */
        paragraph: string 

        /** 特殊元素距离前后元素的距离。 */
        special: string 

        /** 代替分号的小空格。 */
        colon: string 

        /** 一个层级的空格。 */
        level: string 

        /** 结构性的左右偏移。 */
        structure: string 
    } 
    fonts: {
        /** 主要内容的字体。 */
        body: TypographyConfig  
        
        /** 结构性文本的字体。 */
        structure: TypographyConfig

        /** 结构性文本，但是是标题。 */
        title: TypographyConfig

        /** 展示的文本的字体。 */
        display: TypographyConfig

        /** 弱化的文本的字体。（不重要的） */
        weaken: TypographyConfig
    }
}
type PartialPrinterConfig = MyPartial<PrinterConfig>

const default_printerconfig: PrinterConfig =  {
    margins: {
        paragraph   : "0.4rem" ,  
        special     : "0.8rem" ,  
        colon       : "1rem" ,  
        level       : "2rem" ,  
        structure   : "0.4rem" , 
    } , 
    fonts: {
        body: {
            fontFamily: "default" , 
            fontSize: "1rem" , 
            lineHeight: "1.5rem" , 
            lineSpacing: "0.00938em" , 
            fontWeight: 400 , 
        },
        weaken: {
            fontFamily: "default" , 
            fontSize: "1rem" , 
            lineHeight: "1.5rem" , 
            lineSpacing: "0.00938em" , 
            fontWeight: 400 , 
        },
        structure: {
            fontFamily: "default" , 
            fontSize: "1rem" , 
            lineHeight: "1.5rem" , 
            lineSpacing: "0.00938em" , 
            fontWeight: 400 , 
        } , 
        display: {
            fontFamily: "default" , 
            fontSize: "1rem" , 
            lineHeight: "1.5rem" , 
            lineSpacing: "0.00938em" , 
            fontWeight: 400 ,         
        } , 
        title: {
            fontFamily: "default" , 
            fontSize: "1rem" , 
            lineHeight: "1.5rem" , 
            lineSpacing: "0.00938em" , 
            fontWeight: 400 ,   
        }
    } , 
}

const PrinterConfigContext = React.createContext<PrinterConfig>(default_printerconfig)

function make_printerconfig(config: PartialPrinterConfig = {}){
    let actual_config = merge_object(default_printerconfig, config)
    return actual_config
}







