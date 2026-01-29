import React, { useState } from 'react'
import './ComingSoon.css'

const ComingSoon = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Connect to backend API for email collection
    console.log('Email submitted:', email)
    setSubmitted(true)
    setEmail('')
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="coming-soon-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        <div className="header-right">
          <div className="theme-selector">
            <span>Desktop Light</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <button className="buy-button">Buy $5</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Center: Text and Form */}
          <div className="text-section">
            <div className="coming-soon-badge">COMING SOON</div>
            <h1 className="main-headline">
              Understand your business metrics in minutes, not hours
            </h1>
            <p className="description">
              We help founders and teams track key business metrics, spot trends, and make data-driven decisions without complex dashboards or manual reports.
            </p>
            
            <form className="email-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="email-input"
              />
              <button type="submit" className="submit-button">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10L16 10M16 10L11 5M16 10L11 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>

            {submitted && (
              <div className="success-message">Thanks! We'll notify you soon.</div>
            )}

            <div className="social-proof">
              <div className="avatars">
                <div className="avatar"></div>
                <div className="avatar"></div>
                <div className="avatar"></div>
              </div>
              <span className="signup-count">4.5k people signed up</span>
            </div>
          </div>

          {/* Bottom Center: Phone Image */}
          <div className="phone-image-section">
            <div className="phone-image-wrapper">
              <img 
                src="/images/phone-dashboard.png" 
                alt="Businalyst Dashboard" 
                className="phone-image"
                onError={(e) => {
                  // Fallback if image doesn't exist - user will need to add the image
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="phone-image-placeholder" style={{display: 'none'}}>
                <p>Please add phone-dashboard.png to /frontend/public/images/</p>
              </div>
              <div className="phone-reflection"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ComingSoon

