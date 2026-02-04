import React, { useState, useRef } from 'react'
import './LeadsChart.css'

const LeadsChart = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const chartRef = useRef(null)

  // Sample data matching the image
  const revenueData = [
    { date: 'Jul', revenue: 550000, adSpend: 19570 },
    { date: 'Aug', revenue: 320000, adSpend: 19570 },
    { date: 'Sep', revenue: 480000, adSpend: 19570 },
    { date: 'Oct', revenue: 560000, adSpend: 19570 },
    { date: 'Nov', revenue: 520000, adSpend: 19570 },
    { date: 'Dec', revenue: 452264, adSpend: 19570 }
  ]

  // Chart dimensions - compact
  const chartWidth = 1200
  const chartHeight = 250
  const padding = { top: 15, right: 30, bottom: 25, left: 60 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  // Y-axis labels
  const yAxisLabels = [100000, 200000, 300000, 400000, 500000, 600000]
  const yAxisMin = 0
  const yAxisMax = 600000

  // Convert value to Y coordinate
  const valueToY = (value) => {
    return padding.top + graphHeight - ((value - yAxisMin) / (yAxisMax - yAxisMin)) * graphHeight
  }

  // Convert index to X coordinate
  const indexToX = (index) => {
    return padding.left + (index / (revenueData.length - 1)) * graphWidth
  }

  // Generate path for revenue line
  const generateRevenuePath = () => {
    let path = ''
    revenueData.forEach((point, index) => {
      const x = indexToX(index)
      const y = valueToY(point.revenue)
      if (index === 0) {
        path += `M ${x} ${y} `
      } else {
        path += `L ${x} ${y} `
      }
    })
    return path
  }

  // Generate path for ad spend line
  const generateAdSpendPath = () => {
    let path = ''
    revenueData.forEach((point, index) => {
      const x = indexToX(index)
      const y = valueToY(point.adSpend)
      if (index === 0) {
        path += `M ${x} ${y} `
      } else {
        path += `L ${x} ${y} `
      }
    })
    return path
  }

  // Generate path for revenue area
  const generateRevenueAreaPath = () => {
    const linePath = generateRevenuePath()
    const firstX = indexToX(0)
    const lastX = indexToX(revenueData.length - 1)
    const bottomY = padding.top + graphHeight
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`
    }
    return `$${value.toFixed(0)}`
  }

  // Handle mouse move on chart
  const handleMouseMove = (e) => {
    if (!chartRef.current) return
    
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left

    // Find closest data point
    let closestIndex = 0
    let minDistance = Infinity

    revenueData.forEach((point, index) => {
      const pointX = indexToX(index)
      const distance = Math.abs(x - pointX)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    setHoveredPoint(closestIndex)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  return (
    <div className="leads-chart">
      <div className="leads-chart-header">
        <h2 className="leads-chart-title">Leads won vs leads lost</h2>
      </div>

      <div className="leads-chart-container">
        <svg
          ref={chartRef}
          className="leads-chart-svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g className="grid-lines">
            {yAxisLabels.map((value, index) => {
              const y = valueToY(value)
              return (
                <line
                  key={index}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              )
            })}
          </g>

          {/* Y-axis labels */}
          <g className="y-axis-labels">
            {yAxisLabels.map((value, index) => {
              const y = valueToY(value)
              return (
                <text
                  key={index}
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {formatCurrency(value)}
                </text>
              )
            })}
          </g>

          {/* Revenue area fill */}
          <path
            d={generateRevenueAreaPath()}
            className="chart-area revenue"
            fill="url(#revenueGradient)"
          />

          {/* Revenue line */}
          <path
            d={generateRevenuePath()}
            className="chart-line revenue"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ad Spend line (dashed) */}
          <path
            d={generateAdSpendPath()}
            className="chart-line ad-spend"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
          />

          {/* Data points */}
          {revenueData.map((point, index) => {
            const revenueX = indexToX(index)
            const revenueY = valueToY(point.revenue)
            const adSpendY = valueToY(point.adSpend)
            const isHovered = hoveredPoint === index

            return (
              <g key={index}>
                {/* Invisible hit area */}
                <circle
                  cx={revenueX}
                  cy={revenueY}
                  r="12"
                  fill="transparent"
                  className="data-point-hit"
                />
                {/* Revenue point - always visible, larger when hovered */}
                <circle
                  cx={revenueX}
                  cy={revenueY}
                  r={isHovered ? "6" : "4"}
                  className="data-point revenue"
                  opacity={isHovered ? "1" : "0.8"}
                />
                {/* Ad Spend point - always visible, larger when hovered */}
                <circle
                  cx={revenueX}
                  cy={adSpendY}
                  r={isHovered ? "6" : "4"}
                  className="data-point ad-spend"
                  opacity={isHovered ? "1" : "0.8"}
                />
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 100}px`,
            }}
          >
            <div className="tooltip-date">
              {revenueData[hoveredPoint].date} 30
            </div>
            <div className="tooltip-metrics">
              <div className="tooltip-metric">
                <div className="tooltip-indicator revenue"></div>
                <div className="tooltip-content">
                  <span className="tooltip-label">Revenue:</span>
                  <span className="tooltip-value">
                    {formatCurrency(revenueData[hoveredPoint].revenue)}
                  </span>
                </div>
              </div>
              <div className="tooltip-metric">
                <div className="tooltip-indicator ad-spend"></div>
                <div className="tooltip-content">
                  <span className="tooltip-label">Ad Spend:</span>
                  <span className="tooltip-value">
                    {formatCurrency(revenueData[hoveredPoint].adSpend)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeadsChart
