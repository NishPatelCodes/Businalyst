import React from 'react'
import './ExpenseSources.css'

const ExpenseSources = () => {
  // Blue and cyan color palette - matching the image
  const colors = [
    '#0077b6',  // Medium blue (largest segment)
    '#90e0ef',  // Light cyan
    '#023e8a',  // Darker blue
    '#caf0f8',  // Very light cyan
    '#48cae4'   // Bright cyan
  ]
  
  const expenseData = [
    { name: 'Food & Groceries', percentage: 25, color: colors[0] },
    { name: 'Housing', percentage: 20, color: colors[1] },
    { name: 'Utilities', percentage: 22, color: colors[2] },
    { name: 'Transportation', percentage: 18, color: colors[3] },
    { name: 'Healthcare', percentage: 15, color: colors[4] }
  ]

  const totalAmount = 5301

  // Chart dimensions - smaller
  const radius = 70
  const innerRadius = 42
  const centerX = 130
  const centerY = 130
  
  // Uniform gap width in pixels - same visual width at outer and inner edges
  const gapWidth = 8
  const outerGapAngle = (gapWidth / radius) * (180 / Math.PI)
  const innerGapAngle = (gapWidth / innerRadius) * (180 / Math.PI)

  // Calculate total percentage and scale to fit with gaps
  const totalPercentage = expenseData.reduce((sum, item) => sum + item.percentage, 0)
  const numGaps = expenseData.length
  const totalGapAngle = outerGapAngle * numGaps
  const availableAngle = 360 - totalGapAngle
  const scaleFactor = availableAngle / (totalPercentage / 100 * 360)
  
  let currentAngle = -90 // Start at top

  // Generate segment path with uniform gaps
  const generateSegmentPath = (percentage, segmentStartAngle) => {
    // Calculate scaled angle for this segment
    const segmentAngle = (percentage / 100) * 360 * scaleFactor
    
    // Outer edge: start after gap, end before gap
    const outerStartAngle = segmentStartAngle + outerGapAngle / 2
    const outerEndAngle = segmentStartAngle + segmentAngle - outerGapAngle / 2
    
    // Inner edge: start after gap, end before gap (using inner gap angle for uniform width)
    const innerStartAngle = segmentStartAngle + innerGapAngle / 2
    const innerEndAngle = segmentStartAngle + segmentAngle - innerGapAngle / 2

    const outerStartRad = (outerStartAngle * Math.PI) / 180
    const outerEndRad = (outerEndAngle * Math.PI) / 180
    const innerStartRad = (innerStartAngle * Math.PI) / 180
    const innerEndRad = (innerEndAngle * Math.PI) / 180

    // Outer edge points
    const x1 = centerX + radius * Math.cos(outerStartRad)
    const y1 = centerY + radius * Math.sin(outerStartRad)
    const x2 = centerX + radius * Math.cos(outerEndRad)
    const y2 = centerY + radius * Math.sin(outerEndRad)

    // Inner edge points - different angles for uniform gap width
    const innerX1 = centerX + innerRadius * Math.cos(innerStartRad)
    const innerY1 = centerY + innerRadius * Math.sin(innerStartRad)
    const innerX2 = centerX + innerRadius * Math.cos(innerEndRad)
    const innerY2 = centerY + innerRadius * Math.sin(innerEndRad)

    const largeArcFlag = segmentAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} 
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${innerX2} ${innerY2}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
            Z`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }


  return (
    <div className="expense-sources">
      <div className="expense-header">
        <h2 className="expense-title">Expense Sources</h2>
      </div>
      <div className="expense-chart-container">
        <svg
          className="expense-donut-chart"
          viewBox="0 0 260 260"
          preserveAspectRatio="xMidYMid meet"
        >
          {expenseData.map((item, index) => {
            const segmentStartAngle = currentAngle
            const path = generateSegmentPath(item.percentage, segmentStartAngle)
            
            // Calculate segment angle and move to next position
            const segmentAngle = (item.percentage / 100) * 360 * scaleFactor
            currentAngle += segmentAngle + outerGapAngle

            return (
              <path
                key={index}
                d={path}
                fill={item.color}
                stroke={item.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="donut-segment"
              />
            )
          })}
        </svg>
      </div>
      
      {/* Legend below chart */}
      <div className="expense-legend-card">
        {expenseData.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
            <span className="legend-name">{item.name}</span>
          </div>
        ))}
      </div>
      
    </div>
  )
}

export default ExpenseSources
