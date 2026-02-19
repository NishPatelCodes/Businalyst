import React, { useState, useRef, useEffect, useContext, useMemo } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './LineChart.css'

const PLACEHOLDER_DATA = [
  { date: 'Jul', value: 550000 },
  { date: 'Aug', value: 320000 },
  { date: 'Sep', value: 480000 },
  { date: 'Oct', value: 560000 },
  { date: 'Nov', value: 520000 },
  { date: 'Dec', value: 452264 },
]

const getDataPointsForRange = (allData, range) => {
  if (!allData || allData.length === 0) return allData

  const now = new Date()
  let cutoffDate = new Date()

  switch (range) {
    case '1H':
      cutoffDate.setHours(now.getHours() - 1)
      break
    case '24H':
      cutoffDate.setHours(now.getHours() - 24)
      break
    case '1W':
      cutoffDate.setDate(now.getDate() - 7)
      break
    case '1M':
      cutoffDate.setMonth(now.getMonth() - 1)
      break
    case '3M':
      cutoffDate.setMonth(now.getMonth() - 3)
      break
    case '1Y':
      cutoffDate.setFullYear(now.getFullYear() - 1)
      break
    case '5Y':
      cutoffDate.setFullYear(now.getFullYear() - 5)
      break
    default:
      return allData
  }

  return allData
}

const LineChart = () => {
  const { kpiData } = useContext(KpiContext)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedRange] = useState('1Y')
  const [selectedTab, setSelectedTab] = useState('Revenue')
  const chartRef = useRef(null)
  const tooltipTimeoutRef = useRef(null)
  const lastMousePositionRef = useRef({ x: 0, y: 0 })

  const chartData = useMemo(() => {
    const dates = kpiData?.date_data
    const revenue = kpiData?.revenue_data
    const profit = kpiData?.profit_data
    let allData = []

    if (dates?.length && (selectedTab === 'Revenue' ? revenue : profit)) {
      const values = selectedTab === 'Revenue' ? revenue : profit
      const len = Math.min(dates.length, values.length)
      if (len > 0) {
        allData = Array.from({ length: len }, (_, i) => ({
          date: dates[i],
          rawDate: dates[i],
          value: Number(values[i]) || 0,
        }))
      }
    } else {
      allData = PLACEHOLDER_DATA.map((d, i) => ({ ...d, rawDate: d.date }))
    }

    const filteredData = getDataPointsForRange(allData, selectedRange)
    let maxPoints = filteredData.length
    switch (selectedRange) {
      case '1H': maxPoints = Math.min(maxPoints, 12); break
      case '24H': maxPoints = Math.min(maxPoints, 24); break
      case '1W': maxPoints = Math.min(maxPoints, 7); break
      case '1M': maxPoints = Math.min(maxPoints, 30); break
      case '3M': maxPoints = Math.min(maxPoints, 12); break
      case '1Y': maxPoints = Math.min(maxPoints, 12); break
      case '5Y': maxPoints = Math.min(maxPoints, 20); break
    }

    let sampledData = filteredData
    if (filteredData.length > maxPoints) {
      const step = filteredData.length / maxPoints
      sampledData = []
      for (let i = 0; i < maxPoints; i++) {
        const index = Math.floor(i * step)
        sampledData.push(filteredData[index])
      }
      if (sampledData[sampledData.length - 1] !== filteredData[filteredData.length - 1]) {
        sampledData[sampledData.length - 1] = filteredData[filteredData.length - 1]
      }
    }

    return sampledData.map((d) => ({ ...d, date: d.rawDate ?? d.date ?? '' }))
  }, [kpiData?.date_data, kpiData?.revenue_data, kpiData?.profit_data, selectedTab, selectedRange])

  const chartWidth = 1200
  const chartHeight = 320
  const padding = { top: 17, right: 24, bottom: 34, left: 72 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const values = chartData.map((d) => d.value)
  const yMin = Math.min(...values)
  const yMax = Math.max(...values)
  // Always start Y-axis from 0 (X-axis baseline)
  const yAxisMin = 0
  // Add small padding at the top only
  const yPadding = (yMax - yMin) * 0.05 || 1
  const yAxisMax = yMax + yPadding

  const valueToY = (value) => {
    // Ensure value is never below 0 for positioning
    const safeValue = Math.max(0, value)
    return padding.top + graphHeight - ((safeValue - yAxisMin) / (yAxisMax - yAxisMin)) * graphHeight
  }
  const indexToX = (index) =>
    padding.left + (index / Math.max(chartData.length - 1, 1)) * graphWidth

  const points = chartData.map((d, i) => ({
    x: indexToX(i),
    y: valueToY(d.value),
    ...d
  }))

  const getYAxisTicks = () => {
    // Always start from 0 (X-axis baseline)
    const range = yAxisMax - 0
    // Use smaller step to get more ticks and reduce gaps
    const roughStep = range / 5 // Reduced from 6 to 5 for more ticks
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)))
    const step = Math.ceil(roughStep / mag) * mag
    
    const ticks = [0] // Always start with 0 at X-axis
    
    // Add ticks above 0 with smaller step
    for (let v = step; v <= yAxisMax + step * 0.5; v += step) {
      ticks.push(v)
    }
    
    // Ensure we include the max value if it's not already there
    if (ticks[ticks.length - 1] < yAxisMax * 0.9) {
      ticks.push(Math.ceil(yAxisMax / step) * step)
    }
    
    // Remove duplicates and sort
    return [...new Set(ticks)].sort((a, b) => a - b)
  }
  const yAxisTicks = getYAxisTicks()

  const getSharpPath = () => {
    if (points.length < 2) return ''
    let path = `M ${points[0].x} ${points[0].y} `
    for (let i = 1; i < points.length; i++) path += `L ${points[i].x} ${points[i].y} `
    return path
  }

  const linePath = getSharpPath()
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
  const lastPoint = points[points.length - 1]
  const baselineY = padding.top + graphHeight

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value.toFixed(0)}`
  }
  const formatCurrencyExact = (value) => {
    const n = Number(value)
    if (Number.isNaN(n)) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
  }

  useEffect(() => () => { if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current) }, [])

  const handleMouseMove = (e) => {
    if (!chartRef.current) return
    if (lastMousePositionRef.current.x === 0 && lastMousePositionRef.current.y === 0) {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY }
      return
    }
    const mouseMoved = Math.abs(e.clientX - lastMousePositionRef.current.x) > 5 || Math.abs(e.clientY - lastMousePositionRef.current.y) > 5
    if (mouseMoved) {
      if (tooltipTimeoutRef.current) { clearTimeout(tooltipTimeoutRef.current); tooltipTimeoutRef.current = null }
      setShowTooltip(false)
    }
    lastMousePositionRef.current = { x: e.clientX, y: e.clientY }
    const rect = chartRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (chartWidth / rect.width)
    let closestIndex = 0, minDistance = Infinity
    points.forEach((pt, index) => {
      const distance = Math.abs(x - pt.x)
      if (distance < minDistance) { minDistance = distance; closestIndex = index }
    })
    setHoveredPoint(closestIndex)
    let left = e.clientX, top = e.clientY - 48
    if (left - 88 < 0) left = 88
    else if (left + 88 > window.innerWidth) left = window.innerWidth - 88
    if (top < 0) top = e.clientY + 20
    setTooltipPosition({ x: left, y: top })
    if (!mouseMoved && !tooltipTimeoutRef.current) {
      tooltipTimeoutRef.current = setTimeout(() => { setShowTooltip(true); tooltipTimeoutRef.current = null }, 500)
    }
  }

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    setHoveredPoint(null)
    setShowTooltip(false)
  }
  const currentValue = chartData.length ? chartData[chartData.length - 1].value : 0
  const getDelta = (index) => {
    if (index <= 0) return null
    const current = chartData[index].value
    const previous = chartData[index - 1].value
    const delta = current - previous
    const isPositive = delta >= 0
    const formatted = formatCurrencyExact(Math.abs(delta))
    return { value: delta, formatted, isPositive, text: `${isPositive ? '+' : '-'}${formatted} from ${chartData[index - 1].date}` }
  }

  return (
    <div className="line-chart line-chart--wealthsimple">
      <div className="line-chart-header">
        <div className="chart-header-left">
          <div className="line-chart-tabs">
            <button className={`line-chart-tab ${selectedTab === 'Revenue' ? 'line-chart-tab--active' : ''}`} onClick={() => setSelectedTab('Revenue')}>Revenue</button>
            <button className={`line-chart-tab ${selectedTab === 'Profit' ? 'line-chart-tab--active' : ''}`} onClick={() => setSelectedTab('Profit')}>Profit</button>
          </div>
        </div>
      </div>
      <div className="line-chart-container">
        <svg ref={chartRef} className="line-chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <defs>
            <linearGradient id="wealthsimpleGreenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <g className="chart-y-axis" aria-hidden="true">
            {yAxisTicks.map((value) => {
              // For value 0, position exactly at baseline, for others position above
              const yPos = value === 0 
                ? baselineY + 4  // 0 label at X-axis baseline
                : valueToY(value) + 4  // Other labels above baseline
              return (
                <text key={value} x={padding.left - 10} y={yPos} textAnchor="end" className="chart-axis-label">
                  {formatCurrency(value)}
                </text>
              )
            })}
          </g>
          <line x1={padding.left} y1={baselineY} x2={padding.left + graphWidth} y2={baselineY} className="chart-baseline" strokeWidth="1" />
          {chartData.length > 0 && (
            <line x1={padding.left} y1={valueToY(chartData[0].value)} x2={padding.left + graphWidth} y2={valueToY(chartData[0].value)} className="chart-reference-line" strokeWidth="1" />
          )}
          <path d={areaPath} className="chart-area-wealthsimple" fill="url(#wealthsimpleGreenGradient)" />
          <path d={linePath} className="chart-line-wealthsimple" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {lastPoint && <circle cx={lastPoint.x} cy={lastPoint.y} r="5" className="chart-last-point" />}
          <g className="chart-x-axis" aria-hidden="true">
            {(() => {
              const totalPoints = chartData.length
              const minLabelSpacing = 80 // Minimum pixels between labels to prevent overlap
              const visibleLabels = []
              const labelPositions = []
              
              // Always show first and last
              if (totalPoints > 0) {
                visibleLabels.push(0)
                labelPositions.push(indexToX(0))
                if (totalPoints > 1) {
                  visibleLabels.push(totalPoints - 1)
                  labelPositions.push(indexToX(totalPoints - 1))
                }
              }
              
              // Add intermediate labels with spacing check
              if (totalPoints > 2) {
                const step = totalPoints <= 7 ? 1 : totalPoints <= 12 ? 2 : totalPoints <= 24 ? 3 : Math.ceil(totalPoints / 6)
                for (let i = step; i < totalPoints - 1; i += step) {
                  const x = indexToX(i)
                  // Check if this label is far enough from previous labels
                  const tooClose = labelPositions.some(pos => Math.abs(x - pos) < minLabelSpacing)
                  if (!tooClose) {
                    visibleLabels.push(i)
                    labelPositions.push(x)
                  }
                }
              }
              
              // Format date to "DD Mon" format (e.g., "17 Mar")
              const formatDateLabel = (dateStr) => {
                if (!dateStr) return ''
                try {
                  // Try to parse as date
                  const date = new Date(dateStr)
                  if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0')
                    const month = date.toLocaleDateString('en-US', { month: 'short' })
                    return `${day} ${month}`
                  }
                } catch (e) {
                  // If parsing fails, try regex match for YYYY-MM-DD format
                  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const date = new Date(dateStr)
                    const day = date.getDate().toString().padStart(2, '0')
                    const month = date.toLocaleDateString('en-US', { month: 'short' })
                    return `${day} ${month}`
                  }
                }
                // If it's already in a different format, try to extract and reformat
                return dateStr
              }
              
              return visibleLabels.map((index) => {
                const x = indexToX(index)
                const isFirst = index === 0
                const isLast = index === totalPoints - 1
                const textAnchor = isFirst ? 'start' : isLast ? 'end' : 'middle'
                const xOffset = isFirst ? 2 : isLast ? -2 : 0
                return (
                  <text key={index} x={x + xOffset} y={baselineY + 20} textAnchor={textAnchor} className="chart-axis-label">
                    {formatDateLabel(chartData[index].date)}
                  </text>
                )
              })
            })()}
          </g>
          {points.map((pt, index) => (
            <circle key={index} cx={pt.x} cy={pt.y} r="14" fill="transparent" className="data-point-hit" />
          ))}
        </svg>
        {hoveredPoint !== null && showTooltip && (
          <div className={`chart-tooltip chart-tooltip--wealthsimple ${showTooltip ? 'chart-tooltip--visible' : ''}`} style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
            <div className="tooltip-date">{chartData[hoveredPoint].date}</div>
            <div className="tooltip-value">{formatCurrencyExact(chartData[hoveredPoint].value)}</div>
            {getDelta(hoveredPoint) && (
              <div className={`tooltip-delta ${getDelta(hoveredPoint).isPositive ? 'tooltip-delta--positive' : 'tooltip-delta--negative'}`}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {getDelta(hoveredPoint).isPositive ? <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/> : <path d="M6 10L2 6H5V2H7V6H10L6 10Z" fill="currentColor"/>}
                </svg>
                <span>{getDelta(hoveredPoint).text}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LineChart
