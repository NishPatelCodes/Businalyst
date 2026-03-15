import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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

/* ---- dashboard mockup inside laptop ---- */
const DashboardMockup = () => (
  <div className="mock-dashboard">
    {/* sidebar */}
    <div className="mock-sidebar">
      <div className="mock-sidebar-logo" />
      <div className="mock-nav-item active" />
      <div className="mock-nav-item" />
      <div className="mock-nav-item" />
      <div className="mock-nav-item" />
      <div className="mock-nav-item" />
      <div className="mock-nav-item" />
    </div>

    {/* main content */}
    <div className="mock-main">
      {/* top bar */}
      <div className="mock-topbar">
        <div className="mock-topbar-title" />
        <div className="mock-topbar-actions">
          <div className="mock-topbar-dot" />
          <div className="mock-topbar-dot" />
          <div className="mock-topbar-dot" />
        </div>
      </div>

      {/* KPI row */}
      <div className="mock-kpi-row">
        {[
          { color: 'blue',   heights: [4,7,5,9,6,10,8] },
          { color: 'green',  heights: [3,5,8,6,9,7,10] },
          { color: 'purple', heights: [6,4,7,5,8,10,9] },
          { color: 'amber',  heights: [5,8,6,9,4,7,10] },
          { color: 'red',    heights: [7,5,9,6,8,4,10] },
        ].map((kpi, i) => (
          <div className="mock-kpi-card" key={i}>
            <div className="mock-kpi-label" />
            <div className="mock-kpi-value" />
            <div className="mock-kpi-sparkline">
              {kpi.heights.map((h, j) => (
                <div
                  className={`mock-spark ${kpi.color}`}
                  key={j}
                  style={{ height: `${h}px`, animationDelay: `${0.8 + i * 0.12 + j * 0.04}s` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* charts row */}
      <div className="mock-chart-row">
        {/* line chart */}
        <div className="mock-chart-card wide">
          <div className="mock-chart-title" />
          <div className="mock-line-chart">
            <svg viewBox="0 0 200 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="mock-line-path secondary" d="M0,55 Q25,48 50,52 T100,42 T150,50 T200,38" />
              <path className="mock-line-area" d="M0,45 Q25,30 50,38 T100,22 T150,32 T200,18 V80 H0 Z" fill="url(#areaGrad)" />
              <path className="mock-line-path primary" d="M0,45 Q25,30 50,38 T100,22 T150,32 T200,18" />
            </svg>
          </div>
        </div>

        {/* bar chart */}
        <div className="mock-chart-card narrow">
          <div className="mock-chart-title" />
          <div className="mock-bar-chart">
            {[
              [28,20],[36,26],[22,32],[40,18],[30,24],[38,28]
            ].map((pair, i) => (
              <div className="mock-bar-group" key={i}>
                <div className="mock-bar b1" style={{ height: `${pair[0]}px`, animationDelay: `${1 + i * 0.1}s` }} />
                <div className="mock-bar b2" style={{ height: `${pair[1]}px`, animationDelay: `${1.05 + i * 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom row */}
      <div className="mock-bottom-row">
        <div className="mock-bottom-card">
          <div className="mock-bottom-title" />
          <div className="mock-bottom-lines">
            <div className="mock-bottom-line" />
            <div className="mock-bottom-line" />
            <div className="mock-bottom-line" />
          </div>
        </div>
        <div className="mock-bottom-card">
          <div className="mock-bottom-title" />
          <div className="mock-donut" />
        </div>
        <div className="mock-bottom-card">
          <div className="mock-bottom-title" />
          <div className="mock-bottom-lines">
            <div className="mock-bottom-line" />
            <div className="mock-bottom-line" />
            <div className="mock-bottom-line" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

/* ---- branding panel (shared across auth pages) ---- */
const BrandPanel = () => (
  <div className="auth-brand-panel">
    <div className="auth-brand-inner">
      <div className="auth-brand-logo">
        <div className="auth-brand-logo-mark" />
        <span className="auth-brand-logo-text">businalyst.</span>
      </div>

      <h2 className="auth-brand-tagline">
        Smarter analytics for modern businesses.
      </h2>

      <p className="auth-brand-subtitle">
        Understand your revenue, expenses, customers, and growth — all from one dashboard built for clarity.
      </p>

      {/* laptop with dashboard mockup */}
      <div className="auth-laptop">
        <div className="auth-laptop-screen">
          <DashboardMockup />
        </div>
        <div className="auth-laptop-base" />
      </div>

      <div className="auth-brand-features">
        <span className="auth-feature-pill"><span className="auth-feature-dot" />Revenue Insights</span>
        <span className="auth-feature-pill"><span className="auth-feature-dot" />Expense Tracking</span>
        <span className="auth-feature-pill"><span className="auth-feature-dot" />Customer Intelligence</span>
      </div>
    </div>
  </div>
)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Connect to backend API for authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Login attempt:', { email, password, rememberMe })
    } catch (err) {
      setError('Invalid email or password. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign in clicked')
  }

  const handleMicrosoftSignIn = () => {
    // TODO: Implement Microsoft OAuth
    console.log('Microsoft sign in clicked')
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
