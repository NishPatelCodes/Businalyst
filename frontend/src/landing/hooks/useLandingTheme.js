import { useCallback, useEffect, useState } from 'react'

// Same key and values ('light' | 'dark' | 'system') as pages/Settings.jsx,
// so a visitor's choice carries over into the app after login.
const THEME_STORAGE_KEY = 'businalyst_theme'

function readStoredMode() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'system'
  } catch {
    return 'system'
  }
}

function resolve(mode) {
  if (mode !== 'system') return mode
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function useLandingTheme() {
  const [mode, setModeState] = useState(readStoredMode)
  const [resolved, setResolved] = useState(() => resolve(readStoredMode()))

  useEffect(() => {
    setResolved(resolve(mode))
    if (mode !== 'system' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setResolved(resolve('system'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((next) => {
    setModeState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {}
  }, [])

  const toggle = useCallback(() => {
    setMode(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved, setMode])

  return { mode, resolved, isDark: resolved === 'dark', setMode, toggle }
}
