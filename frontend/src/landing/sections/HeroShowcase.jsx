import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { chartSeries } from '../tokens/palette'
import './HeroShowcase.css'

// Hero product showcase: a glass "app window" with Profit / Expenses / Orders
// tabs, sitting over Gradient 3 (Deep Blue) — same band as the closing CTA.
// The window drifts up over the panel as the page scrolls. All numbers are
// demo data generated from fixed seeds, and every KPI is computed from the
// series that is drawn.

const BLUE = chartSeries[0]
const RED = '#ef4444' // negative / expense line, Design.md section 6
const DAYS = 30
const X_LABELS = [0, 4, 8, 12, 16, 20, 24, 28]

const dayLabel = (i) => (i === 0 ? 'Nov 30' : `Dec ${i}`)
const usd = (n, digits = 0) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
const compactUsd = (n) => (n >= 1000 ? `$${n / 1000}K` : `$${n}`)

// Deterministic spiky series: mostly low values with occasional peaks.
function makeSeries(seed, max, spike) {
  let s = seed
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const raw = Array.from({ length: DAYS }, () => 0.04 + 0.9 * rnd() ** spike)
  const top = Math.max(...raw)
  // Scale so the tallest point sits just under the top gridline.
  return raw.map((v) => Math.round((v / top) * max * 0.94))
}

function stats(values) {
  const total = values.reduce((a, b) => a + b, 0)
  const peak = Math.max(...values)
  return { total, avg: total / values.length, peak, peakIndex: values.indexOf(peak) }
}

// Smooth line through the points, in a 1000 x 300 box.
function linePath(values, max) {
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 1000, 300 - (v / max) * 300])
  return pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = pts[i - 1]
    const mx = (px + x) / 2
    return `${d} C${mx},${py} ${mx},${y} ${x},${y}`
  }, '')
}

function buildTabs() {
  const profit = makeSeries(11, 2000, 2.6)
  const expense = makeSeries(29, 9000, 2.2)
  const fixed = expense.map((v, i) => Math.round(v * (0.3 + 0.12 * ((i * 7) % 5) / 4)))
  const orders = makeSeries(53, 190, 1.4)

  const p = stats(profit)
  const e = stats(expense)
  const f = stats(fixed)
  const o = stats(orders)

  return [
    {
      id: 'profit',
      label: 'Profit',
      title: 'Profit Trend Analysis',
      kind: 'line',
      max: 2000,
      ticks: [2000, 1500, 1000, 500, 0].map(compactUsd),
      avg: p.avg,
      avgLabel: `Avg ${usd(p.avg, 1)}`,
      series: [{ name: 'Net Profit', color: BLUE, values: profit, area: true }],
      tip: { index: p.peakIndex, value: p.peak, name: 'Net Profit', text: usd(p.peak), color: BLUE },
      kpis: [
        { label: 'Net profit', value: usd(p.total), delta: '+12.4%', up: true },
        { label: 'Daily average', value: usd(p.avg, 1) },
        { label: 'Best day', value: usd(p.peak), note: dayLabel(p.peakIndex) },
      ],
    },
    {
      id: 'expenses',
      label: 'Expenses',
      title: 'Expense Trend Analysis',
      kind: 'line',
      max: 10000,
      ticks: [10000, 7500, 5000, 2500, 0].map(compactUsd),
      avg: e.avg,
      avgLabel: `Avg ${usd(Math.round(e.avg))}`,
      series: [
        { name: 'Total Expense', color: RED, values: expense, area: true },
        { name: 'Fixed Expense', color: BLUE, values: fixed },
      ],
      tip: { index: e.peakIndex, value: e.peak, name: 'Total Expense', text: usd(e.peak), color: RED },
      kpis: [
        { label: 'Total expenses', value: usd(e.total), delta: '-3.1%', up: true },
        { label: 'Fixed share', value: `${Math.round((f.total / e.total) * 100)}%` },
        { label: 'Highest day', value: usd(e.peak), note: dayLabel(e.peakIndex) },
      ],
    },
    {
      id: 'orders',
      label: 'Orders',
      title: 'Order Volume Analysis',
      kind: 'bar',
      max: 200,
      ticks: [200, 150, 100, 50, 0].map(String),
      avg: o.avg,
      avgLabel: `Avg ${Math.round(o.avg)}`,
      series: [{ name: 'Orders', color: BLUE, values: orders }],
      tip: { index: o.peakIndex, value: o.peak, name: 'Orders', text: String(o.peak), color: BLUE },
      kpis: [
        { label: 'Total orders', value: o.total.toLocaleString('en-US'), delta: '+8.2%', up: true },
        { label: 'Daily average', value: String(Math.round(o.avg)) },
        { label: 'Busiest day', value: String(o.peak), note: dayLabel(o.peakIndex) },
      ],
    },
  ]
}

const ROTATE_MS = 6000

