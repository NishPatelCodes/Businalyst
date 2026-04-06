import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { KpiProvider } from './context/KpiContext'
import ProtectedRoute from './components/ProtectedRoute'
import ComingSoon from './pages/ComingSoon'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import ProfitInsights from './pages/ProfitInsights'
import RevenueInsights from './pages/RevenueInsights'
import Orders from './pages/Orders'
import ExpenseInsights from './pages/ExpenseInsights'
import CustomersInsights from './pages/CustomersInsights'

function App() {
  return (
    <AuthProvider>
      <KpiProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/profit-insights" element={<ProtectedRoute><ProfitInsights /></ProtectedRoute>} />
            <Route path="/revenue-insights" element={<ProtectedRoute><RevenueInsights /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/expense-insights" element={<ProtectedRoute><ExpenseInsights /></ProtectedRoute>} />
            <Route path="/analytics/customers" element={<ProtectedRoute><CustomersInsights /></ProtectedRoute>} />
          </Routes>
        </Router>
      </KpiProvider>
    </AuthProvider>
  )
}

export default App
