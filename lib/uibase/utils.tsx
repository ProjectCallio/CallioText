import * as React from "react"

export {
    with_partial_props,
}

function with_partial_props<PropsType extends object>(
    Component    : React.ComponentType<PropsType>, 
    default_props: Partial<PropsType>
) {
    type RemainingProps = Omit<PropsType, keyof typeof default_props>
    return (props: RemainingProps) => {
        return <Component {...default_props as Partial<PropsType>} {...props as PropsType} />
    }
}