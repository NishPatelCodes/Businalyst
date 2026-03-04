import React from 'react'
import { useNavigate } from 'react-router-dom'
import './SegmentedBarChart.css'

const SegmentedBarChart = () => {
  const navigate = useNavigate()

  const metrics = [
    {
      label: 'Prepaid',
      value: 1228,
      total: 1928,
      color: '#2563eb',
      lightColor: '#dbeafe'
    },
    {
      label: 'Cash On delivery',
      value: 600,
      total: 1928,
      color: '#60a5fa',
      lightColor: '#eff6ff'
    }
  ]

  const renderSegmentedBar = (metric) => {
    const percentage = (metric.value / metric.total) * 100
    const numSegments = 25 // Fixed to 25 bars
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
        <h2 className="analytics-title">Payment method</h2>
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

        <button
          className="payment-view-insights-btn"
          onClick={() => navigate('/profit-insights')}
          title="View Insights"
        >
          View Insights
        </button>
      </div>
    </div>
  )
}

export default SegmentedBarChart


