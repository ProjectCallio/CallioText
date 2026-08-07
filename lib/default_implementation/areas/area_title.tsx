/** 区域面板左上角的标题：一个小图标加面板名称。 */
import * as React from "react"

import {
    Typography ,
    useTheme ,
} from "@mui/material"
import type { LucideIcon } from "lucide-react"

export {
    AreaTitle ,
}

function AreaTitle(props: {icon: LucideIcon, children: React.ReactNode}){
    const { palette } = useTheme()
    const Icon = props.icon
    return <Typography variant="subtitle2" sx={{
        flexGrow: 1,
        fontWeight: 500,
        color: palette.text.secondary,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "0.4rem",
    }}>
        <Icon size={15}/>
        {props.children}
    </Typography>
}
