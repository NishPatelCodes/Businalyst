import React, { useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import artImage from '../assets/hero-band.jpg'
import './HeroBand.css'

// Wraps the Hero and the MetricStrip and paints one full-bleed photo behind
// both. The photo starts where the hero showcase starts (measured, because the
// hero copy above it changes height with the viewport) and runs edge to edge
// down to the divider under the MetricStrip.
const HeroBand = ({ children }) => {
  const bandRef = useRef(null)
  const [top, setTop] = useState(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: bandRef, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1])

  useLayoutEffect(() => {
    const band = bandRef.current
    if (!band) return undefined

    // offsetTop ignores CSS transforms, so reveal and scroll animations on the
    // showcase do not move the photo.
    const measure = () => {
      const anchor = band.querySelector('.lp-show')
      if (!anchor) return
      let y = 0
      let el = anchor
      while (el && el !== band) {
        y += el.offsetTop
        el = el.offsetParent
      }
      setTop(y)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(band)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div ref={bandRef} className="lp-hero-band">
      <div
        className="lp-hero-band-art"
        style={{ top: top ?? 0, visibility: top === null ? 'hidden' : 'visible' }}
        aria-hidden="true"
      >
        <motion.img
          src={artImage}
          alt=""
          className="lp-hero-band-img"
          style={reduceMotion ? undefined : { scale }}
          decoding="async"
        />
      </div>
      {children}
    </div>
  )
}

export default HeroBand
