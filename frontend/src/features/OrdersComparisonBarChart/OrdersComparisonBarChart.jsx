import React, { useMemo, useContext, useState } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './OrdersComparisonBarChart.css'

const OrdersComparisonBarChart = ({ periodRatio = 1 }) => {
  const { kpiData } = useContext(KpiContext)
  const [hoverIndex, setHoverIndex] = useState(null)

  const { labels, currentValues, previousValues, hasComparison, totalCurrent } = useMemo(() => {
    const backendLabels = kpiData?.comparison_bar_labels
    const backendCurrent = kpiData?.comparison_bar_current
    const backendPrevious = kpiData?.comparison_bar_previous
    const backendHasPrevious = kpiData?.comparison_bar_has_previous ?? false

    const safeRatio = periodRatio === 0 ? 1 : periodRatio

    if (
      Array.isArray(backendLabels) && backendLabels.length > 0 &&
      Array.isArray(backendCurrent) && backendCurrent.length > 0
    ) {
      const scaledCurrent = backendCurrent.map((v) => Number(v) * safeRatio)
      const scaledPrevious = Array.isArray(backendPrevious) ? backendPrevious.map((v) => Number(v) * safeRatio) : null
      const total = scaledCurrent.reduce((a, b) => a + b, 0)
      return {
        labels: backendLabels,
        currentValues: scaledCurrent,
        previousValues: backendHasPrevious && Array.isArray(backendPrevious) ? scaledPrevious : null,
        hasComparison: backendHasPrevious && Array.isArray(backendPrevious),
        totalCurrent: Math.round(total),
      }
    }

    const demoLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    const demoCurrent = [18, 22, 20, 24, 19, 26, 28].map((v) => v * safeRatio)
    const demoPrevious = [14, 18, 16, 20, 17, 22, 20].map((v) => v * safeRatio)
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
  const padding = { top: 16, right: 40, bottom: 10, left: 12 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const groupWidth = graphWidth / labels.length

  // ── SPACING FIX ──────────────────────────────────────────────────────────────
  // Root cause of the original bug: the entire groupWidth was consumed by bars
  // (2 × barWidth + innerGap = groupWidth), leaving 0px between product groups.
  //
  // Fix: reserve 30% of each group as outer padding (15% each side), and use
  // only 70% for the two bars + their inner gap.  Inner gap tightened to 4px.
  const CAT_PAD_RATIO = 0.30          // 30% of groupWidth = space between groups
  const innerGap = 4                  // gap between Current and Previous within one group
  const usableWidth = groupWidth * (1 - CAT_PAD_RATIO)
  const barWidth = Math.max(8, hasComparison
    ? (usableWidth - innerGap) / 2
    : usableWidth * 0.8)
  // ─────────────────────────────────────────────────────────────────────────────

  const valueToY = (v) =>
    padding.top + graphHeight - (v / yMax) * graphHeight

  const yTicks = useMemo(() => {
    const step = yMax <= 10 ? 2 : yMax <= 20 ? 5 : Math.ceil(yMax / 5)
    const arr = []
    for (let i = 0; i <= yMax; i += step) arr.push(i)
    if (arr[arr.length - 1] !== yMax) arr.push(yMax)
    return arr
  }, [yMax])

  const fmtTick = (tick) =>
    tick >= 1e6
      ? `${(tick / 1e6).toFixed(1)}M`
      : tick >= 1e3
        ? `${(tick / 1e3).toFixed(0)}k`
        : tick

  const hovered = hoverIndex != null ? {
    label: labels[hoverIndex],
    current: currentValues[hoverIndex] ?? 0,
    previous: hasComparison && previousValues ? (previousValues[hoverIndex] ?? 0) : null,
  } : null

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

      <div className="ocb-chart-wrap" style={{ position: 'relative' }}>
        {/* Hover tooltip */}
        {hovered && (
          <div
            className="ocb-tooltip"
            style={{
              left: `${((padding.left + (hoverIndex + 0.5) * groupWidth) / chartWidth) * 100}%`,
            }}
          >
            <div className="ocb-tooltip-label">{String(hovered.label)}</div>
            <div className="ocb-tooltip-row">
              <span className="ocb-tooltip-swatch ocb-tooltip-swatch--current" />
              Current: <strong>{Math.round(hovered.current).toLocaleString()}</strong>
            </div>
            {hovered.previous != null && (
              <div className="ocb-tooltip-row">
                <span className="ocb-tooltip-swatch ocb-tooltip-swatch--prev" />
                Previous: <strong>{Math.round(hovered.previous).toLocaleString()}</strong>
              </div>
            )}
          </div>
        )}

        <svg
          className="ocb-chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {labels.map((label, i) => {
              const groupCenter = padding.left + (i + 0.5) * groupWidth
              const currentVal = currentValues[i] || 0
              const currentH = (currentVal / yMax) * graphHeight
              const currentX = hasComparison
                ? groupCenter - innerGap / 2 - barWidth
                : groupCenter - barWidth / 2
              return (
                <clipPath key={`ocb-clip-${String(label)}-${i}`} id={`ocb-clip-${i}`}>
                  <rect
                    x={currentX}
                    y={valueToY(currentVal)}
                    width={barWidth}
                    height={currentH}
                    rx="3"
                  />
                </clipPath>
              )
            })}
          </defs>

          {/* Horizontal grid */}
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
                {fmtTick(tick)}
              </text>
            ))}
          </g>

          {/* Hover column highlight */}
          {hoverIndex != null && (
            <rect
              x={padding.left + hoverIndex * groupWidth}
              y={padding.top}
              width={groupWidth}
              height={graphHeight}
              fill="rgba(0,0,0,0.04)"
              rx="3"
              pointerEvents="none"
            />
          )}

          {/* Bars */}
          {labels.map((label, i) => {
            const groupCenter = padding.left + (i + 0.5) * groupWidth
            const isHovered = hoverIndex === i

            const currentVal = currentValues[i] || 0
            const currentH = (currentVal / yMax) * graphHeight
            const currentX = hasComparison
              ? groupCenter - innerGap / 2 - barWidth
              : groupCenter - barWidth / 2

            const prevVal = hasComparison && previousValues ? (previousValues[i] || 0) : null
            const prevH = prevVal != null ? (prevVal / yMax) * graphHeight : 0
            const prevX = groupCenter + innerGap / 2

            return (
              <g
                key={label}
                className="ocb-bar-group"
                onMouseEnter={() => setHoverIndex(i)}
                style={{ cursor: 'default' }}
              >
                {/* invisible hit zone for the whole group */}
                <rect
                  x={padding.left + i * groupWidth}
                  y={padding.top}
                  width={groupWidth}
                  height={graphHeight}
                  fill="transparent"
                />
                <rect
                  x={currentX}
                  y={valueToY(currentVal)}
                  width={barWidth}
                  height={currentH}
                  fill={isHovered ? '#1d4ed8' : '#2563eb'}
                  rx="3"
                  className="ocb-bar"
                />
                {hasComparison && prevVal != null && (
                  <rect
                    x={prevX}
                    y={valueToY(prevVal)}
                    width={barWidth}
                    height={prevH}
                    fill={isHovered ? '#93c5fd' : '#bfdbfe'}
                    rx="3"
                    className="ocb-bar"
                  />
                )}
                {currentH >= 28 && (() => {
                  const cx = currentX + barWidth / 2
                  const cy = valueToY(currentVal) + currentH / 2
                  const fittedTextLength = Math.max(10, currentH - 12)
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(-90 ${cx} ${cy})`}
                      clipPath={`url(#ocb-clip-${i})`}
                      className="ocb-bar-label"
                      textLength={fittedTextLength}
                      lengthAdjust="spacing"
                      style={{ fontSize: `${Math.max(7, Math.min(10, barWidth - 2))}px` }}
                    >
                      {String(label)}
                    </text>
                  )
                })()}
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

        </svg>
      </div>
    </div>
  )
}

export default OrdersComparisonBarChart
