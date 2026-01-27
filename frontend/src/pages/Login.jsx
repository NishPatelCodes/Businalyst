import React, { useState, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import OAuthButton from '../components/OAuthButton'
import { authService } from '../services/auth'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, user, checkAuth } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)

  // Check if user is already logged in (but only if not loading)
  useEffect(() => {
    if (user && !loading) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await register(email, password)
        // After registration, login
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
            <span className="logo-icon">📊</span>
            <span className="logo-text">Businalyst</span>
          </div>
        </div>

        <div className="login-body">
          <h1 className="login-title">Welcome!</h1>
          <p className="login-subtitle">
            {isSignUp 
              ? 'Create your account to get started' 
              : 'Log in to Businalyst to continue'}
          </p>

          <div className="oauth-buttons">
            <OAuthButton
              provider="google"
              icon="G"
              label="Log in with Google"
              onClick={() => handleOAuth('google')}
            />
            <OAuthButton
              provider="github"
              icon="⚫"
              label="Log in with GitHub"
              onClick={() => handleOAuth('github')}
            />
            <OAuthButton
              provider="apple"
              icon="🍎"
              label="Log in with Apple"
              onClick={() => handleOAuth('apple')}
            />
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

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
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

          <div className="signup-prompt">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setIsSignUp(false)}
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Login)

