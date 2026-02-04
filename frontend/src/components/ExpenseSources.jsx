import React from 'react'
import './ExpenseSources.css'

const ExpenseSources = () => {
  // Data matching the image exactly
  const expenseData = [
    { name: 'Online purchase', percentage: 42, color: '#FF9500' },
    { name: 'In-store shopping', percentage: 21, color: '#e5e7eb' },
    { name: 'Subscription', percentage: 15, color: '#e5e7eb' },
    { name: 'Transportation', percentage: 12, color: '#e5e7eb' },
    { name: 'Food & Dining', percentage: 7, color: '#e5e7eb' },
    { name: 'Other', percentage: 3, color: '#e5e7eb' }
  ]

  const total = expenseData.length

  // Calculate angles for donut chart
  let currentAngle = -90 // Start at top
  const radius = 80
  const innerRadius = 50
  const centerX = 150
  const centerY = 150

  const generatePath = (percentage, startAngle) => {
    const endAngle = startAngle + (percentage / 100) * 360
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const innerX1 = centerX + innerRadius * Math.cos(startAngleRad)
    const innerY1 = centerY + innerRadius * Math.sin(startAngleRad)
    const innerX2 = centerX + innerRadius * Math.cos(endAngleRad)
    const innerY2 = centerY + innerRadius * Math.sin(endAngleRad)

    const largeArcFlag = percentage > 50 ? 1 : 0

    return `M ${x1} ${y1} 
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${innerX2} ${innerY2}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
            Z`
  }

  return (
    <div className="expense-sources">
      <div className="expense-sources-header">
        <h2 className="expense-sources-title">Expense Sources</h2>
        <button className="expense-menu-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div className="expense-chart-container">
        <svg
          className="expense-donut-chart"
          viewBox="0 0 300 300"
          preserveAspectRatio="xMidYMid meet"
        >
          {expenseData.map((item, index) => {
            const path = generatePath(item.percentage, currentAngle)
            currentAngle += (item.percentage / 100) * 360

            return (
              <path
                key={index}
                d={path}
                fill={item.color}
                className="donut-segment"
              />
            )
          })}
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            className="donut-total-label"
          >
            Total
          </text>
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            className="donut-total-value"
          >
            {total}
          </text>
        </svg>
      </div>

      
    </div>
  )
}

export default ExpenseSources
