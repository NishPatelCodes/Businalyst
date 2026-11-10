import React, { useEffect, useId, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { chartSeries, gray } from '../tokens/palette'
import './FeatureRevenueChart.css'

// Illustrative daily revenue for the mockup, generated from a fixed seed so it
// is stable between renders. It is built the way real store revenue looks:
// a slow upward trend, a weekly rhythm (Friday high, weekend low), day-to-day
// noise, one promotion spike and one slow day. The previous period follows the
// same rhythm about 16% lower and is drawn as a faint dashed comparison line.
const DAYS = 30
const START = new Date(2026, 8, 1) // Sep 1, 2026 (a Tuesday)
const WEEKDAY = [0.72, 1.02, 1.0, 1.04, 1.08, 1.2, 0.8] // Sun..Sat

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function series(seed, base, growth, events) {
  const rnd = seeded(seed)
  return Array.from({ length: DAYS }, (_, i) => {
    const day = new Date(START.getFullYear(), START.getMonth(), START.getDate() + i).getDay()
    const noise = 0.9 + rnd() * 0.2
    const v = (base + growth * i) * WEEKDAY[day] * noise * (events[i] || 1)
    return Math.round(v / 10) * 10
  })
}

const DATA = series(7, 2150, 34, { 11: 0.74, 18: 1.42, 19: 1.16 })
const PREV = series(19, 1860, 22, { 6: 1.25 })

const TOTAL = DATA.reduce((a, b) => a + b, 0)
const PREV_TOTAL = PREV.reduce((a, b) => a + b, 0)
const DELTA = ((TOTAL - PREV_TOTAL) / PREV_TOTAL) * 100

const TICK_STEP = 1000
const MAX = Math.ceil((Math.max(...DATA, ...PREV) * 1.08) / TICK_STEP) * TICK_STEP
const TICKS = Array.from({ length: MAX / TICK_STEP + 1 }, (_, i) => MAX - i * TICK_STEP)

const W = 480
const H = 200

const toPoint = (v, i) => [(i / (DAYS - 1)) * W, (1 - v / MAX) * H]
const POINTS = DATA.map(toPoint)
const PREV_POINTS = PREV.map(toPoint)

// Monotone-ish smoothing: Catmull-Rom with a low tension so peaks stay sharp
// enough to read as daily data rather than a sine wave.
function smooth(pts) {
  return pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [x0, y0] = pts[i - 2] || pts[i - 1]
    const [x1, y1] = pts[i - 1]
    const [x3, y3] = pts[i + 1] || [x, y]
    const k = 0.12
    const c1 = [x1 + (x - x0) * k, y1 + (y - y0) * k]
    const c2 = [x - (x3 - x1) * k, y - (y3 - y1) * k]
    return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${x},${y}`
  }, '')
}

const LINE = smooth(POINTS)
const PREV_LINE = smooth(PREV_POINTS)
const AREA = `${LINE} L${W},${H} L0,${H} Z`

const fmtDay = (i) =>
  new Date(START.getFullYear(), START.getMonth(), START.getDate() + i)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const fmtUsd = (n) => `$${n.toLocaleString('en-US')}`
const fmtTick = (n) => (n === 0 ? '$0' : `$${n / 1000}K`)
const X_LABELS = [0, 7, 14, 21, 29]

// Tour a few interesting days when idle: the promo spike, the slow day, the latest day
const TOUR = [18, 11, 24, 29, 4]

const FeatureRevenueChart = () => {
  const gradientId = `lp-rc${useId().replace(/:/g, '')}`
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const [hoverIndex, setHoverIndex] = useState(null)
  const index = hoverIndex ?? TOUR[step]

  useEffect(() => {
    if (reduceMotion || hoverIndex !== null || !inView) return undefined
    const timer = setInterval(() => setStep((s) => (s + 1) % TOUR.length), 2000)
    return () => clearInterval(timer)
  }, [reduceMotion, hoverIndex, inView])

  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    setHoverIndex(Math.round(ratio * (DAYS - 1)))
  }

  const [x, y] = POINTS[index]
  const left = `${(x / W) * 100}%`
  const top = `${(y / H) * 100}%`
  const transition = reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 26 }
  // Keep the tooltip inside the card near either edge
  const tipAlign = index < 5 ? 'start' : index > DAYS - 6 ? 'end' : 'center'
  const change = ((DATA[index] - PREV[index]) / PREV[index]) * 100

  return (
    <div ref={ref} className="lp-rchart">
      <div className="lp-rchart-head">
        <div>
          <p className="lp-rchart-label">Total Revenue</p>
          <p className="lp-rchart-total">{fmtUsd(TOTAL)}</p>
        </div>
        <div className="lp-rchart-meta">
          <span className="lp-rchart-delta">↑ {DELTA.toFixed(1)}%</span>
          <span className="lp-rchart-range">vs previous 30 days</span>
        </div>
      </div>

      <div className="lp-rchart-body">
        <div className="lp-rchart-yaxis" aria-hidden="true">
          {TICKS.map((t) => <span key={t}>{fmtTick(t)}</span>)}
        </div>

        <div
          className="lp-rchart-plot"
          onPointerLeave={() => setHoverIndex(null)}
          onPointerMove={onPointerMove}
          role="img"
          aria-label={`Illustrative daily Total Revenue for 30 days, ${fmtUsd(TOTAL)} in total, up ${DELTA.toFixed(1)}% on the previous period`}
        >
          <div className="lp-rchart-grid" aria-hidden="true">
            {TICKS.map((t) => <span key={t} />)}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="lp-rchart-svg" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartSeries[0]} stopOpacity="0.22" />
                <stop offset="100%" stopColor={chartSeries[0]} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={PREV_LINE}
              fill="none"
              stroke={gray[400]}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.7"
            />
            <path d={AREA} fill={`url(#${gradientId})`} />
            <path
              d={LINE}
              fill="none"
              stroke={chartSeries[0]}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <motion.span className="lp-rchart-track" animate={{ x: left }} transition={transition} aria-hidden="true">
            <span className="lp-rchart-cross" />
          </motion.span>
          <motion.span className="lp-rchart-track" animate={{ x: left, y: top }} transition={transition} aria-hidden="true">
            <span className="lp-rchart-dot" />
            <span className={`lp-rchart-tip lp-rchart-tip--${tipAlign}`}>
              <span className="lp-rchart-tip-date">{fmtDay(index)}</span>
              <span className="lp-rchart-tip-value">{fmtUsd(DATA[index])}</span>
              <span className={`lp-rchart-tip-change ${change >= 0 ? 'is-up' : 'is-down'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(0)}%
              </span>
            </span>
          </motion.span>
        </div>

        <div className="lp-rchart-xaxis" aria-hidden="true">
          {X_LABELS.map((d) => (
            <span key={d} style={{ left: `${(d / (DAYS - 1)) * 100}%` }}>{fmtDay(d)}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeatureRevenueChart
