import React from 'react'
import Navbar from './landing/Navbar'
import Hero from './landing/Hero'
import Features from './landing/Features'
import Showcase from './landing/Showcase'
import HowItWorks from './landing/HowItWorks'
import Testimonials from './landing/Testimonials'
import Pricing from './landing/Pricing'
import Faq from './landing/Faq'
import CtaBand from './landing/CtaBand'
import Footer from './landing/Footer'

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  )
}
