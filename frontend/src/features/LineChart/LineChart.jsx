import React, { useState, useMemo, useContext, useRef, useEffect } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './LineChart.css'

// Fallback when no backend data
const PLACEHOLDER = [
  { date: 'Jul', value: 550000 },
  { date: 'Aug', value: 320000 },
  { date: 'Sep', value: 480000 },
  { date: 'Oct', value: 560000 },
  { date: 'Nov', value: 520000 },
  { date: 'Dec', value: 452264 },
]

function formatDateShort(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return String(str)
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const year = d.getFullYear()
  return `${month} ${year}`
}

function formatCurrency(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}k`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const LineChart = ({ hideTabs = false, metric, variant }) => {
  const { kpiData } = useContext(KpiContext)
  const [selectedTab, setSelectedTab] = useState(hideTabs ? (metric === 'revenue' ? 'Revenue' : 'Profit') : 'Revenue')
  const [hoverIndex, setHoverIndex] = useState(null)
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const isTotalSales = variant === 'totalSales'

  // Measure container so chart viewBox matches it (no top/bottom whitespace)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) {
        setContainerSize({ width: Math.round(width), height: Math.round(height) })
      }
    })
    observer.observe(el)
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) setContainerSize({ width: Math.round(width), height: Math.round(height) })
    return () => observer.disconnect()
  }, [])

  // Build chart data from backend: date_data + revenue_data or profit_data
  const chartData = useMemo(() => {
    const dates = kpiData?.date_data
    const revenue = kpiData?.revenue_data
    const profit = kpiData?.profit_data
    const values = selectedTab === 'Revenue' ? revenue : profit
    if (dates?.length && values?.length) {
      const len = Math.min(dates.length, values.length)
      return Array.from({ length: len }, (_, i) => ({
        date: dates[i],
        value: Number(values[i]) || 0,
      }))
    }
    return PLACEHOLDER.map((d) => ({ date: d.date, value: d.value }))
  }, [kpiData?.date_data, kpiData?.revenue_data, kpiData?.profit_data, selectedTab])

  const values = chartData.map((d) => d.value)
  const maxVal = Math.max(0, ...values)
  const overallAverage = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  const yMax = Math.max(maxVal, overallAverage) * 1.05 || 1

  // Layout: use measured container size so chart is drawn in correct coordinates (no stretch)
  const width = containerSize.width
  const height = containerSize.height
  const hasSize = width > 0 && height > 0
  const pad = hasSize
    ? {
        top: Math.round(0.06 * height),
        right: Math.round(0.02 * width),
        bottom: Math.round(0.18 * height),
        left: Math.round(0.07 * width),
      }
    : { top: 16, right: 24, bottom: 44, left: 52 }
  const graphW = width - pad.left - pad.right
  const graphH = height - pad.top - pad.bottom

  const n = chartData.length
  const indexToX = (i) => (n <= 1 ? pad.left : pad.left + (i / (n - 1)) * graphW)
  const valueToY = (v) => pad.top + graphH - (Number(v) / yMax) * graphH

  const points = chartData.map((d, i) => ({
    x: indexToX(i),
    y: valueToY(d.value),
    ...d,
  }))

  // Smooth bezier curve path builder
  const buildSmoothPath = (pts) => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const cpx = (pts[i].x + pts[i + 1].x) / 2
      d += ` C ${cpx} ${pts[i].y} ${cpx} ${pts[i + 1].y} ${pts[i + 1].x} ${pts[i + 1].y}`
    }
    return d
  }

  const linePath = buildSmoothPath(points)
  const areaPath = points.length < 2
    ? ''
    : `${linePath} L ${points[points.length - 1].x} ${pad.top + graphH} L ${points[0].x} ${pad.top + graphH} Z`

  // X labels: first, last, and up to 3 in between (evenly spaced by index)
  const xLabelIndices = useMemo(() => {
    if (n <= 2) return [...Array(n).keys()]
    const step = (n - 1) / 4
    return [0, Math.round(step), Math.round(step * 2), Math.round(step * 3), n - 1].filter((v, i, a) => a.indexOf(v) === i)
  }, [n])

  // Y ticks: 0 and a few steps
  const yTicks = useMemo(() => {
    if (yMax <= 0) return [0]
    const step = yMax / 4
    return [0, step, step * 2, step * 3, yMax].map((v) => Math.round(v))
  }, [yMax])

  const handleMouseMove = (e) => {
    if (!e.currentTarget || !hasSize) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * width
    let idx = 0
    let best = Math.abs(x - indexToX(0))
    for (let i = 1; i < n; i++) {
      const d = Math.abs(x - indexToX(i))
      if (d < best) {
        best = d
        idx = i
      }
    }
    setHoverIndex(idx)
  }

  const handleMouseLeave = () => setHoverIndex(null)

  return (
    <div className={`line-chart line-chart--wealthsimple ${isTotalSales ? 'line-chart--total-sales' : ''}`}>
      {!hideTabs && (
        <div className="line-chart-header">
          <div className="chart-header-left">
            <div className="line-chart-tabs">
              <button
                type="button"
                className={`line-chart-tab ${selectedTab === 'Revenue' ? 'line-chart-tab--active' : ''}`}
                onClick={() => setSelectedTab('Revenue')}
              >
                Revenue
              </button>
              <button
                type="button"
                className={`line-chart-tab ${selectedTab === 'Profit' ? 'line-chart-tab--active' : ''}`}
                onClick={() => setSelectedTab('Profit')}
              >
                Profit
              </button>
            </div>
            <div className="line-chart-current-total">
              {formatCurrency(values.reduce((a, b) => a + b, 0))}
            </div>
          </div>
        </div>
      )}

      <div ref={containerRef} className="line-chart-container">
        {hasSize && (
        <svg
          className="line-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="lineChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis labels */}
          <g className="chart-y-axis" aria-hidden="true">
            {yTicks.map((tick) => (
              <text
                key={tick}
                x={pad.left - 8}
                y={valueToY(tick) + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                {formatCurrency(tick)}
              </text>
            ))}
          </g>

          {/* Y-axis line */}
          <line
            x1={pad.left}
            y1={pad.top}
            x2={pad.left}
            y2={pad.top + graphH}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Horizontal grid */}
          {yTicks.map((tick) => (
            <line
              key={`grid-${tick}`}
              x1={pad.left}
              y1={valueToY(tick)}
              x2={pad.left + graphW}
              y2={valueToY(tick)}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* Baseline */}
          <line
            x1={pad.left}
            y1={pad.top + graphH}
            x2={pad.left + graphW}
            y2={pad.top + graphH}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Horizontal dashed "Average" line */}
          {values.length > 0 && overallAverage > 0 && (
            <g className="chart-average-line">
              <line
                x1={pad.left}
                y1={valueToY(overallAverage)}
                x2={pad.left + graphW}
                y2={valueToY(overallAverage)}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="6,4"
              />
              <text
                x={pad.left + graphW}
                y={valueToY(overallAverage) - 5}
                textAnchor="end"
                className="chart-average-label"
              >
                Avg
              </text>
            </g>
          )}

          {/* Area + primary line */}
          {areaPath && <path d={areaPath} fill="url(#lineChartGradient)" />}
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 5 : 3}
              fill={hoverIndex === i ? '#2563eb' : '#2563eb'}
              stroke="#fff"
              strokeWidth={hoverIndex === i ? 2 : 1.5}
              style={{ transition: 'r 0.15s ease' }}
            />
          ))}

          {/* Hover vertical line */}
          {hoverIndex != null && points[hoverIndex] && (
            <line
              x1={points[hoverIndex].x}
              y1={pad.top}
              x2={points[hoverIndex].x}
              y2={pad.top + graphH}
              stroke="#2563eb"
              strokeWidth="1"
              strokeDasharray="4,4"
              strokeOpacity="0.5"
            />
          )}

          {/* X-axis labels */}
          <g className="chart-x-axis" aria-hidden="true">
            {xLabelIndices.map((i) => {
              const p = points[i]
              if (!p) return null
              const isFirst = i === 0
              const isLast = i === n - 1
              const labelY = pad.top + graphH + Math.min(22, Math.round(0.08 * height))
              return (
                <text
                  key={i}
                  x={p.x}
                  y={labelY}
                  textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                  className="chart-axis-label"
                >
                  {formatDateShort(p.date)}
                </text>
              )
            })}
          </g>
        </svg>
        )}

        {/* Tooltip: shows hovered point (centered above chart) */}
        {hoverIndex != null && chartData[hoverIndex] && (
          <div
            className="chart-tooltip chart-tooltip--wealthsimple chart-tooltip--visible"
            style={{ position: 'absolute', left: '50%', top: '12px', transform: 'translateX(-50%)' }}
          >
            <div className="tooltip-date">{formatDateShort(chartData[hoverIndex].date)}</div>
            <div className="tooltip-value">{formatCurrency(chartData[hoverIndex].value)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LineChart
