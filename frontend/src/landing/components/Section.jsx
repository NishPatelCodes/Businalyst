import React from 'react'
import Badge from './Badge'
import './Section.css'

export const Container = ({ narrow = false, className = '', children }) => (
  <div className={`lp-container ${narrow ? 'lp-container--narrow' : ''} ${className}`.trim()}>
    {children}
  </div>
)

// tone: 'default' | 'subtle' | 'night'
// `id` doubles as the in-page anchor target (e.g. #features).
export const Section = ({ id, tone = 'default', className = '', children }) => (
  <section id={id} className={`lp-section lp-section--${tone} ${className}`.trim()}>
    {children}
  </section>
)

export const SectionHeader = ({ eyebrow, title, description, align = 'center', as: Heading = 'h2' }) => (
  <header className={`lp-section-header lp-section-header--${align}`}>
    {eyebrow && <Badge tone="brand">{eyebrow}</Badge>}
    <Heading className="lp-section-title">{title}</Heading>
    {description && <p className="lp-section-description">{description}</p>}
  </header>
)

export default Section
