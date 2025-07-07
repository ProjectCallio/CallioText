import * as React from "react"

import type {
    TypographyConfig , 
} from "../uibase"

import {
    merge_object , 
} from "../utils"
import {
    MyPartial , 
} from "../uibase"

export {
    EditorConfigContext    , 
    default_editorconfig , 
    make_editorconfig , 
    useEditorConfig , 
}
export type {
    EditorConfig , 
    PartialEditorConfig , 
}

interface EditorConfig {
    margins: {
        
		/** 用来书写的纸张跟内部元素的距离。 */
        background: string 

		/** 段落之间的上下距离。 */
        paragraph: string

		/** 小间隔。 */
        small: string
    } , 
    widths: {
		/** 所有可以弹出的 Drawer 的宽度。 */
		editable_drawer: string 

		/** 任何一个有值的元素的最小宽度。 */
		minimum_content: string 
	} , 
    fonts: {
        /** 主要文本的字体。 */
        body: TypographyConfig

        /** 结构性文本的字体。 */
        structure: TypographyConfig

        /** 提示性文本的字体。 */
        info: TypographyConfig
    }
}
type PartialEditorConfig = MyPartial<EditorConfig>


const default_editorconfig: EditorConfig = 
{
    margins: {
        background: "0.5rem" , 
        paragraph: "0.8rem" , 
        small: "0.2rem" , 
    } , 
    widths: {
        editable_drawer: "70%" , 
        minimum_content: "3rem" , 
    } , 
    fonts: {
        body: {
            fontFamily: "sarasa-mono" , 
            fontSize: "1rem" , 
            lineHeight : "1.5rem" , 
            lineSpacing: "0.00938em" ,    
            fontWeight: 400 , 
        } , 

        structure: {
            fontFamily: "Century Gothic, SimHei" , 
            fontSize: "1rem" , 
            lineHeight : "1.5rem" , 
            lineSpacing: "0.00938em" ,    
            fontWeight: 400 , 
        } , 

        info: {
            fontFamily: "DengXian" , 
            fontSize: "0.8rem" , 
            lineHeight : "1rem" , 
            lineSpacing: "0.00938em" ,    
            fontWeight: 400 , 
        } , 
    } , 
}


const EditorConfigContext = React.createContext<EditorConfig>(default_editorconfig)

function make_editorconfig(config: PartialEditorConfig = {}){
    let actual_config = merge_object(default_editorconfig, config)
    return actual_config
}

function useEditorConfig(){
    return React.useContext(EditorConfigContext)
}




