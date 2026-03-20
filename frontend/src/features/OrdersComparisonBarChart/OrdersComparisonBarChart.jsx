import React, { useMemo, useContext } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './OrdersComparisonBarChart.css'

const OrdersComparisonBarChart = ({ periodRatio = 1 }) => {
  const { kpiData } = useContext(KpiContext)

  const { labels, currentValues, previousValues, hasComparison, totalCurrent } = useMemo(() => {
    const backendLabels = kpiData?.comparison_bar_labels
    const backendCurrent = kpiData?.comparison_bar_current
    const backendPrevious = kpiData?.comparison_bar_previous
    const backendHasPrevious = kpiData?.comparison_bar_has_previous ?? false

    if (
      Array.isArray(backendLabels) && backendLabels.length > 0 &&
      Array.isArray(backendCurrent) && backendCurrent.length > 0
    ) {
      const scaledCurrent = backendCurrent.map((v) => Number(v) * periodRatio)
      const scaledPrevious = Array.isArray(backendPrevious) ? backendPrevious.map((v) => Number(v) * periodRatio) : null
      const total = scaledCurrent.reduce((a, b) => a + b, 0)
      return {
        labels: backendLabels,
        currentValues: scaledCurrent,
        previousValues: backendHasPrevious && Array.isArray(backendPrevious) ? scaledPrevious : null,
        hasComparison: backendHasPrevious && Array.isArray(backendPrevious),
        totalCurrent: Math.round(total),
      }
    }

    // Demo / fallback data
    const demoLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    const demoCurrent = [18, 22, 20, 24, 19, 26, 28].map((v) => v * periodRatio)
    const demoPrevious = [14, 18, 16, 20, 17, 22, 20].map((v) => v * periodRatio)
    return {
      labels: demoLabels,
      currentValues: demoCurrent,
      previousValues: demoPrevious,
      hasComparison: true,
      totalCurrent: demoCurrent.reduce((a, b) => a + b, 0),
    }
  }, [
    kpiData?.comparison_bar_labels,
    kpiData?.comparison_bar_current,
    kpiData?.comparison_bar_previous,
    kpiData?.comparison_bar_has_previous,
    periodRatio,
  ])

  const allSeries = hasComparison && previousValues
    ? [...currentValues, ...previousValues]
    : [...currentValues]
  const maxVal = Math.max(...allSeries, 1)
  const yMax = Math.ceil(maxVal * 1.15) || 10
  const chartWidth = 560
  const chartHeight = 200
  const padding = { top: 16, right: 40, bottom: 40, left: 12 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const groupWidth = graphWidth / labels.length
  const gap = 8
  const barWidth = Math.max(10, hasComparison
    ? (groupWidth - gap) / 2
    : groupWidth * 0.6)

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
          <div className="ocb-value">{totalCurrent.toLocaleString()}</div>
        </div>
        <div className="ocb-controls">
          <div className="ocb-legend">
            <span className="ocb-legend-item">
              <span className="ocb-legend-dot ocb-legend-dot--current" />
              Current
            </span>
            {hasComparison && (
              <span className="ocb-legend-item">
                <span className="ocb-legend-dot ocb-legend-dot--last" />
                Previous
              </span>
            )}
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
                {tick >= 1e6
                  ? `${(tick / 1e6).toFixed(1)}M`
                  : tick >= 1e3
                    ? `${(tick / 1e3).toFixed(0)}k`
                    : tick}
              </text>
            ))}
          </g>
          {/* Bars */}
          {labels.map((label, i) => {
            const groupCenter = padding.left + (i + 0.5) * groupWidth
            const currentVal = currentValues[i] || 0
            const currentH = (currentVal / yMax) * graphHeight
            const currentX = hasComparison
              ? groupCenter - barWidth - gap / 2
              : groupCenter - barWidth / 2

            const prevVal = hasComparison && previousValues ? (previousValues[i] || 0) : null
            const prevH = prevVal != null ? (prevVal / yMax) * graphHeight : 0
            const prevX = groupCenter + gap / 2

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
                {hasComparison && prevVal != null && (
                  <rect
                    x={prevX}
                    y={valueToY(prevVal)}
                    width={barWidth}
                    height={prevH}
                    fill="#bfdbfe"
                    rx="3"
                    className="ocb-bar"
                  />
                )}
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
                {String(label).length > 8 ? String(label).slice(0, 7) + '…' : label}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

export default OrdersComparisonBarChart
