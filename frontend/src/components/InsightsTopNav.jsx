import React from 'react'

const InsightsTopNav = ({
  topNavPrefix,
  breadcrumbs,
  profileName = 'Nish Patel',
  avatarUrl = 'https://i.pravatar.cc/150?img=12',
}) => {
  return (
    <header className={`${topNavPrefix}-topnav`}>
      {breadcrumbs}

      <div className={`${topNavPrefix}-topnav-search`}>
        <svg
          className={`${topNavPrefix}-search-icon`}
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input type="text" placeholder="Search Anything" className={`${topNavPrefix}-search-input`} />
      </div>

      <div className={`${topNavPrefix}-topnav-actions`}>
        <button className={`${topNavPrefix}-nav-btn`} type="button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2 4C2 2.9 2.9 2 4 2H16C17.1 2 18 2.9 18 4V12C18 13.1 17.1 14 16 14H6L2 18V4Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="6.5" cy="8" r=".8" fill="currentColor" />
            <circle cx="10" cy="8" r=".8" fill="currentColor" />
            <circle cx="13.5" cy="8" r=".8" fill="currentColor" />
          </svg>
        </button>

        <button className={`${topNavPrefix}-nav-btn`} type="button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10 3V4M10 16V17M17 10H16M4 10H3M15.66 4.34L14.95 5.05M5.05 14.95L4.34 15.66M15.66 15.66L14.95 14.95M5.05 5.05L4.34 4.34"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={`${topNavPrefix}-profile`}>
          <img src={avatarUrl} alt="Profile" className={`${topNavPrefix}-avatar`} />
          <span className={`${topNavPrefix}-profile-name`}>{profileName}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </header>
  )
}

export default InsightsTopNav

