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


export {
    mod_scrollbar , 
    mod_scrollbar_nohide , 
    ScrollBarBox , 
}

let _oss: OverlayScrollbars[] = []
function mod_scrollbar(container: HTMLElement | null){
    if(!container){
        return
    }
    container.setAttribute("data-overlayscrollbars-initialize", "")
    const os = OverlayScrollbars(container, {
        scrollbars:{
            autoHide: "leave", 
            autoHideDelay: 700 , 
        }
    })
    _oss.push(os)
}
function mod_scrollbar_nohide(container: HTMLElement | null){
    if(!container){
        return
    }
    container.setAttribute("data-overlayscrollbars-initialize", "")
    const os = OverlayScrollbars(container, {
        scrollbars:{
            autoHide: "leave", 
            autoHideDelay: 700 , 
        }
    })
    _oss.push(os)
}


function ScrollBarBox(props: BoxProps){
    let {ref, ...other_props} = props
    let os_ref = React.useRef<any>({})
    return <Box
        data-overlayscrollbars-initialize
        {...other_props}
        ref = {(divref: HTMLDivElement) => {
            if(!divref){
                return
            }
            os_ref.current = OverlayScrollbars(divref, {
                scrollbars:{
                    autoHide: "leave", 
                    autoHideDelay: 700 , 
                }
            })

            if(ref){
                if(typeof ref === "function"){
                    ref(divref)
                } else {
                    ref.current = divref
                }
            }
        }}
    />
}