import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@fontsource-variable/syne"
import "@workspace/ui/styles/globals.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <App />
    </ThemeProvider>
  </StrictMode>
)
