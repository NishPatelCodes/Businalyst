import React from 'react'
import './PhoneMockup.css'

const PhoneMockup = () => {
  return (
    <div className="phone-container">
      <div className="phone-frame">
        {/* Volume Buttons */}
        <div className="volume-button volume-up"></div>
        <div className="volume-button volume-down"></div>
        {/* Power Button */}
        <div className="power-button"></div>
        
        {/* Dynamic Island */}
        <div className="dynamic-island"></div>
        
        {/* Phone Screen */}
        <div className="phone-screen">
          {/* Header */}
          <div className="phone-header">
            <h2 className="phone-title">Dashboard</h2>
            <div className="hamburger-menu">
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="timeframe-selector">
            <button className="timeframe-btn active">12m</button>
            <button className="timeframe-btn">30d</button>
            <button className="timeframe-btn">7d</button>
            <button className="timeframe-btn">24h</button>
            <button className="filter-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Main Metric */}
          <div className="main-metric">
            <div className="metric-label">MRR</div>
            <div className="metric-value">$18,880</div>
            <div className="metric-change positive">+7.4%</div>
          </div>

          {/* Chart */}
          <div className="chart-container">
            <div className="chart">
              <svg viewBox="0 0 200 80" className="chart-svg">
                <polyline
                  points="10,60 30,55 50,50 70,45 90,40 110,35 130,30 150,25 170,20 190,15"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="chart-labels">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="key-metrics">
            <div className="metric-card">
              <div className="metric-card-label">Total members</div>
              <div className="metric-card-value">4,862</div>
              <div className="metric-card-change positive">+9.2%</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-label">Paid members</div>
              <div className="metric-card-value">2,671</div>
              <div className="metric-card-change positive">+6.6%</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-label">Email open rate</div>
              <div className="metric-card-value">82%</div>
              <div className="metric-card-change positive">+8.1%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneMockup

