import React from 'react'
import './SubscriptionAnalytics.css'

const SubscriptionAnalytics = () => {
  const metrics = [
    {
      label: 'Rating Point',
      value: 1228,
      total: 1928,
      color: '#ff3b30',      // Apple red - vibrant and premium
      lightColor: '#ffebeb'  // Soft red tint
    },
    {
      label: 'Low Stock',
      value: 600,
      total: 1928,
      color: '#007aff',      // Apple blue - professional and clean
      lightColor: '#e5f2ff'  // Soft blue tint
    }
  ]

  const renderSegmentedBar = (metric) => {
    const percentage = (metric.value / metric.total) * 100
    const numSegments = 45 // Optimal number for premium look
    const filledSegments = Math.round((percentage / 100) * numSegments)
    
    return (
      <div className="segmented-bar">
        {Array.from({ length: numSegments }).map((_, index) => {
          const isFilled = index < filledSegments
          return (
            <div
              key={index}
              className={`segment ${isFilled ? 'filled' : 'unfilled'}`}
              style={{
                backgroundColor: isFilled ? metric.color : metric.lightColor
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="subscription-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h2 className="analytics-title">Subscription Analytics</h2>
          <p className="analytics-subtitle">
            Track, analyze, and improve your subscription business.
          </p>
        </div>
        <button className="analytics-action-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="analytics-card">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-item">
            <div className="metric-label">{metric.label}</div>
            <div className="metric-content">
              <div className="metric-value">{metric.value.toLocaleString()}</div>
              {renderSegmentedBar(metric)}
              <div className="metric-total">/{metric.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubscriptionAnalytics


