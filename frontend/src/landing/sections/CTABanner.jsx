import React from 'react'
import { Button, Container, Reveal } from '../components'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../brand/brand'
import './CTABanner.css'

const CTABanner = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="lp-cta" aria-labelledby="lp-cta-title">
      <Container>
        <Reveal className="lp-cta-panel" y={24}>
          <div className="lp-cta-shapes" aria-hidden="true">
            <span className="lp-cta-shape lp-cta-shape--1" />
            <span className="lp-cta-shape lp-cta-shape--2" />
            <span className="lp-cta-shape lp-cta-shape--3" />
          </div>
          <h2 id="lp-cta-title" className="lp-cta-title">
            Analyze. Decide. <span className="lp-cta-title-line">Grow.</span>
          </h2>
          <Button
            to={isAuthenticated ? ROUTES.dashboard : ROUTES.signup}
            variant="light"
            size="lg"
            shape="pill"
          >
            {isAuthenticated ? 'Go to dashboard' : 'Create your free account'}
          </Button>
          <p className="lp-cta-caption">Upload a CSV or Excel file and see your KPIs in minutes.</p>
        </Reveal>
      </Container>
    </section>
  )
}

export default CTABanner