const Chart = ({ tab }) => {
  const count = tab.series[0].values.length
  const tipLeft = tab.kind === 'bar'
    ? ((tab.tip.index + 0.5) / count) * 100
    : (tab.tip.index / (count - 1)) * 100
  const tipTop = (1 - tab.tip.value / tab.max) * 100
  const avgTop = (1 - tab.avg / tab.max) * 100

  return (
    <div className="lp-show-chart">
      <div className="lp-show-yaxis" aria-hidden="true">
        {tab.ticks.map((t) => <span key={t}>{t}</span>)}
      </div>

      <div className="lp-show-plot">
        <div className="lp-show-grid" aria-hidden="true">
          {tab.ticks.map((t) => <span key={t} />)}
        </div>

        {tab.kind === 'line' ? (
          <svg className="lp-show-svg" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              {tab.series.filter((s) => s.area).map((s) => (
                <linearGradient key={s.name} id={`lp-show-fill-${tab.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {tab.series.map((s) => {
              const d = linePath(s.values, tab.max)
              return (
                <g key={s.name}>
                  {s.area && (
                    <path className="lp-show-area" d={`${d} L1000,300 L0,300 Z`} fill={`url(#lp-show-fill-${tab.id})`} />
                  )}
                  <path
                    className="lp-show-line"
                    d={d}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )
            })}
          </svg>
        ) : (
          <div className="lp-show-bars" aria-hidden="true">
            {tab.series[0].values.map((v, i) => (
              <span
                key={i}
                className="lp-show-bar"
                style={{ height: `${(v / tab.max) * 100}%`, background: tab.series[0].color, animationDelay: `${i * 14}ms` }}
              />
            ))}
          </div>
        )}

        <div className="lp-show-avg" style={{ top: `${avgTop}%` }} aria-hidden="true">
          <span>{tab.avgLabel}</span>
        </div>

        <div
          className={`lp-show-tip ${tipLeft > 62 ? 'lp-show-tip--left' : ''}`.trim()}
          style={{ left: `${tipLeft}%`, top: `${tipTop}%` }}
          aria-hidden="true"
        >
          <span className="lp-show-tip-dot" style={{ background: tab.tip.color }} />
          <div className="lp-show-tip-card">
            <p className="lp-show-tip-date">{dayLabel(tab.tip.index)}</p>
            <p className="lp-show-tip-row">
              <span className="lp-show-swatch" style={{ background: tab.tip.color }} />
              <span className="lp-show-tip-name">{tab.tip.name}</span>
              <strong>{tab.tip.text}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="lp-show-xaxis" aria-hidden="true">
        {X_LABELS.map((d) => (
          <span key={d} style={{ left: `${(d / (DAYS - 1)) * 100}%` }}>{dayLabel(d)}</span>
        ))}
      </div>
    </div>
  )
}

const HeroShowcase = () => {
  const tabs = useMemo(buildTabs, [])
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const rootRef = useRef(null)
  const inView = useInView(rootRef, { amount: 0.35 })
  const tab = tabs[active]

  // Scroll-linked drift: the window rises over the panel, the panel settles.
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start end', 'end start'] })
  const windowY = useTransform(scrollYProgress, [0, 1], [32, -32])

  useEffect(() => {
    if (reduceMotion || paused || !inView) return undefined
    const id = setTimeout(() => setActive((i) => (i + 1) % tabs.length), ROTATE_MS)
    return () => clearTimeout(id)
  }, [active, paused, inView, reduceMotion, tabs.length])

  return (
    <div
      ref={rootRef}
      className="lp-show"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <motion.div className="lp-show-window" style={reduceMotion ? undefined : { y: windowY }}>
        <div className="lp-show-bar-top">
          <span className="lp-show-dots" aria-hidden="true"><i /><i /><i /></span>
          <div className="lp-show-tabs" role="tablist" aria-label="Analytics views">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`lp-show-tab-${t.id}`}
                aria-selected={i === active}
                aria-controls="lp-show-panel"
                className={`lp-show-tab ${i === active ? 'is-active' : ''}`.trim()}
                onClick={() => setActive(i)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="lp-show-range">Nov 30 – Dec 29</span>
        </div>

        <div
          id="lp-show-panel"
          role="tabpanel"
          aria-labelledby={`lp-show-tab-${tab.id}`}
          className="lp-show-body"
          key={tab.id}
        >
          <ul className="lp-show-kpis">
            {tab.kpis.map((k) => (
              <li key={k.label} className="lp-show-kpi">
                <span className="lp-show-kpi-label">{k.label}</span>
                <span className="lp-show-kpi-value">{k.value}</span>
                {k.delta && (
                  <span className={`lp-show-kpi-delta ${k.up ? 'is-up' : 'is-down'}`}>
                    {k.delta} <span className="lp-show-kpi-vs">vs previous period</span>
                  </span>
                )}
                {k.note && <span className="lp-show-kpi-note">{k.note}</span>}
              </li>
            ))}
          </ul>

          <div className="lp-show-main">
            <div className="lp-show-head">
              <div>
                <p className="lp-show-eyebrow">Section 01</p>
                <h3 className="lp-show-title">{tab.title}</h3>
              </div>
              <ul className="lp-show-legend">
                {tab.series.map((s) => (
                  <li key={s.name}>
                    <span className="lp-show-swatch" style={{ background: s.color }} />
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
            <Chart tab={tab} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HeroShowcase
