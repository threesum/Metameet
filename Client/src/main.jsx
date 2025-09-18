import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import './index.css'
import App from './App.jsx'
import Landing from "./pages/Landing"
import Room from "./pages/Room"
import Signup from "./pages/Signup"
import Signin from "./pages/Signin"
import Dashboard from "./pages/Dashboard"
import { ThemeProvider } from "./contexts/ThemeContext"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Landing />} />
            <Route path="signup" element={<Signup />} />
            <Route path="signin" element={<Signin />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="room" element={<Room />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  </StrictMode>,
)
