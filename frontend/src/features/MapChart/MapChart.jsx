import React, { useContext, useState, useCallback } from 'react'
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

const getMarkerTier = (value, maxValue) => {
  if (maxValue <= 0) return 'low'
  const ratio = value / maxValue
  if (ratio >= 0.66) return 'high'
  if (ratio >= 0.33) return 'medium'
  return 'low'
}

const getMarkerColor = (value, maxValue) => {
  const tier = getMarkerTier(value, maxValue)
  if (tier === 'high') return '#16a34a'
  if (tier === 'medium') return '#f59e0b'
  return '#ef4444'
}

const getMarkerLocationLabel = (marker) => {
  if (marker?.city && marker?.country) return `${marker.city}, ${marker.country}`
  if (marker?.state && marker?.country) return `${marker.state}, ${marker.country}`
  if (marker?.city) return marker.city
  if (marker?.state) return marker.state
  if (marker?.country) return marker.country
  return marker?.name || 'Unknown location'
}

const MapChart = ({ periodRatio = 1 }) => {
  const { kpiData } = useContext(KpiContext)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [activeMarker, setActiveMarker] = useState(null)
  const [cursorPos, setCursorPos] = useState(null)

  const handleWrapperMouseMove = useCallback((e) => {
    setCursorPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleWrapperMouseLeave = useCallback(() => {
    setActiveMarker(null)
    setCursorPos(null)
  }, [])

  const handleMarkerEnter = useCallback((marker) => {
    setActiveMarker(marker)
  }, [])

  const handleMarkerLeave = useCallback(() => {
    setActiveMarker(null)
  }, [])

  const mapDataRaw = Array.isArray(kpiData?.map_data) && kpiData.map_data.length > 0
    ? kpiData.map_data
    : DEFAULT_MARKERS
  // BUG 10 fix: skip scaling when periodRatio is 0 to prevent all markers showing 0
  const safeRatio = periodRatio === 0 ? 1 : periodRatio
  const mapData = mapDataRaw.map((m) => ({
    ...m,
    value: Math.round((Number(m?.value) || 0) * safeRatio),
  }))
  const maxOrderValue = Math.max(...mapData.map((m) => Number(m.value) || 0), 0)
  const mapColumn = kpiData?.map_column || 'region'
  const topName = mapData[0]?.name ?? '—'
  const marketCount = mapData.length

  const handleZoomIn = () => {
    if (position.zoom >= 4) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }))
    setActiveMarker(null)
  }

  const handleZoomOut = () => {
    if (position.zoom <= 1) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }))
    setActiveMarker(null)
  }

  const handleMoveEnd = ({ coordinates, zoom }) => {
    setPosition({ coordinates: coordinates ?? position.coordinates, zoom: zoom ?? position.zoom })
    setActiveMarker(null)
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
        <div
          className="map-wrapper"
          onWheel={handleWheel}
          onMouseMove={handleWrapperMouseMove}
          onMouseLeave={handleWrapperMouseLeave}
        >
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
              {mapData.map((marker, index) => {
                const markerColor = getMarkerColor(marker.value, maxOrderValue)
                return (
                <Marker key={marker.name ?? index} coordinates={marker.coordinates}>
                  <g
                    className="map-marker-g map-marker-interactive"
                    pointerEvents="all"
                    onMouseEnter={() => handleMarkerEnter(marker)}
                    onMouseLeave={handleMarkerLeave}
                  >
                    <circle r={16} fill={markerColor} fillOpacity={0.08} />
                    <circle r={14} fill={markerColor} fillOpacity={0.12} />
                    <circle r={12} fill={markerColor} fillOpacity={0.18} />
                    <circle r={10} fill={markerColor} fillOpacity={0.22} />
                    <circle r={8} fill={markerColor} fillOpacity={0.28} />
                    <circle
                      r={6}
                      fill={markerColor}
                      fillOpacity={0.9}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      filter="url(#glow)"
                    />
                    <circle r={2.5} fill="#ffffff" fillOpacity={0.9} />
                  </g>
                </Marker>
                )
              })}
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
          <div className="map-tier-legend">
            <div className="map-tier-legend-item">
              <span className="map-tier-dot map-tier-dot--high" />
              <span>High</span>
            </div>
            <div className="map-tier-legend-item">
              <span className="map-tier-dot map-tier-dot--medium" />
              <span>Medium</span>
            </div>
            <div className="map-tier-legend-item">
              <span className="map-tier-dot map-tier-dot--low" />
              <span>Low</span>
            </div>
          </div>

        </div>

        {activeMarker && cursorPos && (
          <div
            className={`map-tooltip${cursorPos.y < 80 ? ' map-tooltip--below' : ''}`}
            style={{ left: cursorPos.x, top: cursorPos.y }}
          >
            <div className="map-tooltip-content">
              <span className="map-tooltip-name">{getMarkerLocationLabel(activeMarker)}</span>
              <span className="map-tooltip-value">
                {(Number(activeMarker.value) || 0).toLocaleString()} orders received
              </span>
            </div>
          </div>
        )}

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
