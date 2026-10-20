import React, { useId, useState } from 'react'
import Button from './Button'
import { joinWaitlist } from '../lib/api'
import './WaitlistForm.css'

const WaitlistForm = ({ placeholder = 'jane@example.com', ctaLabel = 'Join waitlist', className = '' }) => {
  const inputId = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      await joinWaitlist(email)
      setStatus('success')
      setEmail('')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <div className={`lp-waitlist ${className}`.trim()}>
      <form className="lp-waitlist-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="lp-sr-only">Email address</label>
        <input
          id={inputId}
          type="email"
          className={`lp-input ${error ? 'has-error' : ''}`.trim()}
          placeholder={placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          autoComplete="email"
          required
          disabled={status === 'loading'}
          aria-invalid={!!error}
        />
        <Button type="submit" loading={status === 'loading'}>
          {ctaLabel}
        </Button>
      </form>
      <div className="lp-waitlist-feedback" aria-live="polite">
        {error && <p className="lp-waitlist-error">{error}</p>}
        {status === 'success' && <p className="lp-waitlist-success">Thanks! We'll notify you soon.</p>}
      </div>
    </div>
  )
}

export default WaitlistForm
