import React, { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import './FeatureRangeFilter.css'

// TODO(copy): illustrative daily revenue for the mockup.
const DAYS = [
  { id: 'mon', label: 'Mon', value: 1420 },
  { id: 'tue', label: 'Tue', value: 1810 },
  { id: 'wed', label: 'Wed', value: 1630 },
  { id: 'thu', label: 'Thu', value: 2101 },
  { id: 'fri', label: 'Fri', value: 1960 },
  { id: 'sat', label: 'Sat', value: 2380 },
  { id: 'sun', label: 'Sun', value: 1540 },
]

const SPAN = 3
const MAX_START = DAYS.length - SPAN
const PEAK = Math.max(...DAYS.map((d) => d.value))

const FeatureRangeFilter = () => {
  const trackRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const [colWidth, setColWidth] = useState(0)
  const [start, setStart] = useState(2)
  const x = useMotionValue(0)

  useEffect(() => {
    const node = trackRef.current
    if (!node || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => setColWidth(entry.contentRect.width / DAYS.length))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!colWidth) return
    animate(x, start * colWidth, reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34 })
  }, [start, colWidth, reduceMotion, x])

  const snap = () => {
    const next = Math.round(x.get() / colWidth)
    const clamped = Math.min(Math.max(next, 0), MAX_START)
    setStart(clamped)
    animate(x, clamped * colWidth, { type: 'spring', stiffness: 380, damping: 34 })
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setStart((s) => Math.max(s - 1, 0))
    else if (e.key === 'ArrowRight') setStart((s) => Math.min(s + 1, MAX_START))
    else return
    e.preventDefault()
  }

  const selected = DAYS.slice(start, start + SPAN)
  const total = selected.reduce((sum, d) => sum + d.value, 0)
  const rangeText = `${selected[0].label} – ${selected[SPAN - 1].label}`

  return (
    <div className="lp-range">
      <div className="lp-range-summary" aria-live="polite">
        <span className="lp-range-summary-label">{rangeText}</span>
        <span className="lp-range-summary-value">${total.toLocaleString('en-US')}</span>
      </div>

      <div ref={trackRef} className="lp-range-track">
        {DAYS.map((day, i) => (
          <div key={day.id} className="lp-range-col">
            <span
              className={`lp-range-bar ${i >= start && i < start + SPAN ? 'is-selected' : ''}`.trim()}
              style={{ height: `${(day.value / PEAK) * 100}%` }}
            />
            <span className="lp-range-day">{day.label}</span>
          </div>
        ))}

        <span className="lp-range-today" aria-hidden="true">
          <span className="lp-range-today-chip">Today</span>
        </span>

        {colWidth > 0 && (
          <motion.div
            className="lp-range-window"
            style={{ x, width: colWidth * SPAN }}
            drag="x"
            dragConstraints={{ left: 0, right: MAX_START * colWidth }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={snap}
            role="slider"
            tabIndex={0}
            aria-label="Selected date range. Drag or use arrow keys to move it."
            aria-valuemin={0}
            aria-valuemax={MAX_START}
            aria-valuenow={start}
            aria-valuetext={rangeText}
            onKeyDown={onKeyDown}
          >
            <span className="lp-range-handle" aria-hidden="true" />
            <span className="lp-range-handle" aria-hidden="true" />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default FeatureRangeFilter
