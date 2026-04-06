import React, { useContext, useState, useId, useRef } from 'react'
import { KpiContext } from '../../context/KpiContext'
import { formatAxisValueCompact } from '../../utils/axisFormatters'
import './BarChart.css'

const truncateLabel = (s, maxLen = 14) => {
  if (!s || typeof s !== 'string') return ''
  const t = s.trim()
  return t.length <= maxLen ? t : t.slice(0, maxLen - 1) + '…'
}

const BarChart = ({ data: dataProp, title: titleProp, periodRatio = 1 }) => {
  const { kpiData } = useContext(KpiContext)
  const [tooltip, setTooltip] = useState(null)   // { name, value, x, y } container-relative
  const [hoverIndex, setHoverIndex] = useState(null)
  const containerRef = useRef(null)
  const gradientId = useId().replace(/:/g, '-')
  const hoverGradientId = useId().replace(/:/g, '-') + '-h'

  const barDataRaw = Array.isArray(dataProp) && dataProp.length >= 2
    ? dataProp
    : Array.isArray(kpiData?.bar_data) && kpiData.bar_data.length >= 2
      ? kpiData.bar_data
      : [
          { name: 'Item 1', value: 2100 },
          { name: 'Item 2', value: 3000 },
          { name: 'Item 3', value: 1800 },
          { name: 'Item 4', value: 1100 },
          { name: 'Item 5', value: 2200 },
        ]

  const safeRatio = periodRatio === 0 ? 1 : periodRatio
  const barData = barDataRaw.map((d) => ({
    ...d,
    value: (Number(d?.value) || 0) * safeRatio,
  }))
  const barColumn = kpiData?.bar_column || 'Item'

  const values = barData.map(d => Math.max(0, Number(d.value) || 0))
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values, 1)
  const range = maxVal - minVal || 1
  const yMin = maxVal === 0 ? 0 : Math.max(0, minVal - range * 0.15)
  const yMax = maxVal === 0 ? 10 : maxVal + range * 0.05
  const yRange = yMax - yMin || 1
  const tickCount = 5
  const yAxisLabels = Array.from({ length: tickCount }, (_, i) =>
    yMin + (yRange * (tickCount - 1 - i)) / (tickCount - 1)
  )

  const chartWidth = 400
  const chartHeight = 280
  const padding = { top: 20, right: 40, bottom: 90, left: 48 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const barWidth = Math.max(20, (graphWidth / barData.length) - 10)
  const barSpacing = 10

  const chartTitle = titleProp ?? (kpiData?.bar_data ? `Top by ${barColumn.replace(/_/g, ' ')}` : 'Revenue Summary')

  const handleBarEnter = (e, item, index) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setHoverIndex(index)
    setTooltip({
      name: item.name,
      value: Number(item.value) || 0,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleBarMove = (e) => {
    if (!containerRef.current || !tooltip) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip(prev => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null)
  }

  const handleBarLeave = () => {
    setHoverIndex(null)
    setTooltip(null)
  }

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2 className="orders-title">{chartTitle}</h2>
      </div>

      <div className="orders-chart-container" ref={containerRef}>
        {/* Tooltip — absolute, container-relative so scroll doesn't break it */}
        {tooltip && (
          <div
            className="bar-chart-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="bar-tooltip-header">
              <span className="bar-tooltip-swatch" />
              <span className="bar-tooltip-name">{tooltip.name}</span>
            </div>
            <div className="bar-tooltip-value">
              {tooltip.value >= 1e6
                ? `${(tooltip.value / 1e6).toFixed(2)}M`
                : tooltip.value >= 1e3
                  ? `${(tooltip.value / 1e3).toFixed(1)}k`
                  : Number(tooltip.value).toLocaleString()}
            </div>
          </div>
        )}

        <svg
          className="orders-chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={handleBarLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id={hoverGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* X-axis baseline */}
          <line
            x1={padding.left} y1={padding.top + graphHeight}
            x2={padding.left + graphWidth} y2={padding.top + graphHeight}
            stroke="#e5e7eb" strokeWidth="1"
          />

          {/* Grid lines */}
          <g className="grid-lines">
            {yAxisLabels.filter(v => v > yMin).map((value, index) => {
              const y = padding.top + graphHeight - ((value - yMin) / yRange) * graphHeight
              return (
                <line key={index}
                  x1={padding.left} y1={y}
                  x2={padding.left + graphWidth} y2={y}
                  stroke="#e5e7eb" strokeWidth="0.5" opacity="0.6"
                />
              )
            })}
          </g>

          {/* Y-axis labels */}
          <g className="y-axis-labels">
            {yAxisLabels.map((value, index) => {
              const baselineY = padding.top + graphHeight
              const y = value <= yMin ? baselineY : baselineY - ((value - yMin) / yRange) * graphHeight
              return (
                <text key={index} x={padding.left - 5} y={y + 4}
                  textAnchor="end" className="axis-label">
                  {formatAxisValueCompact(value)}
                </text>
              )
            })}
          </g>

          {/* Bars */}
          {barData.map((item, index) => {
            const safeValue = Math.max(yMin, Number(item.value) || 0)
            const barHeight = ((safeValue - yMin) / yRange) * graphHeight
            const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
            const baselineY = padding.top + graphHeight
            const barY = baselineY - barHeight
            const isHovered = hoverIndex === index

            // rounded top corners only
            const r = Math.min(4, barHeight / 2)
            const path = barHeight > 0
              ? `M ${barX},${barY + r} Q ${barX},${barY} ${barX + r},${barY} L ${barX + barWidth - r},${barY} Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + r} L ${barX + barWidth},${baselineY} L ${barX},${baselineY} Z`
              : ''

            return (
              <g key={index}>
                {/* transparent wider hit zone so thin bars are easy to hover */}
                <rect
                  x={barX - 4} y={padding.top}
                  width={barWidth + 8} height={graphHeight}
                  fill="transparent"
                  onMouseEnter={(e) => handleBarEnter(e, item, index)}
                  onMouseMove={handleBarMove}
                  onMouseLeave={handleBarLeave}
                  style={{ cursor: 'pointer' }}
                />
                {path && (
                  <path
                    d={path}
                    fill={isHovered ? `url(#${hoverGradientId})` : `url(#${gradientId})`}
                    className="bar-segment"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 -3px 8px rgba(37,99,235,0.4))' : 'none',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </g>
            )
          })}

          {/* X-axis labels */}
          <g className="x-axis-labels">
            {barData.map((item, index) => {
              const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
              const cx = barX + barWidth / 2
              const cy = padding.top + graphHeight + 16
              return (
                <text key={index} x={cx} y={cy}
                  textAnchor="end"
                  className="axis-label bar-x-label"
                  transform={`rotate(-45, ${cx}, ${cy})`}
                >
                  {truncateLabel(item.name, 12)}
                </text>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}

export default BarChart
