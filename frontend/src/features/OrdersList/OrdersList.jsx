import React from 'react'
import './OrdersList.css'

const OrdersList = () => {
  // Premium jewel-tone gradient matching pie chart - sophisticated blues & teals
  const segmentColors = [
    '#1d3557',  // Deep Navy
    '#457b9d',  // Steel Blue
    '#2a9d8f',  // Teal
    '#48cae4',  // Bright Cyan
    '#90e0ef'   // Sky Blue
  ]

  const ordersData = [
    {
      month: 'January',
      segments: [
        { label: '10%', value: 3.2, color: segmentColors[0] },
        { label: '20%', value: 6.4, color: segmentColors[1] },
        { label: '40%', value: 12.8, color: segmentColors[2] },
        { label: '60%', value: 6.4, color: segmentColors[3] },
        { label: '80%', value: 3.2, color: segmentColors[4] }
      ],
      total: 32
    },
    {
      month: 'February',
      segments: [
        { label: '10%', value: 3.0, color: segmentColors[0] },
        { label: '20%', value: 6.0, color: segmentColors[1] },
        { label: '40%', value: 12.0, color: segmentColors[2] },
        { label: '60%', value: 6.0, color: segmentColors[3] },
        { label: '80%', value: 3.0, color: segmentColors[4] }
      ],
      total: 30
    }
  ]

  const maxValue = Math.max(...ordersData.map(d => d.total))
  const yAxisLabels = [0, 5, 15, 25, 30]

  const totalOrders = ordersData.reduce((sum, d) => sum + d.total, 0)
  const monthlyGrowth = 6.7
  const targetProgress = 78

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2 className="orders-title">Orders List</h2>
      </div>

      <div className="orders-chart-container">
        <svg className="orders-chart" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.08)" />
            </filter>
          </defs>
          {/* Grid lines - horizontal grey lines with low opacity */}
          <g className="grid-lines">
            {yAxisLabels.map((value, index) => {
              const y = 200 - (value / maxValue) * 180
              return (
                <line
                  key={index}
                  x1="40"
                  y1={y}
                  x2="360"
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
              const y = 200 - (value / maxValue) * 180
              return (
                <text
                  key={index}
                  x="35"
                  y={y + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {value}
                </text>
              )
            })}
          </g>

          {/* Bars */}
          {ordersData.map((monthData, monthIndex) => {
            const barWidth = 100
            const barX = 100 + monthIndex * 150
            let currentY = 200
            const scale = 180 / maxValue

            return (
              <g key={monthIndex}>
                {/* Stacked segments */}
                {monthData.segments.map((segment, segIndex) => {
                  const segmentHeight = segment.value * scale
                  const y = currentY - segmentHeight
                  currentY = y

                  return (
                    <rect
                      key={segIndex}
                      x={barX}
                      y={y}
                      width={barWidth}
                      height={segmentHeight}
                      fill={segment.color}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1"
                      rx="2"
                      className="bar-segment"
                      filter="url(#barShadow)"
                    />
                  )
                })}
              </g>
            )
          })}

          {/* X-axis labels */}
          <g className="x-axis-labels">
            {ordersData.map((monthData, index) => {
              const barX = 100 + index * 150
              return (
                <text
                  key={index}
                  x={barX + 50}
                  y="230"
                  textAnchor="middle"
                  className="axis-label"
                >
                  {monthData.month}
                </text>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="orders-mini-stats">
        <div className="orders-mini-stat">
          <span className="orders-mini-stat-label">Total</span>
          <span className="orders-mini-stat-value">{totalOrders}</span>
        </div>
        <div className="orders-mini-stat">
          <span className="orders-mini-stat-label">MoM growth</span>
          <span className="orders-mini-stat-value positive">+{monthlyGrowth}%</span>
        </div>
        <div className="orders-mini-stat">
          <span className="orders-mini-stat-label">Target progress</span>
          <span className="orders-mini-stat-value">{targetProgress}%</span>
          <div className="orders-progress-bar">
            <div className="orders-progress-fill" style={{ width: `${targetProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersList



