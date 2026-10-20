import React from 'react'
import './Card.css'

// variant: 'default' | 'elevated' | 'product' (square corners, mirrors dashboard cards)
const Card = ({ variant = 'default', interactive = false, as: Tag = 'div', className = '', children, ...rest }) => (
  <Tag
    className={`lp-card lp-card--${variant} ${interactive ? 'lp-card--interactive' : ''} ${className}`.trim()}
    {...rest}
  >
    {children}
  </Tag>
)

export default Card
