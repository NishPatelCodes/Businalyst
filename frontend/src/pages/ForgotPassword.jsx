import React from 'react'
import { Link } from 'react-router-dom'
import { BrandPanel } from './Login'
import './Login.css'

const ForgotPassword = () => {
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
            <h1>Forgot Password?</h1>
            <p>
              Automated password reset isn't available yet. Email us at{' '}
              <a href="mailto:support@businalyst.com" className="auth-terms-link">
                support@businalyst.com
              </a>{' '}
              from your account email and we'll reset it for you.
            </p>
          </div>

          <p className="auth-footer-link">
            Remember your password?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
