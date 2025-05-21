/** 
 * 这个文件提供一个开箱即用的editor示例。
 * @module
 */
import React  from "react"

import {
    Accordion , 
    AccordionSummary , 
    Toolbar , 
    Typography , 
    Button , 
    Box , 
    Paper ,
    Divider , 
    Popover , 
} from "@mui/material"

import * as Slate from "slate"
import * as SlateReact from "slate-react"
import {
    EditorComponent , 
    EditorCore, 
    EditorComponentProps , 
} from "../../editor"
import {
    ConceptNode , 
    GroupNode , 
    Node , 
    AllConceptTypes , 
    AllNodeTypes, 
    AbstractNode,
} from "../../core"

import { 
    DefaultParameterEditButton , 
    DefaultRootParameterEditButton , 
} from "./buttons"
import { 
    AutoStack , 
    AutoTooltip , 
    AutoStackedPopper , 
    AutoStackButtons , 
} from "../../uibase"
import {
    object_foreach , 
    merge_object ,

} from "../../utils"

import {
    KeyEventManager , 
    MouselessElement , 
    KeyDownUpFunctionProxy , 
    DirectionKey, 
} from "../../uibase/mouseless"

import { 
    EditorBackgroundPaper , 
    EditorComponentEditingBox  ,
    EditorConfigContext , 
    make_editorconfig , 
    EditorConfig , 
    PartialEditorConfig , 
} from "./uibase"
import { 
    ScrollBarBox , 
} from "../../uibase"

import {
    set_normalize_status , 
    get_normalize_status , 
} from "../../editor/plugins"
import {
    slate_is_concept , 
} from "../../editor/utils"

import {
    DefaultSidebar , 
    get_mouseless_space as sidebar_get_mouseless_space , 
} from "./sidebar"
import {
    get_mouseless_space as buttons_get_mouseless_space
} from "../../implbase/buttons"

import {
    ParameterEdit
} from "./editbox"

export { 
    IdxConflictSolver ,
}

export type {
    IdxConflictSolverProps , 
}


interface IdxConflictSolverProps{
    get_editor: ()=> EditorComponent | undefined
    children: (onUpdate: ()=>void)=>React.ReactElement
}

class IdxConflictSolver extends React.Component<IdxConflictSolverProps,{
    idx_conflicts: [string, number[][]][] // 节点idx冲突

}>{

    constructor(props: IdxConflictSolverProps){
        super(props)

        this.state = {
            idx_conflicts: [] , 
        }

        this.IdxConflitSolverComp = this.IdxConflitSolverComp.bind(this)
    }

    get_editor(){
        return this.props.get_editor()
    }
        
    /**
     * 添加一个编号冲突。
     */
    append_idx_conflict(conflicts: [string, number[][]][]){
        this.setState({idx_conflicts: [...this.state.idx_conflicts, ...conflicts]})
    }

    /**
     * 解决编号冲突的组件。
     */
    IdxConflitSolverComp(props: {}){
        let me = this
        let editor = me.get_editor()
        if(!editor){ // 等待editor创建完毕
            return <></>
        }
        let slate = editor.get_slate()
        let conflicts = this.state.idx_conflicts

        /**
         * 解决一个`idx`冲突。
         * 如果`keep`是`undefined`，则重写所有人的`idx`。如果`keep`是一个`path`，则
         * 保留这个`path`指向的节点的`idx`，重写其他节点的`idx`。如果`keep = "fuck"`，那么就跳过这个冲突。
         * @param keep 要如何解决冲突。
         * @returns 
         */
        function _solve(keep: number[] | undefined | string = undefined){
            if(conflicts.length <= 0){
                return
            }
            let new_conf = [...me.state.idx_conflicts]
            let confitem = new_conf.shift()
            if(keep != "fuck" && confitem && editor){
                for(let path of confitem[1]){
                    if(keep && JSON.stringify(path) == JSON.stringify(keep)){ // 或许用下标比较更好？
                        continue
                    }
                    editor.set_node_by_path(path,{
                        idx: Math.floor(Math.random()*233333333 + 2333333).toString()
                    })
                }    
            }
            me.setState({idx_conflicts: new_conf})
        }

        return <React.Fragment>
            <Popover
                sx={{
                    left: "30%",
                    top: "20%",
                    minWidth: "20rem" , 
                    minHeight: "30rem" , 
                }}
                PaperProps = {{
                    sx:{
                        paddingX: "1rem",
                        paddingY: "1rem" , 
                        minWidth: "40vw" , 
                        backgroundColor: "rgba(160,60,90,0.90)" , 
                        color: "white" , 
                    },
                }}
                
                open = {conflicts.length > 0}
                anchorReference="none"
                onClose={()=>{}}
            >
                <p>以下组件编号冲突，请选择要保留谁的编号。目前还有{conflicts.length}个冲突</p>
                {conflicts.length > 0 ? conflicts[0][1].map((path, key)=>{
                    return <div key = {key} style={{
                        
                        marginTop: "1rem" , 
                        marginBottom: "1rem" , 
                        display: "flex" , 
                    }}>
                        <div style={{
                            border: "1px solid white" ,
                            marginRight: "1rem" , 
                            paddingLeft: "0.5rem" , 
                            paddingRight: "0.5rem" , 
                        }}>
                            <p>位置：{JSON.stringify(path)}</p>
                            <p>内容：</p>
                            <p style={{paddingLeft: "2rem"}}>{Slate.Node.string(Slate.Node.get(slate, path))}</p>
                        </div>
                        <div style={{marginTop: "auto", marginBottom: "auto"}}>
                            <Button sx={{color:"white", borderColor: "white"}} variant="outlined" onClick={()=>{
                                _solve(path)
                            }}>保留这个</Button>
                        </div>
                    </div>
                }) : <></>}
                <Button sx={{color:"white", borderColor: "white", marginRight: "1rem"}} variant="outlined" onClick={()=>{
                    _solve()
                }}>你看着办</Button>
                <Button sx={{color:"white", borderColor: "white", marginRight: "1rem"}} variant="outlined" onClick={()=>{
                    _solve("fuck")
                }}>当不存在</Button>
            </Popover>
        </React.Fragment>
    }

    /**
     * 检查是否有编号冲突。
     */
    check_idx(){
        if(!get_normalize_status("pasting")){ // 如果没有在粘贴，就直接退出。
            return 
        }

        let me = this
        let editor = me.get_editor()
        if(!editor){
            return
        }
        let slate = editor.get_slate()
        let idx_paths: {[key: string]: number[][]} = {}
        for(let [node,path] of Slate.Node.descendants(slate)){
            if(!slate_is_concept(node)){
                continue
            }
            if(idx_paths[node.idx] == undefined){
                idx_paths[node.idx] = []
            }
            idx_paths[node.idx].push(path)
        }

        let conflicts: [string, number[][]][] = new Array()
        for(let idx in idx_paths){
            if(idx_paths[idx].length > 1){
                conflicts.push([idx, idx_paths[idx]])
            }
        }
        if(conflicts.length > 0){
            me.append_idx_conflict( conflicts )
        }
        set_normalize_status({pasting: false})
    }

    render(){
        let me = this 
        let IdxConflitSolverComp = this.IdxConflitSolverComp
        return <React.Fragment>
            <IdxConflitSolverComp />
            {this.props.children(()=>{
                me.check_idx()
            })}
        </React.Fragment>
    }
}
