import {
    FirstClassConcept , 
    SecondClassConcept , 
    AbstractNode ,  
    is_abstractnode , 
} from "../core"
import {
    DefaultAbstractAsRoot
} from "../default_implementation"

export {
    section_fst_concept , 
    section_snd_concept , 
    verify_root , 
}

let section_fst_concept = new FirstClassConcept({
    type: "abstract" , 
    name: "section" , 
    parameter_prototype: {
        label: {val: "section"  , type: "string"} , 
        title: {val: ""         , type: "string"} , 
        minor: {val: false      , type: "boolean"} , 
    }
})

let section_snd_concept = new SecondClassConcept({
    first_concept: "section" , 
    type: "abstract" , 
    name: "section" , 
    fixed_override: {
        label: {val: "section"  , type: "string"} , 
    }
})

function verify_root(root: AbstractNode){
    for(let child of root.children){
        if(!(is_abstractnode(child) && child.concept == "section")){
            return false 
        }
    }
    return true 
}
