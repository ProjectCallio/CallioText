import React, { useState, useEffect, useRef } from "react"

import {
    Box ,
    Button ,
    Divider ,
    Typography ,
    ThemeProvider ,
    createTheme ,
} from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"
import { useSnackbar } from "notistack"
import { debounce } from "lodash"

import {
    AbstractNode ,
    EditorCore ,
    Printer ,
    RendererDict ,
    DefaultRendererDict ,
    mod_scrollbar ,
    DefaultEditorComponent ,
    DefaultPrinterComponent ,
    AreaContainer ,
} from "@project-callio/calliotext"

import { STR , switch_lang } from "./lang"
import {
    first_concepts ,
    second_concepts ,
    renderers ,
    default_renderers ,
    editors ,
    default_editors ,
} from "./concepts"
import { demo_theme , demo_printer_config } from "./theme"
import { MathJaxContext } from "./math"
import { build_document } from "./document"

const GITHUB_URL = "https://github.com/ProjectCallio/CallioText"

const topbar_height = "3.2rem"

const topbar_styles = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: topbar_height,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "0.8rem",
    paddingX: "1.2rem",
    boxSizing: "border-box",
    borderBottom: "1px solid",
    borderBottomColor: "divider",
    backgroundColor: "background.paper",
    zIndex: 10,
} as const

const main_styles = {
    position: "absolute",
    top: topbar_height,
    bottom: 0,
    left: 0,
    width: "100%",
} as const

const inner_styles = {
    position: "absolute",
    top: "1rem",
    bottom: "0.5rem",
    left: "1%",
    width: "98%",
} as const

const editor_styles = {
    position: "absolute",
    width: "49%",
    left: "0%",
    top: "0",
    height: "100%",
} as const

const printer_styles = {
    position: "absolute",
    width: "49%",
    left: "50%",
    top: "0",
    height: "100%",
} as const

const area_container_styles = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0)",
} as const

const App: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()
    const [printer, set_printer] = useState<Printer | undefined>(undefined)
    const [editor_core, set_editor_core] = useState<EditorCore | undefined>(undefined)
    const [tree, set_tree] = useState<AbstractNode | undefined>(undefined)

    const [tree_children, tree_property] = React.useMemo(()=>{
        if(!tree){
            return [undefined, undefined]
        }
        const {children, ...property} = tree
        return [children, property]
    }, [tree])

    const editor_ref = useRef<DefaultEditorComponent | null>(null)

    useEffect(() => {
        const printer = new Printer(
            first_concepts,
            second_concepts,
            renderers as RendererDict,
            default_renderers as DefaultRendererDict,
        )

        const editor_core = new EditorCore({
            renderers: editors,
            default_renderers: default_editors,
            printer: printer,
        })

        const root = build_document(editor_core)

        set_printer(printer)
        set_editor_core(editor_core)
        set_tree(root)
    }, [])

    /** 从编辑器读出最新的树，交给印刷器。 */
    const update_tree = React.useCallback(() => {
        const editor = editor_ref.current?.get_editor()
        if (!editor) {
            return
        }
        const root = editor.get_root()
        set_tree(root)
        return root
    }, [])

    /** 编辑时防抖地刷新印刷结果。 */
    const debounced_update = React.useMemo(
        () => debounce(update_tree, 600),
        [update_tree],
    )

    const handle_save = React.useCallback(() => {
        update_tree()
        enqueueSnackbar(STR.save_hint, { variant: "info" })
    }, [update_tree, enqueueSnackbar])

    const handle_export = React.useCallback(() => {
        const editor = editor_ref.current?.get_editor()
        const root = editor ? editor.get_root() : tree
        if(!root){
            return
        }
        const blob = new Blob([JSON.stringify(root, null, 4)], {type: "application/json"})
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "calliotext-demo.json"
        a.click()
        URL.revokeObjectURL(url)
        enqueueSnackbar(STR.export_done, { variant: "success" })
    }, [tree, enqueueSnackbar])

    if (!(editor_core && printer && tree)) {
        return <></>
    }

    return <ThemeProvider theme={createTheme(demo_theme)}><CssBaseline />
        <Box sx={topbar_styles}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} style={{height: "1.8rem"}} alt="CallioText" />
            <Typography sx={{fontWeight: 600, fontSize: "1.1rem"}}>CallioText</Typography>
            <Typography sx={{
                color: "text.secondary",
                fontSize: "0.85rem",
                flexGrow: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}>{STR.subtitle}</Typography>
            <Button size="small" onClick={switch_lang}>{STR.lang_button}</Button>
            <Button size="small" onClick={handle_export}>{STR.export_json}</Button>
            <Button size="small" href={STR.docs_url}>{STR.docs}</Button>
            <Button size="small" href={GITHUB_URL} target="_blank" rel="noopener">{STR.github}</Button>
        </Box>

        <Box sx={main_styles}>
        <Box sx={inner_styles}>
            <Box sx={editor_styles} className="mathjax_ignore">
                <DefaultEditorComponent
                    key="editor-component"
                    ref={editor_ref}
                    editorcore={editor_core}
                    init_rootchildren={tree_children}
                    init_rootproperty={tree_property}
                    onUpdate={debounced_update}
                    onSave={handle_save}
                    end_element={<Divider sx={{
                        marginY: "1rem",
                        marginX: "0.5rem",
                    }}/>}
                />
            </Box>

            <Box sx={printer_styles}>
                <Box sx={area_container_styles}>
                    <AreaContainer />
                </Box>

                <MathJaxContext>
                    <Box
                        ref={mod_scrollbar}
                        sx={{width: "100%", height: "100%"}}
                        className="mathjax_process"
                    >
                        <DefaultPrinterComponent
                            printer={printer}
                            config={demo_printer_config}
                            root={tree}
                        />
                    </Box>
                </MathJaxContext>
            </Box>
        </Box></Box>
    </ThemeProvider>
}

export default App
