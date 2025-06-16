import * as React from "react"
import * as Slate from "slate"

import {
    ConceptNode , 
} from "../core"
import {
    useEditor , 
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
    selector?: (node: NodeType) => any
){
    const store = React.useContext(CurNode_ScopedStore)
    if(!store){
        throw new Error("Not in a `NodeInfoProvider` context.")
    }
    const info = useStore(store, useShallow(state=>{
        if(selector){
            return selector(state.node as NodeType)
        }
        return state.node
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
