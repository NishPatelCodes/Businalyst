import React, { useState, useContext } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { KpiContext } from '../context/KpiContext'
import './Sidebar.css'

const PROMO_DISMISSED_KEY = 'businalyst_promo_dismissed'

const Sidebar = () => {
  const location = useLocation()
  const { isDemoData, datasetMeta } = useContext(KpiContext)
  const [promoDismissed, setPromoDismissed] = useState(() => {
    try { return localStorage.getItem(PROMO_DISMISSED_KEY) === '1' } catch { return false }
  })

  const dismiss = () => {
    setPromoDismissed(true)
    try { localStorage.setItem(PROMO_DISMISSED_KEY, '1') } catch {}
  }

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="sidebar-brand">Businalyst</span>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <div className="sidebar-search-inner">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Search" />
          <div className="sidebar-search-kbd">
            <kbd>⌘</kbd><kbd>K</kbd>
          </div>
        </div>
      </div>

      {/* Main nav */}

      {/* Home button */}
      <nav className="sidebar-nav">
        <Link to="/upload" className={`nav-item ${isActive('/upload') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"/></svg>
          <span className="nav-label">Home</span>
        </Link>

        {/* Dashboard button */}
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
          <span className="nav-label">Dashboard</span>
        </Link>

        {/* Profit button */}
        <Link to="/profit-insights" className={`nav-item ${isActive('/profit-insights') ? 'active' : ''}`}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <path
          d="M16 7.99983V4.50048C16 3.66874 16 3.25287 15.8248 2.9973C15.6717 2.77401 15.4346 2.62232 15.1678 2.57691C14.8623 2.52493 14.4847 2.6992 13.7295 3.04775L4.85901 7.14182C4.18551 7.45267 3.84875 7.6081 3.60211 7.84915C3.38406 8.06225 3.21762 8.32238 3.1155 8.60966C3 8.93462 3 9.30551 3 10.0473V14.9998M16.5 14.4998H16.51M3 11.1998L3 17.7998C3 18.9199 3 19.48 3.21799 19.9078C3.40973 20.2841 3.71569 20.5901 4.09202 20.7818C4.51984 20.9998 5.07989 20.9998 6.2 20.9998H17.8C18.9201 20.9998 19.4802 20.9998 19.908 20.7818C20.2843 20.5901 20.5903 20.2841 20.782 19.9078C21 19.48 21 18.9199 21 17.7998V11.1998C21 10.0797 21 9.51967 20.782 9.09185C20.5903 8.71552 20.2843 8.40956 19.908 8.21782C19.4802 7.99983 18.9201 7.99983 17.8 7.99983L6.2 7.99983C5.0799 7.99983 4.51984 7.99983 4.09202 8.21781C3.7157 8.40956 3.40973 8.71552 3.21799 9.09185C3 9.51967 3 10.0797 3 11.1998ZM17 14.4998C17 14.776 16.7761 14.9998 16.5 14.9998C16.2239 14.9998 16 14.776 16 14.4998C16 14.2237 16.2239 13.9998 16.5 13.9998C16.7761 13.9998 17 14.2237 17 14.4998Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          />
          </svg>
          <span className="nav-label">Profit</span>
        </Link>

        {/* Revenue button */}

        <Link to="/revenue-insights" className={`nav-item ${isActive('/revenue-insights') ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 18L18 20L22 16M22 10H2M22 12V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H5.2C4.0799 5 3.51984 5 3.09202 5.21799C2.7157 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.0799 2 8.2V15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.0799 19 5.2 19H12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            />
          </svg>
          <span className="nav-label">Revenue</span>
          <span className="nav-badge">8</span>
        </Link>

        {/* Order button */}
        <Link to="/orders" className={`nav-item ${isActive('/orders') ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M9.35419 21C10.0593 21.6224 10.9856 22 12 22C13.0145 22 13.9407 21.6224 14.6458 21M18 8V2M15 5H21M13 2.08389C12.6717 2.02841 12.3373 2 12 2C10.4087 2 8.8826 2.63214 7.75738 3.75736C6.63216 4.88258 6.00002 6.4087 6.00002 8C6.00002 11.0902 5.22049 13.206 4.34968 14.6054C3.61515 15.7859 3.24788 16.3761 3.26134 16.5408C3.27626 16.7231 3.31488 16.7926 3.46179 16.9016C3.59448 17 4.19261 17 5.38887 17H18.6112C19.8074 17 20.4055 17 20.5382 16.9016C20.6851 16.7926 20.7237 16.7231 20.7386 16.5408C20.7521 16.3761 20.3848 15.7858 19.6502 14.6052C19.1582 13.8144 18.6953 12.7948 18.3857 11.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
          <span className="nav-label">Orders</span>
        </Link>

        {/* Expense button */}
        <Link to="/expense-insights" className={`nav-item ${isActive('/expense-insights') ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V12M8 13V17M16 11V17M12 7V17M2 5L5 8M5 8L8 5M5 8L5 2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
          <span className="nav-label">Expense</span>
        </Link>

        {/* Customer button */}
        <Link to="/analytics/customers" className={`nav-item ${isActive('/analytics/customers') ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
              d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>

          <span className="nav-label">Customer</span>
        </Link>

        {/* Spacer */}
        <div className="sidebar-spacer" />
      </nav>

      {/* Bottom nav: Support + Settings */}
      <div className="sidebar-bottom">
        <Link to="/support" className={`nav-item ${isActive('/support') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1"/></svg>
          <span className="nav-label">Support</span>
        </Link>

        <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
          <span className="nav-label">Settings</span>
        </Link>
      </div>

      {/* Promo card */}
      {!promoDismissed && (
        <div className="sidebar-promo">
          <div className="sidebar-promo-body">
            <button className="sidebar-promo-dismiss" onClick={dismiss} aria-label="Dismiss">
              <svg viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <p className="sidebar-promo-title">New features available!</p>
            <p className="sidebar-promo-desc">Check out the new dashboard view. Pages now load faster.</p>
            <div className="sidebar-promo-img-placeholder" />
          </div>
          <div className="sidebar-promo-actions">
            <button className="sidebar-promo-dismiss-text" onClick={dismiss}>Dismiss</button>
            <button className="sidebar-promo-cta">What's new?</button>
          </div>
        </div>
      )}

      {/* User profile */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">CK</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">Caitlyn King</div>
          <div className="sidebar-user-email">caitlyn@untitleui.com</div>
        </div>
        <svg className="sidebar-user-chevron" viewBox="0 0 16 16" fill="none">
          <path d="M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

    </aside>
  )
}

export default Sidebar