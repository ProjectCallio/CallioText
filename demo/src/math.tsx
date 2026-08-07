/** MathJax 的加载与刷新。配置必须先于 MathJax 本体注入。 */
import React from "react"
import { DoSomething } from "@project-callio/calliotext"

export { MathJaxContext , MathJaxInline , MathJaxBlock }

const MATHJAX_INLINE_START = "$"
const MATHJAX_INLINE_END = "$"
const MATHJAX_BLOCK_START = "$$"
const MATHJAX_BLOCK_END = "$$"

interface MathJaxGlobal {
    typesetPromise?: ()=>Promise<void>
    texReset?: ()=>void
}

const flush_math = new DoSomething(()=>{
    const MathJax = (window as {MathJax?: MathJaxGlobal}).MathJax
    if(MathJax != undefined && MathJax.typesetPromise != undefined){
        MathJax.typesetPromise()
        MathJax.texReset?.()
    }
}, 3000)

function flush_mathjax(){
    flush_math.go()
}

function MathJaxContext(props: {children: React.ReactNode}){
    React.useEffect(() => {
        const config_script = document.createElement("script")
        config_script.text = `
            MathJax = {
                tex: {
                    packages: {"[+]": ["tagformat"]} ,
                    inlineMath: [["${MATHJAX_INLINE_START}", "${MATHJAX_INLINE_END}"]] ,
                    displayMath: [["${MATHJAX_BLOCK_START}", "${MATHJAX_BLOCK_END}"]] ,
                    tags: "ams" ,
                },
                svg: {
                    fontCache: "global" ,
                    scale: 1.0 ,
                },
                ignoreHtmlClass: "mathjax_ignore" ,
                processHtmlClass: "mathjax_process" ,
                preRemoveClass: "mathjax_preview" ,
            }
        `

        const loader_script = document.createElement("script")
        loader_script.id = "MathJax-script"
        loader_script.async = true
        loader_script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"

        document.head.appendChild(config_script)
        document.head.appendChild(loader_script)

        return ()=>{
            config_script.remove()
            loader_script.remove()
        }
    }, [])

    return <React.Fragment>
        {props.children}
    </React.Fragment>
}

function MathJaxInline(props: {children: React.ReactNode}){
    React.useEffect(()=>{
        flush_mathjax()
    }, [props.children])

    return <span className="mathjax_process">{MATHJAX_INLINE_START}{props.children}{MATHJAX_INLINE_END}</span>
}

function MathJaxBlock(props: {children: React.ReactNode}){
    React.useEffect(()=>{
        flush_mathjax()
    }, [props.children])

    return <div className="mathjax_process">{MATHJAX_BLOCK_START}{props.children}{MATHJAX_BLOCK_END}</div>
}
