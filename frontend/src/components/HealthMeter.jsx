import React from 'react'
import './HealthMeter.css'

const HealthMeter = () => {
  const percentage = 68
  const target = 80
  const totalBars = 50
  const filledBars = Math.round((percentage / 100) * totalBars)

  return (
    <div className="health-meter">
      <h3 className="health-meter-title">Repeat Customer Rate</h3>
      
      <div className="health-meter-gauge">
        <div className="gauge-bars-wrapper">
          {Array.from({ length: totalBars }).map((_, index) => {
            const isFilled = index < filledBars
            // Create semi-circle from 180° (left) to 0° (right)
            const angle = 180 - (index / (totalBars - 1)) * 180
            const radian = (angle * Math.PI) / 180
            const radius = 75
            const centerX = 50 // percentage
            const centerY = 100 // percentage
            const x = centerX + (radius * Math.cos(radian)) / 2
            const y = centerY + (radius * Math.sin(radian)) / 2
            
            // Calculate color gradient from light green to vibrant green
            let color
            if (isFilled) {
              const progress = (index / totalBars) * 100
              if (progress < 30) {
                color = '#86efac' // Light green
              } else if (progress < 60) {
                color = '#4ade80' // Medium green
              } else {
                color = '#22c55e' // Vibrant green
              }
            } else {
              color = '#e5e7eb' // Light gray
            }
            
            // Bar height varies for visual effect
            const barHeight = 8 + Math.sin((index / totalBars) * Math.PI) * 6
            
            return (
              <div
                key={index}
                className="gauge-bar-item"
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  width: '3px',
                  height: `${barHeight}px`,
                  backgroundColor: color,
                  borderRadius: '2px',
                  transform: `translate(-50%, -100%) rotate(${angle - 90}deg)`,
                  transformOrigin: 'center bottom',
                  transition: 'background-color 0.3s ease'
                }}
              />
            )
          })}
        </div>
        
        <div className="gauge-center">
          <div className="gauge-value">{percentage}%</div>
          <div className="gauge-status">On track for {target}% target</div>
        </div>
      </div>
      
      <button className="health-meter-button">Show details</button>
    </div>
  )
}

export default HealthMeter

