import React, { useState } from 'react'
import './Sidebar.css'

const Sidebar = () => {
  const [expandedSection, setExpandedSection] = useState('finances')

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1f2937" stroke="#1f2937" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#1f2937" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#1f2937" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="sidebar-brand">Businalyst</span>
        <div className="sidebar-header-icon">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
          </svg>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <a href="/dashboard" className="nav-item active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 12L10 17L18 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span>Dashboard</span>
          </a>

          <a href="/orders" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 7H17" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Orders</span>
            <span className="nav-badge">46</span>
          </a>

          <a href="/products" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 4V16" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Products</span>
          </a>

          <a href="/customers" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="13" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 15C3 12.5 5.5 10.5 7 10.5C8.5 10.5 11 12.5 11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 15C9 12.5 11.5 10.5 13 10.5C14.5 10.5 17 12.5 17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Customers</span>
          </a>

          <a href="/content" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="7" cy="7" r="1" fill="currentColor"/>
            </svg>
            <span>Content</span>
          </a>

          <a href="/upload" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13V4M10 4L7 7M10 4L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 13H6M14 13H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Upload</span>
          </a>

          <a href="/online-store" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L6 4H14L16 6V16H4V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M6 4V8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 4V8" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Online Store</span>
          </a>
        </div>

        <div className="nav-divider"></div>

        <div className="nav-section">
          <div className="nav-item nav-item-expandable" onClick={() => toggleSection('finances')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 8H13M7 12H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Finances</span>
            <svg 
              className={`nav-chevron ${expandedSection === 'finances' ? 'expanded' : ''}`}
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {expandedSection === 'finances' && (
            <div className="nav-subsection">
              <a href="/invoices" className="nav-subitem">Invoices</a>
              <a href="/transactions" className="nav-subitem">Transactions</a>
              <a href="/reports" className="nav-subitem">Reports</a>
            </div>
          )}

          <a href="/analytics" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="12" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="7.5" y="8" width="3" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="12" y="4" width="3" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Analytics</span>
          </a>

          <a href="/discounts" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Discounts</span>
          </a>

          <a href="/settings" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M15.5 10C15.5 10.5 15.6 11 15.7 11.5L17.5 12.5C17.8 12.7 17.9 13.1 17.7 13.4L16.2 15.9C16 16.2 15.6 16.3 15.3 16.1L13.2 15C12.8 15.3 12.4 15.5 12 15.7V18C12 18.3 11.7 18.6 11.4 18.6H8.6C8.3 18.6 8 18.3 8 18V15.7C7.6 15.5 7.2 15.3 6.8 15L4.7 16.1C4.4 16.3 4 16.2 3.8 15.9L2.3 13.4C2.1 13.1 2.2 12.7 2.5 12.5L4.3 11.5C4.4 11 4.5 10.5 4.5 10C4.5 9.5 4.4 9 4.3 8.5L2.5 7.5C2.2 7.3 2.1 6.9 2.3 6.6L3.8 4.1C4 3.8 4.4 3.7 4.7 3.9L6.8 5C7.2 4.7 7.6 4.5 8 4.3V2C8 1.7 8.3 1.4 8.6 1.4H11.4C11.7 1.4 12 1.7 12 2V4.3C12.4 4.5 12.8 4.7 13.2 5L15.3 3.9C15.6 3.7 16 3.8 16.2 4.1L17.7 6.6C17.9 6.9 17.8 7.3 17.5 7.5L15.7 8.5C15.6 9 15.5 9.5 15.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Settings</span>
          </a>

          <a href="/help" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="13" r="0.5" fill="currentColor"/>
            </svg>
            <span>Help & Support</span>
          </a>
        </div>
      </nav>

      <div className="sidebar-premium">
        <div className="premium-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <h3 className="premium-title">Upgrade to Premium!</h3>
        <p className="premium-description">Upgrade your account and unlock all of the benefits.</p>
        <button className="premium-button">Upgrade premium</button>
      </div>
    </aside>
  )
}

export default Sidebar

