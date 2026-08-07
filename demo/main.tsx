import React from "react"
import ReactDOM from "react-dom/client"
import { SnackbarProvider } from "notistack"
import App from "./src/App"

const root = ReactDOM.createRoot(document.getElementById("root")!)

root.render(
    <React.StrictMode>
        <SnackbarProvider maxSnack={3} anchorOrigin={{vertical: "top", horizontal: "center"}}>
            <App />
        </SnackbarProvider>
    </React.StrictMode>
)
