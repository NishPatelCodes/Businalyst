import React from 'react'
import { Link } from 'react-router-dom'
import { BRAND, LOGO, ROUTES } from '../brand/brand'
import './Logo.css'

// `onDark` forces the dark-background logo regardless of theme (e.g. inside a night band).
const Logo = ({ withWordmark = true, onDark = false, to = ROUTES.home, className = '' }) => (
  <Link
    to={to}
    className={`lp-logo ${onDark ? 'lp-logo--on-dark' : ''} ${className}`.trim()}
    aria-label={`${BRAND.name} home`}
  >
    {onDark ? (
      <img src={LOGO.dark} alt="" className="lp-logo-mark" />
    ) : (
      <>
        <img src={LOGO.light} alt="" className="lp-logo-mark lp-logo-mark--light" />
        <img src={LOGO.dark} alt="" className="lp-logo-mark lp-logo-mark--dark" />
      </>
    )}
    {withWordmark && <span className="lp-logo-wordmark">{BRAND.wordmark}</span>}
  </Link>
)

export default Logo
