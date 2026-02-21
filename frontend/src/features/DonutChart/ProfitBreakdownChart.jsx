import React, { useState, useCallback, useContext, useMemo } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './DonutChart.css'

// Colors for profit and expense
const PROFIT_COLOR = { base: '#10b981', light: '#34d399', id: 'profit-green' }
const EXPENSE_COLOR = { base: '#ef4444', light: '#f87171', id: 'expense-red' }

/** Relative luminance (0–1). Above ~0.6 use dark text for contrast. */
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

const ProfitBreakdownChart = () => {
  const { kpiData } = useContext(KpiContext)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, visible: false })

  // Calculate profit and expense data
  const chartData = useMemo(() => {
    const revenue = kpiData?.revenue_sum || 0
    const profit = kpiData?.profit_sum || 0
    const expense = revenue - profit
    
    if (revenue === 0) {
      return null
    }
    
    const profitPct = Math.round((profit / revenue) * 1000) / 10
    const expensePct = Math.round((expense / revenue) * 1000) / 10
    
    return [
      {
        name: 'Profit',
        value: profit,
        percentage: profitPct,
        amount: profit,
        color: PROFIT_COLOR,
      },
      {
        name: 'Expense',
        value: expense,
        percentage: expensePct,
        amount: expense,
        color: EXPENSE_COLOR,
      }
    ]
  }, [kpiData?.revenue_sum, kpiData?.profit_sum])

  const totalAmount = chartData ? chartData.reduce((s, d) => s + (d.amount ?? 0), 0) : 0

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }, [])

  // Donut geometry (viewBox 0 0 260 260)
  const centerX = 130
  const centerY = 130
  const radius = 96
  const innerRadius = 52
  const gapWidth = 1
  const outerGapAngle = (gapWidth / radius) * (180 / Math.PI)
  const innerGapAngle = (gapWidth / innerRadius) * (180 / Math.PI)

  if (!chartData || chartData.length === 0) {
    return (
      <div className="expense-sources" role="region" aria-label="Profit breakdown chart">
        <p className="expense-sources-empty">Upload a file to see profit breakdown.</p>
      </div>
    )
  }

  const totalPercentage = chartData.reduce((s, item) => s + item.percentage, 0)
  const numGaps = chartData.length
  const totalGapAngle = outerGapAngle * numGaps
  const availableAngle = 360 - totalGapAngle
  const scaleFactor = availableAngle / ((totalPercentage / 100) * 360)

  const generateSegmentPath = (percentage, segmentStartAngle) => {
    const segmentAngle = (percentage / 100) * 360 * scaleFactor
    const outerStartAngle = segmentStartAngle + outerGapAngle / 2
    const outerEndAngle = segmentStartAngle + segmentAngle - outerGapAngle / 2
    const innerStartAngle = segmentStartAngle + innerGapAngle / 2
    const innerEndAngle = segmentStartAngle + segmentAngle - innerGapAngle / 2

    const rad = (deg) => (deg * Math.PI) / 180
    const x1 = centerX + radius * Math.cos(rad(outerStartAngle))
    const y1 = centerY + radius * Math.sin(rad(outerStartAngle))
    const x2 = centerX + radius * Math.cos(rad(outerEndAngle))
    const y2 = centerY + radius * Math.sin(rad(outerEndAngle))
    const innerX1 = centerX + innerRadius * Math.cos(rad(innerStartAngle))
    const innerY1 = centerY + innerRadius * Math.sin(rad(innerStartAngle))
    const innerX2 = centerX + innerRadius * Math.cos(rad(innerEndAngle))
    const innerY2 = centerY + innerRadius * Math.sin(rad(innerEndAngle))
    const largeArc = segmentAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1} Z`
  }

  // Mid-angle (in degrees) for each segment for label placement
  let currentAngle = -90
  const segmentAngles = chartData.map((item) => {
    const segmentAngle = (item.percentage / 100) * 360 * scaleFactor
    const midAngle = currentAngle + outerGapAngle / 2 + segmentAngle / 2
    currentAngle += segmentAngle + outerGapAngle
    return midAngle
  })

  const labelRadius = (innerRadius + radius) / 2

  const handleSegmentMouseMove = useCallback((index, e) => {
    const rect = e.currentTarget.closest('svg').getBoundingClientRect()
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    })
    setHoveredIndex(index)
  }, [])

  const handleSegmentMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    setTooltip((t) => ({ ...t, visible: false }))
  }, [])

  return (
    <div className="expense-sources" role="region" aria-label="Profit breakdown chart">
      {/* Chart and Legend Container */}
      <div className="expense-content-wrapper">
        {/* Pie chart on the left */}
        <div className="expense-chart-container">
          <svg
            className="expense-donut-chart"
            viewBox="0 0 260 260"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              {/* Gradients for profit and expense */}
              <radialGradient id="grad-profit-green" cx="50%" cy="50%" r="100%" fx="35%" fy="35%">
                <stop offset="0%" stopColor={PROFIT_COLOR.light} stopOpacity="1" />
                <stop offset="70%" stopColor={PROFIT_COLOR.base} stopOpacity="1" />
                <stop offset="100%" stopColor={PROFIT_COLOR.base} stopOpacity="0.88" />
              </radialGradient>
              <radialGradient id="grad-expense-red" cx="50%" cy="50%" r="100%" fx="35%" fy="35%">
                <stop offset="0%" stopColor={EXPENSE_COLOR.light} stopOpacity="1" />
                <stop offset="70%" stopColor={EXPENSE_COLOR.base} stopOpacity="1" />
                <stop offset="100%" stopColor={EXPENSE_COLOR.base} stopOpacity="0.88" />
              </radialGradient>
              <filter id="expense-text-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
              </filter>
              <filter id="expense-slice-shadow-strong" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
              </filter>
              <filter id="expense-slice-label-dark" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#fff" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* Donut segments */}
            {(() => {
              let angle = -90
              return chartData.map((item, index) => {
                const path = generateSegmentPath(item.percentage, angle)
                const segmentAngle = (item.percentage / 100) * 360 * scaleFactor
                angle += segmentAngle + outerGapAngle

                return (
                  <g key={item.name}>
                    <path
                      d={path}
                      fill={`url(#grad-${item.color.id})`}
                      className={`donut-segment ${hoveredIndex === index ? 'donut-segment--hover' : ''} ${hoveredIndex !== null && hoveredIndex !== index ? 'donut-segment--dimmed' : ''}`}
                      transform={hoveredIndex === index ? `translate(${centerX}, ${centerY}) scale(1.04) translate(${-centerX}, ${-centerY})` : ''}
                      onMouseMove={(e) => handleSegmentMouseMove(index, e)}
                      onMouseLeave={handleSegmentMouseLeave}
                      aria-label={`${item.name}: ${formatCurrency(item.amount)} (${item.percentage}%)`}
                    />
                    {/* Percentage label */}
                    <text
                      x={centerX + labelRadius * Math.cos((segmentAngles[index] * Math.PI) / 180)}
                      y={centerY + labelRadius * Math.sin((segmentAngles[index] * Math.PI) / 180)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`donut-slice-label ${luminance(item.color.base) > 0.6 ? 'donut-slice-label--dark' : ''}`}
                      filter={luminance(item.color.base) > 0.6 ? 'url(#expense-slice-label-dark)' : 'url(#expense-text-shadow)'}
                    >
                      {item.percentage}%
                    </text>
                  </g>
                )
              })
            })()}

            {/* Center hole: subtle fill, optically centered total + subtitle */}
            <circle cx={centerX} cy={centerY} r={innerRadius - 2} fill="#fafafa" aria-hidden="true" />
            <g className="donut-center" aria-hidden="true">
              <text
                x={centerX}
                y={centerY - 5}
                textAnchor="middle"
                className="donut-center-total"
              >
                {formatCurrency(totalAmount)}
              </text>
              <text x={centerX} y={centerY + 15} textAnchor="middle" className="donut-center-subtitle">
                Total Revenue
              </text>
            </g>

            {/* Tooltip (offset above cursor for readability) */}
            {tooltip.visible && hoveredIndex !== null && (
              <g className="expense-tooltip" transform={`translate(${Math.min(Math.max(tooltip.x, 60), 200)}, ${tooltip.y - 36})`}>
                <rect
                  x="-52"
                  y="-28"
                  width="104"
                  height="44"
                  rx="10"
                  ry="10"
                  className="expense-tooltip-bg"
                />
                <text x="0" y="-10" textAnchor="middle" className="expense-tooltip-name">
                  {chartData[hoveredIndex].name}
                </text>
                <text x="0" y="8" textAnchor="middle" className="expense-tooltip-value">
                  {`${formatCurrency(chartData[hoveredIndex].amount)} · ${chartData[hoveredIndex].percentage}%`}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Legend card on the right */}
        <div className="expense-legend-card">
          <div className="expense-legend" role="list" aria-label="Profit breakdown categories">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className={`expense-legend-item ${hoveredIndex === index ? 'expense-legend-item--active' : ''} ${hoveredIndex !== null && hoveredIndex !== index ? 'expense-legend-item--dimmed' : ''}`}
                onMouseEnter={() => {
                  setHoveredIndex(index)
                  setTooltip({ x: 130, y: 90, visible: true })
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null)
                  setTooltip((t) => ({ ...t, visible: false }))
                }}
                role="listitem"
              >
                <span className="expense-legend-dot" style={{ backgroundColor: item.color.base }} />
                <span className="expense-legend-name">{item.name}</span>
                <span className="expense-legend-percentage">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfitBreakdownChart

