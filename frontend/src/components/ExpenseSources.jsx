import React from 'react'
import './ExpenseSources.css'

const ExpenseSources = () => {
  // Black/gray/white palette - emphasized segment in black, rest in grays
  const grayPalette = ['#000000', '#e5e5e5', '#d8d8d8', '#d0d0d0', '#c0c0c0', '#b0b0b0']
  
  const expenseData = [
    { name: 'Online purchase', percentage: 42, color: grayPalette[0] },
    { name: 'In-store shopping', percentage: 21, color: grayPalette[1] },
    { name: 'Subscription', percentage: 15, color: grayPalette[2] },
    { name: 'Transportation', percentage: 12, color: grayPalette[3] },
    { name: 'Food & Dining', percentage: 7, color: grayPalette[4] },
    { name: 'Other', percentage: 3, color: grayPalette[5] }
  ]

  const total = expenseData.reduce((sum, item) => sum + item.percentage, 0)

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
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="1"
                className="donut-segment"
              />
            )
          })}
        </svg>
        
        {/* Apple-style glassmorphic legend card */}
        <div className="expense-legend-card">
          {expenseData.map((item, index) => (
            <div key={index} className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
              <span className="legend-name">{item.name}</span>
              <span className="legend-percent">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}

export default ExpenseSources
