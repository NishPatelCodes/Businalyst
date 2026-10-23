import React, { useCallback, useRef, useState } from 'react'
import { Badge, Button, Container, Icon, Modal, Reveal } from '../components'
import { useAuth } from '../../context/AuthContext'
import { BRAND, ROUTES, SCREENSHOTS } from '../brand/brand'
import ProductTour from './ProductTour'
import './Hero.css'

const Hero = () => {
  const { isAuthenticated } = useAuth()
  const [tourOpen, setTourOpen] = useState(false)
  const playRef = useRef(null)
  const closeTour = useCallback(() => setTourOpen(false), [])

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
              <Button to={ROUTES.dashboard} size="lg" shape="pill">Go to dashboard</Button>
            ) : (
              <>
                <Button to={ROUTES.signup} size="lg" shape="pill">Try for free</Button>
                <Button to={ROUTES.login} size="lg" shape="pill" variant="secondary">Log in</Button>
              </>
            )}
          </div>
        </Reveal>

        <Reveal className="lp-hero-preview" delay={0.15} y={24}>
          <img
            src={SCREENSHOTS.main}
            alt={`${BRAND.name} dashboard showing Total Revenue, Net Profit, Expenses, Orders and Customers`}
            width="1656"
            height="928"
            className="lp-hero-shot"
            decoding="async"
          />
          <button
            ref={playRef}
            type="button"
            className="lp-hero-play"
            onClick={() => setTourOpen(true)}
            aria-label="Open the product tour"
          >
            <span className="lp-hero-play-halo" aria-hidden="true" />
            <span className="lp-hero-play-core" aria-hidden="true">
              <Icon name="play" size={22} strokeWidth={0} />
            </span>
          </button>
        </Reveal>
      </Container>

      <Modal open={tourOpen} onClose={closeTour} title="Product tour" returnFocusRef={playRef}>
        <ProductTour />
      </Modal>
    </section>
  )
}

export default Hero
