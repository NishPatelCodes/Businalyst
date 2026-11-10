import React from 'react'
import { Badge, Button, Container, Icon, Reveal } from '../components'
import { useAuth } from '../../context/AuthContext'
import { BRAND, ROUTES } from '../brand/brand'
import HeroShowcase from './HeroShowcase'
import './Hero.css'

const Hero = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section id="home" className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-hero-backdrop" aria-hidden="true">
        <span className="lp-hero-chroma" />
        <span className="lp-hero-fade" />
      </div>

      <Container className="lp-hero-inner">
        <Reveal className="lp-hero-copy">
          <Badge tone="neutral" className="lp-hero-badge">
            <Icon name="dashboard" size={14} />
            Revenue · Profit · Expenses · Customers
          </Badge>
          <h1 id="lp-hero-title" className="lp-hero-title">{BRAND.headline}</h1>
          <p className="lp-hero-subtitle">{BRAND.subTagline}</p>
          <div className="lp-hero-actions">
            {isAuthenticated ? (
              <Button to={ROUTES.dashboard} size="lg">Go to dashboard</Button>
            ) : (
              <>
                <Button to={ROUTES.signup} size="lg">Try for free</Button>
                <Button to={ROUTES.login} size="lg" variant="secondary">Log in</Button>
              </>
            )}
          </div>
        </Reveal>

        {/* Product showcase. The previous placeholder + product tour button is in
            git history (Hero.jsx before this change) if it needs to come back. */}
        <Reveal className="lp-hero-showcase" delay={0.15} y={24}>
          <HeroShowcase />
        </Reveal>
      </Container>
    </section>
  )
}

export default Hero
