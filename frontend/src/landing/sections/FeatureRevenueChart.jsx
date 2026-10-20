import React, { useEffect, useId, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { chartSeries } from '../tokens/palette'
import './FeatureRevenueChart.css'

// TODO(copy): illustrative daily revenue series for the mockup.
const DATA = [1240, 1380, 1310, 1520, 1460, 1690, 1610, 1580, 1820, 1750, 1930, 1880,
  2010, 1940, 2101, 2060, 2230, 2180, 2320, 2290, 2460, 2410, 2580, 2650]

const W = 480
const H = 220
const PAD_TOP = 40
const MAX = Math.max(...DATA) * 1.05
const MIN = Math.min(...DATA) * 0.85

const point = (v, i) => [
  (i / (DATA.length - 1)) * W,
  PAD_TOP + (1 - (v - MIN) / (MAX - MIN)) * (H - PAD_TOP),
]

const POINTS = DATA.map(point)

// Catmull-Rom spline converted to cubic Béziers for a smooth line.
const LINE = POINTS.reduce((d, [x, y], i, pts) => {
  if (i === 0) return `M${x},${y}`
  const [x0, y0] = pts[i - 2] || pts[i - 1]
  const [x1, y1] = pts[i - 1]
  const [x3, y3] = pts[i + 1] || [x, y]
  const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6]
  const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6]
  return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${x},${y}`
}, '')

const AREA = `${LINE} L${W},${H} L0,${H} Z`

const FeatureRevenueChart = () => {
  const gradientId = `lp-rc${useId().replace(/:/g, '')}`
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(14)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (reduceMotion || hovering || !inView) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 3) % DATA.length), 1800)
    return () => clearInterval(timer)
  }, [reduceMotion, hovering, inView])

  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    setIndex(Math.round(ratio * (DATA.length - 1)))
  }

  const [x, y] = POINTS[index]
  const left = `${(x / W) * 100}%`
  const top = `${(y / H) * 100}%`
  const transition = reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 24 }

  return (
    <div ref={ref} className="lp-rchart">
      <p className="lp-rchart-label">Total Revenue</p>
      <div
        className="lp-rchart-plot"
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onPointerMove={onPointerMove}
        role="img"
        aria-label="Illustrative Total Revenue line chart trending upward over 24 days"
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="lp-rchart-svg" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartSeries[0]} stopOpacity="0.28" />
              <stop offset="100%" stopColor={chartSeries[0]} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={AREA} fill={`url(#${gradientId})`} />
          <path d={LINE} fill="none" stroke={chartSeries[0]} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>

        <motion.span className="lp-rchart-track" animate={{ x: left }} transition={transition} aria-hidden="true">
          <span className="lp-rchart-cross" />
        </motion.span>
        <motion.span className="lp-rchart-track" animate={{ x: left, y: top }} transition={transition} aria-hidden="true">
          <span className="lp-rchart-dot" />
          <span className="lp-rchart-tip">${DATA[index].toLocaleString('en-US')}</span>
        </motion.span>
      </div>
    </div>
  )
}

export default FeatureRevenueChart
