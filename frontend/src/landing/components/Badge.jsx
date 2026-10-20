import React from 'react'
import './Badge.css'

// tone: 'neutral' | 'brand' | 'success' | 'warning'
const Badge = ({ tone = 'neutral', className = '', children }) => (
  <span className={`lp-badge lp-badge--${tone} ${className}`.trim()}>{children}</span>
)

export default Badge
