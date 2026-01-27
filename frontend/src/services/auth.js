import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authService = {
  async login(email, password) {
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
    const response = await api.post('/api/auth/register', { email, password, name })
    return response.data
  },

  async logout() {
    await api.post('/api/auth/logout')
    localStorage.removeItem('access_token')
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  async initiateOAuth(provider) {
    const response = await api.get(`/api/auth/${provider}`)
    // Redirect to OAuth provider
    window.location.href = response.data.authorization_url
  },
}

