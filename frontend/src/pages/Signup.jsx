import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.terms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      // TODO: Connect to backend API for signup
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Signup attempt:', formData)
      // Handle successful signup (redirect, etc.)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign up clicked')
  }

  return (
    <div className="signup-container">
      <div className="signup-panel">
        <div className="signup-content">
          <div className="brand-row">
            <div className="brand-mark"></div>
            <span className="brand-name">businalyst.</span>
          </div>

          <div className="heading-block">
            <h1>Create your account</h1>
            <p>
              Start understanding your business better.{' '}
              <Link to="/login" className="login-link">
                Already have an account? Login
              </Link>
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleSignUp}
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
              <span>Sign up with Google</span>
            </button>

            <div className="divider">
              <span className="divider-line"></span>
              <span>or</span>
              <span className="divider-line"></span>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="name">
                Full Name
              </label>
              <div className="field-input-wrap">
                <input
                  id="name"
                  name="name"
                  className="field-input"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <div className="field-input-wrap">
                <input
                  id="email"
                  name="email"
                  className="field-input"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
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
                  name="password"
                  className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            <div className="field-group">
              <label className="field-label" htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="field-input-wrap">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  className="field-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  👁
                </button>
              </div>
            </div>

            <div className="terms-row">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
              />
              <label htmlFor="terms">
                I agree to the{' '}
                <a href="#" className="terms-link">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="terms-link">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>

      <div className="right-panel"></div>
    </div>
  )
}

export default Signup





















