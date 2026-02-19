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

  const maxValue = 4 // 4k max on y-axis
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
          {/* Grid lines - horizontal grey lines */}
          <g className="grid-lines">
            {yAxisLabels.map((value, index) => {
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
              const y = padding.top + graphHeight - (value / maxValue) * graphHeight
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
            const barHeight = (dayData.value / maxValue) * graphHeight
            const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
            const barY = padding.top + graphHeight - barHeight
            const cornerRadius = 6 // Increased corner radius for top corners

            // Create path with rounded top corners only
            const path = `
              M ${barX + cornerRadius},${barY}
              L ${barX + barWidth - cornerRadius},${barY}
              Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + cornerRadius}
              L ${barX + barWidth},${barY + barHeight}
              L ${barX},${barY + barHeight}
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



