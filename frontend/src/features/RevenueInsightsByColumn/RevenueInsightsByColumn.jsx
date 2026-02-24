import React, { useState, useMemo, useRef, useEffect, useContext } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './RevenueInsightsByColumn.css'

const COLUMN_OPTIONS = [
  { key: 'category', label: 'Category' },
  { key: 'region', label: 'Region' },
  { key: 'payment_method', label: 'Payment method' },
  { key: 'product_name', label: 'Product name' },
  { key: 'subcategory', label: 'Subcategory' },
]

const TIME_OPTIONS = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

// Image-style palette: purple, lime green, light blue, dark grey, light grey (last can be striped "Other")
const SEGMENT_COLORS = [
  '#8B5CF6',
  '#84CC16',
  '#38BDF8',
  '#374151',
  '#D1D5DB',
]

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

const RevenueInsightsByColumn = () => {
  const { kpiData } = useContext(KpiContext)
  const [selectedColumn, setSelectedColumn] = useState('category')
  const [timeRange, setTimeRange] = useState('month')
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const columnDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(e.target)) {
        setColumnDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const chartData = useMemo(() => {
    const byColumn = kpiData?.revenue_by_column
    if (!byColumn || !byColumn[selectedColumn]) {
      const fallback = selectedColumn === 'region' ? kpiData?.map_data : kpiData?.pie_data
      if (Array.isArray(fallback) && fallback.length > 0) {
        return fallback.map((d, i) => ({
          name: String(d.name ?? '—'),
          value: Number(d.value) ?? 0,
          color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
        }))
      }
      return [
        { name: 'Electronics', value: 120000, color: SEGMENT_COLORS[0] },
        { name: 'Office', value: 90000, color: SEGMENT_COLORS[1] },
        { name: 'Other', value: 50000, color: SEGMENT_COLORS[4] },
      ]
    }
    const raw = byColumn[selectedColumn]
    const total = raw.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1
    return raw.map((d, i) => ({
      name: String(d.name ?? '—'),
      value: Number(d.value) || 0,
      percentage: Math.round(((Number(d.value) || 0) / total) * 100),
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    }))
  }, [kpiData, selectedColumn])

  const total = useMemo(() => chartData.reduce((s, d) => s + (d.value ?? 0), 0), [chartData])
  const withPercentage = useMemo(() => {
    if (total <= 0) return chartData
    return chartData.map((d) => ({
      ...d,
      percentage: Math.round(((d.value ?? 0) / total) * 100),
    }))
  }, [chartData, total])

  const columnLabel = COLUMN_OPTIONS.find((c) => c.key === selectedColumn)?.label ?? selectedColumn
  const title = `Revenue by ${columnLabel}`

  // Donut geometry
  const centerX = 100
  const centerY = 100
  const radius = 72
  const innerRadius = 40
  const gapWidth = 2
  const outerGapAngle = (gapWidth / radius) * (180 / Math.PI)
  const innerGapAngle = (gapWidth / innerRadius) * (180 / Math.PI)
  const numGaps = withPercentage.length
  const totalGapAngle = outerGapAngle * numGaps
  const availableAngle = 360 - totalGapAngle
  const totalPct = withPercentage.reduce((s, d) => s + (d.percentage ?? 0), 0) || 100
  const scaleFactor = availableAngle / ((totalPct / 100) * 360)

  let currentAngle = -90
  const segmentAngles = withPercentage.map((item) => {
    const segmentAngle = ((item.percentage ?? 0) / 100) * 360 * scaleFactor
    const midAngle = currentAngle + outerGapAngle / 2 + segmentAngle / 2
    currentAngle += segmentAngle + outerGapAngle
    return midAngle
  })

  const labelRadius = (innerRadius + radius) / 2

  const generateSegmentPath = (percentage, segmentStartAngle) => {
    const segmentAngle = (percentage / 100) * 360 * scaleFactor
    const outerStartAngle = segmentStartAngle + outerGapAngle / 2
    const outerEndAngle = segmentStartAngle + segmentAngle - outerGapAngle / 2
    const innerStartAngle = segmentStartAngle + innerGapAngle / 2
    const innerEndAngle = segmentStartAngle + segmentAngle - innerGapAngle / 2
    const rad = (deg) => (deg * Math.PI) / 180
    const x1 = centerX + radius * Math.cos(rad(outerStartAngle))
    const y1 = centerY + radius * Math.sin(rad(outerStartAngle))
    const x2 = centerX + radius * Math.cos(rad(outerEndAngle))
    const y2 = centerY + radius * Math.sin(rad(outerEndAngle))
    const innerX1 = centerX + innerRadius * Math.cos(rad(innerStartAngle))
    const innerY1 = centerY + innerRadius * Math.sin(rad(innerStartAngle))
    const innerX2 = centerX + innerRadius * Math.cos(rad(innerEndAngle))
    const innerY2 = centerY + innerRadius * Math.sin(rad(innerEndAngle))
    const largeArc = segmentAngle > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1} Z`
  }

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0)

  return (
    <div className="ribc-card">
      <div className="ribc-header">
        <div className="ribc-header-top">
          <div>
            <h3 className="ribc-title">{title}</h3>
            <p className="ribc-subtitle">Monitor how your revenue is distributed</p>
          </div>
          <button type="button" className="ribc-expand-btn" aria-label="View all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>

        <div className="ribc-controls-row">
          <div className="ribc-dropdown-wrap" ref={columnDropdownRef}>
            <button
              type="button"
              className="ribc-column-btn"
              onClick={() => setColumnDropdownOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={columnDropdownOpen}
            >
              {columnLabel}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {columnDropdownOpen && (
              <ul className="ribc-dropdown" role="listbox">
                {COLUMN_OPTIONS.map((opt) => (
                  <li key={opt.key} role="option" aria-selected={opt.key === selectedColumn}>
                    <button
                      type="button"
                      className={opt.key === selectedColumn ? 'ribc-dropdown-item ribc-dropdown-item--active' : 'ribc-dropdown-item'}
                      onClick={() => {
                        setSelectedColumn(opt.key)
                        setColumnDropdownOpen(false)
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ribc-time-pills">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={timeRange === t.key ? 'ribc-pill ribc-pill--selected' : 'ribc-pill'}
                onClick={() => setTimeRange(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ribc-content">
        <div className="ribc-legend" role="list">
          {withPercentage.map((item, index) => (
            <div
              key={item.name}
              className={`ribc-legend-item ${hoveredIndex === index ? 'ribc-legend-item--active' : ''} ${hoveredIndex !== null && hoveredIndex !== index ? 'ribc-legend-item--dimmed' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="listitem"
            >
              <span className="ribc-legend-swatch" style={{ backgroundColor: item.color }} />
              <span className="ribc-legend-name">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="ribc-chart">
          <svg viewBox="0 0 200 200" className="ribc-donut" aria-hidden="true">
            <defs>
              <pattern id="ribc-stripe-other" patternUnits="userSpaceOnUse" width="6" height="6">
                <rect width="6" height="6" fill="#E5E7EB" />
                <path d="M0 0L6 6M6 0L0 6" stroke="#9CA3AF" strokeWidth="1.2" />
              </pattern>
            </defs>
            <circle cx={centerX} cy={centerY} r={innerRadius - 2} fill="#fafafa" />
            {(() => {
              let angle = -90
              return withPercentage.map((item, index) => {
                const path = generateSegmentPath(item.percentage ?? 0, angle)
                const segmentAngle = ((item.percentage ?? 0) / 100) * 360 * scaleFactor
                angle += segmentAngle + outerGapAngle
                const isLast = index === withPercentage.length - 1
                const fill = isLast && item.name === 'Other' ? 'url(#ribc-stripe-other)' : item.color
                return (
                  <g key={item.name}>
                    <path
                      d={path}
                      fill={fill}
                      className={`ribc-segment ${hoveredIndex === index ? 'ribc-segment--hover' : ''} ${hoveredIndex !== null && hoveredIndex !== index ? 'ribc-segment--dimmed' : ''}`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      aria-label={`${item.name}: ${item.percentage}%`}
                    />
                    <text
                      x={centerX + labelRadius * Math.cos((segmentAngles[index] * Math.PI) / 180)}
                      y={centerY + labelRadius * Math.sin((segmentAngles[index] * Math.PI) / 180)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`ribc-segment-label ${luminance(item.color) > 0.5 ? 'ribc-segment-label--dark' : ''}`}
                    >
                      {item.percentage}%
                    </text>
                  </g>
                )
              })
            })()}
            <g className="ribc-donut-center">
              <text x={centerX} y={centerY - 4} textAnchor="middle" className="ribc-donut-total">
                {formatCurrency(total)}
              </text>
              <text x={centerX} y={centerY + 12} textAnchor="middle" className="ribc-donut-sub">
                This period
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default RevenueInsightsByColumn
