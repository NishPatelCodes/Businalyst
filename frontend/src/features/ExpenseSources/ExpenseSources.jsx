import React from 'react'
import './ExpenseSources.css'

const ExpenseSources = () => {
  // Premium jewel-tone gradient - sophisticated blues & teals contrasting with black/white
  const premiumColors = [
    '#1d3557',  // Deep Navy - rich, authoritative
    '#457b9d',  // Steel Blue - elegant mid-tone
    '#2a9d8f',  // Teal - vibrant yet refined
    '#48cae4',  // Bright Cyan - fresh accent
    '#90e0ef',  // Sky Blue - light & airy
    '#caf0f8'   // Soft Blue - delicate finish
  ]
  
  const expenseData = [
    { name: 'Online purchase', percentage: 42, color: premiumColors[0] },
    { name: 'In-store shopping', percentage: 21, color: premiumColors[1] },
    { name: 'Subscription', percentage: 15, color: premiumColors[2] },
    { name: 'Transportation', percentage: 12, color: premiumColors[3] },
    { name: 'Food & Dining', percentage: 7, color: premiumColors[4] },
    { name: 'Other', percentage: 3, color: premiumColors[5] }
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
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="2.5"
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
