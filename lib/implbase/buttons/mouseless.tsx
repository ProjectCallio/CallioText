/**
 * 这个模块规定每个概念节点的按钮栏的无鼠标操作。
 * 约定1：位置用`[节点编号,按钮组层次,按钮编号]`来表示。其中按钮层次以`0`开始。
 * 约定2：每个概念节点都有按钮。按钮编号用整数表示。在实际取得按钮的时候取模。
 * @module
 */

/*
    XXX 这个按钮组层次本来的设计是可以有多层按钮，但是现在看来好像没有必要。
 */

import React from "react"
import * as Slate from "slate"
import {
    ConceptNode,
    Node
} from "../../core"

import {
    KeyNames ,
    
    SpaceDefinition , 
    NodeName , 
    KeyName , 
} from "@ftyyy/mouseless"

import { 
    EditorComponent , 
    slate_is_concept , 
    slate_concept_father , 
    slate_idx_to_node , 
    useCurEditor , 
} from "../../editor"

export {
    get_mouseless_space , 
    decode_position ,
    get_position ,
    SPACE_NAME , 
    HOLDING , 
}

const SPACE_NAME = "buttons"
const HOLDING = [KeyNames.alt, KeyNames.q]

function get_position(node_idx: string , level: number,position_idx: number): string{
    return JSON.stringify([node_idx, level, position_idx])
}
function decode_position(position: string): [string, number, number]{

    return JSON.parse(position) as [string, number, number]
}

/** 这个函数是位置函数的备用方案，当在祖先节点中找不到一个带无鼠标元素的概念节点时，就去兄弟节点中找。 */
function get_brother_concept(editor: EditorComponent): NodeName | undefined{
    let selection = editor.get_slate().selection
    if(!selection){ // 如果光标不在编辑器上
        return undefined
    }

    let now_path = selection.anchor.path // 如果光标在编辑器上，那么就选择光标开始位置作为当前节点。
    let my_order_in_father = now_path[now_path.length-2] || 0 // 自己在父节点中的位置
    now_path = now_path.slice(0,now_path.length-2) // 向上两格，之所以要向上两格是为了跳出text，然后再跳出一格。

    let father_node = Slate.Editor.node(editor.get_slate(), now_path)[0] // 父节点
    let children = (father_node as any)["children"] as (Slate.Node[] | undefined)
    if(!children){
        return undefined // 如果父节点没有子节点，那么就返回undefined。
    }

    let res_node: (Slate.Node & ConceptNode) | undefined = undefined
    for(let _subidx in children){ // 枚举父节点的子节点。
        let sub_order = parseInt(_subidx)
        if(sub_order >= my_order_in_father){ // 不要管后面的节点。
            break
        }
        let subnode = children[sub_order]
        if(!slate_is_concept(subnode)){ // 跳过非概念节点。
            continue
        }
        res_node = subnode // 找到离自己最近的一个兄弟概念节点。
    }
    if(!res_node){
        return undefined
    }
    return get_position(res_node.idx, 0, 0)
}

function onMoveMaker(get_editor: ()=>EditorComponent | undefined, trigger_key: KeyName){
    return (from?: NodeName): string | undefined =>{
        let editor = get_editor()
        if(editor == undefined){
            return undefined
        }
        if(!from){
            return onStartMaker(get_editor)(undefined)
        }

        // 获得当前激活位置。
        let [now_node_idx, now_level, now_button_idx] = decode_position(from)

        let new_idx = now_button_idx
        let new_level = now_level
        if(trigger_key == KeyNames.ArrowLeft){
            new_idx --
        }
        if(trigger_key == KeyNames.ArrowRight){
            new_idx ++
        }
        if(trigger_key == KeyNames.ArrowUp){
            new_level --
        }
        if(trigger_key == KeyNames.ArrowDown){
            new_level ++
        }


        return get_position(now_node_idx, new_level, new_idx)
    }
}

function onStartMaker(get_editor: ()=>EditorComponent | undefined): (last?: NodeName)=> NodeName | undefined{
    return (last?: NodeName): NodeName | undefined => {
        let editor = get_editor()
        if(editor == undefined){
            return undefined
        }
        let now_node = editor.get_cur_concept_node()
        if(!now_node){
            return undefined
        }
        // 如果退到了根节点，就说明没有找到概念节点，那么就返回兄弟节点。
        if(now_node.idx == editor.get_root().idx){ 
            return get_brother_concept(editor) ?? last
        }

        let now_idx = now_node.idx

        if(last != undefined){
            let [old_nodeidx, _] = JSON.parse(last)
            if(old_nodeidx == now_idx){ // 如果还在之前的节点内，那么就保留原来的位置。
                return last 
            }
        }

        return get_position(now_idx, 0, 0)
    }
}


function get_mouseless_space(): SpaceDefinition{

    const onStart = onStartMaker(useCurEditor.current)    

    return {
        name: SPACE_NAME ,
        holding: HOLDING , 
        nodes: [] , // 这个是可以留空的（大概）...
    
        onStart: (from)=> onStart(from) ?? "_no_action", 
    
        // 这个是用来描述按钮的。
        edges: [
            {pressing: KeyNames.ArrowLeft , onMove: onMoveMaker(useCurEditor.current, KeyNames.ArrowLeft ) },
            {pressing: KeyNames.ArrowRight, onMove: onMoveMaker(useCurEditor.current, KeyNames.ArrowRight) },
            {pressing: KeyNames.ArrowUp   , onMove: onMoveMaker(useCurEditor.current, KeyNames.ArrowUp   ) },
            {pressing: KeyNames.ArrowDown , onMove: onMoveMaker(useCurEditor.current, KeyNames.ArrowDown ) },
        ]
    }
}
