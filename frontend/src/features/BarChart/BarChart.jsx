import React, { useContext } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './BarChart.css'

function formatBarTitle(barColumn) {
  if (!barColumn) return 'Breakdown'
  const s = String(barColumn).trim()
  if (!s) return 'Breakdown'
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

/** Format a number as compact K/M with one decimal when needed for specificity */
function formatCompactAxis(value) {
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e6) {
    const m = value / 1e6
    return m % 1 === 0 ? `${m}M` : `${Number(m.toFixed(1))}M`
  }
  if (abs >= 1000) {
    const k = value / 1000
    return k % 1 === 0 ? `${k}K` : `${Number(k.toFixed(1))}K`
  }
  return abs % 1 === 0 ? String(Math.round(value)) : String(Number(value.toFixed(1)))
}

const BarChart = () => {
  const { kpiData } = useContext(KpiContext)
  const barData = kpiData?.bar_data
  const barColumn = kpiData?.bar_column
  const hasData = Array.isArray(barData) && barData.length > 0

  const chartData = hasData
    ? barData.map((item) => ({ label: item.name ?? String(item.label ?? ''), value: Number(item.value) ?? 0 }))
    : []

  const chartWidth = 400
  const chartHeight = 250
  // Left padding fits compact K/M labels (e.g. "100K", "1.5M")
  const padding = { top: 20, right: 40, bottom: 40, left: 44 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const maxValue = chartData.length
    ? Math.max(...chartData.map((d) => d.value), 1)
    : 1
  const step = maxValue <= 5 ? 1 : maxValue <= 20 ? 5 : Math.ceil(maxValue / 5)
  const yAxisLabels = []
  for (let v = 0; v <= maxValue; v += step) yAxisLabels.push(v)
  if (yAxisLabels[yAxisLabels.length - 1] !== maxValue) yAxisLabels.push(maxValue)

  const n = chartData.length || 1
  const barWidth = graphWidth / n - 10
  const barSpacing = 10
  const title = formatBarTitle(barColumn)

  if (!hasData) {
    return (
      <div className="orders-list">
        <div className="orders-header">
          <h2 className="orders-title">{title}</h2>
        </div>
        <div className="orders-chart-container orders-chart-empty">
          <p className="bar-chart-empty-message">No bar chart data. Upload a file with at least two categorical columns.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2 className="orders-title">{title}</h2>
      </div>

      <div className="orders-chart-container">
        <svg className="orders-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <g className="grid-lines">
            {yAxisLabels.map((value, index) => {
              const y = padding.top + graphHeight - (value / maxValue) * graphHeight
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

          <g className="y-axis-labels">
            {yAxisLabels.map((value, index) => {
              const y = padding.top + graphHeight - (value / maxValue) * graphHeight
              return (
                <text
                  key={index}
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="axis-label bar-y-axis-label"
                >
                  {formatCompactAxis(value)}
                </text>
              )
            })}
          </g>

          {chartData.map((dayData, index) => {
            const barHeight = (dayData.value / maxValue) * graphHeight
            const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
            const barY = padding.top + graphHeight - barHeight
            const cornerRadius = 6
            const path = `
              M ${barX + cornerRadius},${barY}
              L ${barX + barWidth - cornerRadius},${barY}
              Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + cornerRadius}
              L ${barX + barWidth},${barY + barHeight}
              L ${barX},${barY + barHeight}
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
              />
            )
          })}

          <g className="x-axis-labels">
            {chartData.map((dayData, index) => {
              const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
              return (
                <text
                  key={index}
                  x={barX + barWidth / 2}
                  y={padding.top + graphHeight + 20}
                  textAnchor="middle"
                  className="axis-label"
                >
                  {dayData.label}
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



