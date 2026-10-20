import React, { createContext, useContext } from 'react'
import useLandingTheme from './hooks/useLandingTheme'
import './tokens/tokens.css'

const LandingThemeContext = createContext(null)

export function useLandingThemeContext() {
  const ctx = useContext(LandingThemeContext)
  if (!ctx) throw new Error('useLandingThemeContext must be used within LandingShell')
  return ctx
}

const LandingShell = ({ children }) => {
  const theme = useLandingTheme()

  return (
    <LandingThemeContext.Provider value={theme}>
      <div className="lp-root" data-theme={theme.resolved}>
        {children}
      </div>
    </LandingThemeContext.Provider>
  )
}

export default LandingShell
