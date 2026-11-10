// Public (unauthenticated) endpoints the landing page is allowed to call.
// Authenticated calls must go through useAuth().authFetch instead.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function joinWaitlist(email) {
  const res = await fetch(`${API_BASE}/api/waitlist/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }
  return data
}
