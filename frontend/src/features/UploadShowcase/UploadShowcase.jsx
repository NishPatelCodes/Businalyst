import React from 'react'
import './UploadShowcase.css'

const UploadShowcase = () => {
  const columnItems = ['Revenue', 'Profit', 'Orders', 'Date']

  // Line chart data
  const lineData = [
    { x: 0, y: 30 },
    { x: 20, y: 35 },
    { x: 40, y: 32 },
    { x: 60, y: 42 },
    { x: 80, y: 38 },
    { x: 100, y: 48 }
  ]

  // Bar chart data
  const barData = [
    { label: 'Q1', value: 45 },
    { label: 'Q2', value: 62 },
    { label: 'Q3', value: 55 },
    { label: 'Q4', value: 70 }
  ]

  // Multi-line shaded area chart data
  const areaData = [
    { x: 0, y: 20 },
    { x: 15, y: 25 },
    { x: 30, y: 30 },
    { x: 45, y: 28 },
    { x: 60, y: 40 },
    { x: 75, y: 45 },
    { x: 100, y: 55 }
  ]

  const createLinePath = (data, height = 60) => {
    const scaleY = (y) => height - (y / 70) * height
    let path = `M ${data[0].x} ${scaleY(data[0].y)}`
    for (let i = 1; i < data.length; i++) {
      path += ` L ${data[i].x} ${scaleY(data[i].y)}`
    }
    return path
  }

  const createAreaPath = (data, height = 60) => {
    const linePath = createLinePath(data, height)
    return `${linePath} L 100 ${height} L 0 ${height} Z`
  }

  return (
    <div className="upload-showcase">
      {/* Card 1: Line Chart */}
      <div className="showcase-card showcase-card--line-chart">
        <div className="showcase-card-header">
          <h3 className="showcase-card-title">Complaints Received</h3>
          <p className="showcase-card-subtitle">
            This Month <span className="growth-indicator">+0.3%</span>
          </p>
        </div>
        
        <div className="showcase-metrics">
          <div className="metric-group">
            <div className="metric-value large">165</div>
            <div className="metric-description">Total complaints received</div>
          </div>
        </div>

        <div className="showcase-chart">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <path
              d={createLinePath(lineData)}
              fill="none"
              stroke="#007AFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Bar Chart */}
      <div className="showcase-card showcase-card--bar-chart">
        <div className="showcase-card-header">
          <h3 className="showcase-card-title">Quarterly Performance</h3>
          <p className="showcase-card-subtitle">Revenue breakdown by quarter</p>
        </div>

        <div className="showcase-chart">
          <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
            {barData.map((bar, index) => {
              const maxValue = Math.max(...barData.map(b => b.value))
              const barWidth = 16
              const barHeight = (bar.value / maxValue) * 48
              const barX = 8 + index * 22
              const barY = 50 - barHeight
              
              return (
                <g key={index}>
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="2"
                    fill="#007AFF"
                    opacity="0.85"
                  />
                  <text
                    x={barX + barWidth / 2}
                    y="57"
                    textAnchor="middle"
                    fontSize="8"
                    fill="#86868b"
                    fontWeight="500"
                  >
                    {bar.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Card 3: Multi-line Shaded Area Chart (Large) */}
      <div className="showcase-card showcase-card--area-chart">
        <div className="showcase-card-header">
          <h3 className="showcase-card-title">Account & Monthly Recurring Revenue Growth</h3>
        </div>

        <div className="showcase-metrics">
          <div className="metric-group">
            <div className="metric-label">MRR GROWTH</div>
            <div className="metric-value">$620,076</div>
          </div>
          <div className="metric-group">
            <div className="metric-label">AVG. MRR/CUSTOMER</div>
            <div className="metric-value">$1,200</div>
          </div>
        </div>

        <div className="showcase-chart large">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#007AFF" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#5AC8FA" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#007AFF" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d={createAreaPath(areaData)}
              fill="url(#areaGradient)"
            />
            <path
              d={createLinePath(areaData)}
              fill="none"
              stroke="#007AFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 4: Required Columns */}
      <div className="showcase-card showcase-card--required">
        <div className="column-list-container">
          <span className="column-list-pill required">REQUIRED</span>
          <div className="column-items">
            {columnItems.map((item, index) => (
              <div key={index} className="column-item">
                <div className="column-radio selected"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card 5: Optional Columns */}
      <div className="showcase-card showcase-card--optional">
        <div className="column-list-container">
          <span className="column-list-pill optional">OPTIONAL</span>
          <div className="column-items">
            {columnItems.map((item, index) => (
              <div key={index} className="column-item">
                <div className="column-radio"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadShowcase
