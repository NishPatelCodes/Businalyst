import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Check if we're in production and API is not configured
const isProduction = import.meta.env.PROD
const isLocalhost = API_URL.includes('localhost') || API_URL.includes('127.0.0.1')
const isApiConfigured = !isProduction || !isLocalhost

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't throw for network errors or 401s - let components handle them
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      // Network error - backend might not be available
      return Promise.reject(new Error('Backend service unavailable'))
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email, password) {
    if (!isApiConfigured) {
      throw new Error('Backend service is not configured. Please set VITE_API_URL environment variable.')
    }
    
    const response = await api.post('/api/auth/login', { email, password })
    // Store token in localStorage as backup (cookie is primary)
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
    }
    // Get user info
    const userResponse = await api.get('/api/auth/me')
    return userResponse.data
  },

  async register(email, password, name) {
    if (!isApiConfigured) {
      throw new Error('Backend service is not configured. Please set VITE_API_URL environment variable.')
    }
    
    const response = await api.post('/api/auth/register', { email, password, name })
    return response.data
  },

  async logout() {
    // Clear localStorage first
    localStorage.removeItem('access_token')
    
    if (isApiConfigured) {
      try {
        await api.post('/api/auth/logout')
      } catch (error) {
        // Ignore logout errors - we've already cleared local storage
        console.error('Logout API error:', error)
      }
    }
    
    // Clear any cookies by making a request to logout endpoint
    // This ensures HTTP-only cookies are cleared
    try {
      // Force clear cookies by setting them to expire
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (error) {
      // Ignore cookie clearing errors
    }
  },

  async getCurrentUser() {
    // Don't make API calls if backend is not configured in production
    if (!isApiConfigured) {
      throw new Error('Backend unavailable')
    }
    
    try {
      const response = await api.get('/api/auth/me')
      return response.data
    } catch (error) {
      // If backend is not available, return null (user is not authenticated)
      if (error.message === 'Backend service unavailable' || error.code === 'ERR_NETWORK' || error.message === 'Backend unavailable') {
        throw new Error('Backend unavailable')
      }
      throw error
    }
  },

  async initiateOAuth(provider) {
    if (!isApiConfigured) {
      throw new Error('Backend service is not configured. Please set VITE_API_URL environment variable.')
    }
    
    const response = await api.get(`/api/auth/${provider}`)
    // Redirect to OAuth provider
    window.location.href = response.data.authorization_url
  },
}


