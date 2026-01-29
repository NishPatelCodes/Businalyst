import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ComingSoon />} />
        {/* TODO: Add login route when login page is ready */}
      </Routes>
    </Router>
  )
}

export default App

