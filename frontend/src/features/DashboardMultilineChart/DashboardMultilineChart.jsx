import React, { useMemo, useContext, useRef, useEffect, useState } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './DashboardMultilineChart.css'

const COLORS = {
  revenue: '#2563eb',
  orders: '#dc2626',
  aov: '#16a34a',
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

const DashboardMultilineChart = ({ revenueRatio = 1, ordersRatio = 1 }) => {
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

  const { chartData, paths, pad, valueToY, indexToX, n, yTicks, xLabelIndices } = useMemo(() => {
    // Consume clean backend arrays; fall back to demo data if unavailable
    const labels = kpiData?.multiline_labels || kpiData?.date_data || []
    const revenue = kpiData?.multiline_revenue || kpiData?.revenue_data || []
    const orders = kpiData?.multiline_orders || []
    const aov = kpiData?.multiline_aov || []

    const len = Math.min(
      labels.length || 1,
      revenue.length || 1,
      Math.max(orders.length, 1),
    ) || 1
    const safelen = Math.min(len, labels.length, revenue.length) || 1

    const chartData = Array.from({ length: safelen }, (_, i) => ({
      label: labels[i] ?? '',
      revenue: (Number(revenue[i]) || 0) * revenueRatio,
      orders: (Number(orders[i]) || 0) * ordersRatio,
      aov: Number(aov[i]) || 0,
    }))

    const allValues = chartData.flatMap((d) => [d.revenue, d.orders, d.aov])
    const maxVal = Math.max(1, ...allValues)
    const yMax = maxVal * 1.08

    const width = size.width
    const height = size.height
    if (width <= 0 || height <= 0) {
      return {
        chartData: [],
        paths: { revenue: '', orders: '', aov: '' },
        pad: { top: 12, right: 12, bottom: 28, left: 36 },
        valueToY: () => 0,
        indexToX: () => 0,
        n: 0,
        yTicks: [0],
        xLabelIndices: [0],
      }
    }

    const pad = { top: 12, right: 12, bottom: 28, left: 40 }
    const graphW = width - pad.left - pad.right
    const graphH = height - pad.top - pad.bottom

    const nPts = chartData.length
    const valueToY = (v) => pad.top + graphH - (Number(v) / yMax) * graphH
    const indexToX = (i) => (nPts <= 1 ? pad.left : pad.left + (i / (nPts - 1)) * graphW)

    const pts = (key) =>
      chartData.map((d, i) => ({ x: indexToX(i), y: valueToY(d[key]) }))

    const paths = {
      revenue: buildSmoothPath(pts('revenue')),
      orders: buildSmoothPath(pts('orders')),
      aov: buildSmoothPath(pts('aov')),
    }

    const yStep = yMax / 4
    const yTicks = [0, yStep, yStep * 2, yStep * 3, yMax].map((v) => Math.round(v))
    const xLabelIndices =
      nPts <= 2
        ? [...Array(nPts).keys()]
        : [0, Math.round((nPts - 1) / 4), Math.round((nPts - 1) / 2), Math.round((3 * (nPts - 1)) / 4), nPts - 1]
            .filter((v, i, a) => a.indexOf(v) === i)

    return {
      chartData,
      paths,
      pad,
      valueToY,
      indexToX,
      n: nPts,
      yTicks,
      xLabelIndices,
    }
  }, [
    kpiData?.multiline_labels,
    kpiData?.multiline_revenue,
    kpiData?.multiline_orders,
    kpiData?.multiline_aov,
    kpiData?.date_data,
    kpiData?.revenue_data,
    revenueRatio,
    ordersRatio,
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
            <span className="dashboard-multiline-legend-dot" style={{ background: COLORS.orders }} />
            Orders
          </span>
          <span className="dashboard-multiline-legend-item">
            <span className="dashboard-multiline-legend-dot" style={{ background: COLORS.aov }} />
            AOV
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
            <path d={paths.orders} fill="none" stroke={COLORS.orders} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={paths.aov} fill="none" stroke={COLORS.aov} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* X labels */}
            {xLabelIndices.map((i) => (
              <text
                key={i}
                x={indexToX(i)}
                y={size.height - 6}
                textAnchor="middle"
                className="dashboard-multiline-xlabel"
              >
                {chartData[i]?.label ?? ''}
              </text>
            ))}
            {/* Hover vertical line */}
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
          style={{ left: `${(indexToX(hoverIndex) / size.width) * 100}%` }}
        >
          <div className="dashboard-multiline-tooltip-date">{point.label}</div>
          <div className="dashboard-multiline-tooltip-row" style={{ color: COLORS.revenue }}>
            Revenue: {formatCurrency(point.revenue)}
          </div>
          <div className="dashboard-multiline-tooltip-row" style={{ color: COLORS.orders }}>
            Orders: {Number(point.orders).toLocaleString()}
          </div>
          <div className="dashboard-multiline-tooltip-row" style={{ color: COLORS.aov }}>
            AOV: {formatCurrency(point.aov)}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardMultilineChart
