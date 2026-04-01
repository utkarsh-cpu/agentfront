import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Login } from "./pages/login"
import { Trial } from "./pages/trial" 

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Trial />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
