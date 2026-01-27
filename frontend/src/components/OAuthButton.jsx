import React, { memo } from 'react'
import { authService } from '../services/auth'
import './OAuthButton.css'

const OAuthButton = memo(({ provider, icon, label, onClick }) => {
  const handleClick = async () => {
    if (onClick) {
      onClick()
    } else {
      await authService.initiateOAuth(provider)
    }
  }

  return (
    <button
      type="button"
      className={`oauth-button oauth-button-${provider}`}
      onClick={handleClick}
    >
      {icon && <span className="oauth-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  )
})

OAuthButton.displayName = 'OAuthButton'

export default OAuthButton

