import React from 'react'
import './MapView.css'

const MapView = () => {
  // Sample map data - you can replace this with actual map integration
  const mapRegions = [
    { name: 'North America', value: 45, color: '#2563eb' },
    { name: 'Europe', value: 32, color: '#16a34a' },
    { name: 'Asia', value: 28, color: '#FF9500' },
    { name: 'South America', value: 15, color: '#dc2626' }
  ]

  return (
    <div className="map-view">
      <div className="map-header">
        <h2 className="map-title">Geographic Distribution</h2>
        <button className="map-filter-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="map-container">
        <div className="map-placeholder">
          <svg viewBox="0 0 400 300" className="map-svg">
            {/* Simplified world map outline */}
            <path
              d="M50 100 Q100 80 150 100 T250 100 T350 100 L350 200 Q300 220 250 200 T150 200 T50 200 Z"
              fill="#F5F5F7"
              stroke="#E8E8ED"
              strokeWidth="1"
            />
            <path
              d="M100 120 Q130 110 160 120 T220 120 T280 120 L280 180 Q250 190 220 180 T160 180 T100 180 Z"
              fill="#E8E8ED"
              stroke="#D1D1D6"
              strokeWidth="1"
            />
            
            {/* Sample markers */}
            <circle cx="120" cy="140" r="8" fill="#007AFF" opacity="0.8">
              <title>North America</title>
            </circle>
            <circle cx="200" cy="130" r="6" fill="#30D158" opacity="0.8">
              <title>Europe</title>
            </circle>
            <circle cx="280" cy="150" r="7" fill="#FF9500" opacity="0.8">
              <title>Asia</title>
            </circle>
            <circle cx="150" cy="200" r="5" fill="#FF3B30" opacity="0.8">
              <title>South America</title>
            </circle>
          </svg>
        </div>

        <div className="map-legend">
          {mapRegions.map((region, index) => (
            <div key={index} className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: region.color }}></div>
              <span className="legend-name">{region.name}</span>
              <span className="legend-value">{region.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MapView


