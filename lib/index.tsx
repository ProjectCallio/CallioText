import React from "react"
import whyDidYouRender from "@welldone-software/why-did-you-render"

if (import.meta.env.DEV) {
    whyDidYouRender(React, {
        trackAllPureComponents: false,
        trackHooks: false,
        logOnDifferentValues: true
    })
}

export * from "./core"
export * from "./uibase/exceptions"
export * from "./editor"
export * from "./uibase"
export * from "./printer"
export * from "./implbase"

export * as default_implementation from "./default_implementation"

// XXX Notice that this package should be build under development mode (using npm run build-dev) to avoid 
// React's unique key warning. See https://github.com/vitejs/vite/issues/5646.