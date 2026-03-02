const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function subscribeEmail(email) {
  const response = await fetch(`${API_BASE_URL}/api/subscribe/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Unexpected server response. Please try again.')
  }

  if (!response.ok) {
    throw new Error(data.error || 'Subscription failed')
  }

  return data
}
