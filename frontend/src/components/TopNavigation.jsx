import React from 'react'
import './TopNavigation.css'

const TopNavigation = () => {
  return (
    <header className="top-navigation">
      <div className="nav-welcome">
        <h2 className="welcome-text">Welcome Back, Nish Patel 👋</h2>
      </div>

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
        <button className="nav-icon-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4C2 2.9 2.9 2 4 2H16C17.1 2 18 2.9 18 4V12C18 13.1 17.1 14 16 14H6L2 18V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="6.5" cy="8" r="0.8" fill="currentColor"/>
            <circle cx="10" cy="8" r="0.8" fill="currentColor"/>
            <circle cx="13.5" cy="8" r="0.8" fill="currentColor"/>
          </svg>
        </button>

        <button className="nav-icon-button nav-icon-button-theme">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 3V4M10 16V17M17 10H16M4 10H3M15.66 4.34L14.95 5.05M5.05 14.95L4.34 15.66M15.66 15.66L14.95 14.95M5.05 5.05L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="nav-profile">
          <img 
            src="https://i.pravatar.cc/150?img=12" 
            alt="Profile" 
            className="profile-image"
          />
          <span className="profile-name">Nish Patel</span>
          <svg className="profile-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </header>
  )
}

export default TopNavigation

