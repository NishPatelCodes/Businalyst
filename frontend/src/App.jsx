import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { KpiProvider } from './context/KpiContext'
import ProtectedRoute from './components/ProtectedRoute'

const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Upload = lazy(() => import('./pages/Upload'))
const ProfitInsights = lazy(() => import('./pages/ProfitInsights'))
const RevenueInsights = lazy(() => import('./pages/RevenueInsights'))
const Orders = lazy(() => import('./pages/Orders'))
const ExpenseInsights = lazy(() => import('./pages/ExpenseInsights'))
const CustomersInsights = lazy(() => import('./pages/CustomersInsights'))

function App() {
  return (
    <AuthProvider>
      <KpiProvider>
        <Router>
          <Suspense fallback={<div style={{ padding: '24px' }}>Loading...</div>}>
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
          </Suspense>
        </Router>
      </KpiProvider>
    </AuthProvider>
  )
}

export default App
