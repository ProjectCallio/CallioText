import * as React from "react"

export {
    usePersistedState,
}

function usePersistedState<T>(key: string, default_val: T) {
    // 从 localStorage 获取初始值
    const [state, set_state] = React.useState<T>(() => {
        const stored_val = localStorage.getItem(key)
        return (stored_val !== null) ? JSON.parse(stored_val) : default_val
    })

    // 当 state 改变时，更新 localStorage
    React.useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state))
    }, [key, state])

    return [state, set_state] as const
}
