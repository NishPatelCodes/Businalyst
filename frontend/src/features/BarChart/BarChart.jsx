import React, { useContext, useState } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './BarChart.css'

const truncateLabel = (s, maxLen = 14) => {
  if (!s || typeof s !== 'string') return ''
  const t = s.trim()
  return t.length <= maxLen ? t : t.slice(0, maxLen - 1) + '…'
}

const formatAxisValue = (v) => {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`
  return String(Math.round(v))
}

const BarChart = () => {
  const { kpiData } = useContext(KpiContext)
  const [tooltip, setTooltip] = useState(null)
  const barData = Array.isArray(kpiData?.bar_data) && kpiData.bar_data.length >= 2
    ? kpiData.bar_data
    : [
        { name: 'Item 1', value: 2100 },
        { name: 'Item 2', value: 3000 },
        { name: 'Item 3', value: 1800 },
        { name: 'Item 4', value: 1100 },
        { name: 'Item 5', value: 2200 },
      ]
  const barColumn = kpiData?.bar_column || 'Item'

  const values = barData.map(d => Math.max(0, Number(d.value) || 0))
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values, 1)
  const range = maxVal - minVal || 1
  // Non-zero baseline: scale from ~80% of min so bars are centered, not over-heighted
  const yMin = Math.max(0, minVal - range * 0.15)
  const yMax = maxVal + range * 0.05
  const yRange = yMax - yMin || 1
  const tickCount = 5
  const yAxisLabels = Array.from({ length: tickCount }, (_, i) =>
    yMin + (yRange * (tickCount - 1 - i)) / (tickCount - 1)
  )

  const chartWidth = 400
  const chartHeight = 250
  const padding = { top: 20, right: 40, bottom: 72, left: 48 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const barWidth = Math.max(20, (graphWidth / barData.length) - 10)
  const barSpacing = 10

  const chartTitle = kpiData?.bar_data
    ? `Top by ${barColumn.replace(/_/g, ' ')}`
    : 'Revenue Summary'

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2 className="orders-title">{chartTitle}</h2>
      </div>

      <div className="orders-chart-container">
        {tooltip && (
          <div
            className="bar-chart-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="bar-tooltip-name">{tooltip.name}</div>
            <div className="bar-tooltip-value">
              {tooltip.value >= 1e6
                ? `${(tooltip.value / 1e6).toFixed(2)}M`
                : tooltip.value >= 1e3
                  ? `${(tooltip.value / 1e3).toFixed(2)}k`
                  : Number(tooltip.value).toLocaleString()}
            </div>
          </div>
        )}
        <svg className="orders-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* X-axis baseline */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Grid lines - horizontal grey lines */}
          <g className="grid-lines">
            {yAxisLabels.filter(v => v > yMin).map((value, index) => {
              const y = padding.top + graphHeight - ((value - yMin) / yRange) * graphHeight
              return (
                <line
                  key={index}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  strokeWidth="0.5"
                  opacity="0.5"
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
                <text
                  key={index}
                  x={padding.left - 5}
                  y={y + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {formatAxisValue(value)}
                </text>
              )
            })}
          </g>

          {/* Bars */}
          {barData.map((item, index) => {
            const safeValue = Math.max(yMin, Number(item.value) || 0)
            const barHeight = ((safeValue - yMin) / yRange) * graphHeight
            const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
            // Baseline is the X-axis line - bars always start from here
            const baselineY = padding.top + graphHeight
            // Bar top position (bars grow upward from baseline)
            const barY = baselineY - barHeight
            const cornerRadius = 6 // Increased corner radius for top corners

            // Create path with rounded top corners only
            // Bottom of bar is always at baselineY (X-axis)
            const path = `
              M ${barX + cornerRadius},${barY}
              L ${barX + barWidth - cornerRadius},${barY}
              Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + cornerRadius}
              L ${barX + barWidth},${baselineY}
              L ${barX},${baselineY}
              L ${barX},${barY + cornerRadius}
              Q ${barX},${barY} ${barX + cornerRadius},${barY}
              Z
            `

            return (
              <path
                key={index}
                d={path}
                fill="url(#barGradient)"
                className="bar-segment"
                onMouseEnter={(e) => setTooltip({
                  name: item.name,
                  value: Number(item.value) || 0,
                  x: e.clientX,
                  y: e.clientY,
                })}
                onMouseMove={(e) => setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          })}

          {/* X-axis labels - rotated to prevent overlap */}
          <g className="x-axis-labels">
            {barData.map((item, index) => {
              const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
              const cx = barX + barWidth / 2
              const cy = padding.top + graphHeight + 16
              return (
                <text
                  key={index}
                  x={cx}
                  y={cy}
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



