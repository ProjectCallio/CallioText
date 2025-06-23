/** 这个模块提供一个修改根节点的参数的按钮。
 * @module
 */

import React, {useEffect, useState} from "react"

import { 
    Button , 
    Drawer , 
    Box , 
    Divider, 
} from "@mui/material"
import { 
    Settings as SettingsIcon , 
} from "@mui/icons-material"

import * as Slate from "slate"
import * as SlateReact from "slate-react"

import {
    AbstractNode, 
} from "../../../../core"

import { EditorStructureTypography as StructureTypography } from "../../uibase/components"
import { 
    EditorComponent , 
    EditorGlobalInfo , 
} from "../../../../editor"
import { AutoIconButton } from "../base"
import {
    DefaultParameterContainer , 
    DefaultParameterContainerRef , 
} from "../../../../implbase"

export { 
    DefaultRootParameterWithEditorWithDrawer , 
    DefaultRootParameterEditButton , 
}


/** 参数更新抽屉的`props` */
type DefaultRootParameterWithEditorWithDrawerProps = {

    root: AbstractNode

    /** 抽屉是否打开。 */
    open: boolean 

    /** 所服务的编辑器。这里之所以需要传入编辑器组件是因为这个按钮不在编辑器的上下文内。 */
    editor: EditorComponent

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
function DefaultRootParameterWithEditorWithDrawer(props: DefaultRootParameterWithEditorWithDrawerProps){
    let globalinfo = React.useContext(EditorGlobalInfo)
    let onClose = props.onClose || ((e:any)=>{})
    let parametereditor_ref = React.useRef<DefaultParameterContainerRef | null>(null)

    // 记录进入时的光标位置，以便在退出时还原。
    let [enter_selection , set_ec] = React.useState<Slate.BaseSelection | null>(null)

    let editor = props.editor

    // 临时提供一个上下文。
    return <EditorGlobalInfo.Provider value={{...globalinfo, editor: props.editor}}><Drawer 
        anchor      = {"left"}
        open        = {props.open}
        onClose     = {onClose}
        ModalProps  = {{
            keepMounted: true,
        }}
        slotProps = {{
            transition: {
                onEnter: ()=>{
                    set_ec(editor.get_slate().selection)
                } , 
                onExited: () => {
                    if(parametereditor_ref?.current){ // 在退出时更新所服务的节点的参数。
                        let parameters = parametereditor_ref.current.get_parameters()
                        editor.set_root({parameters: {...editor.get_root().parameters, ...parameters}})
                    }
                    SlateReact.ReactEditor.focus(editor.get_slate())
                    if(enter_selection && enter_selection["anchor"] && enter_selection["anchor"]["path"]){
                        Slate.Transforms.select(editor.get_slate() , enter_selection) // 设置为保存的selection。
                    }
                }
            }, 
            paper: {
                sx: {
                    width: "40%"
                }
            }
        }}
    >
        <Box><StructureTypography>idx: {props.root.idx} [root]</StructureTypography></Box>
        <Divider />
        <DefaultParameterContainer 
            node     = {props.root} 
            ref      = {parametereditor_ref}
        />
        <Button onClick={onClose}>Close</Button>
    </Drawer></EditorGlobalInfo.Provider>
}

interface DefaultRootParameterEditButtonProps{

    root: AbstractNode

    /** 所服务的编辑器。这里之所以需要传入编辑器组件是因为这个按钮不在编辑器的上下文内。 */
    editor: EditorComponent

    onExit?: (e:any)=>void
}

/**
 * 这个组件提供`DefaultRootParameterWithEditorWithDrawer`的按钮
 */
function DefaultRootParameterEditButton(props: DefaultRootParameterEditButtonProps) {
    const [open, setOpen] = React.useState(false)
    const onExit = props.onExit || ((e: any) => {})

    return <Box sx={{ marginX: "auto" }}>
        <AutoIconButton 
            onClick={() => setOpen(true)} 
            title="设置参数" 
            icon={SettingsIcon} 
            size="medium" 
        />
        <DefaultRootParameterWithEditorWithDrawer 
            root={props.root} 
            editor={props.editor}
            open={open} 
            onClose={e => { 
                onExit(e)
                setOpen(false)
            }} 
        />
    </Box>
}
