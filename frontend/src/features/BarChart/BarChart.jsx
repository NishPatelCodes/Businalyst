import React from 'react'
import './BarChart.css'

const BarChart = () => {
  // Daily revenue data matching the image (in thousands)
  const revenueData = [
    { day: 'Mo', value: 2.1 },
    { day: 'Tu', value: 3.0 },
    { day: 'We', value: 1.8 },
    { day: 'Th', value: 1.1 },
    { day: 'Fr', value: 2.2 },
    { day: 'Sa', value: 3.4 },
    { day: 'Su', value: 1.7 }
  ]

  // Ensure all values are non-negative
  const minValue = 0 // Always start from 0
  const maxValue = Math.max(4, ...revenueData.map(d => Math.max(0, d.value))) // Ensure max is at least 4 and never negative
  const yAxisLabels = [0, 1, 2, 3, 4] // 0, 1k, 2k, 3k, 4k

  const chartWidth = 400
  const chartHeight = 250
  const padding = { top: 20, right: 40, bottom: 40, left: 40 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const barWidth = graphWidth / revenueData.length - 10
  const barSpacing = 10

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2 className="orders-title">Revenue Summary</h2>
      </div>

      <div className="orders-chart-container">
        <svg className="orders-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* X-axis baseline */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Grid lines - horizontal grey lines (only above baseline) */}
          <g className="grid-lines">
            {yAxisLabels.filter(value => value > 0).map((value, index) => {
              const y = padding.top + graphHeight - (value / maxValue) * graphHeight
              return (
                <line
                  key={index}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              )
            })}
          </g>

          {/* Y-axis labels */}
          <g className="y-axis-labels">
            {yAxisLabels.map((value, index) => {
              // Ensure 0 is always at the baseline (X-axis)
              const baselineY = padding.top + graphHeight
              const y = value === 0 ? baselineY : baselineY - (value / maxValue) * graphHeight
              return (
                <text
                  key={index}
                  x={padding.left - 5}
                  y={y + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {value === 0 ? '0' : `${value}k`}
                </text>
              )
            })}
          </g>

          {/* Bars */}
          {revenueData.map((dayData, index) => {
            // Ensure value is never negative and calculate height from 0
            const safeValue = Math.max(0, dayData.value)
            const barHeight = (safeValue / maxValue) * graphHeight
            const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
            // Baseline is the X-axis line - bars always start from here
            const baselineY = padding.top + graphHeight
            // Bar top position (bars grow upward from baseline)
            const barY = baselineY - barHeight
            const cornerRadius = 6 // Increased corner radius for top corners

            // Create path with rounded top corners only
            // Bottom of bar is always at baselineY (X-axis)
            const path = `
              M ${barX + cornerRadius},${barY}
              L ${barX + barWidth - cornerRadius},${barY}
              Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + cornerRadius}
              L ${barX + barWidth},${baselineY}
              L ${barX},${baselineY}
              L ${barX},${barY + cornerRadius}
              Q ${barX},${barY} ${barX + cornerRadius},${barY}
              Z
            `

            return (
              <path
                key={index}
                d={path}
                fill="url(#barGradient)"
                className="bar-segment"
              />
            )
          })}

          {/* X-axis labels */}
          <g className="x-axis-labels">
            {revenueData.map((dayData, index) => {
              const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
              return (
                <text
                  key={index}
                  x={barX + barWidth / 2}
                  y={padding.top + graphHeight + 20}
                  textAnchor="middle"
                  className="axis-label"
                >
                  {dayData.day}
                </text>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}

export default BarChart



