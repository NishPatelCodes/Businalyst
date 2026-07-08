import React, { useState, useMemo, useContext, useRef, useEffect, useCallback } from 'react'
import { KpiDataContext, CurrencyContext } from '../../context/KpiContext'
import { aggregateSeriesByTimeframe, getXAxisConfig } from '../../utils/chartAggregation'
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

const LineChart = ({ hideTabs = false, metric, variant, seriesOverride, timeframe = '30D' }) => {
  const { kpiData } = useContext(KpiDataContext)
  const { formatCurrency, formatCompactCurrency } = useContext(CurrencyContext)
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

  // BUG 2/12 fix: when seriesOverride is supplied (Dashboard dateRange filtering),
  // always use it as the source of truth — even when empty. Previously an empty
  // override silently fell back to raw unfiltered kpiData, making the chart ignore
  // the date filter and show stale data.
  const chartData = useMemo(() => {
    const override = Array.isArray(seriesOverride) ? seriesOverride : null

    let baseData
    if (override !== null) {
      const valueKey = selectedTab === 'Revenue' ? 'revenue' : 'profit'
      baseData = override.map((pt) => ({
        date: pt.date,
        value: Number(pt?.[valueKey]) || 0,
      }))
    } else {
      const dates = kpiData?.date_data
      const revenue = kpiData?.revenue_data
      const profit = kpiData?.profit_data
      const values = selectedTab === 'Revenue' ? revenue : profit
      if (dates?.length && values?.length) {
        const len = Math.min(dates.length, values.length)
        baseData = Array.from({ length: len }, (_, i) => ({
          date: dates[i],
          value: Number(values[i]) || 0,
        }))
      } else {
        baseData = PLACEHOLDER.map((d) => ({ date: d.date, value: d.value }))
      }
    }

    // Apply aggregation based on timeframe
    return aggregateSeriesByTimeframe(baseData, timeframe)
  }, [seriesOverride, kpiData?.date_data, kpiData?.revenue_data, kpiData?.profit_data, selectedTab, timeframe])

  const values = useMemo(() => chartData.map((d) => d.value), [chartData])
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
  const xAxisConfig = useMemo(() => getXAxisConfig(timeframe), [timeframe])
  const formatXLabel = (date) => xAxisConfig.formatLabel(date)
  const indexToX = (i) => (n <= 1 ? pad.left : pad.left + (i / (n - 1)) * graphW)
  const valueToY = (v) => pad.top + graphH - (Number(v) / yMax) * graphH

  const points = useMemo(
    () =>
      chartData.map((d, i) => ({
        x: indexToX(i),
        y: valueToY(d.value),
        ...d,
      })),
    [chartData, n, graphW, graphH, yMax, pad.left, pad.top]
  )

  // Monotone cubic interpolation for smooth, data-faithful curves
  const buildSmoothPath = (pts) => {
    if (pts.length < 2) return ''
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`

    const n = pts.length

    // Compute slopes using Fritsch-Carlson monotone method
    const deltas = []
    const slopes = []

    for (let i = 0; i < n - 1; i++) {
      deltas.push({
        dx: pts[i + 1].x - pts[i].x,
        dy: pts[i + 1].y - pts[i].y,
      })
      slopes.push(deltas[i].dy / deltas[i].dx)
    }

    // Assign tangent slopes at each point
    const tangents = new Array(n)
    tangents[0] = slopes[0]
    tangents[n - 1] = slopes[n - 2]

    for (let i = 1; i < n - 1; i++) {
      if (slopes[i - 1] * slopes[i] <= 0) {
        tangents[i] = 0
      } else {
        tangents[i] = (slopes[i - 1] + slopes[i]) / 2
      }
    }

    // Monotonicity adjustment
    for (let i = 0; i < n - 1; i++) {
      if (Math.abs(slopes[i]) < 1e-6) {
        tangents[i] = 0
        tangents[i + 1] = 0
      } else {
        const alpha = tangents[i] / slopes[i]
        const beta = tangents[i + 1] / slopes[i]
        const s = alpha * alpha + beta * beta
        if (s > 9) {
          const tau = 3 / Math.sqrt(s)
          tangents[i] = tau * alpha * slopes[i]
          tangents[i + 1] = tau * beta * slopes[i]
        }
      }
    }

    // Build SVG path with cubic bezier segments
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < n - 1; i++) {
      const dx = deltas[i].dx / 3
      const cp1x = pts[i].x + dx
      const cp1y = pts[i].y + tangents[i] * dx
      const cp2x = pts[i + 1].x - dx
      const cp2y = pts[i + 1].y - tangents[i + 1] * dx
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${pts[i + 1].x} ${pts[i + 1].y}`
    }
    return d
  }

  const linePath = useMemo(() => buildSmoothPath(points), [points])
  const areaPath = useMemo(
    () =>
      points.length < 2
        ? ''
        : `${linePath} L ${points[points.length - 1].x} ${pad.top + graphH} L ${points[0].x} ${pad.top + graphH} Z`,
    [linePath, points, pad.top, graphH]
  )

  // Use shared interval logic so dashboard SVG charts match Recharts behavior.
  const xLabelIndices = useMemo(() => {
    if (n <= 2) return [...Array(n).keys()]
    const interval = xAxisConfig.getInterval(n)
    const intervalStride = Math.max(1, interval + 1)
    const pixelsPerStep = graphW / Math.max(1, n - 1)
    const minLabelGapPx = 72
    const widthStride = Math.max(1, Math.ceil(minLabelGapPx / Math.max(1, pixelsPerStep)))
    const stride = Math.max(intervalStride, widthStride)
    const candidates = []
    for (let i = 0; i < n; i += stride) candidates.push(i)
    if (candidates[candidates.length - 1] !== n - 1) {
      const gapToEnd = (n - 1) - candidates[candidates.length - 1]
      if (gapToEnd < Math.ceil(stride * 0.6)) {
        candidates[candidates.length - 1] = n - 1
      } else {
        candidates.push(n - 1)
      }
    }
    const uniqueCandidates = candidates
      .filter((v, i, a) => a.indexOf(v) === i)
    const seen = new Set()
    return uniqueCandidates.filter((idx) => {
      const label = formatXLabel(chartData[idx]?.date)
      if (seen.has(label)) return false
      seen.add(label)
      return true
    })
  }, [n, chartData, xAxisConfig, graphW])

  // Y ticks: 0 and a few steps
  const yTicks = useMemo(() => {
    if (yMax <= 0) return [0]
    const step = yMax / 4
    return [0, step, step * 2, step * 3, yMax].map((v) => Math.round(v))
  }, [yMax])

  const hoverIndexRef = useRef(null)
  const handleMouseMove = useCallback((e) => {
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
    if (hoverIndexRef.current !== idx) {
      hoverIndexRef.current = idx
      setHoverIndex(idx)
    }
  }, [hasSize, width, n, indexToX])

  const handleMouseLeave = useCallback(() => {
    hoverIndexRef.current = null
    setHoverIndex(null)
  }, [])

  return (
    <div className={`line-chart line-chart--wealthsimple ${isTotalSales ? 'line-chart--total-sales' : ''}`}>
      {!hideTabs && (
        <div className="line-chart-header">
          <div className="chart-header-left">
            <div className="line-chart-current-subtitle">
              Total {selectedTab}
            </div>
            <div className="line-chart-current-total">
              {formatCurrency(values.reduce((a, b) => a + b, 0))}
            </div>
          </div>
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
                {formatCompactCurrency(tick)}
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
              r={hoverIndex === i ? 5 : 0}
              fill="#2563eb"
              stroke="#fff"
              strokeWidth={2}
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
                  {formatXLabel(p.date)}
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
            <div className="tooltip-date">{formatXLabel(chartData[hoverIndex].date)}</div>
            <div className="tooltip-value">{formatCurrency(chartData[hoverIndex].value)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LineChart
