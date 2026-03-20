import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()

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
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 12L10 17L18 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link to="/profit-insights" className={`nav-item ${location.pathname === '/profit-insights' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 2.5L8.39 16.64L10.48 10.48L16.64 8.39L2.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.48 10.48L16.64 8.39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Profit</span>
          </Link>

          <Link to="/revenue-insights" className={`nav-item ${location.pathname === '/revenue-insights' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 15L6 10L9 13L18 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 4H14V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Revenue</span>
          </Link>

          <Link to="/orders" className={`nav-item ${location.pathname === '/orders' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 7H17" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Orders</span>
          </Link>

          <Link to="/expense-insights" className={`nav-item ${location.pathname === '/expense-insights' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2V18M10 2L6 6M10 2L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Expenses</span>
          </Link>

          <Link to="/analytics/customers" className={`nav-item ${location.pathname === '/analytics/customers' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="13" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 15C3 12.5 5.5 10.5 7 10.5C8.5 10.5 11 12.5 11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 15C9 12.5 11.5 10.5 13 10.5C14.5 10.5 17 12.5 17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Customers</span>
          </Link>

          <Link to="/upload" className={`nav-item ${location.pathname === '/upload' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13V4M10 4L7 7M10 4L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 13H6M14 13H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Upload</span>
          </Link>
        </div>
      </nav>

      <div className="sidebar-premium sidebar-premium--coming-soon">
        <div className="premium-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" fillOpacity="0.9"/>
          </svg>
        </div>
        <h3 className="premium-title">Coming soon</h3>
        <p className="premium-description">Premium feature</p>
      </div>
    </aside>
  )
}

export default Sidebar

