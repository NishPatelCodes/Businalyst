import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { KpiProvider } from './context/KpiContext'
import ComingSoon from './pages/ComingSoon'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import ProfitInsights from './pages/ProfitInsights'
import RevenueInsights from './pages/RevenueInsights'
import Orders from './pages/Orders'

function App() {
  return (
    <KpiProvider>
      <Router>
        <Routes>
        <Route path="/" element={<ComingSoon />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profit-insights" element={<ProfitInsights />} />
        <Route path="/revenue-insights" element={<RevenueInsights />} />
        <Route path="/orders" element={<Orders />} />
        </Routes>
      </Router>
    </KpiProvider>
  )
}

export default App

