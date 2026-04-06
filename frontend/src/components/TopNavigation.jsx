import React, { useState, useRef, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { KpiContext } from '../context/KpiContext'
import './TopNavigation.css'

const TopNavigation = () => {
  const { user, logout } = useAuth()
  const { datasetMeta, isDemoData } = useContext(KpiContext)
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [dataMenuOpen, setDataMenuOpen] = useState(false)
  const profileRef = useRef(null)
  const dataRef = useRef(null)

  const displayName = user?.name || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (dataRef.current && !dataRef.current.contains(e.target)) setDataMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="top-navigation">
      <div className="nav-welcome">
        <h2 className="welcome-text">Welcome Back, {displayName.split(' ')[0]}</h2>
      </div>

      {datasetMeta && !isDemoData && (
        <div className="nav-dataset-badge">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="2" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="3" y="8" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="3" y="14" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span className="dataset-badge-name">{datasetMeta.name}</span>
        </div>
      )}

      <div className="nav-search">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input 
          type="text" 
          placeholder="Search Anything" 
          className="search-input"
        />
      </div>

      <div className="nav-actions">
        {/* Manage Data dropdown */}
        <div className="nav-dropdown-wrap" ref={dataRef}>
          <button
            className="nav-manage-data-btn"
            onClick={() => setDataMenuOpen(!dataMenuOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 13V4M10 4L7 7M10 4L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Manage Data</span>
          </button>
          {dataMenuOpen && (
            <div className="nav-dropdown">
              <Link to="/upload" className="nav-dropdown-item" onClick={() => setDataMenuOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M10 13V4M10 4L7 7M10 4L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Upload / Replace CSV
              </Link>
            </div>
          )}
        </div>

        <button className="nav-icon-button nav-icon-button-theme">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 3V4M10 16V17M17 10H16M4 10H3M15.66 4.34L14.95 5.05M5.05 14.95L4.34 15.66M15.66 15.66L14.95 14.95M5.05 5.05L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Profile dropdown */}
        <div className="nav-dropdown-wrap" ref={profileRef}>
          <div className="nav-profile" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="profile-avatar">{initials}</div>
            <span className="profile-name">{displayName}</span>
            <svg className="profile-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {profileOpen && (
            <div className="nav-dropdown">
              <div className="nav-dropdown-header">
                <span className="nav-dropdown-email">{user?.email}</span>
              </div>
              <button className="nav-dropdown-item nav-dropdown-item--danger" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M7 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M14 14L18 10L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopNavigation
