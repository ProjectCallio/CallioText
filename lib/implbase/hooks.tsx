import * as React from "react"
import * as Slate from "slate"
import * as ReactSlate from "slate-react"

import {
    ConceptNode , 
} from "../core"
import {
    useEditor , 
    useCurEditor , 
} from "../editor"
import {
    createStore,
    StoreApi,
} from "zustand/vanilla"
import {
    useStore,
} from "zustand"
import {
    useShallow,
} from "zustand/shallow"

export {
    useNode , 
    useParameters , 
    NodeInfoProvider , 
    useEditor , 
    useResetSelection , 
}

interface CurNodeStore{
    node?: Slate.Node & ConceptNode
    set_node: (new_node: Slate.Node & ConceptNode)=>void
}

const CurNode_ScopedStore = React.createContext<StoreApi<CurNodeStore> | null>(null)

function create_curnode_store(the_node: Slate.Node & ConceptNode): StoreApi<CurNodeStore>{
    return createStore<CurNodeStore>(set=>({
        node: the_node,
        set_node: (new_node: Slate.Node & ConceptNode)=>{
            set({node: new_node})
        }
    }))
}

function NodeInfoProvider({
    node,
    children,
}: {
    node: Slate.Node & ConceptNode, 
    children?: React.ReactNode
}){
    const store = React.useRef(create_curnode_store(node))

    React.useEffect(()=>{
        store.current.setState({node: node})
    }, [node])

    return <CurNode_ScopedStore.Provider value={store.current}>{
        children
    }</CurNode_ScopedStore.Provider>
}


function useNode<NodeType extends ConceptNode = ConceptNode>(
    is_equal?: (prev: NodeType & Slate.Node, next: NodeType & Slate.Node) => boolean
){
    const store = React.useContext(CurNode_ScopedStore)
    const prev_ref = React.useRef<NodeType & Slate.Node>(null)


    if(!store){
        throw new Error("Not in a `NodeInfoProvider` context.")
    }

    React.useEffect(()=>{
        prev_ref.current = null // 如果selector变化，则重置prev_ref
    }, [is_equal])

    const info = useStore(store, useShallow(state=>{
        let cur_node = state.node as NodeType & Slate.Node
        if(is_equal && prev_ref.current && cur_node){
            if(is_equal(prev_ref.current, cur_node)){ // 如果node不变...
                return prev_ref.current // 就返回上次select的结果。
            }
        }
        prev_ref.current = cur_node
        return cur_node
    }))

    if(info instanceof Error){
        throw info
    }
    return info
}

function useParameters(){
    const node       = useNode()
    const editor     = useEditor()
    const parameters = editor.get_core().get_printer().process_parameters(node)
    return parameters
}

function is_textend(slate: Slate.Editor, point: Slate.Point): boolean {
    const node_entry = Slate.Editor.node(slate, point.path)
    if (!node_entry) return false
  
    const node = node_entry[0]
    return Slate.Text.isText(node) && point.offset === node.text.length
  }

// XXX 不确定要不要把这个跟../editor/state.tsx合并
function useResetSelection(){
    const _selection_ref = React.useRef<Slate.Selection | null>(null)
    const editor = useCurEditor()

    
    const reset_selection = React.useCallback(()=>{
        const _selection = _selection_ref.current
        if(!_selection){
            return
        }
        if(!editor){
            return
        }
        const slate = editor.get_slate()
        
        setTimeout(() => { // 延迟执行，等待React渲染完毕
            ReactSlate.ReactEditor.focus(slate)
            Slate.Transforms.select(slate, _selection)

            
            // XXX 不知道为啥，必须要移动一下光标，不然不能正确focus
            Slate.Transforms.move(slate, { distance: 1, unit: "offset", reverse: true})
            Slate.Transforms.move(slate, { distance: 1, unit: "offset" })

            
            // XXX 现在还是有一个bug，就是他在组件末尾的时候，往后挪动也会导致失焦，要再往前挪一下
            // 这个好像是slate的bug...
            const at_end = is_textend(slate, _selection.focus)
            if(at_end){
                Slate.Transforms.move(slate, { distance: 1, unit: "offset", reverse: true})
            }
          
        }, 0)

    }, [editor])

    const set_selection = React.useCallback(()=>{
        if(!editor){
            return
        }
        const slate = editor.get_slate()
        _selection_ref.current = slate.selection
    }, [editor])

    return [set_selection, reset_selection]
}