import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const isLoggingOut = useRef(false)

  useEffect(() => {
    // Check if user is already authenticated (only on initial mount)
    if (!isLoggingOut.current) {
      checkAuth()
    }
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      // Silently fail if backend is unavailable - user is just not logged in
      // This is expected if backend is not configured
      setUser(null)
      // Clear any stale tokens
      localStorage.removeItem('access_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const userData = await authService.login(email, password)
    setUser(userData)
    return userData
  }

  const register = async (email, password, name) => {
    const userData = await authService.register(email, password, name)
    return userData
  }

  const logout = async () => {
    // Set flag to prevent checkAuth from running
    isLoggingOut.current = true
    
    try {
      await authService.logout()
    } catch (error) {
      // Ignore logout errors - we still want to clear local state
      console.error('Logout error:', error)
    }
    
    // Clear user state immediately
    setUser(null)
    // Clear any remaining tokens
    localStorage.removeItem('access_token')
    // Set loading to false so UI updates immediately
    setLoading(false)
    
    // Reset flag after a delay to allow normal auth checks to resume
    setTimeout(() => {
      isLoggingOut.current = false
    }, 2000)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

