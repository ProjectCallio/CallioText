/* CallioText docs — sidebar / language switch / pager injection.
   Each page loads this with:
   <script src=".../assets/docs.js" data-lang="zh" data-root="../../" data-page="tutorial/01-model.html"></script>
*/
(function () {
    "use strict"

    var script = document.currentScript
    var LANG = script.getAttribute("data-lang")
    var ROOT = script.getAttribute("data-root")
    var PAGE = script.getAttribute("data-page")

    var NAV = {
        zh: {
            sub: "面向概念的结构化文本编辑器",
            switch_label: "English",
            other_lang: "en",
            prev_label: "上一篇",
            next_label: "下一篇",
            sections: [
                { title: "开始", items: [
                    ["index.html", "介绍与快速开始"],
                ]},
                { title: "教程", items: [
                    ["tutorial/01-model.html", "1. 核心思想：概念与文档树"],
                    ["tutorial/02-setup.html", "2. 准备工程"],
                    ["tutorial/03-editor.html", "3. 跑起来：最小编辑器"],
                    ["tutorial/04-printer.html", "4. 印刷器：渲染成品"],
                    ["tutorial/05-custom-concept.html", "5. 定义自己的概念"],
                    ["tutorial/06-numbering.html", "6. 自动编号与交叉引用"],
                    ["tutorial/07-advanced.html", "7. 进阶主题"],
                ]},
                { title: "默认实现", items: [
                    ["default/overview.html", "总览"],
                    ["default/interface.html", "编辑界面"],
                    ["default/keyboard.html", "键盘操作"],
                    ["default/renderers.html", "编辑渲染器工厂"],
                    ["default/customize.html", "定制默认编辑器"],
                    ["default/printer.html", "印刷侧的默认实现"],
                ]},
                { title: "API 文档", items: [
                    ["api/overview.html", "API 总览"],
                    ["api/core.html", "core：概念与节点"],
                    ["api/editor.html", "editor：编辑器"],
                    ["api/printer.html", "printer：印刷器"],
                    ["api/default.html", "默认实现与 UI 基础"],
                ]},
            ],
            ref_title: "完整参考",
            ref_label: "API Reference（TypeDoc 生成）",
        },
        en: {
            sub: "A concept-oriented structured text editor",
            switch_label: "中文",
            other_lang: "zh",
            prev_label: "Previous",
            next_label: "Next",
            sections: [
                { title: "Getting Started", items: [
                    ["index.html", "Introduction & Quick Start"],
                ]},
                { title: "Tutorial", items: [
                    ["tutorial/01-model.html", "1. Core Ideas: Concepts & the Tree"],
                    ["tutorial/02-setup.html", "2. Project Setup"],
                    ["tutorial/03-editor.html", "3. A Minimal Editor"],
                    ["tutorial/04-printer.html", "4. The Printer"],
                    ["tutorial/05-custom-concept.html", "5. Defining Your Own Concepts"],
                    ["tutorial/06-numbering.html", "6. Numbering & Cross References"],
                    ["tutorial/07-advanced.html", "7. Advanced Topics"],
                ]},
                { title: "Default Implementation", items: [
                    ["default/overview.html", "Overview"],
                    ["default/interface.html", "The Editing Interface"],
                    ["default/keyboard.html", "Keyboard Operation"],
                    ["default/renderers.html", "Renderer Factories"],
                    ["default/customize.html", "Customizing the Editor"],
                    ["default/printer.html", "The Printer Side"],
                ]},
                { title: "API Docs", items: [
                    ["api/overview.html", "API Overview"],
                    ["api/core.html", "core: Concepts & Nodes"],
                    ["api/editor.html", "editor: The Editor"],
                    ["api/printer.html", "printer: The Printer"],
                    ["api/default.html", "Default Implementation & UI"],
                ]},
            ],
            ref_title: "Full Reference",
            ref_label: "API Reference (TypeDoc, comments in Chinese)",
        },
    }

    var nav = NAV[LANG]
    if (!nav) return

    // ---------- favicon ----------
    var fav = document.createElement("link")
    fav.rel = "icon"
    fav.type = "image/png"
    fav.href = ROOT + "assets/logo.png"
    document.head.appendChild(fav)

    // ---------- sidebar ----------
    var sidebar = document.getElementById("sidebar")
    if (sidebar) {
        var github_svg =
            '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.01 8.01 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A8.01 8.01 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>'
        var html = ""
        html += '<div class="site-head">'
        html += '<a class="site-title" href="' + ROOT + LANG + '/index.html">' +
            '<img class="site-logo" src="' + ROOT + 'assets/logo.png" alt="">CallioText</a>'
        html += '<a class="github-link" href="https://github.com/ProjectCallio/CallioText" title="GitHub" aria-label="GitHub">' + github_svg + "</a>"
        html += "</div>"
        html += '<div class="site-sub">' + nav.sub + "</div>"
        html += '<a class="lang-switch" href="' + ROOT + nav.other_lang + "/" + PAGE + '">' + nav.switch_label + "</a>"

        nav.sections.forEach(function (sec) {
            html += "<h4>" + sec.title + "</h4><ul>"
            sec.items.forEach(function (item) {
                var active = item[0] === PAGE ? ' class="active"' : ""
                html += '<li><a href="' + ROOT + LANG + "/" + item[0] + '"' + active + ">" + item[1] + "</a></li>"
            })
            html += "</ul>"
        })

        html += "<h4>" + nav.ref_title + "</h4><ul>"
        html += '<li><a href="' + ROOT + 'reference/index.html">' + nav.ref_label + "</a></li></ul>"

        sidebar.innerHTML = html
    }

    // ---------- pager (prev / next) ----------
    var pager = document.getElementById("pager")
    if (pager) {
        var flat = []
        nav.sections.forEach(function (sec) {
            sec.items.forEach(function (item) { flat.push(item) })
        })
        var idx = flat.findIndex(function (item) { return item[0] === PAGE })
        if (idx >= 0) {
            var html2 = ""
            if (idx > 0) {
                html2 += '<a href="' + ROOT + LANG + "/" + flat[idx - 1][0] + '"><span class="dir">← ' +
                    nav.prev_label + "</span>" + flat[idx - 1][1] + "</a>"
            } else {
                html2 += "<span></span>"
            }
            if (idx < flat.length - 1) {
                html2 += '<a style="text-align:right" href="' + ROOT + LANG + "/" + flat[idx + 1][0] + '"><span class="dir">' +
                    nav.next_label + " →</span>" + flat[idx + 1][1] + "</a>"
            }
            pager.innerHTML = html2
        }
    }

    // ---------- breadcrumbs ----------
    var crumb_target = document.querySelector("main.content")
    if (crumb_target) {
        var crumb_section = null, crumb_page = null
        nav.sections.forEach(function (sec) {
            sec.items.forEach(function (item) {
                if (item[0] === PAGE) { crumb_section = sec.title; crumb_page = item[1] }
            })
        })
        if (crumb_section && PAGE !== "index.html") {
            var bc = document.createElement("nav")
            bc.className = "breadcrumbs"
            bc.innerHTML =
                '<a href="' + ROOT + LANG + '/index.html">CallioText</a>' +
                '<span class="sep">/</span><span>' + crumb_section + "</span>" +
                '<span class="sep">/</span><span class="current">' + crumb_page + "</span>"
            crumb_target.insertBefore(bc, crumb_target.firstChild)
        }
    }

    // ---------- on-page table of contents (right column) ----------
    var content = document.querySelector("main.content")
    if (content) {
        var headings = Array.prototype.slice.call(content.querySelectorAll("h2, h3"))
        if (headings.length >= 2) {
            var used = {}
            var toc_html = '<div class="toc-title">' + (LANG === "zh" ? "本页目录" : "On this page") + "</div><ul>"
            for (var h = 0; h < headings.length; h++) {
                var head = headings[h]
                var id = head.id
                if (!id) {
                    id = head.textContent.trim().toLowerCase()
                        .replace(/[^\w一-鿿]+/g, "-")
                        .replace(/^-+|-+$/g, "") || "section"
                    while (used[id] || document.getElementById(id)) id += "-2"
                    head.id = id
                }
                used[id] = true
                toc_html += '<li class="toc-' + head.tagName.toLowerCase() + '"><a href="#' + id + '">' +
                    head.textContent + "</a></li>"
            }
            toc_html += "</ul>"

            var toc = document.createElement("aside")
            toc.className = "toc"
            toc.innerHTML = toc_html
            document.querySelector(".layout").appendChild(toc)

            // highlight the section currently in view
            var toc_links = {}
            var link_nodes = toc.querySelectorAll("a")
            for (var l = 0; l < link_nodes.length; l++) {
                toc_links[link_nodes[l].getAttribute("href").slice(1)] = link_nodes[l]
            }
            var update_active = function () {
                var current = null
                for (var j = 0; j < headings.length; j++) {
                    if (headings[j].getBoundingClientRect().top <= 130) current = headings[j]
                }
                for (var k = 0; k < link_nodes.length; k++) link_nodes[k].classList.remove("active")
                if (current && toc_links[current.id]) toc_links[current.id].classList.add("active")
            }
            window.addEventListener("scroll", update_active, { passive: true })
            update_active()
        }
    }

    // ---------- code highlighting (shiki) ----------
    // Shiki is the highlighter VS Code's grammars are built on; unlike highlight.js
    // it has real grammars for tsx / typescript / latex. Loaded lazily from CDN;
    // if the CDN is unreachable, code blocks simply stay unhighlighted.
    ;(async function () {
        var blocks = document.querySelectorAll("pre > code[class*='language-']")
        if (!blocks.length) return
        try {
            var shiki = await import("https://cdn.jsdelivr.net/npm/shiki@1/+esm")
            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i]
                var m = block.className.match(/language-([\w-]+)/)
                var lang = m ? m[1] : "plaintext"
                if (lang === "text") lang = "plaintext"
                try {
                    var html = await shiki.codeToHtml(block.textContent, {
                        lang: lang,
                        theme: "github-light",
                    })
                    var tmp = document.createElement("div")
                    tmp.innerHTML = html
                    block.parentElement.replaceWith(tmp.firstElementChild)
                } catch (e) {
                    // unknown language: leave this block as plain text
                }
            }
        } catch (e) {
            // CDN unavailable: plain code blocks are still readable
        }
    })()
})()
