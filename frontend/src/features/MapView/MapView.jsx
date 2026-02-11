import React from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps'
import './MapView.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const mapRegions = [
  { name: 'North America', value: 45, color: '#007AFF', coordinates: [-100, 45] },
  { name: 'Europe', value: 32, color: '#34C759', coordinates: [15, 48] },
  { name: 'Asia', value: 28, color: '#FF9500', coordinates: [100, 35] },
  { name: 'South America', value: 15, color: '#FF3B30', coordinates: [-60, -15] }
]

const MapView = () => {
  return (
    <div className="map-view">
      <div className="map-header">
        <div className="map-header-content">
          <h2 className="map-title">Geographic Distribution</h2>
          <p className="map-subtitle">Revenue by region</p>
        </div>
        <button className="map-filter-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="map-container">
        <div className="map-wrapper">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120,
              center: [20, 25]
            }}
            className="composable-map"
          >
            <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#FAFAFA"
                      stroke="#D1D1D6"
                      strokeWidth={0.6}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: '#F5F5F7', outline: 'none' },
                        pressed: { outline: 'none' }
                      }}
                    />
                  ))
                }
              </Geographies>
              {mapRegions.map((region, index) => (
                <Marker key={index} coordinates={region.coordinates}>
                  <g>
                    <circle
                      r={6}
                      fill={region.color}
                      fillOpacity={0.95}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                    <circle r={2.5} fill="#ffffff" fillOpacity={0.6} />
                  </g>
                </Marker>
              ))}
          </ComposableMap>
        </div>

        <div className="map-legend">
          {mapRegions.map((region, index) => (
            <div key={index} className="map-legend-item">
              <div className="map-legend-dot" style={{ backgroundColor: region.color }} />
              <span className="map-legend-name">{region.name}</span>
              <span className="map-legend-value">{region.value}%</span>
            </div>
          ))}
        </div>

        <div className="map-mini-stats">
          <div className="map-mini-stat">
            <span className="map-mini-stat-label">Top:</span>
            <span className="map-mini-stat-value">N. America</span>
          </div>
          <div className="map-mini-stat">
            <span className="map-mini-stat-label">Markets:</span>
            <span className="map-mini-stat-value">4</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView
