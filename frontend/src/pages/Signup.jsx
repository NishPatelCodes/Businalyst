import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandPanel, GoogleIcon, MicrosoftIcon, EyeIcon, EyeOffIcon } from './Login'
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
      setError('Passwords do not match.')
      return
    }

    if (!formData.terms) {
      setError('Please agree to the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)

    try {
      // TODO: Connect to backend API for signup
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Signup attempt:', formData)
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

  const handleMicrosoftSignUp = () => {
    // TODO: Implement Microsoft OAuth
    console.log('Microsoft sign up clicked')
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
            <h1>Create Your Account</h1>
            <p>
              Start understanding your business better.
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* social login */}
            <div className="auth-social-group">
              <button type="button" className="auth-social-btn" onClick={handleGoogleSignUp}>
                <span className="auth-social-icon"><GoogleIcon /></span>
                <span>Continue with Google</span>
              </button>
              <button type="button" className="auth-social-btn" onClick={handleMicrosoftSignUp}>
                <span className="auth-social-icon"><MicrosoftIcon /></span>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span>or</span>
              <span className="auth-divider-line" />
            </div>

            {/* full name */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-name">Full Name</label>
              <div className="auth-input-wrap">
                <input
                  id="signup-name"
                  name="name"
                  className="auth-input"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-email">Email</label>
              <div className="auth-input-wrap">
                <input
                  id="signup-email"
                  name="email"
                  className="auth-input"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="signup-password"
                  name="password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            {/* confirm password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="auth-input-wrap">
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  className="auth-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* terms */}
            <div className="auth-terms-row">
              <input
                type="checkbox"
                id="signup-terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
              />
              <label htmlFor="signup-terms">
                I agree to the{' '}
                <a href="#" className="auth-terms-link">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="auth-terms-link">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
