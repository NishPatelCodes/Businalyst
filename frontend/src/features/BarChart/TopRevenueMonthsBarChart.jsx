import React, { useContext, useMemo } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './BarChart.css'

/* Apple blue gradient for Revenue page */
const BAR_GRADIENT_ID = 'revenueBarGradient'

const TopRevenueMonthsBarChart = () => {
  const { kpiData } = useContext(KpiContext)

  const top3Months = useMemo(() => {
    if (!kpiData?.date_data || !kpiData?.revenue_data) {
      return [
        { month: 'Jan', revenue: 165000 },
        { month: 'Feb', revenue: 142000 },
        { month: 'Mar', revenue: 128000 },
      ]
    }

    const dates = kpiData.date_data
    const revenues = kpiData.revenue_data
    const monthData = new Map()

    dates.forEach((dateStr, i) => {
      try {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`
          const monthName = date.toLocaleDateString('en-US', { month: 'short' })
          const revenue = Number(revenues[i]) || 0

          if (monthData.has(monthKey)) {
            monthData.set(monthKey, {
              month: monthName,
              revenue: monthData.get(monthKey).revenue + revenue,
            })
          } else {
            monthData.set(monthKey, {
              month: monthName,
              revenue: revenue,
            })
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    })

    return Array.from(monthData.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
  }, [kpiData?.date_data, kpiData?.revenue_data])

  const chartData = top3Months.map(m => ({
    month: m.month,
    value: m.revenue / 1000,
  }))

  const minValue = 0
  const maxValue = Math.max(4, ...chartData.map(d => Math.max(0, d.value)))

  const yAxisLabels = useMemo(() => {
    const labels = []
    for (let i = 0; i <= 4; i++) {
      labels.push((maxValue * i) / 4)
    }
    return labels
  }, [maxValue])

  const chartWidth = 400
  const chartHeight = 250
  const padding = { top: 20, right: 40, bottom: 40, left: 40 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom
  const barWidth = graphWidth / chartData.length - 10
  const barSpacing = 10

  return (
    <div className="orders-list">
      <div className="orders-chart-container">
        <svg className="orders-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={BAR_GRADIENT_ID} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#007AFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#007AFF" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <g className="grid-lines">
            {yAxisLabels.filter(value => value > 0).map((value, index) => {
              const y = padding.top + graphHeight - (value / maxValue) * graphHeight
              return (
                <line
                  key={index}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              )
            })}
          </g>
          <g className="y-axis-labels">
            {yAxisLabels.map((value, index) => {
              const baselineY = padding.top + graphHeight
              const y = value === 0 ? baselineY : baselineY - (value / maxValue) * graphHeight
              return (
                <text
                  key={index}
                  x={padding.left - 5}
                  y={y + 4}
                  textAnchor="end"
                  className="axis-label"
                  fill="#6b7280"
                  fontSize="11"
                >
                  {value === 0 ? '0' : `${value.toFixed(0)}k`}
                </text>
              )
            })}
          </g>
          {chartData.map((monthData, index) => {
            const safeValue = Math.max(0, monthData.value)
            const barHeight = (safeValue / maxValue) * graphHeight
            const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
            const baselineY = padding.top + graphHeight
            const barY = baselineY - barHeight
            const cornerRadius = 6

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
                fill={`url(#${BAR_GRADIENT_ID})`}
                className="bar-segment"
              />
            )
          })}
          <g className="x-axis-labels">
            {chartData.map((monthData, index) => {
              const barX = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
              return (
                <text
                  key={index}
                  x={barX + barWidth / 2}
                  y={padding.top + graphHeight + 20}
                  textAnchor="middle"
                  className="axis-label"
                  fill="#6b7280"
                  fontSize="12"
                >
                  {monthData.month}
                </text>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}

export default TopRevenueMonthsBarChart
