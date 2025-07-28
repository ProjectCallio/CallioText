/** 这个模块提供一个修改根节点的参数的按钮。
 * @module
 */


/** 
 * 这个文件提供一个通用的参数编辑器。
 * @module
 */

import React, {useEffect, useState} from "react"

import * as Slate from "slate"
import * as SlateReact from "slate-react"

import { 
    Button , 
    Drawer , 
    Box , 
    Divider, 
    Typography , 
} from "@mui/material"
import {
    ArrowRightFromLineIcon , 
    SettingsIcon, 
} from "lucide-react"
import {
    useSnackbar,
} from "notistack"


import { ConceptNode } from "../../../../core"

import { EditorStructureTypography as StructureTypography } from "../../uibase/components"
import { 
    useEditor , 
    useEditorState , 
}
 from "../../../../editor"

import { 
    DefaultParameterContainerRef , 
    DefaultParameterContainer , 
    useResetSelection,
    AutoIconButton,
    useParameters, 
    AutoElement , 
    MouselessSelect , 
    
} from "../../../../implbase"

export { 
    DefaultRootParameterEditButton , 
}

/**
 * 这个组件向具体的编辑器和具体的节点提供 DefaultParameterContainer ，同时还提供一个按钮。
 * @param props.onExit 抽屉关闭时的行为。
 */
const DefaultRootParameterEditButton = React.memo(({ onExit }: { onExit?: (e: any) => void }) => {
    const editor = useEditor()
    const root = editor.get_root()

    const [open, set_open] = React.useState(false)
    const [set_selection, reset_selection] = useResetSelection()

    const is_selected = React.useContext(MouselessSelect)
    
    React.useEffect(()=>{
        // 必须在打开drawer之前设置位置。
        // 如果是onClick的时候设置（此时drawer已经打开），则对于第一个小节线，光标会跳到最前面。
        if(!open){
            set_selection() 
        }
    }, [is_selected, open])

    // 只在parameters变的时候重新渲染
    const subcomp = React.useMemo(()=>{
        return <DefaultRootParameterWithDrawer 
            open = {open} 
            onClose = {(e: any) => { 
                onExit?.(e)
                reset_selection()
                set_open(false)
            }}
        />
    }, [root.parameters, root.idx, open, onExit])

    return <Box sx={{ marginX: "auto" }}>
        <AutoIconButton onClick={()=>{
            set_open(true)
        }} title="设置参数" icon={SettingsIcon} size="large"/>
        {subcomp}
    </Box>
})


/**
 * 这个组件向具体的编辑器和具体的节点提供 DefaultParameterContainer ，并包含一个抽屉来打开关闭编辑界面。
 * 抽屉关闭时会调用 editor.apply_all() 来应用所有更新。
 * @param props.node 这个组件所服务的节点。
 * @param props.open 抽屉是否打开。
 * @param props.onClose 抽屉应该关闭时的回调。如果不提供这个参数，抽屉就不会关闭。
 */
const DefaultRootParameterWithDrawer = React.memo(({
    open, onClose
}: {
    /** 抽屉是否打开。 */
    open: boolean 

    /** 抽屉应该关闭时的回调。 */
    onClose?: (e:any)=>void
})=>{
    const editor = useEditor()
    const root = editor.get_root()

    const parametereditor_ref = React.useRef<DefaultParameterContainerRef | null>(null)
    const {enqueueSnackbar} = useSnackbar()

    return editor && <Drawer 
        anchor      = "left"
        variant     = "temporary"
        open        = {open}
        onClose     = {onClose}
        ModalProps  = {{
            keepMounted: true,
        }}
        slotProps = {{
            transition: {
                onExited: () => {
                    const par_editor = parametereditor_ref.current
                    if(!par_editor){
                        return
                    }
                    // 在更新完毕之后，刷新area。
                    editor.add_apply_callback(()=>{
                        useEditorState.getState().flush_cur_conceptnode(editor)
                    })

                    // 在退出时更新所服务的节点的参数。
                    const parameters = par_editor.get_parameters()
                    editor.set_root({parameters: {...editor.get_root().parameters, ...parameters}})
                    enqueueSnackbar("已应用参数", {
                        variant: "success",
                    })
                }    
            },
            paper: {
                sx: {
                    width: "13rem" , 
                    padding: "1rem",
                }
            }
        }}
    >
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "0.5rem",
        }}>
            <Typography 
                component = "div"
                sx = {{
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    letterSpacing: "0.02em",
                }}
            >根节点</Typography>

            <Typography 
                component = "div"
                sx = {{
                    fontSize: "0.6rem", 
                }}
            >{root.idx}</Typography>
        </Box>
        {/* <Divider /> */}
        <DefaultParameterContainer 
            node     = {root} 
            ref      = {parametereditor_ref}
        />
        <Box sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "0.5rem",
            paddingTop: "1rem",
            paddingRight: "1rem",
        }}>
            <AutoIconButton 
                title = "关闭并应用"
                icon = {ArrowRightFromLineIcon}
                size = "large"
                onClick = {onClose}
                icon_props = {{
                    sx: {
                        width: "2rem",
                        height: "2rem",
                        padding: "0.35rem",
                    }
                }}
                ignore_mouseless // 这个按钮在mouseless模式下不生效。
            />
        </Box>
    </Drawer>
}, (prev, next)=>{
    return prev.open == next.open
    && prev.onClose === next.onClose
})


