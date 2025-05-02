/** 这个模块提供一个组件，这个组件向下提供滚动条。
 * 
 * @module
*/

import React from "react"
import {
    Box , 
    BoxProps , 
} from "@mui/material"
import "overlayscrollbars/overlayscrollbars.css"
import { OverlayScrollbars } from "overlayscrollbars"


export { ScrollBarBox }

/**
 * 注意，这个里面的所有东西都必须先被box包起来...
 */
class ScrollBarBox extends React.Component<BoxProps>{
    os: OverlayScrollbars | undefined

    constructor(props: BoxProps){
        super(props)
        this.os = undefined
    }
    render(){
        let {children, ...other_props} = this.props
        return <Box 
            {...other_props} 
            data-overlayscrollbars = "" 
            ref = {(divref: HTMLDivElement) => {
                if(!divref){
                    return
                }
                this.os = OverlayScrollbars(divref, {
                    scrollbars:{
                        autoHide: "leave", 
                        autoHideDelay: 700 , 
                    }
                })
            }}
        >{children}</Box>
    }
}

