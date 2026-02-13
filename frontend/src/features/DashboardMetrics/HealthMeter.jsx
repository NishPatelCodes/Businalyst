import React from 'react'
import './HealthMeter.css'

const HealthMeter = ({ 
  value = 68, 
  target = 80 
}) => {
  // Total segments for the gauge (35-40 range for thicker appearance)
  const totalSegments = 36
  // Calculate filled segments based on value percentage
  const filledSegments = Math.round((value / 100) * totalSegments)
  
  // SVG dimensions - compact size, centered
  const svgWidth = 300
  const svgHeight = 170
  const centerX = svgWidth / 2  // 150 - perfectly centered
  const centerY = svgHeight - 20  // 150 - positioned for arc
  const radius = 120
  
  // Segment dimensions: width 8-10px, height 24-28px for thicker appearance
  const segmentWidth = 8
  const segmentHeight = 24
  
  // Arc parameters: -90° to +90° (exactly 180 degrees)
  const startAngle = -90
  const endAngle = 90
  const angleStep = (endAngle - startAngle) / (totalSegments - 1)
  
  // Calculate color for gradient (lighter on left → darker on right)
  const getSegmentColor = (index, isFilled) => {
    if (!isFilled) return '#e8e8e8' // Light gray for unfilled
    
    const progress = index / (totalSegments - 1)
    // Soft green gradient: very light green (left) → medium green (middle) → soft green (right)
    if (progress < 0.33) return '#a8e6cf' // Very light green
    if (progress < 0.66) return '#6dd5a8' // Medium green
    return '#34c759' // Apple green
  }
  
  // Calculate transform for each segment using polar coordinates
  const getSegmentTransform = (index) => {
    const angle = startAngle + index * angleStep
    return `rotate(${angle} ${centerX} ${centerY}) translate(${-segmentWidth / 2}, ${-segmentHeight})`
  }

  return (
    <div className="health-meter">
      <div className="health-meter-gauge">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 300 170"
          preserveAspectRatio="xMidYMid meet"
          className="gauge-svg"
          style={{ overflow: 'visible' }}
        >
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
        <div className="gauge-center-content">
          <div className="gauge-value">
            {value}<span className="gauge-percent-sign">%</span>
          </div>
          <div className="gauge-status">On track for {target}%</div>
        </div>
      </div>
    </div>
  )
}

export default HealthMeter
