import React from 'react'
import { MotionConfig } from 'framer-motion'
import LandingShell from './LandingShell'
import Navbar from './sections/Navbar'
import Hero from './sections/Hero'
import MetricStrip from './sections/MetricStrip'
import FeatureBento from './sections/FeatureBento'
import Testimonial from './sections/Testimonial'
import HowItWorks from './sections/HowItWorks'
import Security from './sections/Security'
import WallOfLove from './sections/WallOfLove'
import FAQ from './sections/FAQ'
import CTABanner from './sections/CTABanner'
import Footer from './sections/Footer'
import './LandingPage.css'

const LandingPage = () => (
  <LandingShell>
    <MotionConfig reducedMotion="user">
      <div className="lp-page">
        <a href="#lp-main" className="lp-skip">Skip to content</a>
        <Navbar />
        <div className="lp-frame">
          <main id="lp-main" className="lp-frame-main">
            <Hero />
            <MetricStrip />
            <FeatureBento />
            <Testimonial />
            <HowItWorks />
            <Security />
            <WallOfLove />
            <FAQ />
            <CTABanner />
          </main>
          <Footer />
        </div>
      </div>
    </MotionConfig>
  </LandingShell>
)

export default LandingPage
