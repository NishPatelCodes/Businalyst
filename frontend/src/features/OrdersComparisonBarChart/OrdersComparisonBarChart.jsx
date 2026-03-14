import React, { useState, useMemo, useContext } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './OrdersComparisonBarChart.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

/** Build year comparison: 2024 vs 2023. Seven groups (Jan–Jul). Uses KPI or mock. */
function getYearComparisonData(kpiData) {
  const mock2024 = [18, 22, 20, 24, 19, 26, 28]
  const mock2023 = [14, 18, 16, 20, 17, 22, 20]
  const total2024 = mock2024.reduce((a, b) => a + b, 0)
  return {
    labels: MONTHS,
    currentYear: mock2024,
    previousYear: mock2023,
    totalCurrent: total2024,
  }
}

const OrdersComparisonBarChart = () => {
  const { kpiData } = useContext(KpiContext)
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)

  const { labels, currentYear, previousYear, totalCurrent } = useMemo(
    () => getYearComparisonData(kpiData),
    [kpiData]
  )

  const maxVal = Math.max(...currentYear, ...previousYear, 1)
  const yMax = Math.ceil(maxVal * 1.2) || 10
  const chartWidth = 560
  const chartHeight = 200
  const padding = { top: 16, right: 40, bottom: 40, left: 12 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const groupWidth = graphWidth / labels.length
  const barGap = 4
  const barWidth = Math.max(12, (groupWidth * 0.6 - barGap) / 2)

  const valueToY = (v) =>
    padding.top + graphHeight - (v / yMax) * graphHeight

  const yTicks = useMemo(() => {
    const step = yMax <= 10 ? 2 : yMax <= 20 ? 5 : Math.ceil(yMax / 5)
    const arr = []
    for (let i = 0; i <= yMax; i += step) arr.push(i)
    if (arr[arr.length - 1] !== yMax) arr.push(yMax)
    return arr
  }, [yMax])

  return (
    <div className="ocb-card">
      <div className="ocb-header">
        <div className="ocb-title-wrap">
          <h3 className="ocb-title">Number of sales</h3>
          <div className="ocb-value">{totalCurrent}</div>
        </div>
        <div className="ocb-controls">
          <div className="ocb-legend">
            <span className="ocb-legend-item">
              <span className="ocb-legend-dot ocb-legend-dot--current" />
              2024
            </span>
            <span className="ocb-legend-item">
              <span className="ocb-legend-dot ocb-legend-dot--last" />
              2023
            </span>
          </div>
          <div className="ocb-dropdown-wrap">
            <button
              type="button"
              className="ocb-dropdown-btn"
              onClick={() => setYearDropdownOpen((o) => !o)}
              aria-expanded={yearDropdownOpen}
            >
              Year
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="ocb-chart-wrap">
        <svg className="ocb-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
          {/* Horizontal grid only - subtle dotted */}
          <g className="ocb-grid">
            {yTicks.map((tick) => {
              const y = valueToY(tick)
              return (
                <line
                  key={tick}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              )
            })}
          </g>
          {/* Y-axis labels (right) */}
          <g className="ocb-y-axis">
            {yTicks.map((tick) => (
              <text
                key={tick}
                x={padding.left + graphWidth + 8}
                y={valueToY(tick) + 4}
                textAnchor="start"
                className="ocb-axis-label"
              >
                {tick}
              </text>
            ))}
          </g>
          {/* Bars */}
          {labels.map((label, i) => {
            const groupCenter = padding.left + (i + 0.5) * groupWidth
            const currentVal = currentYear[i] || 0
            const lastVal = previousYear[i] || 0
            const currentH = (currentVal / yMax) * graphHeight
            const lastH = (lastVal / yMax) * graphHeight
            const pairWidth = barWidth * 2 + barGap
            const currentX = groupCenter - pairWidth / 2
            const lastX = currentX + barWidth + barGap

            return (
              <g key={label}>
                <rect
                  x={currentX}
                  y={valueToY(currentVal)}
                  width={barWidth}
                  height={currentH}
                  fill="#2563eb"
                  rx="4"
                  className="ocb-bar"
                />
                <rect
                  x={lastX}
                  y={valueToY(lastVal)}
                  width={barWidth}
                  height={lastH}
                  fill="#bfdbfe"
                  rx="4"
                  className="ocb-bar"
                />
              </g>
            )
          })}
          {/* Baseline */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          {/* X-axis labels */}
          <g className="ocb-x-axis">
            {labels.map((label, i) => (
              <text
                key={label}
                x={padding.left + (i + 0.5) * groupWidth}
                y={padding.top + graphHeight + 22}
                textAnchor="middle"
                className="ocb-axis-label"
              >
                {label}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

export default OrdersComparisonBarChart
