import React, { useState, useEffect, memo, useRef } from 'react'
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
  const statsAnimated = useRef(false)

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  // After OAuth redirect, check auth state
  useEffect(() => {
    // If we're on the login page after an OAuth redirect, check auth
    if (window.location.pathname === '/login') {
      // Small delay to ensure cookie is set
      const timer = setTimeout(() => {
        checkAuth()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [checkAuth])

  // Animate stats numbers
  useEffect(() => {
    if (statsAnimated.current) return
    
    const animateValue = (element, start, end, duration) => {
      const startTime = performance.now()
      const range = end - start
      
      const updateValue = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const current = Math.floor(start + range * easeOutQuart)
        
        element.textContent = current.toLocaleString()
        
        if (progress < 1) {
          requestAnimationFrame(updateValue)
        } else {
          element.textContent = end.toLocaleString()
        }
      }
      
      requestAnimationFrame(updateValue)
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated.current) {
          statsAnimated.current = true
          const statNumbers = entry.target.querySelectorAll('.stat-number')
          statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'))
            animateValue(stat, 0, target, 2000)
          })
        }
      })
    }, { threshold: 0.5 })
    
    const statsContainer = document.querySelector('.stats-container')
    if (statsContainer) {
      observer.observe(statsContainer)
    }
    
    return () => {
      if (statsContainer) {
        observer.unobserve(statsContainer)
      }
    }
  }, [])

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
      <div className="login-left">
        <div className="login-content">
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

      <div className="login-right">
        <div className="analytics-showcase">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number" data-target="500000">0</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" data-target="1000000">0</div>
              <div className="stat-label">Reports Generated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" data-target="99">0</div>
              <div className="stat-label">% Uptime</div>
            </div>
          </div>

          <div className="analytics-graphic">
            <div className="chart-container">
              <div className="chart-bar" style={{ height: '60%', animationDelay: '0s' }}></div>
              <div className="chart-bar" style={{ height: '80%', animationDelay: '0.1s' }}></div>
              <div className="chart-bar" style={{ height: '45%', animationDelay: '0.2s' }}></div>
              <div className="chart-bar" style={{ height: '90%', animationDelay: '0.3s' }}></div>
              <div className="chart-bar" style={{ height: '70%', animationDelay: '0.4s' }}></div>
              <div className="chart-bar" style={{ height: '85%', animationDelay: '0.5s' }}></div>
            </div>
          </div>

          <div className="cta-section">
            <h2 className="cta-title">Transform Your Data Into Insights</h2>
            <p className="cta-description">
              Powerful analytics tools to help you make data-driven decisions
            </p>
            <button className="cta-button">
              Explore Features →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Login)

