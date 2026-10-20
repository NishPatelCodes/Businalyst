import React, { useId } from 'react'
import { Link } from 'react-router-dom'
import { Container, Logo } from '../components'
import { BRAND, PRODUCT_AREAS, ROUTES, SUPPORTED_UPLOADS } from '../brand/brand'
import './Footer.css'

const COLUMNS = [
  {
    id: 'product',
    title: 'Product',
    links: [
      { id: 'features', label: 'Features', href: '#features' },
      { id: 'how', label: 'How it Works', href: '#how-it-works' },
      { id: 'security', label: 'Privacy', href: '#security' },
      { id: 'faq', label: 'FAQ', href: '#faq' },
    ],
  },
  {
    id: 'insights',
    title: 'Insights',
    links: PRODUCT_AREAS
      .filter((area) => area.id !== 'dashboard')
      .map((area) => ({ id: area.id, label: area.label, to: area.route })),
  },
  {
    id: 'account',
    title: 'Account',
    links: [
      { id: 'login', label: 'Log in', to: ROUTES.login },
      { id: 'signup', label: 'Sign up', to: ROUTES.signup },
      { id: 'forgot', label: 'Forgot password', to: ROUTES.forgotPassword },
    ],
  },
]

const HalftoneText = ({ text }) => {
  const id = `lp-ht${useId().replace(/:/g, '')}`
  return (
    <svg className="lp-footer-halftone" viewBox="0 0 1200 150" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`${id}-dots`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.6" className="lp-footer-halftone-dot" />
        </pattern>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect width="1200" height="150" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <text
        x="600"
        y="118"
        textAnchor="middle"
        textLength="1180"
        lengthAdjust="spacingAndGlyphs"
        className="lp-footer-halftone-text"
        fill={`url(#${id}-dots)`}
        mask={`url(#${id}-mask)`}
      >
        {text}
      </text>
    </svg>
  )
}

const Footer = () => (
  <footer className="lp-footer">
    <Container>
      <div className="lp-footer-top">
        <div className="lp-footer-brand">
          <Logo />
          <p className="lp-footer-description">{BRAND.description}</p>
          <ul className="lp-footer-formats" aria-label="Supported file formats">
            {SUPPORTED_UPLOADS.map((ext) => (
              <li key={ext} className="lp-footer-format">{ext}</li>
            ))}
          </ul>
        </div>

        <nav className="lp-footer-columns" aria-label="Footer">
          {COLUMNS.map((column) => (
            <div key={column.id} className="lp-footer-column">
              <h2 className="lp-footer-heading">{column.title}</h2>
              <ul className="lp-footer-links">
                {column.links.map((link) => (
                  <li key={link.id}>
                    {link.to ? (
                      <Link to={link.to} className="lp-footer-link">{link.label}</Link>
                    ) : (
                      <a href={link.href} className="lp-footer-link">{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="lp-footer-bottom">
        <span>© {new Date().getFullYear()} {BRAND.name}</span>
        <span>{BRAND.domain}</span>
      </div>

      <HalftoneText text="Turn data into decisions" />
    </Container>
  </footer>
)

export default Footer
