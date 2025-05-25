/** 
 * 这个模块提供一些基础组件。
 * @module
 */

import * as React from "react"

import {
    ScrollBarBox , 
} from "../../../uibase/scroll"

import {
    Typography , 
    Box , 
    Paper , 
    Card , 
    Container , 
    useTheme , 
} from "@mui/material"

import type {
    TypographyProps , 
    PaperProps , 
    BoxProps , 
} from "@mui/material"

import  Color  from "color"

import {
    EditorConfigContext , 
} from "./config"

import {
    light_grey
} from "../../../uibase"

export { 
    EditorComponentPaper , 
    EditorParagraphBox , 
    EditorBackgroundPaper , 
    EditorComponentEditingBox , 
    EditorUnselecableBox , 
    EditorComponentBox , 
    EditorStructureTypography , 
}

// XXX 可以加入一个通用抽屉...

/** 这个组件定义一个不可被选中的区域。用于 slate 的各种不希望被修改的辅助部分。 */
const EditorUnselecableBox = React.memo((props: BoxProps) => <Box 
    contentEditable = {false}
    {...props}
    sx = {[
        {
            userSelect: "none" , 
            cursor: "default" , 
            
        } , 
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]) , 
    ]}
/>)

/** 这个组件定义默认的段落渲染方式。 */
const EditorParagraphBox = React.memo((props: TypographyProps) => {
    const config = React.useContext(EditorConfigContext)
    return <Typography 
        component = {Box}
        {...props}
        sx = {[
            {
                ...config.fonts.body , 
                marginTop: config.margins.paragraph , 
            } , 
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]) , 
        ]}
    />
})

/** 结构性的文字。 */
const EditorStructureTypography = React.memo((props: TypographyProps) => {
    const config = React.useContext(EditorConfigContext)
    return <Typography 
        component = {Box}
        {...props}
        sx = {[
            {
                ...config.fonts.structure,
                marginY: "auto" , // 垂直居中
                height: config.fonts.structure.lineHeight , 
                whiteSpace: "nowrap" , 
            },
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]) , 
        ]}
    />
})


/** 这个组件定义可以书写的区域。
 * @param props.autogrow 如果为 true ，则区域会自动横向增长以填满父元素。
 */
const EditorComponentEditingBox = React.memo((props: BoxProps & {autogrow?: boolean}) => {
    const config = React.useContext(EditorConfigContext)
    return <Box 
        {...{...props , autogrow: undefined}} // 去掉自己定义的属性。
        sx = {[
            {
                paddingX : config.margins.background , 
                ...(props.autogrow
                    ? { flex: 1 , minWidth: 0 , } // 如果自动增长，就设置一个 flex 属性。但是必须同时设置一个 minWidth，不知道为啥...
                                                // 可以参考 https://makandracards.com/makandra/66994-css-flex-and-min-width 
                    : {} // { minWidth: config.widths.minimum_content } // 如果不自动增长，设置一个最小宽度。
                ) ,
            } , 
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]) , 
        ]}
    />
})


let EditorComponentPaperNestLevel = React.createContext<number>(1)

/** 这个组件定义一个用来渲染特殊节点的纸张。 
 * @param props.is_inline 这个组件是否是行内组件。
*/
const EditorComponentPaper = React.memo((
    props: PaperProps & {is_inline?: boolean}
) =>{
    // XXX 目前没有用到level
    const net_level = React.useContext(EditorComponentPaperNestLevel) // 已经嵌套了多少层了
    const {children , is_inline, sx, ...other_props} = props
    
    const config = React.useContext(EditorConfigContext)
    const theme  = useTheme()

    let bgcolor = Color( theme.palette.background.paper )
    bgcolor = bgcolor.rotate(30 * (net_level + 1))
    bgcolor = light_grey(bgcolor)
    return <Box 
        {...other_props} // 去掉自己定义的属性。
        sx = {[
            {
                paddingY : "0.5rem" , 
                paddingX : "0.25rem" , 
                backgroundColor: bgcolor.toString() , 
            } , 
            {
                ...(is_inline
                    ? { // 行内
                        display     : "inline-block" ,
                        minHeight   : config.fonts.body.lineHeight , 
                        color       : "text.primary" ,
                        marginX     : config.margins.small , 
                    } : { // 块级
                        marginTop   : config.margins.paragraph ,      
                        color       : "text.primary" ,        
                    }
                ) , 
            } , 
            ...(Array.isArray(sx) ? sx : [sx]) , 
        ]}
    ><EditorComponentPaperNestLevel.Provider value = {net_level + 1}>
        {children}
    </EditorComponentPaperNestLevel.Provider></Box>
})

/** 对于一个不用纸张作为最外层元素的节点，这个组件用来提供其边框。 */
const EditorComponentBox = React.memo((props: BoxProps) => {
    const config = React.useContext(EditorConfigContext)
    return <Box 
        {...props}
        sx = {[
            {
                marginTop: config.margins.paragraph , 
            },
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]) , 
        ]}
    />
})

/** 包裹整个编辑器的纸张。 */
const EditorBackgroundPaper = React.memo((props: PaperProps) => {

    return <Box 
        elevation = {0}
        variant = "outlined"
        // square 
        {...props}
        sx = {[
            {
                border: "1px solid " , 
                width: "100%" , 
                height: "100%" , 
                overflow: "hidden" , 
            },
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]) , 
        ]}
    />
})

