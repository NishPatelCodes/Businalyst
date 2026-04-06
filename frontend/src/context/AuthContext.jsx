import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'businalyst_access_token'
const REFRESH_KEY = 'businalyst_refresh_token'
const USER_KEY = 'businalyst_user'

function getStored(key) {
  try { return localStorage.getItem(key) } catch { return null }
}
function setStored(key, value) {
  try { localStorage.setItem(key, value) } catch {}
}
function removeStored(key) {
  try { localStorage.removeItem(key) } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getStored(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [accessToken, setAccessToken] = useState(() => getStored(TOKEN_KEY))
  const [refreshToken, setRefreshToken] = useState(() => getStored(REFRESH_KEY))
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const isAuthenticated = useMemo(() => !!accessToken && !!user, [accessToken, user])

  const persistTokens = useCallback((access, refresh, userData) => {
    setAccessToken(access)
    setRefreshToken(refresh)
    setUser(userData)
    setStored(TOKEN_KEY, access)
    setStored(REFRESH_KEY, refresh)
    setStored(USER_KEY, JSON.stringify(userData))
  }, [])

  const clearAuth = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    removeStored(TOKEN_KEY)
    removeStored(REFRESH_KEY)
    removeStored(USER_KEY)
  }, [])

  const refreshAccessToken = useCallback(async () => {
    const rt = getStored(REFRESH_KEY)
    if (!rt) return null
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: rt }),
      })
      if (!res.ok) {
        clearAuth()
        return null
      }
      const data = await res.json()
      setAccessToken(data.access)
      setStored(TOKEN_KEY, data.access)
      if (data.refresh) {
        setRefreshToken(data.refresh)
        setStored(REFRESH_KEY, data.refresh)
      }
      return data.access
    } catch {
      clearAuth()
      return null
    }
  }, [clearAuth])

  const authFetch = useCallback(async (url, options = {}) => {
    let token = getStored(TOKEN_KEY)
    const makeRequest = (t) =>
      fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
      })

    let res = await makeRequest(token)
    if (res.status === 401) {
      token = await refreshAccessToken()
      if (token) {
        res = await makeRequest(token)
      }
    }
    return res
  }, [refreshAccessToken])

  const loginUser = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      persistTokens(data.access, data.refresh, data.user)
      return { success: true, hasDataset: data.has_dataset, user: data.user }
    } finally {
      setLoading(false)
    }
  }, [persistTokens])

  const registerUser = useCallback(async (name, email, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      persistTokens(data.access, data.refresh, data.user)
      return { success: true, user: data.user }
    } finally {
      setLoading(false)
    }
  }, [persistTokens])

  const logout = useCallback(() => {
    clearAuth()
    removeStored('businalyst_kpi_data')
    removeStored('businalyst_kpi_version')
    removeStored('businalyst_currency_code')
  }, [clearAuth])

  useEffect(() => {
    const validateSession = async () => {
      const token = getStored(TOKEN_KEY)
      if (!token) {
        setInitializing(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUser({ id: data.id, email: data.email, name: data.name })
          setStored(USER_KEY, JSON.stringify({ id: data.id, email: data.email, name: data.name }))
        } else if (res.status === 401) {
          const newToken = await refreshAccessToken()
          if (!newToken) clearAuth()
        } else {
          clearAuth()
        }
      } catch {
        // Network error — keep existing tokens, user might be offline
      } finally {
        setInitializing(false)
      }
    }
    validateSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        loading,
        initializing,
        loginUser,
        registerUser,
        logout,
        authFetch,
        API_BASE,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
