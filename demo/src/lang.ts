/** 语言检测与界面文案。
 * 语言由 URL 的 lang 参数决定（默认英文），切换语言时整页重载，
 * 因此其余模块可以把 LANG 当作常量使用。
*/

export type Lang = "en" | "zh"

export const LANG: Lang = (()=>{
    const param = new URLSearchParams(window.location.search).get("lang")
    return param == "zh" ? "zh" : "en"
})()

export function switch_lang(){
    const url = new URL(window.location.href)
    if(LANG == "zh"){
        url.searchParams.delete("lang")
    }
    else{
        url.searchParams.set("lang", "zh")
    }
    window.location.href = url.toString()
}

const strings = {
    en: {
        subtitle: "Live demo: edit on the left, the printed page follows on the right.",
        lang_button: "中文",
        docs: "Docs",
        github: "GitHub",
        export_json: "Export JSON",
        export_done: "Document tree exported.",
        save_hint: "This demo does not persist content. Use \"Export JSON\" to download the document tree.",
        docs_url: "../en/",
    },
    zh: {
        subtitle: "在线演示：左边编辑，右边同步给出印刷结果。",
        lang_button: "English",
        docs: "文档",
        github: "GitHub",
        export_json: "导出 JSON",
        export_done: "已导出文档树。",
        save_hint: "这个演示不会保存内容，可以用「导出 JSON」下载文档树。",
        docs_url: "../zh/",
    },
} as const

export const STR = strings[LANG]
