import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ElevatorControl from './pages/ElevatorControl'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/elevator-control" element={<ElevatorControl />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
