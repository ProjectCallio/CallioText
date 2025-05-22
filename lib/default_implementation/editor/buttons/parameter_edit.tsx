/** 
 * 这个文件提供一个通用的参数编辑器。
 * @module
 */

import React, {useEffect, useState} from "react"

import { 
    Typography ,  
    Card , 
    TextField ,
    Button , 
    Drawer , 
    Box , 
    Select , 
    Switch , 
    MenuItem  , 
    Divider, 
    List , 
    FormControlLabel  , 
    ListItem, 
    FormControl , 
    FormLabel  , 
    RadioGroup , 
    Radio  , 
} from "@mui/material"
import { 
    ExpandMore as ExpandMoreIcon , 
    ChevronRight as ChevronRightIcon  , 
} from "@mui/icons-material"

import * as Slate from "slate"
import * as SlateReact from "slate-react"

import { EditorStructureTypography as StructureTypography } from "../uibase/components"
import { 
    EditorComponent , 
    EditorGlobalInfo , 
}
 from "../../../editor"

import { 
    EditorButtonInformation , 
    DefaultParameterContainer , 
} from "../../../implbase"
import { UseAreaStore } from "../../areas"

export { 
    DefaultParameterWithEditorWithDrawer , 
}

/** 参数更新抽屉的`props` */
type DefaultParameterWithEditorWithDrawerProps = EditorButtonInformation & {

    /** 抽屉是否打开。 */
    open: boolean 

    /** 抽屉应该关闭时的回调。 */
    onClose?: (e:any)=>void
}

/**
 * 这个组件向具体的编辑器和具体的节点提供 DefaultParameterContainer ，并包含一个抽屉来打开关闭编辑界面。抽屉关闭时会调用 
 * editor.apply_all() 来应用所有更新。
 * @param props.node 这个组件所服务的节点。
 * @param props.open 抽屉是否打开。
 * @param props.onClose 抽屉应该关闭时的回调。如果不提供这个参数，抽屉就不会关闭。
 */
function DefaultParameterWithEditorWithDrawer(props: DefaultParameterWithEditorWithDrawerProps){
    let onClose = props.onClose || ((e:any)=>{})
    let parametereditor_ref = React.useRef<DefaultParameterContainer | null>(null)
    
    // 记录进入时的光标位置，以便在退出时还原。
    let [enter_selection , set_ec] = React.useState<Slate.BaseSelection | null>(null)

    return <EditorGlobalInfo.Consumer>{globalinfo=>{
        let editor = globalinfo.editor as EditorComponent

        return <Drawer 
            anchor      = "left"
            variant     = "temporary"
            open        = {props.open}
            onClose     = {onClose}
            ModalProps  = {{
                keepMounted: true,
            }}
            SlideProps  = {{
                onEnter: ()=>{
                    set_ec(editor.get_slate().selection)
                } , 
                onExited: () => {
                    if(parametereditor_ref && parametereditor_ref.current){ // 在退出时更新所服务的节点的参数。
                        // 在更新完毕之后，刷新area。
                        editor.add_apply_callback(()=>{
                            UseAreaStore.getState().flush()
                        })

                        // 在退出时更新所服务的节点的参数。
                        let parameters = parametereditor_ref.current.get_parameters()
                        editor.auto_set_parameter(props.node, parameters)
                    }
                    SlateReact.ReactEditor.focus(editor.get_slate())
                    if(enter_selection && enter_selection["anchor"] && enter_selection["anchor"]["path"]){
                        Slate.Transforms.select(editor.get_slate() , enter_selection) // 设置为保存的selection。
                    }
                }
            }}
            PaperProps  = {{sx: { width: "40%" }}}
        >
            <Box><StructureTypography>idx: {props.node.idx}</StructureTypography></Box>
            <Divider />
            <DefaultParameterContainer 
                node     = {props.node} 
                ref      = {parametereditor_ref}
            />
            <Button onClick={onClose}>Close</Button>
        </Drawer>
    }}</EditorGlobalInfo.Consumer>
}

