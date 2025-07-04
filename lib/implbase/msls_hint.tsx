import * as React from "react"

import {
    KeyName,
    useKeyHoldingState , 
    useKeyEvents , 
} from "@ftyyy/mouseless"

import {
    Box , 
    Typography ,
    Chip , 
    Popper , 
    useTheme,
    alpha,
    PopperProps , 
} from "@mui/material"

import {
    motion,
    AnimatePresence
} from "framer-motion"

import {
    create , 
} from "zustand"

import {
    persist,
} from "zustand/middleware"

import {
    Tags as TagsIcon,
} from "lucide-react"

import {
    AutoIconButton,
} from "./buttons"

export {
    MouselessHint,
    ShowHintControlButton,
}

const useHintStore = create(persist<{
    showhint: boolean,
    set_showhint: (show: boolean)=>void,
}>(set=>{
    return {
        showhint: false,
        set_showhint: (show: boolean)=>{
            set({showhint: show})
        }
    }
}, {
    name: "mouselesshint-open",
}))

const ShowHintControlButton = React.memo(()=>{
    const show_hint = useHintStore(state=>state.showhint)
    const set_showhint = useHintStore(state=>state.set_showhint)

    return <AutoIconButton 
        onClick = {() => set_showhint(!show_hint)} 
        icon    = {TagsIcon}
        title   = "显示提示"
        size    = "large" 
        activate = {show_hint}
    />
})

const MouselessHint = React.memo(({
    get_anchor_el,
    ctrl_key,
    keys,
    placement = "right",
    with_portal = false , 
    info  , 
}: {
    get_anchor_el: () => HTMLDivElement | null
    ctrl_key: KeyName
    keys: KeyName[]
    placement?: PopperProps["placement"]
    with_portal?: boolean
    info?: string
})=>{
    const anchor_el = React.useRef<HTMLDivElement>(null)
    const show_hint = useHintStore(state=>state.showhint)

    const _holding = useKeyEvents(store=>{
        const keys = store.holding_keys
        return keys.length == 1 && keys[0] === ctrl_key
    })
    const _holding_ref = React.useRef(_holding)
    _holding_ref.current = _holding // 防止闭包捕获错误

    const [holding, set_holding] = React.useState(false)
    React.useEffect(()=>{
        if(!show_hint){
            return
        }
        if(_holding_ref.current){
            setTimeout(()=>{
                // 需要连续按下500ms才能触发
                if(_holding_ref.current){
                    set_holding(true)
                }
            }, 500)
        }
        else{
            set_holding(false)
        }
    }, [_holding, show_hint])

    const palette = useTheme().palette

    React.useEffect(()=>{
        anchor_el.current = get_anchor_el()
    }, [get_anchor_el, holding])


    return <AnimatePresence mode="wait">{(show_hint && holding) && (
        <Popper 
            open={true}
            anchorEl={anchor_el.current}
            placement={placement}
            disablePortal={!with_portal}
            sx={{
                zIndex: 10000,
            }}
        >
        <motion.div
            key="hint"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <Chip 
                size = "small"
                label={
                    keys.map(key => key.toLowerCase()).join("+") + 
                    (info ? `+( ${info} )` : "")
                } 
                sx={{
                    backgroundColor: alpha(palette.grey[600], 0.8),
                    color: palette.secondary.contrastText,
                    backdropFilter: "blur(2px)",
                    borderRadius: "4px",
                }}
            />
        </motion.div>
    </Popper>)}</AnimatePresence>
})
