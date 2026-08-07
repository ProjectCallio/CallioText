/** 界面主题与印刷字体配置。印刷字体按语言选择。 */
import { ThemeOptions } from "@mui/material"

import { MyPartial } from "@project-callio/calliotext"
import { PrinterConfig } from "@project-callio/calliotext"

import { LANG } from "./lang"

export {
    demo_theme ,
    demo_printer_config ,
}

const demo_theme: ThemeOptions = {
    palette: {
        divider: "rgb(130, 128, 128)",
        mode: "light",
        primary: {
            main: "rgb(108, 138, 132)",
            contrastText: "rgb(255, 255, 255)",
        },
        secondary: {
            main: "rgb(156, 158, 170)",
            contrastText: "rgb(255, 255, 255)",
        },
        info: {
            main: "rgb(136, 160, 168)",
        },
        background: {
            default: "rgb(247, 244, 233)",
            paper  : "rgb(253, 251, 246)",
        },
        text: {
            primary  : "rgb(47, 47, 47)",
            secondary: "rgb(95, 95, 95)",
            disabled : "rgb(168, 168, 168)",
        },
    },
}

const zh_fonts = {
    body: {
        fontFamily: "STXihei, 'Microsoft YaHei', sans-serif",
        fontSize: "1.0rem",
        lineHeight: "1.5rem",
    },
    title: {
        fontFamily: "SimHei, 'Microsoft YaHei', sans-serif",
        fontSize: "1.0rem",
        lineHeight: "1.5rem",
    },
    structure: {
        fontFamily: "SimHei, 'Microsoft YaHei', sans-serif",
        fontSize: "1.0rem",
        lineHeight: "1.5rem",
    },
    display: {
        fontFamily: "KaiTi, STKaiti, serif",
        fontSize: "1.1rem",
        lineHeight: "1.5rem",
    },
    weaken: {
        fontFamily: "FangSong, STFangsong, serif",
        fontSize: "1.0rem",
        lineHeight: "1.5rem",
    },
}

const en_fonts = {
    body: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "1.0rem",
        lineHeight: "1.5rem",
    },
    title: {
        fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
        fontSize: "1.0rem",
        lineHeight: "1.5rem",
    },
    structure: {
        fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
        fontSize: "1.0rem",
        lineHeight: "1.5rem",
    },
    display: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "1.1rem",
        lineHeight: "1.6rem",
    },
    weaken: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "1.0rem",
        lineHeight: "1.5rem",
    },
}

const demo_printer_config: MyPartial<PrinterConfig> = {
    margins: {
        paragraph: "0.4rem",
        special: "1.0rem",
        colon: "1rem",
        level: "2rem",
    },
    fonts: LANG == "zh" ? zh_fonts : en_fonts,
}
