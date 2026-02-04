import React from 'react'
import './OrdersList.css'

const OrdersList = () => {
  // Sample data for January and February
  const ordersData = [
    {
      month: 'January',
      segments: [
        { label: '10%', value: 3.2, color: '#8E44AD' },
        { label: '20%', value: 6.4, color: '#9B59B6' },
        { label: '40%', value: 12.8, color: '#A569BD' },
        { label: '60%', value: 6.4, color: '#BB8FCE' },
        { label: '80%', value: 3.2, color: '#D2B4DE' }
      ],
      total: 32
    },
    {
      month: 'February',
      segments: [
        { label: '10%', value: 3.0, color: '#8E44AD' },
        { label: '20%', value: 6.0, color: '#9B59B6' },
        { label: '40%', value: 12.0, color: '#A569BD' },
        { label: '60%', value: 6.0, color: '#BB8FCE' },
        { label: '80%', value: 3.0, color: '#D2B4DE' }
      ],
      total: 30
    }
  ]

  const maxValue = Math.max(...ordersData.map(d => d.total))
  const yAxisLabels = [0, 5, 15, 25, 30]

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2 className="orders-title">Orders List</h2>
        <div className="orders-actions">
          <button className="orders-action-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="orders-action-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="orders-chart-container">
        <svg className="orders-chart" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">
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
                  stroke="#E8E8ED"
                  strokeWidth="0.5"
                  opacity="0.4"
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
                      rx="2"
                      className="bar-segment"
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

        {/* Legend */}
        <div className="orders-legend">
          {ordersData[0].segments.map((segment, index) => (
            <div key={index} className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: segment.color }}></div>
              <span className="legend-label">{segment.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrdersList

