import * as React from "react"
import * as Slate from "slate"
import { EditorComponent } from "./main"
import { gene_idx } from "../utils"
import { 
    Node , 
    is_concetnode , 
} from "../core"

export {
    handle_copy,
    handle_paste,
}
export type {
    CopyPasteData,
}

interface CopyPasteData{
    fragment: (Slate.Node & Node)[]
    copy_id ?: string 
}

let copy_id_cache: {[key: string]: boolean} = {}

// XXX 目前的逻辑只能处理同一个网页的复制粘贴，因为copy_id是保存在内存中的。

/**
* 这个函数返回一个控制copy行为的函数。
* copy_id会跟踪每次复制或者剪切。
* 如果粘贴的时候发现相同copy_id的内容已经被粘贴过，那么就会给每个节点创建新的idx。
* 如果copy_id是undefined，那么也会创建新的idx。
*/
function handle_copy(
    editor: EditorComponent, 
    e: React.ClipboardEvent<HTMLDivElement>, 
    force_newidx : boolean , 
    remove_data: boolean,
){
    let slate = editor.get_slate()
    let selection = slate.selection
    if(selection == undefined){
        return
    }

    const data: CopyPasteData = {
        fragment: Slate.Editor.fragment(slate, selection) as (Slate.Node & Node)[],
        copy_id: force_newidx ? undefined : gene_idx(),
    }
    const serialized = JSON.stringify(data)

    console.log("handle_copy", data.fragment)

    e.clipboardData.setData(
        "application/x-caliotext-fragment", 
        btoa(encodeURIComponent(serialized))
    )
    e.clipboardData.setData("text/plain", serialized)

    if(remove_data){
        Slate.Transforms.delete(slate)
    }

    e.preventDefault()
}

function make_new_idx(node: (Slate.Node & Node)){
    if(is_concetnode(node)){
        node.idx = gene_idx()
    }
    let children = (node as any).children
    if(children){
        for(let idx in children){
            children[idx] = make_new_idx(children[idx])
        }
    }
    return node
}

function handle_paste(
    editor: EditorComponent, 
    e: React.ClipboardEvent<HTMLDivElement>, 
){
    let slate = editor.get_slate()

    let enc_data = e.clipboardData.getData("application/x-caliotext-fragment")
    if(!enc_data){
        let text = e.clipboardData.getData("text/plain")
        Slate.Transforms.insertText(slate, text)
        e.preventDefault()
        return 
    }

    let data = JSON.parse(decodeURIComponent(atob(enc_data))) as CopyPasteData
    let fragment = data.fragment
    let copy_id = data.copy_id

    // 剥离最外层元素
    // XXX 不确定是不是最优方案
    while(
        fragment.length == 1 
        && (fragment[0] as any).children 
        && (fragment[0] as any).children.length == 1
    ){
        fragment = (fragment[0] as any).children
    }
    
    console.log("handle_paste", fragment)

    if(copy_id == undefined || copy_id_cache[copy_id]){
        for(let cur_node of fragment){
            make_new_idx(cur_node)
        }
    }
    if(copy_id != undefined){
        copy_id_cache[copy_id] = true
    }

    Slate.Editor.insertFragment(slate, fragment)
    e.preventDefault()
}
