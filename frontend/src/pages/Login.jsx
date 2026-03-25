import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

/* ---- reusable SVG icons ---- */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.16-3.28 1.16-2.97 0-5.49-2.01-6.39-4.72l-3.66 2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.38H2.18C1.43 8.9 1 10.4 1 12s.43 3.1 1.18 4.62l2.85-2.22.81-.31z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.38l3.66 2.84c.9-2.7 3.47-4.84 6.16-4.84z" />
  </svg>
)

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
)

/* ---- floating dashboard mockup (premium hero) ---- */
const DashboardMockup = () => (
  <div className="showcase-device">
    <div className="showcase-device-glow" />
    <div className="showcase-screen">
      {/* top bar */}
      <div className="sc-topbar">
        <div className="sc-topbar-left">
          <div className="sc-topbar-dot" />
          <span className="sc-topbar-brand">businalyst.</span>
        </div>
        <div className="sc-topbar-nav">
          <span className="sc-topbar-link active">Dashboard</span>
          <span className="sc-topbar-link">Revenue</span>
          <span className="sc-topbar-link">Expenses</span>
          <span className="sc-topbar-link">Customers</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="sc-kpi-strip">
        <div className="sc-kpi-card">
          <span className="sc-kpi-label">Total Revenue</span>
          <span className="sc-kpi-value">$124.8k</span>
          <span className="sc-kpi-change up">+12.3%</span>
        </div>
        <div className="sc-kpi-card">
          <span className="sc-kpi-label">Net Profit</span>
          <span className="sc-kpi-value">$82.7k</span>
          <span className="sc-kpi-change up">+8.1%</span>
        </div>
        <div className="sc-kpi-card">
          <span className="sc-kpi-label">Customers</span>
          <span className="sc-kpi-value">2,847</span>
          <span className="sc-kpi-change up">+5.1%</span>
        </div>
      </div>

      {/* chart area */}
      <div className="sc-chart-area">
        <div className="sc-chart-header">
          <span className="sc-chart-title">Revenue Overview</span>
          <div className="sc-chart-legend">
            <span className="sc-legend-dot blue" />
            <span className="sc-legend-text">Revenue</span>
            <span className="sc-legend-dot purple" />
            <span className="sc-legend-text">Expenses</span>
          </div>
        </div>
        <svg className="sc-chart-svg" viewBox="0 0 320 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="scFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,62 C30,55 55,58 80,48 C110,36 140,42 170,32 C200,24 230,30 260,22 C285,16 310,12 320,10 V80 H0 Z" fill="url(#scFill)" />
          <path d="M0,62 C30,55 55,58 80,48 C110,36 140,42 170,32 C200,24 230,30 260,22 C285,16 310,12 320,10" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          <path d="M0,58 C30,60 55,55 80,58 C110,62 140,56 170,60 C200,57 230,62 260,58 C285,60 310,56 320,58" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" opacity="0.6" />
        </svg>
      </div>
    </div>
  </div>
)

/* ---- branding panel (shared across auth pages) ---- */
const BrandPanel = () => (
  <div className="auth-brand-panel">
    {/* cinematic background layers */}
    <div className="auth-brand-bg">
      <div className="auth-brand-glow auth-brand-glow--1" />
      <div className="auth-brand-glow auth-brand-glow--2" />
    </div>

    <div className="auth-brand-inner">
      {/* logo */}
      <div className="auth-brand-logo">
        <div className="auth-brand-logo-mark" />
        <span className="auth-brand-logo-text">businalyst.</span>
      </div>

      {/* headline block */}
      <div className="auth-brand-text">
        <h2 className="auth-brand-tagline">
          Smarter Analytics for<br />Modern Businesses.
        </h2>
        <p className="auth-brand-subtitle">
          Understand revenue, expenses, customers and growth — all from one intelligent dashboard.
        </p>
      </div>

      {/* hero: floating dashboard mockup */}
      <DashboardMockup />

      {/* feature pills */}
      <div className="auth-brand-features">
        <span className="auth-feature-pill">Revenue Insights</span>
        <span className="auth-feature-pill">Expense Tracking</span>
        <span className="auth-feature-pill">Customer Intelligence</span>
      </div>
    </div>
  </div>
)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const { loginUser, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const result = await loginUser(email, password)
      if (result.success) {
        navigate(result.hasDataset ? '/dashboard' : '/upload', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.')
    }
  }

  const handleGoogleSignIn = () => {
    console.log('Google sign in — OAuth not yet configured')
  }

  const handleMicrosoftSignIn = () => {
    console.log('Microsoft sign in — OAuth not yet configured')
  }

  return (
    <div className="auth-container">
      <BrandPanel />

      <div className="auth-form-panel">
        <div className="auth-form-content">
          {/* mobile-only brand */}
          <div className="auth-mobile-brand">
            <div className="auth-brand-logo-mark" />
            <span className="auth-brand-logo-text">businalyst.</span>
          </div>

          <div className="auth-heading">
            <h1>Welcome Back</h1>
            <p>
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* social login */}
            <div className="auth-social-group">
              <button type="button" className="auth-social-btn" onClick={handleGoogleSignIn}>
                <span className="auth-social-icon"><GoogleIcon /></span>
                <span>Continue with Google</span>
              </button>
              <button type="button" className="auth-social-btn" onClick={handleMicrosoftSignIn}>
                <span className="auth-social-icon"><MicrosoftIcon /></span>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span>or</span>
              <span className="auth-divider-line" />
            </div>

            {/* email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email</label>
              <div className="auth-input-wrap">
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* meta row */}
            <div className="auth-meta-row">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer-link">
            Don't have an account?{' '}
            <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export { BrandPanel, GoogleIcon, MicrosoftIcon, EyeIcon, EyeOffIcon }
export default Login
