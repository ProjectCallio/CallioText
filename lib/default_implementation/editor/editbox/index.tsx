/** 这个模块用来取代之前的parameter drawer，直接在画面上显示一个永久的参数修改栏。
 * @module
 */

// TODO 现在这个模块没有被用起来。因为找不到好的UI设计。
// TODO 还需要增加无鼠标操作。

import * as React from "react"

import {
    Box , 
    Divider , 
    Drawer , 
} from "@mui/material"

import { EditorStructureTypography as StructureTypography } from "../uibase/components"
import { EditorComponent } from "../../../editor"
import {
    DefaultParameterContainer , 
} from "../../../implbase"
import {
    slate_concept_father_path
} from "../../../editor/utils"

export {
    ParameterEdit , 
}

class ParameterEdit extends React.Component<{
    editor: EditorComponent , 
},{
    curpath: number [] | undefined, 
}>{

    parametereditor_ref: React.RefObject<DefaultParameterContainer | null>

    constructor(props: any){
        super(props)

        this.state = {
            curpath: undefined
        }

        this.parametereditor_ref = React.createRef()
    }

    try_update(){
        let editor = this.props.editor
        this.setState({curpath: editor?.get_slate()?.selection?.anchor?.path})
    }

    render(){
        let me = this
        let editor = this.props.editor
        let curpath = me.state.curpath
        if( !curpath ){
            return <></>
        }
        let curnode = slate_concept_father_path(editor.get_root(), curpath)

        if(curnode == undefined){
            return <></>
        }

        return <Box sx = {{
            maxHeight: "10vh" , 
        }}>
            <Box><StructureTypography>idx: {curnode.idx}</StructureTypography></Box>
            <Divider />
            <DefaultParameterContainer node={curnode} ref={me.parametereditor_ref}/>
        </Box>

    }
}

