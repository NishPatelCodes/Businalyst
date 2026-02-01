import React from 'react'
import './HealthMeter.css'

const HealthMeter = ({ 
  value = 68, 
  target = 80 
}) => {
  // Total segments for the gauge (40-50 range)
  const totalSegments = 45
  // Calculate filled segments based on value percentage
  const filledSegments = Math.round((value / 100) * totalSegments)
  
  // SVG dimensions
  const svgWidth = 300
  const svgHeight = 180
  const centerX = 150
  const centerY = 150
  const radius = 120
  
  // Segment dimensions: width 6-8px, height 16-20px
  const segmentWidth = 7
  const segmentHeight = 18
  
  // Arc parameters: -90° to +90° (exactly 180 degrees)
  const startAngle = -90
  const endAngle = 90
  const angleStep = (endAngle - startAngle) / (totalSegments - 1)
  
  // Calculate color for gradient (lighter on left → darker on right)
  const getSegmentColor = (index, isFilled) => {
    if (!isFilled) return '#e5e7eb' // Light gray for unfilled
    
    const progress = index / (totalSegments - 1)
    // Green gradient: light green (left) → medium green (middle) → vibrant green (right)
    if (progress < 0.33) return '#86efac' // Light green
    if (progress < 0.66) return '#4ade80' // Medium green
    return '#22c55e' // Vibrant green
  }
  
  // Calculate transform for each segment using polar coordinates
  const getSegmentTransform = (index) => {
    // Calculate angle: angle = startAngle + index * angleStep
    // Progresses from -90° (left) to +90° (right)
    const angle = startAngle + index * angleStep
    
    // Transform order: rotate(angle centerX centerY) translate(-rectWidth/2, -rectHeight)
    // This rotates around center, then translates to position rect extending inward
    return `rotate(${angle} ${centerX} ${centerY}) translate(${-segmentWidth / 2}, ${-segmentHeight})`
  }

  return (
    <div className="health-meter">
      <h3 className="health-meter-title">Repeat Customer Rate</h3>
      
      {/* SVG Gauge */}
      <div className="health-meter-gauge">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 300 180"
          preserveAspectRatio="xMidYMax meet"
          overflow="visible"
          className="gauge-svg"
        >
          {/* Render each segment */}
          {Array.from({ length: totalSegments }).map((_, index) => {
            const isFilled = index < filledSegments
            const color = getSegmentColor(index, isFilled)
            const transform = getSegmentTransform(index)
            
            return (
              <rect
                key={index}
                x={centerX}
                y={centerY - radius}
                width={segmentWidth}
                height={segmentHeight}
                fill={color}
                transform={transform}
              />
            )
          })}
        </svg>
        
        {/* Center content: Percentage and status */}
        <div className="gauge-center-content">
          <div className="gauge-value">{value}%</div>
          <div className="gauge-status">On track for {target}% target</div>
        </div>
      </div>
    </div>
  )
}

export default HealthMeter

