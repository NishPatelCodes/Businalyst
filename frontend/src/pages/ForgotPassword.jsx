import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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

  if (success) {
    return (
      <div className="forgot-container">
        <div className="forgot-panel">
          <div className="forgot-content">
            <div className="brand-row">
              <div className="brand-mark"></div>
              <span className="brand-name">businalyst.</span>
            </div>

            <div className="heading-block">
              <h1>Check your email</h1>
              <p>
                We've sent password reset instructions to {email}
              </p>
            </div>

            <div className="login-link">
              <Link to="/login">Back to login</Link>
            </div>
          </div>
        </div>
        <div className="right-panel"></div>
      </div>
    )
  }

  return (
    <div className="forgot-container">
      <div className="forgot-panel">
        <div className="forgot-content">
          <div className="brand-row">
            <div className="brand-mark"></div>
            <span className="brand-name">businalyst.</span>
          </div>

          <div className="heading-block">
            <h1>Forgot Password?</h1>
            <p>
              No worries, we'll send you reset instructions.{' '}
              <Link to="/login" className="back-link">
                Back to login
              </Link>
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <div className="field-input-wrap">
                <input
                  id="email"
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="login-link">
            <Link to="/login">Remember your password? Login</Link>
          </div>
        </div>
      </div>

      <div className="right-panel"></div>
    </div>
  )
}

export default ForgotPassword























