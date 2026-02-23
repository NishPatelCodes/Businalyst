import React, { useContext, useMemo, useState, useCallback } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './RevenueByCategoryBubble.css'

/* Same as DonutChart: blue, green, orange */
const BUBBLE_COLORS = ['#007AFF', '#22C55E', '#F97316']
const MAX_BUBBLES = 3

/** Normalize to top 3 categories by value; compute revenue percentage */
function getCategoryData(pieData, revenueSum) {
  if (!Array.isArray(pieData) || pieData.length === 0) {
    return [
      { name: 'Electronics', value: 60, pct: 60 },
      { name: 'Office Supplies', value: 25, pct: 25 },
      { name: 'Accessories', value: 15, pct: 15 },
    ]
  }
  const total = pieData.reduce((s, d) => s + (Number(d.value) || 0), 0)
  const withPct = pieData
    .map((d) => ({
      name: String(d.name ?? '—'),
      value: Number(d.value) || 0,
      pct: total > 0 ? Math.round(((Number(d.value) || 0) / total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, MAX_BUBBLES)
  return withPct
}

/** Position 3 bubbles in a triangular layout with clear separation (like reference) */
function getBubbleLayout(items) {
  const totalPct = items.reduce((s, i) => s + i.pct, 0) || 100
  const normalized = items.map((i) => ({ ...i, pct: (i.pct / totalPct) * 100 }))

  const minR = 28
  const maxR = 46
  const r = (pct) => minR + (pct / 100) * (maxR - minR)

  /* Triangular formation: largest bottom-left, medium top-right, smallest bottom-right */
  const positions = [
    { cx: 34, cy: 52 },
    { cx: 70, cy: 28 },
    { cx: 70, cy: 60 },
  ]

  return normalized.map((item, i) => ({
    ...item,
    radius: r(item.pct),
    cx: positions[i].cx,
    cy: positions[i].cy,
    color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
  }))
}

const RevenueByCategoryBubble = () => {
  const { kpiData } = useContext(KpiContext)
  const [hovered, setHovered] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const categories = useMemo(() => {
    const raw = getCategoryData(kpiData?.pie_data, kpiData?.revenue_sum)
    return getBubbleLayout(raw)
  }, [kpiData?.pie_data, kpiData?.revenue_sum])

  const showTooltip = useCallback((i, e) => {
    setHovered(i)
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])

  const hideTooltip = useCallback(() => setHovered(null), [])

  return (
    <div className="rbc-card">
      <div className="rbc-header">
        <h3 className="rbc-title">Revenue by Category</h3>
        <button type="button" className="rbc-menu-btn" aria-label="Options">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="4" r="1.25" fill="currentColor" />
            <circle cx="8" cy="8" r="1.25" fill="currentColor" />
            <circle cx="8" cy="12" r="1.25" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="rbc-chart">
        <svg className="rbc-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {categories.map((b, i) => (
            <g
              key={i}
              onMouseEnter={(e) => showTooltip(i, e)}
              onMouseMove={(e) => {
                if (hovered === i) {
                  const rect = e.currentTarget.closest('.rbc-chart')?.getBoundingClientRect()
                  if (rect) setTooltipPos({ x: e.clientX, y: e.clientY })
                }
              }}
              onMouseLeave={hideTooltip}
              style={{ cursor: 'pointer' }}
            >
              <circle
                className="rbc-bubble"
                cx={b.cx}
                cy={b.cy}
                r={b.radius}
                fill={b.color}
              />
              <text
                className="rbc-bubble-label"
                x={b.cx}
                y={b.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {b.name}
              </text>
            </g>
          ))}
        </svg>
        {hovered !== null && (
          <div
            className="rbc-tooltip"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
            role="tooltip"
          >
            <div className="rbc-tooltip-name">{categories[hovered].name}</div>
            <div className="rbc-tooltip-value">{categories[hovered].value.toLocaleString()}</div>
            <div className="rbc-tooltip-pct">{Math.round(categories[hovered].pct)}%</div>
          </div>
        )}
      </div>

      <div className="rbc-legend">
        {categories.map((b, i) => (
          <div key={i} className="rbc-legend-item">
            <span className="rbc-legend-icon" style={{ background: b.color }} />
            <span className="rbc-legend-value">{b.value.toLocaleString()}</span>
            <span className="rbc-legend-name">{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RevenueByCategoryBubble
