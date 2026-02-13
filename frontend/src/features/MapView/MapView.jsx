import React, { useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps'
import './MapView.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const CONTINENTS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json'

const mapRegions = [
  { name: 'North America', value: 45, color: '#007AFF', coordinates: [-100, 45] },
  { name: 'Europe', value: 32, color: '#34C759', coordinates: [15, 48] },
  { name: 'Asia', value: 28, color: '#FF9500', coordinates: [100, 35] },
  { name: 'South America', value: 15, color: '#FF3B30', coordinates: [-60, -15] }
]

// Additional markers for the map
const mapMarkers = [
  { coordinates: [-100, 45], region: 'America' }, // North America
  { coordinates: [-60, -15], region: 'America' }, // South America
  { coordinates: [15, 48], region: 'Europe' }, // Europe
  { coordinates: [20, 0], region: 'Africa' }, // Africa
  { coordinates: [100, 60], region: 'Asia' }, // Russia/Asia
  { coordinates: [120, -25], region: 'Asia' }, // Southeast Asia/Australia
]


const MapView = () => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })

  const handleZoomIn = () => {
    if (position.zoom >= 4) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }))
  }

  const handleZoomOut = () => {
    if (position.zoom <= 1) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }))
  }

  const handleReset = () => {
    setPosition({ coordinates: [0, 0], zoom: 1 })
  }

  const handleMoveEnd = (position) => {
    setPosition(position)
  }

  const handleWheel = (e) => {
    // Stop event propagation to prevent dashboard scrolling
    // ZoomableGroup will handle the zoom internally
    e.stopPropagation()
  }

  return (
    <div className="map-view">
      <div className="map-header">
        <div className="map-header-content">
          <h2 className="map-title">Geographic Distribution</h2>
          <p className="map-subtitle">Revenue by region</p>
        </div>
      </div>

      <div className="map-container">
        <div className="map-wrapper" onWheel={handleWheel}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120,
              center: [20, 25]
            }}
            className="composable-map"
          >
            <defs>
              {/* Dotted pattern for landmasses */}
              <pattern id="dotPattern" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1" fill="#636366" opacity="1"/>
              </pattern>
            </defs>
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              minZoom={1}
              maxZoom={4}
            >
              <Geographies geography={CONTINENTS_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="url(#dotPattern)"
                        stroke="none"
                        style={{
                          default: { outline: 'none', pointerEvents: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>
                {/* Purple markers with glow */}
                {mapMarkers.map((marker, index) => (
                  <Marker key={index} coordinates={marker.coordinates}>
                    <g>
                      {/* Glow effect */}
                      <circle
                        r={10}
                        fill="#9B59B6"
                        fillOpacity={0.2}
                      />
                      <circle
                        r={8}
                        fill="#9B59B6"
                        fillOpacity={0.3}
                      />
                      {/* Main marker */}
                      <circle
                        r={6}
                        fill="#9B59B6"
                        fillOpacity={0.9}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                      <circle r={2.5} fill="#ffffff" fillOpacity={0.8} />
                    </g>
                  </Marker>
                ))}
            </ZoomableGroup>
          </ComposableMap>
          
          <div className="map-zoom-controls-bottom">
            <button 
              className="map-zoom-btn-circle" 
              onClick={handleZoomIn}
              disabled={position.zoom >= 4}
              title="Zoom In"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button 
              className="map-zoom-btn-circle" 
              onClick={handleZoomOut}
              disabled={position.zoom <= 1}
              title="Zoom Out"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="map-legend-bottom">
          <div className="map-legend-item-bottom">
            <div className="map-legend-dot-bottom" style={{ backgroundColor: '#D1D1D6' }} />
            <span className="map-legend-name-bottom">Europe</span>
          </div>
          <div className="map-legend-item-bottom">
            <div className="map-legend-dot-bottom" style={{ backgroundColor: '#9B59B6' }} />
            <span className="map-legend-name-bottom">Asia</span>
          </div>
          <div className="map-legend-item-bottom">
            <div className="map-legend-dot-bottom" style={{ backgroundColor: '#007AFF' }} />
            <span className="map-legend-name-bottom">Africa</span>
          </div>
          <div className="map-legend-item-bottom">
            <div className="map-legend-dot-bottom" style={{ backgroundColor: '#34C759' }} />
            <span className="map-legend-name-bottom">America</span>
          </div>
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
