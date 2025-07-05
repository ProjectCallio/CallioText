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


const HINT_TIME = 400 // 触发提示需要按下的时间
const SYNC_TIME = 200 // 同步按键时间与事件触发时间的单位。

const MouselessHint = React.memo(({
    get_anchor_el,
    ctrl_key,
    keys,
    placement = "right",
    with_portal = false , 
    info  , 
}: {
    get_anchor_el: () => HTMLDivElement | null
    ctrl_key: KeyName | KeyName[]
    keys: KeyName[]
    placement?: PopperProps["placement"]
    with_portal?: boolean
    info?: string
})=>{
    const show_hint = useHintStore(state=>state.showhint)

    // 使用ref来记录按键，防止闭包捕获错误。
    const holding_time_ref = React.useRef(-1)
    const holding_ref = React.useRef(false)
    const holding_version = useKeyEvents(store=>{
        const keys = store.holding_keys
        const flag = keys.length == 1 && ctrl_key.includes(keys[0])

        // 这个记录按键的时间。
        // 之所以是用按键的时间而不是用事件触发的时间是为了防止不同组件触发钩子的时间不同。
        if(flag){
            let press_time = store.press_time[keys[0]] ?? -1
            let now_time = Date.now()

            // 舍入到最近`SYNC_TIME`以内，防止以前的按键假触发
            // 但是只能加`SYNC_TIME`的整数倍数，这是为了让不同组件同步。
            const N = Math.floor((now_time - press_time) / SYNC_TIME)
            press_time = press_time + SYNC_TIME * N
            holding_time_ref.current = press_time
        }
        holding_ref.current = flag
        return flag
    })
    const [holding, set_holding] = React.useState(false)

    React.useEffect(()=>{
        if(!show_hint){
            return
        }
        if(holding_ref.current){
            // 反复监听直到超过500ms。
            // 这样写是为了让所有组件尽可能同时触发。
            const interval = setInterval(()=>{
                if(!holding_ref.current){
                    set_holding(false)
                    clearInterval(interval)
                    return 
                }
                const now = Date.now()
                if(now - holding_time_ref.current > HINT_TIME){
                    set_holding(true)
                    clearInterval(interval)
                }
            }, 20)
        }
        else{
            set_holding(false)
        }
    }, [holding_version, show_hint, holding])

    const palette = useTheme().palette

    const popper_comp = React.useMemo(()=>{
        const anchor_el = get_anchor_el()
        if(!anchor_el){
            return null
        }
        return <Popper 
            open={true}
            anchorEl={anchor_el}
            placement={placement}
            disablePortal={with_portal ? undefined : true}
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
        </Popper>
    }, [placement, with_portal, get_anchor_el, holding_version])


    return <AnimatePresence mode="wait">{(holding && show_hint) && popper_comp}</AnimatePresence>
})

