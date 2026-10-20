import React, { useCallback, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { Button, Icon, Logo } from '../components'
import { useLandingThemeContext } from '../LandingShell'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../brand/brand'
import useScrollSpy from '../hooks/useScrollSpy'
import useFocusTrap from '../hooks/useFocusTrap'
import './Navbar.css'

export const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it Works' },
  { id: 'faq', label: 'FAQ' },
]

const NAV_IDS = NAV_LINKS.map((link) => link.id)

const ThemeToggle = () => {
  const { isDark, toggle } = useLandingThemeContext()
  return (
    <button
      type="button"
      className="lp-nav-icon-btn"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <Icon name={isDark ? 'moon' : 'sun'} size={18} />
    </button>
  )
}

const Navbar = () => {
  const { isAuthenticated } = useAuth()
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const [floating, setFloating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const active = useScrollSpy(NAV_IDS)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  useMotionValueEvent(scrollY, 'change', (y) => setFloating(y > 24))

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useFocusTrap(menuRef, menuOpen, closeMenu, toggleRef)

  const cta = isAuthenticated
    ? { label: 'Go to dashboard', to: ROUTES.dashboard }
    : { label: 'Try for free', to: ROUTES.signup }

  return (
    <header className={`lp-nav ${floating ? 'is-floating' : ''}`.trim()}>
      <motion.div
        layout={!reduceMotion}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="lp-nav-bar"
      >
        <Logo className="lp-nav-logo" />

        <nav className="lp-nav-links" aria-label="Primary">
          <ul className="lp-nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={`lp-nav-link ${active === link.id ? 'is-active' : ''}`.trim()}
                  aria-current={active === link.id ? 'true' : undefined}
                >
                  {active === link.id && (
                    <motion.span
                      layoutId="lp-nav-active"
                      className="lp-nav-link-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="lp-nav-link-label">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lp-nav-actions">
          <Button to={cta.to} size="sm" shape="pill" className="lp-nav-cta">{cta.label}</Button>
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            className="lp-nav-icon-btn lp-nav-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="lp-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
          </button>
        </div>
      </motion.div>

      <div
        id="lp-mobile-menu"
        ref={menuRef}
        className={`lp-nav-menu ${menuOpen ? 'is-open' : ''}`.trim()}
        hidden={!menuOpen}
      >
        <ul className="lp-nav-menu-list">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} className="lp-nav-menu-link" onClick={closeMenu}>{link.label}</a>
            </li>
          ))}
        </ul>
        <div className="lp-nav-menu-actions">
          {!isAuthenticated && (
            <Button to={ROUTES.login} variant="secondary" shape="pill" fullWidth>Log in</Button>
          )}
          <Button to={cta.to} shape="pill" fullWidth>{cta.label}</Button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
