import React, { useMemo, useContext, useRef, useEffect, useState } from 'react'
import { KpiContext } from '../../context/KpiContext'
import { aggregateSeriesByTimeframe, getXAxisConfig } from '../../utils/chartAggregation'
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

const DashboardMultilineChart = ({ revenueRatio = 1, ordersRatio = 1, timeframe = '30D' }) => {
  const { kpiData, formatCurrency } = useContext(KpiContext)
  const xAxisConfig = useMemo(() => getXAxisConfig(timeframe), [timeframe])
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hoverIndex, setHoverIndex] = useState(null)
  const [hoverY, setHoverY] = useState(0)

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

  // Aggregate the raw data based on timeframe
  const aggregatedData = useMemo(() => {
    const dates = kpiData?.date_data || []
    const revenue = kpiData?.revenue_data || []
    const orders = kpiData?.multiline_orders || []
    const aov = kpiData?.multiline_aov || []

    // Build series objects for aggregation
    const len = Math.min(dates.length, revenue.length)
    if (len === 0) {
      return {
        dates: [],
        revenue: [],
        orders: [],
        aov: [],
      }
    }

    // Create series for each metric
    const revenueSeries = Array.from({ length: len }, (_, i) => ({
      date: dates[i],
      value: Number(revenue[i]) || 0,
    }))
    const ordersSeries = Array.from({ length: len }, (_, i) => ({
      date: dates[i],
      value: Number(orders[i]) || 0,
    }))
    const aovSeries = Array.from({ length: len }, (_, i) => ({
      date: dates[i],
      value: Number(aov[i]) || 0,
    }))

    // Aggregate each series
    const aggRevenue = aggregateSeriesByTimeframe(revenueSeries, timeframe)
    const aggOrders = aggregateSeriesByTimeframe(ordersSeries, timeframe)
    const aggAov = aggregateSeriesByTimeframe(aovSeries, timeframe)

    // Extract back into arrays
    return {
      dates: aggRevenue.map(pt => pt.date),
      revenue: aggRevenue.map(pt => pt.value),
      orders: aggOrders.map(pt => pt.value),
      aov: aggAov.map(pt => pt.value),
    }
  }, [kpiData?.date_data, kpiData?.revenue_data, kpiData?.multiline_orders, kpiData?.multiline_aov, timeframe])

  // BUG 4 fix: Revenue ($1M+), Orders (~1000s), and AOV (~$280) have vastly
  // different scales. A single y-axis made Revenue dominate and AOV/Orders
  // invisible. Fix: normalize each series to 0–1 range for plotting, but
  // show actual values in tooltips. This keeps all three lines visible.
  const { chartData, paths, pad, indexToX, n, xLabelIndices, seriesMax } = useMemo(() => {
    const labels = aggregatedData?.dates?.map(d => xAxisConfig.formatLabel(d)) || []
    const revenue = aggregatedData?.revenue || []
    const orders = aggregatedData?.orders || []
    const aov = aggregatedData?.aov || []

    const len = Math.min(labels.length, revenue.length) || 1
    const safelen = Math.min(len, labels.length, revenue.length) || 1

    const chartData = Array.from({ length: safelen }, (_, i) => ({
      label: labels[i] ?? '',
      revenue: (Number(revenue[i]) || 0) * revenueRatio,
      orders: (Number(orders[i]) || 0) * ordersRatio,
      aov: Number(aov[i]) || 0,
    }))

    const maxRevenue = Math.max(1, ...chartData.map(d => d.revenue))
    const maxOrders = Math.max(1, ...chartData.map(d => d.orders))
    const maxAov = Math.max(1, ...chartData.map(d => d.aov))
    const seriesMax = { revenue: maxRevenue, orders: maxOrders, aov: maxAov }

    const width = size.width
    const height = size.height
    if (width <= 0 || height <= 0) {
      return {
        chartData: [],
        paths: { revenue: '', orders: '', aov: '' },
        pad: { top: 12, right: 12, bottom: 28, left: 12 },
        indexToX: () => 0,
        n: 0,
        xLabelIndices: [0],
        seriesMax,
      }
    }

    const pad = { top: 12, right: 12, bottom: 28, left: 12 }
    const graphW = width - pad.left - pad.right
    const graphH = height - pad.top - pad.bottom

    const nPts = chartData.length
    const normalizedY = (v, max) => pad.top + graphH - (Number(v) / max) * graphH
    const indexToX = (i) => (nPts <= 1 ? pad.left : pad.left + (i / (nPts - 1)) * graphW)

    const pts = (key, max) =>
      chartData.map((d, i) => ({ x: indexToX(i), y: normalizedY(d[key], max) }))

    const paths = {
      revenue: buildSmoothPath(pts('revenue', maxRevenue)),
      orders: buildSmoothPath(pts('orders', maxOrders)),
      aov: buildSmoothPath(pts('aov', maxAov)),
    }

    const interval = xAxisConfig.getInterval(nPts)
    const intervalStride = Math.max(1, interval + 1)
    const pixelsPerStep = graphW / Math.max(1, nPts - 1)
    const minLabelGapPx = 72
    const widthStride = Math.max(1, Math.ceil(minLabelGapPx / Math.max(1, pixelsPerStep)))
    const stride = Math.max(intervalStride, widthStride)
    const xLabelIndices = []
    for (let i = 0; i < nPts; i += stride) xLabelIndices.push(i)
    if (nPts > 1 && xLabelIndices[xLabelIndices.length - 1] !== nPts - 1) {
      const gapToEnd = (nPts - 1) - xLabelIndices[xLabelIndices.length - 1]
      if (gapToEnd < Math.ceil(stride * 0.6)) {
        xLabelIndices[xLabelIndices.length - 1] = nPts - 1
      } else {
        xLabelIndices.push(nPts - 1)
      }
    }

    return {
      chartData,
      paths,
      pad,
      indexToX,
      n: nPts,
      xLabelIndices,
      seriesMax,
    }
  }, [
    aggregatedData,
    xAxisConfig,
    revenueRatio,
    ordersRatio,
    size.width,
    size.height,
  ])

  const handleMouseMove = (e) => {
    if (!containerRef.current || n === 0) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * size.width
    const y = e.clientY - rect.top   // container-relative Y in CSS pixels
    let idx = 0
    let best = Infinity
    for (let i = 0; i < n; i++) {
      const d = Math.abs(x - indexToX(i))
      if (d < best) { best = d; idx = i }
    }
    setHoverIndex(idx)
    setHoverY(y)
  }

  const handleMouseLeave = () => { setHoverIndex(null); setHoverY(0) }

  const hasSize = size.width > 0 && size.height > 0
  const point = hoverIndex != null && chartData[hoverIndex] ? chartData[hoverIndex] : null

  // Re-derive Y coordinate for each series at the hover point (needed for SVG dots)
  const graphH = size.height - pad.top - pad.bottom
  const calcDotY = (v, max) =>
    pad.top + graphH - (Number(v) / Math.max(max, 1)) * graphH

  // Tooltip horizontal position: clamp so it never overflows the container edges
  const tooltipPct = hasSize && hoverIndex != null
    ? Math.min(Math.max((indexToX(hoverIndex) / size.width) * 100, 12), 88)
    : 50

  // Tooltip vertical position: follow cursor, flip above/below the midpoint so
  // the tooltip never covers the chart lines the user is actively looking at.
  const containerH = size.height   // SVG render height (= container height)
  const tooltipAbove = hoverY > containerH * 0.55   // in bottom 45% → show above cursor
  const tooltipTopPx  = tooltipAbove ? undefined : hoverY + 14
  const tooltipBotPx  = tooltipAbove ? containerH - hoverY + 10 : undefined

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
            {/* Horizontal grid */}
            {[0.25, 0.5, 0.75].map((frac) => {
              const y = pad.top + graphH * (1 - frac)
              return (
                <line key={frac} x1={pad.left} y1={y} x2={size.width - pad.right} y2={y}
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
              )
            })}

            {/* Lines */}
            <path d={paths.revenue} fill="none" stroke={COLORS.revenue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={paths.orders}  fill="none" stroke={COLORS.orders}  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={paths.aov}     fill="none" stroke={COLORS.aov}     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

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

            {/* Hover hairline */}
            {hoverIndex != null && point && (
              <line
                x1={indexToX(hoverIndex)}
                y1={pad.top}
                x2={indexToX(hoverIndex)}
                y2={size.height - pad.bottom}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
            )}

            {/* Hover dots — one per series at the hovered data point */}
            {hoverIndex != null && point && (() => {
              const cx = indexToX(hoverIndex)
              return (
                <>
                  {/* Revenue dot */}
                  <circle cx={cx} cy={calcDotY(point.revenue, seriesMax.revenue)} r="5"
                    fill="#fff" stroke={COLORS.revenue} strokeWidth="2.5" />
                  {/* Orders dot */}
                  {point.orders > 0 && (
                    <circle cx={cx} cy={calcDotY(point.orders, seriesMax.orders)} r="5"
                      fill="#fff" stroke={COLORS.orders} strokeWidth="2.5" />
                  )}
                  {/* AOV dot */}
                  {point.aov > 0 && (
                    <circle cx={cx} cy={calcDotY(point.aov, seriesMax.aov)} r="5"
                      fill="#fff" stroke={COLORS.aov} strokeWidth="2.5" />
                  )}
                </>
              )
            })()}
          </svg>
        )}

        {/* Floating tooltip — follows cursor, flips above/below so it never
            covers the area the user is actively looking at */}
        {point && hoverIndex != null && hasSize && (
          <div
            className="dashboard-multiline-tooltip"
            style={{
              left: `${tooltipPct}%`,
              top: tooltipTopPx != null ? tooltipTopPx : undefined,
              bottom: tooltipBotPx != null ? tooltipBotPx : undefined,
            }}
          >
            <div className="dashboard-multiline-tooltip-date">{point.label}</div>
            <div className="dashboard-multiline-tooltip-row">
              <span className="dml-tip-swatch" style={{ background: COLORS.revenue }} />
              Revenue: <strong>{formatCurrency(point.revenue)}</strong>
            </div>
            <div className="dashboard-multiline-tooltip-row">
              <span className="dml-tip-swatch" style={{ background: COLORS.orders }} />
              Orders: <strong>{Number(point.orders).toLocaleString()}</strong>
            </div>
            <div className="dashboard-multiline-tooltip-row">
              <span className="dml-tip-swatch" style={{ background: COLORS.aov }} />
              AOV: <strong>{formatCurrency(point.aov)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardMultilineChart
