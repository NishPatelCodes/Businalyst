import React, { useState, useRef, useEffect } from 'react'
import './LeadsChart.css'

const TIME_RANGES = ['1H', '24H', '1W', '1M', '3M', '1Y', '5Y']

const LeadsChart = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedRange, setSelectedRange] = useState('24H')
  const [selectedTab, setSelectedTab] = useState('Revenue')
  const chartRef = useRef(null)
  const tooltipTimeoutRef = useRef(null)
  const lastMousePositionRef = useRef({ x: 0, y: 0 })

  const chartData = [
    { date: 'Jul', value: 550000 },
    { date: 'Aug', value: 320000 },
    { date: 'Sep', value: 480000 },
    { date: 'Oct', value: 560000 },
    { date: 'Nov', value: 520000 },
    { date: 'Dec', value: 452264 }
  ]

  const chartWidth = 1200
  const chartHeight = 272
  const padding = { top: 17, right: 24, bottom: 34, left: 56 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const values = chartData.map((d) => d.value)
  const yMin = Math.min(...values)
  const yMax = Math.max(...values)
  const yPadding = (yMax - yMin) * 0.1 || 1
  const yAxisMin = yMin - yPadding
  const yAxisMax = yMax + yPadding

  const valueToY = (value) =>
    padding.top + graphHeight - ((value - yAxisMin) / (yAxisMax - yAxisMin)) * graphHeight

  const indexToX = (index) =>
    padding.left + (index / Math.max(chartData.length - 1, 1)) * graphWidth

  const points = chartData.map((d, i) => ({
    x: indexToX(i),
    y: valueToY(d.value),
    ...d
  }))

  const getYAxisTicks = () => {
    const range = yAxisMax - yAxisMin
    const roughStep = range / 6
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)))
    const step = Math.ceil(roughStep / mag) * mag
    const first = Math.floor(yAxisMin / step) * step
    const ticks = []
    for (let v = first; v <= yAxisMax + step * 0.5; v += step) {
      if (v >= yAxisMin - step * 0.5) ticks.push(v)
    }
    return ticks.length ? ticks : [yAxisMin, yAxisMax]
  }
  const yAxisTicks = getYAxisTicks()

  const getSharpPath = () => {
    if (points.length < 2) return ''
    let path = `M ${points[0].x} ${points[0].y} `
    for (let i = 1; i < points.length; i++) {
      path += `L ${points[i].x} ${points[i].y} `
    }
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

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

  const handleMouseMove = (e) => {
    if (!chartRef.current) return
    
    // Initialize last position if not set
    if (lastMousePositionRef.current.x === 0 && lastMousePositionRef.current.y === 0) {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY }
      return
    }
    
    // Check if mouse has moved significantly (more than 5px)
    const mouseMoved = Math.abs(e.clientX - lastMousePositionRef.current.x) > 5 || 
                       Math.abs(e.clientY - lastMousePositionRef.current.y) > 5
    
    // If mouse moved significantly, reset tooltip and clear timeout
    if (mouseMoved) {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
        tooltipTimeoutRef.current = null
      }
      setShowTooltip(false)
    }
    
    lastMousePositionRef.current = { x: e.clientX, y: e.clientY }
    
    const rect = chartRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (chartWidth / rect.width)
    let closestIndex = 0
    let minDistance = Infinity
    points.forEach((pt, index) => {
      const distance = Math.abs(x - pt.x)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })
    setHoveredPoint(closestIndex)
    
    const tooltipWidth = 176
    let left = e.clientX
    let top = e.clientY - 48
    if (left - tooltipWidth / 2 < 0) left = tooltipWidth / 2
    else if (left + tooltipWidth / 2 > window.innerWidth) left = window.innerWidth - tooltipWidth / 2
    if (top < 0) top = e.clientY + 20
    setTooltipPosition({ x: left, y: top })
    
    // Only set timeout if mouse hasn't moved significantly and there's no existing timeout
    if (!mouseMoved && !tooltipTimeoutRef.current) {
      // Set timeout to show tooltip after 0.5 seconds of static hover
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true)
        tooltipTimeoutRef.current = null
      }, 500)
    }
  }

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    setHoveredPoint(null)
    setShowTooltip(false)
  }
  const currentValue = chartData[chartData.length - 1].value

  const getDelta = (index) => {
    if (index <= 0) return null
    const current = chartData[index].value
    const previous = chartData[index - 1].value
    const delta = current - previous
    const isPositive = delta >= 0
    const formatted = formatCurrency(Math.abs(delta))
    return {
      value: delta,
      formatted,
      isPositive,
      text: `${isPositive ? '+' : '-'}${formatted} from ${chartData[index - 1].date}`
    }
  }

  return (
    <div className="leads-chart leads-chart--wealthsimple">
      <div className="leads-chart-header">
        <div className="chart-header-left">
          <div className="leads-chart-tabs">
            <button
              className={`leads-chart-tab ${selectedTab === 'Revenue' ? 'leads-chart-tab--active' : ''}`}
              onClick={() => setSelectedTab('Revenue')}
            >
              Revenue
            </button>
            <button
              className={`leads-chart-tab ${selectedTab === 'Profit' ? 'leads-chart-tab--active' : ''}`}
              onClick={() => setSelectedTab('Profit')}
            >
              Profit
            </button>
          </div>
        </div>
        <div className="chart-current-value">
          <div className="current-value-label">Current</div>
          <div className="current-value-amount">{formatCurrency(currentValue)}</div>
        </div>
      </div>

      <div className="leads-chart-container">
        <svg
          ref={chartRef}
          className="leads-chart-svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="wealthsimpleGreenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <g className="chart-y-axis" aria-hidden="true">
            {yAxisTicks.map((value) => {
              const y = valueToY(value)
              return (
                <text key={value} x={padding.left - 10} y={y + 4} textAnchor="end" className="chart-axis-label">
                  {formatCurrency(value)}
                </text>
              )
            })}
          </g>

          <line x1={padding.left} y1={baselineY} x2={padding.left + graphWidth} y2={baselineY} className="chart-baseline" strokeWidth="1" />
          <line x1={padding.left} y1={valueToY(chartData[0].value)} x2={padding.left + graphWidth} y2={valueToY(chartData[0].value)} className="chart-reference-line" strokeWidth="1" />
          <path d={areaPath} className="chart-area-wealthsimple" fill="url(#wealthsimpleGreenGradient)" />
          <path d={linePath} className="chart-line-wealthsimple" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastPoint.x} cy={lastPoint.y} r="5" className="chart-last-point" />

          <g className="chart-x-axis" aria-hidden="true">
            {chartData.map((d, index) => {
              if (index === 0 || index === chartData.length - 1 || index % 2 === 0) {
                return (
                  <text key={index} x={indexToX(index)} y={baselineY + 20} textAnchor="middle" className="chart-axis-label">
                    {d.date}
                  </text>
                )
              }
              return null
            })}
          </g>

          {points.map((pt, index) => (
            <circle key={index} cx={pt.x} cy={pt.y} r="14" fill="transparent" className="data-point-hit" />
          ))}
        </svg>

        {hoveredPoint !== null && showTooltip && (
          <div className={`chart-tooltip chart-tooltip--wealthsimple ${showTooltip ? 'chart-tooltip--visible' : ''}`} style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
            <div className="tooltip-date">{chartData[hoveredPoint].date}</div>
            <div className="tooltip-value">{formatCurrency(chartData[hoveredPoint].value)}</div>
            {getDelta(hoveredPoint) && (
              <div className={`tooltip-delta ${getDelta(hoveredPoint).isPositive ? 'tooltip-delta--positive' : 'tooltip-delta--negative'}`}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {getDelta(hoveredPoint).isPositive ? (
                    <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
                  ) : (
                    <path d="M6 10L2 6H5V2H7V6H10L6 10Z" fill="currentColor"/>
                  )}
                </svg>
                <span>{getDelta(hoveredPoint).text}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="chart-time-ranges">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            type="button"
            className={`chart-time-range-pill ${selectedRange === range ? 'chart-time-range-pill--active' : ''}`}
            onClick={() => setSelectedRange(range)}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LeadsChart
