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

/* ---- floating showcase cards (Kezak-style collage) ---- */
const ShowcaseCards = () => (
  <div className="showcase-canvas">
    {/* Card 1 — Revenue Overview (large, back-left) */}
    <div className="showcase-card showcase-card--revenue">
      <div className="sc-header">
        <span className="sc-title">Revenue Overview</span>
        <span className="sc-badge green">+12.3%</span>
      </div>
      <div className="sc-chart">
        <svg viewBox="0 0 200 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id="scAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,45 C20,38 40,42 60,32 C80,22 100,30 120,20 C140,14 160,22 180,16 C190,12 200,10 200,10 V60 H0 Z" fill="url(#scAreaGrad)" />
          <path d="M0,45 C20,38 40,42 60,32 C80,22 100,30 120,20 C140,14 160,22 180,16 C190,12 200,10 200,10" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="sc-kpi-row">
        <div className="sc-kpi"><span className="sc-kpi-val">$124.8k</span><span className="sc-kpi-lbl">Revenue</span></div>
        <div className="sc-kpi"><span className="sc-kpi-val">$42.1k</span><span className="sc-kpi-lbl">Expenses</span></div>
        <div className="sc-kpi"><span className="sc-kpi-val">$82.7k</span><span className="sc-kpi-lbl">Profit</span></div>
      </div>
    </div>

    {/* Card 2 — Customer Intelligence (medium, top-right) */}
    <div className="showcase-card showcase-card--customers">
      <div className="sc-header">
        <span className="sc-title">Customer Intelligence</span>
      </div>
      <div className="sc-table">
        <div className="sc-table-head">
          <span>Customer</span><span>Orders</span><span>Revenue</span>
        </div>
        {[
          { name: 'Acme Corp',     orders: '142', rev: '$18.4k' },
          { name: 'Nova Labs',     orders: '98',  rev: '$12.7k' },
          { name: 'Zenith Inc',    orders: '87',  rev: '$9.8k' },
          { name: 'Pixel Studio',  orders: '64',  rev: '$7.2k' },
        ].map((r, i) => (
          <div className="sc-table-row" key={i}>
            <span className="sc-customer">
              <span className="sc-avatar">{r.name[0]}</span>
              {r.name}
            </span>
            <span>{r.orders}</span>
            <span>{r.rev}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Card 3 — Expense Breakdown (small, bottom-right) */}
    <div className="showcase-card showcase-card--expenses">
      <div className="sc-header">
        <span className="sc-title">Expense Breakdown</span>
      </div>
      <div className="sc-donut-row">
        <svg className="sc-donut" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="42 58" strokeDashoffset="25" strokeLinecap="round" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="28 72" strokeDashoffset="67" strokeLinecap="round" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="18 82" strokeDashoffset="95" strokeLinecap="round" />
        </svg>
        <div className="sc-donut-legend">
          <div className="sc-legend-item"><span className="sc-dot" style={{background:'#3b82f6'}} />Operations — 42%</div>
          <div className="sc-legend-item"><span className="sc-dot" style={{background:'#8b5cf6'}} />Marketing — 28%</div>
          <div className="sc-legend-item"><span className="sc-dot" style={{background:'#22c55e'}} />Payroll — 18%</div>
          <div className="sc-legend-item"><span className="sc-dot" style={{background:'#e2e8f0'}} />Other — 12%</div>
        </div>
      </div>
    </div>

    {/* Card 4 — KPI mini card (floating accent, top-left) */}
    <div className="showcase-card showcase-card--kpi">
      <div className="sc-kpi-mini">
        <div className="sc-kpi-mini-icon">
          <svg viewBox="0 0 20 20" fill="none"><path d="M2 15L6 10L9 13L18 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div className="sc-kpi-mini-val">3,241</div>
          <div className="sc-kpi-mini-lbl">Total Orders</div>
        </div>
      </div>
      <div className="sc-badge green">+8.7%</div>
    </div>

    {/* Card 5 — Growth mini card (floating accent, bottom-left) */}
    <div className="showcase-card showcase-card--growth">
      <div className="sc-kpi-mini">
        <div className="sc-kpi-mini-icon purple">
          <svg viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" stroke="#8b5cf6" strokeWidth="1.5"/><circle cx="13" cy="7" r="3" stroke="#8b5cf6" strokeWidth="1.5"/><path d="M3 16C3 13.5 5 11 7 11C9 11 11 13.5 11 16" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div>
          <div className="sc-kpi-mini-val">2,847</div>
          <div className="sc-kpi-mini-lbl">Active Customers</div>
        </div>
      </div>
      <div className="sc-badge green">+5.1%</div>
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
      <div className="auth-brand-grid" />
    </div>

    <div className="auth-brand-inner">
      {/* floating card showcase */}
      <ShowcaseCards />

      {/* bottom text block */}
      <div className="auth-brand-text">
        <div className="auth-brand-logo">
          <div className="auth-brand-logo-mark" />
          <span className="auth-brand-logo-text">businalyst.</span>
        </div>

        <h2 className="auth-brand-tagline">
          A Unified Hub for Smarter<br />Business Decision-Making.
        </h2>

        <p className="auth-brand-subtitle">
          Understand revenue, expenses, customers and growth — all in one dashboard.
        </p>

        <div className="auth-brand-features">
          <span className="auth-feature-pill">Revenue Insights</span>
          <span className="auth-feature-pill">Expense Tracking</span>
          <span className="auth-feature-pill">Customer Intelligence</span>
        </div>
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
