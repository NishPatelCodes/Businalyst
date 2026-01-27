  import React, { useState, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/auth'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, user } = useAuth()
  const navigate = useNavigate()
  const [showPasswordCard, setShowPasswordCard] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  // Check if user is already logged in (but only if not loading)
  useEffect(() => {
    if (user && !loading) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (email && email.includes('@')) {
      setShowPasswordCard(true)
      setError('')
    } else {
      setError('Please enter a valid email address')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await register(email, password, email.split('@')[0]) // Using email prefix as name
        await login(email, password)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setShowPasswordCard(false)
    setIsSignUp(false)
    setPassword('')
    setError('')
  }

  const handleOAuth = async (provider) => {
    try {
      await authService.initiateOAuth(provider)
    } catch (err) {
      setError(`Failed to initiate ${provider} login. Please try again.`)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-text">Businalyst</span>
          </div>
        </div>

        <div className="login-body">
          <div 
            className="login-title"
            style={{
              color: '#000000',
              WebkitFontSmoothing: 'subpixel-antialiased',
              MozOsxFontSmoothing: 'auto',
              textRendering: 'geometricPrecision',
              opacity: 1,
              filter: 'none',
              background: 'none',
              WebkitTextFillColor: '#000000',
              WebkitBackgroundClip: 'unset'
            }}
          >
            Welcome to Businalyst
          </div>

          {!showPasswordCard ? (
            <>
              <form onSubmit={handleEmailSubmit} className="email-form">
                <div className="form-group">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button
                  type="submit"
                  className="continue-button"
                  disabled={!email || !email.includes('@')}
                >
                  Continue
                </button>
              </form>

              <div className="oauth-divider">
                <span>OR</span>
              </div>

              <div className="login-options">
                <button
                  type="button"
                  className="option-button"
                  onClick={() => handleOAuth('google')}
                >
                  Login with Google
                </button>
                <button
                  type="button"
                  className="option-button"
                  onClick={() => handleOAuth('apple')}
                >
                  Login with Apple
                </button>
              </div>

              <div className="signup-prompt">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setIsSignUp(true)
                    setShowPasswordCard(true)
                  }}
                >
                  Sign up
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="back-button"
                onClick={handleBack}
              >
                ← Back
              </button>

              <div className="email-display">
                <span className="email-text">{email}</span>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <div className="form-group-header">
                    <label htmlFor="password">Password</label>
                    {!isSignUp && (
                      <a href="#" className="forgot-password">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Log in'}
                </button>
              </form>

              {!isSignUp && (
                <div className="signup-prompt">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setIsSignUp(true)}
                  >
                    Sign up
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(Login)

