import React from 'react'
import { Link } from 'react-router-dom'
import './Button.css'

// variant: 'primary' | 'secondary' | 'ghost' | 'ink' | 'light'
// size: 'sm' | 'md' | 'lg'
// shape: 'default' | 'pill'
// Pass `to` for internal routes, `href` for external links / in-page anchors.
const Button = ({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  to,
  href,
  loading = false,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) => {
  const classes = [
    'lp-btn',
    `lp-btn--${variant}`,
    `lp-btn--${size}`,
    shape === 'pill' ? 'lp-btn--pill' : '',
    fullWidth ? 'lp-btn--full' : '',
    loading ? 'is-loading' : '',
    className,
  ].filter(Boolean).join(' ')

  const content = (
    <>
      {loading && <span className="lp-btn-spinner" aria-hidden="true" />}
      <span className="lp-btn-label">{children}</span>
    </>
  )

  if (to) {
    return <Link to={to} className={classes} {...rest}>{content}</Link>
  }
  if (href) {
    return <a href={href} className={classes} {...rest}>{content}</a>
  }
  return (
    <button type="button" {...rest} className={classes} disabled={loading || rest.disabled}>
      {content}
    </button>
  )
}

export default Button
