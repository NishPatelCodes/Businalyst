import React, { useMemo, useContext, useRef, useEffect, useState } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './DashboardMultilineChart.css'

const COLORS = {
  revenue: '#2563eb',
  profit: '#16a34a',
  orders: '#dc2626',
}

function formatDateShort(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return String(str)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildSmoothPath(pts) {
  if (!pts || pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i + 1].x) / 2
    d += ` C ${cpx} ${pts[i].y} ${cpx} ${pts[i + 1].y} ${pts[i + 1].x} ${pts[i + 1].y}`
  }
  return d
}

const DashboardMultilineChart = () => {
  const { kpiData, formatCurrency } = useContext(KpiContext)
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hoverIndex, setHoverIndex] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setSize({ width: Math.round(width), height: Math.round(height) })
    })
    observer.observe(el)
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) setSize({ width: Math.round(width), height: Math.round(height) })
    return () => observer.disconnect()
  }, [])

  const { chartData, paths, pad, valueToY, indexToX, n, yTicks, xLabelIndices, maxVal } = useMemo(() => {
    const dates = kpiData?.date_data || []
    const revenue = kpiData?.revenue_data || []
    const profit = kpiData?.profit_data || []
    const ordersRaw = kpiData?.orders_data || [850, 720, 617]
    const len = Math.min(dates.length, revenue.length, profit.length) || 1
    let ordersSeries
    if (ordersRaw.length >= len) {
      ordersSeries = ordersRaw.slice(0, len).map(Number)
    } else if (ordersRaw.length > 0) {
      ordersSeries = Array.from({ length: len }, (_, i) => {
        const t = len > 1 ? i / (len - 1) : 0
        const pos = t * (ordersRaw.length - 1)
        const lo = Math.floor(pos)
        const hi = Math.min(lo + 1, ordersRaw.length - 1)
        const frac = pos - lo
        const a = Number(ordersRaw[lo]) || 0
        const b = Number(ordersRaw[hi]) || 0
        return Math.round(a + frac * (b - a))
      })
    } else {
      ordersSeries = revenue.map((r, i) => Math.round(Number(r) / 20 + 500 - i * 2))
    }

    const chartData = Array.from({ length: len }, (_, i) => ({
      date: dates[i],
      revenue: Number(revenue[i]) || 0,
      profit: Number(profit[i]) || 0,
      orders: Number(ordersSeries[i]) || 0,
    }))

    const allValues = chartData.flatMap((d) => [d.revenue, d.profit, d.orders])
    const maxVal = Math.max(1, ...allValues)
    const yMax = maxVal * 1.08

    const width = size.width
    const height = size.height
    if (width <= 0 || height <= 0) {
      return {
        chartData: [],
        paths: { revenue: '', profit: '', orders: '' },
        pad: { top: 12, right: 12, bottom: 28, left: 36 },
        valueToY: () => 0,
        indexToX: () => 0,
        n: 0,
        yTicks: [0],
        xLabelIndices: [0],
        maxVal: 1,
      }
    }

    const pad = {
      top: 12,
      right: 12,
      bottom: 28,
      left: 40,
    }
    const graphW = width - pad.left - pad.right
    const graphH = height - pad.top - pad.bottom

    const n = chartData.length
    const valueToY = (v) => pad.top + graphH - (Number(v) / yMax) * graphH
    const indexToX = (i) => (n <= 1 ? pad.left : pad.left + (i / (n - 1)) * graphW)

    const pts = (key) =>
      chartData.map((d, i) => ({
        x: pad.left + (n <= 1 ? 0 : (i / (n - 1)) * graphW),
        y: valueToY(d[key]),
      }))

    const paths = {
      revenue: buildSmoothPath(pts('revenue')),
      profit: buildSmoothPath(pts('profit')),
      orders: buildSmoothPath(pts('orders')),
    }

    const yStep = yMax / 4
    const yTicks = [0, yStep, yStep * 2, yStep * 3, yMax].map((v) => Math.round(v))
    const xLabelIndices =
      n <= 2
        ? [...Array(n).keys()]
        : [0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round((3 * (n - 1)) / 4), n - 1].filter(
            (v, i, a) => a.indexOf(v) === i
          )

    return {
      chartData,
      paths,
      pad,
      valueToY,
      indexToX: (i) => pad.left + (n <= 1 ? 0 : (i / (n - 1)) * graphW),
      n,
      yTicks,
      xLabelIndices,
      maxVal: yMax,
    }
  }, [
    kpiData?.date_data,
    kpiData?.revenue_data,
    kpiData?.profit_data,
    kpiData?.orders_data,
    size.width,
    size.height,
  ])

  const handleMouseMove = (e) => {
    if (!containerRef.current || n === 0) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * size.width
    let idx = 0
    let best = Infinity
    for (let i = 0; i < n; i++) {
      const d = Math.abs(x - indexToX(i))
      if (d < best) {
        best = d
        idx = i
      }
    }
    setHoverIndex(idx)
  }

  const handleMouseLeave = () => setHoverIndex(null)

  const hasSize = size.width > 0 && size.height > 0
  const point = hoverIndex != null && chartData[hoverIndex] ? chartData[hoverIndex] : null

  return (
    <div className="dashboard-multiline">
      <div className="dashboard-multiline-header">
        <h2 className="dashboard-multiline-title">Trends</h2>
        <div className="dashboard-multiline-legend">
          <span className="dashboard-multiline-legend-item">
            <span className="dashboard-multiline-legend-dot" style={{ background: COLORS.revenue }} />
            Revenue
          </span>
          <span className="dashboard-multiline-legend-item">
            <span className="dashboard-multiline-legend-dot" style={{ background: COLORS.profit }} />
            Profit
          </span>
          <span className="dashboard-multiline-legend-item">
            <span className="dashboard-multiline-legend-dot" style={{ background: COLORS.orders }} />
            Orders
          </span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="dashboard-multiline-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {hasSize && n > 0 && (
          <svg
            className="dashboard-multiline-svg"
            viewBox={`0 0 ${size.width} ${size.height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Y grid */}
            {yTicks.map((tick) => (
              <line
                key={tick}
                x1={pad.left}
                y1={valueToY(tick)}
                x2={size.width - pad.right}
                y2={valueToY(tick)}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            ))}
            {/* Lines */}
            <path d={paths.revenue} fill="none" stroke={COLORS.revenue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={paths.profit} fill="none" stroke={COLORS.profit} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={paths.orders} fill="none" stroke={COLORS.orders} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* X labels */}
            {xLabelIndices.map((i) => (
              <text
                key={i}
                x={indexToX(i)}
                y={size.height - 6}
                textAnchor="middle"
                className="dashboard-multiline-xlabel"
              >
                {formatDateShort(chartData[i]?.date)}
              </text>
            ))}
            {/* Hover vertical line + tooltip area */}
            {hoverIndex != null && chartData[hoverIndex] && (
              <line
                x1={indexToX(hoverIndex)}
                y1={pad.top}
                x2={indexToX(hoverIndex)}
                y2={size.height - pad.bottom}
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="2"
              />
            )}
          </svg>
        )}
      </div>
      {point && hoverIndex != null && hasSize && (
        <div
          className="dashboard-multiline-tooltip"
          style={{
            left: `${(indexToX(hoverIndex) / size.width) * 100}%`,
          }}
        >
          <div className="dashboard-multiline-tooltip-date">{formatDateShort(point.date)}</div>
          <div className="dashboard-multiline-tooltip-row" style={{ color: COLORS.revenue }}>
            Revenue: {formatCurrency(point.revenue)}
          </div>
          <div className="dashboard-multiline-tooltip-row" style={{ color: COLORS.profit }}>
            Profit: {formatCurrency(point.profit)}
          </div>
          <div className="dashboard-multiline-tooltip-row" style={{ color: COLORS.orders }}>
            Orders: {Number(point.orders).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardMultilineChart
