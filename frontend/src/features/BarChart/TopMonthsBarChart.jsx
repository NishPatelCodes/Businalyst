import React, { useContext, useMemo } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './BarChart.css'

const TopMonthsBarChart = () => {
  const { kpiData } = useContext(KpiContext)

  // Calculate top 3 profitable months
  const top3Months = useMemo(() => {
    if (!kpiData?.date_data || !kpiData?.profit_data) {
      return [
        { month: 'Jan', profit: 125000 },
        { month: 'Feb', profit: 98000 },
        { month: 'Mar', profit: 87000 },
      ]
    }

    const dates = kpiData.date_data
    const profits = kpiData.profit_data
    const monthData = new Map()

    // Group profits by month
    dates.forEach((dateStr, i) => {
      try {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`
          const monthName = date.toLocaleDateString('en-US', { month: 'short' })
          const profit = Number(profits[i]) || 0
          
          if (monthData.has(monthKey)) {
            monthData.set(monthKey, {
              month: monthName,
              profit: monthData.get(monthKey).profit + profit,
            })
          } else {
            monthData.set(monthKey, {
              month: monthName,
              profit: profit,
            })
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    })

    // Sort by profit and get top 3
    return Array.from(monthData.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 3)
  }, [kpiData?.date_data, kpiData?.profit_data])

  // Convert profit to thousands for display
  const chartData = top3Months.map(m => ({
    month: m.month,
    value: m.profit / 1000 // Convert to thousands
  }))

  // Ensure all values are non-negative
  const minValue = 0
  const maxValue = Math.max(4, ...chartData.map(d => Math.max(0, d.value)))
  
  // Generate Y-axis labels (5 evenly spaced values)
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

          {/* Grid lines - horizontal grey lines (only above baseline) */}
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
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              )
            })}
          </g>

          {/* Y-axis labels */}
          <g className="y-axis-labels">
            {yAxisLabels.map((value, index) => {
              // Ensure 0 is always at the baseline (X-axis)
              const baselineY = padding.top + graphHeight
              const y = value === 0 ? baselineY : baselineY - (value / maxValue) * graphHeight
              return (
                <text
                  key={index}
                  x={padding.left - 5}
                  y={y + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {value === 0 ? '0' : `${value.toFixed(0)}k`}
                </text>
              )
            })}
          </g>

          {/* Bars */}
          {chartData.map((monthData, index) => {
            // Ensure value is never negative and calculate height from 0
            const safeValue = Math.max(0, monthData.value)
            const barHeight = (safeValue / maxValue) * graphHeight
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
              />
            )
          })}

          {/* X-axis labels */}
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

export default TopMonthsBarChart

