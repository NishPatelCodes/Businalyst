import React, { useContext, useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps'
import { KpiContext } from '../../context/KpiContext'
import './MapChart.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const DEFAULT_MARKERS = [
  { name: 'North America', value: 0, coordinates: [-100, 45] },
  { name: 'South America', value: 0, coordinates: [-60, -15] },
  { name: 'Europe', value: 0, coordinates: [15, 48] },
  { name: 'Africa', value: 0, coordinates: [20, 0] },
  { name: 'Asia', value: 0, coordinates: [100, 60] },
  { name: 'Australia', value: 0, coordinates: [120, -25] },
]

const MapChart = ({ periodRatio = 1 }) => {
  const { kpiData } = useContext(KpiContext)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })

  const mapDataRaw = Array.isArray(kpiData?.map_data) && kpiData.map_data.length > 0
    ? kpiData.map_data
    : DEFAULT_MARKERS
  // BUG 10 fix: skip scaling when periodRatio is 0 to prevent all markers showing 0
  const safeRatio = periodRatio === 0 ? 1 : periodRatio
  const mapData = mapDataRaw.map((m) => ({
    ...m,
    value: Math.round((Number(m?.value) || 0) * safeRatio),
  }))
  const mapColumn = kpiData?.map_column || 'region'
  const topName = mapData[0]?.name ?? '—'
  const marketCount = mapData.length

  const handleZoomIn = () => {
    if (position.zoom >= 4) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }))
  }

  const handleZoomOut = () => {
    if (position.zoom <= 1) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }))
  }

  const handleMoveEnd = ({ coordinates, zoom }) => {
    setPosition({ coordinates: coordinates ?? position.coordinates, zoom: zoom ?? position.zoom })
  }

  const handleWheel = (e) => {
    e.stopPropagation()
  }

  return (
    <div className="map-view">
      <div className="map-header">
        <div className="map-header-content">
          <h2 className="map-title">Geographic Distribution</h2>
          <p className="map-subtitle">
            {kpiData?.map_data ? `Orders by ${mapColumn}` : 'Orders by region'}
          </p>
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
              {/* Glow filter for markers */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              minZoom={1}
              maxZoom={4}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="url(#dotPattern)"
                      stroke="#94a3b8"
                      strokeWidth={0.3}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>
              {mapData.map((marker, index) => (
                <Marker key={marker.name ?? index} coordinates={marker.coordinates}>
                  <g className="map-marker-g">
                    <circle r={16} fill="#2563eb" fillOpacity={0.08} />
                    <circle r={14} fill="#2563eb" fillOpacity={0.12} />
                    <circle r={12} fill="#2563eb" fillOpacity={0.18} />
                    <circle r={10} fill="#2563eb" fillOpacity={0.22} />
                    <circle r={8} fill="#2563eb" fillOpacity={0.28} />
                    <circle
                      r={6}
                      fill="#2563eb"
                      fillOpacity={0.9}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      filter="url(#glow)"
                    />
                    <circle r={2.5} fill="#ffffff" fillOpacity={0.9} />
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

        {/* BUG 10 fix: color-scale legend showing region names + order counts */}
        <div className="map-legend-bottom">
          {mapData.map((marker) => (
            <div key={marker.name} className="map-legend-item-bottom">
              <span className="map-legend-dot-bottom" style={{ background: '#2563eb' }} />
              <span className="map-legend-name-bottom">
                {marker.name}{marker.value > 0 ? ` (${marker.value.toLocaleString()})` : ''}
              </span>
            </div>
          ))}
        </div>

        <div className="map-mini-stats">
          <div className="map-mini-stat">
            <span className="map-mini-stat-label">Top:</span>
            <span className="map-mini-stat-value">{topName}</span>
          </div>
          <div className="map-mini-stat">
            <span className="map-mini-stat-label">Markets:</span>
            <span className="map-mini-stat-value">{marketCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapChart
