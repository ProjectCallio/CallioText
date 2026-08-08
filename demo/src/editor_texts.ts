/** 默认编辑器界面文字的英文版。库自带的默认文案是中文，这里按语言覆盖。 */
import { PartialEditorTexts } from "@project-callio/calliotext"
import { LANG } from "./lang"

export { editor_texts }

const en: PartialEditorTexts = {
    buttons: {
        edit_parameters         : "Edit parameters",
        delete_node             : "Delete node",
        unwrap_node             : "Unwrap node",
        add_paragraph_above     : "Add paragraph above",
        add_paragraph_below     : "Add paragraph below",
        copy_node               : "Copy node",
        chain_switch            : "Chain to previous",
        new_abstract            : "New abstract",
        expand                  : "Expand",
        close_and_apply         : "Close and apply",
        apply_parameters        : "Apply changes",
        show_hint               : "Show key hints",
        parameter_area          : "Parameter panel",
        concept_area            : "Concept panel",
        delete_abstract         : "Delete",
        confirm_delete_abstract : "Click again to delete",
    },
    areas: {
        concept_title  : "Insert Concept",
        parameter_title: "Edit Parameters",
        concept_types: {
            group    : "Group",
            inline   : "Inline",
            support  : "Support",
            structure: "Structure",
        },
    },
    messages: {
        save_success           : "Saved.",
        parameters_applied     : "Parameters applied.",
        parameters_auto_applied: "Parameters applied automatically.",
        parameters_saved       : "Parameters saved.",
    },
}

/** 中文不用传，库的默认值就是中文。 */
const editor_texts: PartialEditorTexts | undefined = LANG == "zh" ? undefined : en
