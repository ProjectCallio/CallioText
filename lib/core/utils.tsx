import {
    AbstractNode,
    AllConceptTypes,
    ConceptNode,
    GroupNode,
    InlineNode,
    ParagraphNode,
    SupportNode,
    TextNode,
    Node , 
    is_concetnode,
} from "./intermidiate"

export {
    find_node_by_path , 
    find_concept_nodes_by_path , 
}

function find_node_by_path(root: AbstractNode, path: number[]): Node | undefined{
    if(path.length == 0){
        return root
    }
    let cur_node: Node = root
    for(let i = 0; i < path.length; i++){
        if(cur_node.children[path[i]]){
            cur_node = cur_node.children[path[i]]
        }
    }
    return cur_node
}

/**
 * find all concept nodes along the path.
 * @param root 
 * @param path 
 */
function find_concept_nodes_by_path(root: AbstractNode, path: number[]): ConceptNode[]{
    let ret: ConceptNode[] = []

    let cur_node: Node = root
    for(let i = 0; i < path.length; i++){
        if(!(cur_node.children[path[i]])){
            continue
        }
        cur_node = cur_node.children[path[i]]
        if(is_concetnode(cur_node)){
            ret.push(cur_node)
        }
    }
    return ret
}



