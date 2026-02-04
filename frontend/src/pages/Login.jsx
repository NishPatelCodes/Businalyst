import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('karan.blackwave@businalyst.com')
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
      // Handle successful login (redirect, etc.)
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

  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="login-content">
          <div className="brand-row">
            <div className="brand-mark"></div>
            <span className="brand-name">businalyst.</span>
          </div>

          <div className="heading-block">
            <h1>Understand your business better</h1>
            <p>
              Haven't registered yet?{' '}
              <Link to="/signup" className="signup-link">
                Signup
              </Link>
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleSignIn}
            >
              <span className="google-logo">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.16-3.28 1.16-2.97 0-5.49-2.01-6.39-4.72l-3.66 2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.38H2.18C1.43 8.9 1 10.4 1 12s.43 3.1 1.18 4.62l2.85-2.22.81-.31z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.38l3.66 2.84c.9-2.7 3.47-4.84 6.16-4.84z"
                  />
                </svg>
              </span>
              <span>Sign in with Google</span>
            </button>

            <div className="divider">
              <span className="divider-line"></span>
              <span>or</span>
              <span className="divider-line"></span>
            </div>

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
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="field-input-wrap">
                <input
                  id="password"
                  className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁
                </button>
              </div>
            </div>

            <div className="meta-row">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password
              </Link>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      <div className="right-panel"></div>
    </div>
  )
}

export default Login





















