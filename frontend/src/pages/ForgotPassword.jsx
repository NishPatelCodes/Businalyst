import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandPanel } from './Login'
import './Login.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Connect to backend API for password reset
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Password reset requested for:', email)
      setSuccess(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
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

          {success ? (
            <>
              <div className="auth-heading">
                <h1>Check Your Email</h1>
                <p>
                  We've sent password reset instructions to <strong>{email}</strong>.
                </p>
              </div>

              <p className="auth-footer-link">
                <Link to="/login">Back to sign in</Link>
              </p>
            </>
          ) : (
            <>
              <div className="auth-heading">
                <h1>Forgot Password?</h1>
                <p>
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="forgot-email">Email</label>
                  <div className="auth-input-wrap">
                    <input
                      id="forgot-email"
                      className="auth-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      placeholder="you@company.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="auth-footer-link">
                Remember your password?{' '}
                <Link to="/login">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
