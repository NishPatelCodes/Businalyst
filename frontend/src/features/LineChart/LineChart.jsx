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

// Helper function to parse date string
const parseDate = (dateStr) => {
  if (!dateStr) return null
  try {
    // Try parsing as ISO date (YYYY-MM-DD)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(dateStr)
    }
    // Try parsing as Date object
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date
    }
  } catch (e) {
    // Try other formats
    return new Date(dateStr)
  }
  return null
}

// Analyze date range and determine X-axis interval strategy
const analyzeDateRange = (data) => {
  if (!data || data.length === 0) {
    return { interval: 'month', format: 'month', step: 1 }
  }

  const dates = data
    .map(d => parseDate(d.date || d.rawDate))
    .filter(d => d !== null)
    .sort((a, b) => a - b)

  if (dates.length === 0) {
    return { interval: 'month', format: 'month', step: 1 }
  }

  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]
  const diffMs = lastDate - firstDate
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  const diffMonths = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                     (lastDate.getMonth() - firstDate.getMonth())
  const diffYears = lastDate.getFullYear() - firstDate.getFullYear()

  // Determine interval based on date range
  if (diffDays <= 1) {
    // Less than 1 day: show hourly
    return { interval: 'hour', format: 'hour', step: 1 }
  } else if (diffDays <= 7) {
    // 1 week or less: show daily
    return { interval: 'day', format: 'day', step: 1 }
  } else if (diffDays <= 31) {
    // 1 month or less: show daily with step
    const step = diffDays <= 14 ? 1 : diffDays <= 21 ? 2 : 3
    return { interval: 'day', format: 'day', step }
  } else if (diffDays <= 90) {
    // 3 months or less: show weekly
    return { interval: 'week', format: 'week', step: 1 }
  } else if (diffMonths <= 12) {
    // 1 year or less: show monthly
    return { interval: 'month', format: 'month', step: 1 }
  } else if (diffYears <= 2) {
    // 2 years or less: show bi-monthly
    return { interval: 'month', format: 'month', step: 2 }
  } else if (diffYears <= 5) {
    // 5 years or less: show quarterly
    return { interval: 'month', format: 'month', step: 3 }
  } else {
    // More than 5 years: show yearly
    return { interval: 'year', format: 'year', step: 1 }
  }
}

// Generate X-axis labels based on date range analysis
const generateXAxisLabels = (data, dateStrategy) => {
  if (!data || data.length === 0) return []

  const dates = data.map((d, i) => ({
    index: i,
    date: parseDate(d.date || d.rawDate),
    original: d.date || d.rawDate
  })).filter(d => d.date !== null)

  if (dates.length === 0) return []

  const labels = []
  const { interval, format, step } = dateStrategy

  // Always include first and last
  labels.push({ index: dates[0].index, date: dates[0].date, original: dates[0].original })

  if (dates.length > 1) {
    labels.push({ 
      index: dates[dates.length - 1].index, 
      date: dates[dates.length - 1].date, 
      original: dates[dates.length - 1].original 
    })
  }

  // Generate intermediate labels based on strategy
  if (dates.length > 2) {
    const firstDate = dates[0].date
    const lastDate = dates[dates.length - 1].date

    if (interval === 'day') {
      // Daily labels
      let currentDate = new Date(firstDate)
      currentDate.setDate(currentDate.getDate() + step)
      while (currentDate < lastDate) {
        // Find closest data point to this date
        let closest = dates[0]
        let minDiff = Math.abs(currentDate - dates[0].date)
        dates.forEach(d => {
          const diff = Math.abs(currentDate - d.date)
          if (diff < minDiff) {
            minDiff = diff
            closest = d
          }
        })
        if (!labels.find(l => l.index === closest.index)) {
          labels.push({ index: closest.index, date: closest.date, original: closest.original })
        }
        currentDate.setDate(currentDate.getDate() + step)
      }
    } else if (interval === 'week') {
      // Weekly labels
      let currentDate = new Date(firstDate)
      currentDate.setDate(currentDate.getDate() + (7 * step))
      while (currentDate < lastDate) {
        let closest = dates[0]
        let minDiff = Math.abs(currentDate - dates[0].date)
        dates.forEach(d => {
          const diff = Math.abs(currentDate - d.date)
          if (diff < minDiff) {
            minDiff = diff
            closest = d
          }
        })
        if (!labels.find(l => l.index === closest.index)) {
          labels.push({ index: closest.index, date: closest.date, original: closest.original })
        }
        currentDate.setDate(currentDate.getDate() + (7 * step))
      }
    } else if (interval === 'month') {
      // Monthly labels
      let currentDate = new Date(firstDate)
      currentDate.setMonth(currentDate.getMonth() + step)
      while (currentDate < lastDate) {
        let closest = dates[0]
        let minDiff = Math.abs(currentDate - dates[0].date)
        dates.forEach(d => {
          const diff = Math.abs(currentDate - d.date)
          if (diff < minDiff) {
            minDiff = diff
            closest = d
          }
        })
        if (!labels.find(l => l.index === closest.index)) {
          labels.push({ index: closest.index, date: closest.date, original: closest.original })
        }
        currentDate.setMonth(currentDate.getMonth() + step)
      }
    } else if (interval === 'year') {
      // Yearly labels
      let currentDate = new Date(firstDate)
      currentDate.setFullYear(currentDate.getFullYear() + step)
      while (currentDate < lastDate) {
        let closest = dates[0]
        let minDiff = Math.abs(currentDate - dates[0].date)
        dates.forEach(d => {
          const diff = Math.abs(currentDate - d.date)
          if (diff < minDiff) {
            minDiff = diff
            closest = d
          }
        })
        if (!labels.find(l => l.index === closest.index)) {
          labels.push({ index: closest.index, date: closest.date, original: closest.original })
        }
        currentDate.setFullYear(currentDate.getFullYear() + step)
      }
    } else {
      // Hourly or fallback: use evenly spaced indices
      const stepSize = Math.max(1, Math.floor(dates.length / 8))
      for (let i = stepSize; i < dates.length - 1; i += stepSize) {
        if (!labels.find(l => l.index === dates[i].index)) {
          labels.push({ index: dates[i].index, date: dates[i].date, original: dates[i].original })
        }
      }
    }
  }

  return labels.sort((a, b) => a.index - b.index)
}

// Format date label based on interval type
const formatDateLabel = (dateStr, dateStrategy) => {
  if (!dateStr) return ''
  const date = parseDate(dateStr)
  if (!date || isNaN(date.getTime())) return dateStr

  const { interval, format } = dateStrategy

  if (format === 'hour') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (format === 'day') {
    return date.getDate().toString()
  } else if (format === 'week') {
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    return `${day} ${month}`
  } else if (format === 'month') {
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    // Show year only if it's different from previous/next or if span is multi-year
    return `${month} ${year}`
  } else if (format === 'year') {
    return date.getFullYear().toString()
  } else {
    // Default: day month
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    return `${day} ${month}`
  }
}

const getDataPointsForRange = (allData, range) => {
  if (!allData || allData.length === 0) return allData
  return allData
}

const LineChart = ({ hideTabs = false, metric }) => {
  const { kpiData } = useContext(KpiContext)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedRange] = useState('1Y')
  const initialTab = hideTabs ? (metric === 'revenue' ? 'Revenue' : 'Profit') : 'Revenue'
  const [selectedTab, setSelectedTab] = useState(initialTab)
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
    
    // Fill missing dates with 0 values to ensure alignment with X-axis
    // But preserve all original data points
    if (filteredData.length > 0) {
      // Parse all dates and find the range
      const parsedData = filteredData
        .map(d => {
          const parsed = parseDate(d.date || d.rawDate)
          return {
            date: parsed,
            original: d,
            dateStr: d.date || d.rawDate || ''
          }
        })
        .filter(d => d.date !== null)
        .sort((a, b) => a.date - b.date)

      if (parsedData.length > 0) {
        const firstDate = new Date(parsedData[0].date)
        const lastDate = new Date(parsedData[parsedData.length - 1].date)
        const dateStrategy = analyzeDateRange(filteredData)
        
        // Create a map of existing data by normalized date string (for exact matches)
        const dataMap = new Map()
        parsedData.forEach(({ date, original }) => {
          const dateKey = date.toISOString().split('T')[0]
          // Store with date key and also with original date string for lookup
          if (!dataMap.has(dateKey)) {
            dataMap.set(dateKey, original)
          }
          dataMap.set(original.date || original.rawDate || dateKey, original)
        })

        // Also create a map by date object for closest matching
        const dataByDate = new Map()
        parsedData.forEach(({ date, original }) => {
          const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
          if (!dataByDate.has(dateKey)) {
            dataByDate.set(dateKey, original)
          }
        })

        // Generate all dates in the range based on interval
        const filledData = []
        const { interval, step } = dateStrategy
        
        let currentDate = new Date(firstDate)
        currentDate.setHours(0, 0, 0, 0) // Normalize to start of day
        
        // Helper to find data for a given date
        const findDataForDate = (targetDate) => {
          const targetKey = targetDate.toISOString().split('T')[0]
          const dateKey = `${targetDate.getFullYear()}-${targetDate.getMonth()}-${targetDate.getDate()}`
          
          // Try exact match first
          if (dataMap.has(targetKey)) {
            return dataMap.get(targetKey)
          }
          if (dataByDate.has(dateKey)) {
            return dataByDate.get(dateKey)
          }
          
          // For daily intervals, find exact day match
          if (interval === 'day') {
            for (const { date, original } of parsedData) {
              if (date.getDate() === targetDate.getDate() &&
                  date.getMonth() === targetDate.getMonth() &&
                  date.getFullYear() === targetDate.getFullYear()) {
                return original
              }
            }
          } else if (interval === 'week') {
            // For weekly, find within 3 days
            for (const { date, original } of parsedData) {
              const diffDays = Math.abs((date - targetDate) / (1000 * 60 * 60 * 24))
              if (diffDays <= 3) {
                return original
              }
            }
          } else if (interval === 'month') {
            // For monthly, find same month
            for (const { date, original } of parsedData) {
              if (date.getMonth() === targetDate.getMonth() &&
                  date.getFullYear() === targetDate.getFullYear()) {
                return original
              }
            }
          } else if (interval === 'year') {
            // For yearly, find same year
            for (const { date, original } of parsedData) {
              if (date.getFullYear() === targetDate.getFullYear()) {
                return original
              }
            }
          }
          
          return null
        }
        
        if (interval === 'day') {
          // Fill daily - generate every day in range
          while (currentDate <= lastDate) {
            const dateKey = currentDate.toISOString().split('T')[0]
            const existing = findDataForDate(currentDate)
            
            filledData.push({
              date: dateKey,
              rawDate: existing ? (existing.date || existing.rawDate || dateKey) : dateKey,
              value: existing ? existing.value : 0,
              hasData: !!existing // Flag to indicate if this is real data or filled
            })
            
            currentDate.setDate(currentDate.getDate() + step)
          }
        } else if (interval === 'week') {
          // Fill weekly
          while (currentDate <= lastDate) {
            const dateKey = currentDate.toISOString().split('T')[0]
            const existing = findDataForDate(currentDate)
            
            filledData.push({
              date: dateKey,
              rawDate: existing ? (existing.date || existing.rawDate || dateKey) : dateKey,
              value: existing ? existing.value : 0,
              hasData: !!existing
            })
            
            currentDate.setDate(currentDate.getDate() + (7 * step))
          }
        } else if (interval === 'month') {
          // Fill monthly - use first day of each month
          while (currentDate <= lastDate) {
            const dateKey = currentDate.toISOString().split('T')[0]
            const existing = findDataForDate(currentDate)
            
            filledData.push({
              date: dateKey,
              rawDate: existing ? (existing.date || existing.rawDate || dateKey) : dateKey,
              value: existing ? existing.value : 0,
              hasData: !!existing
            })
            
            currentDate.setMonth(currentDate.getMonth() + step)
          }
        } else if (interval === 'year') {
          // Fill yearly - use first day of each year
          while (currentDate <= lastDate) {
            const dateKey = currentDate.toISOString().split('T')[0]
            const existing = findDataForDate(currentDate)
            
            filledData.push({
              date: dateKey,
              rawDate: existing ? (existing.date || existing.rawDate || dateKey) : dateKey,
              value: existing ? existing.value : 0,
              hasData: !!existing
            })
            
            currentDate.setFullYear(currentDate.getFullYear() + step)
          }
        } else {
          // For other intervals, use original data but ensure all original points are included
          const result = []
          const seen = new Set()
          
          // Add all original data points
          filteredData.forEach(d => {
            const key = d.date || d.rawDate || ''
            if (!seen.has(key)) {
              result.push({
                ...d,
                date: d.rawDate ?? d.date ?? '',
                hasData: true
              })
              seen.add(key)
            }
          })
          
          return result
        }

        // Ensure last date is included
        const lastDateKey = lastDate.toISOString().split('T')[0]
        if (filledData.length === 0 || filledData[filledData.length - 1].date !== lastDateKey) {
          const lastExisting = findDataForDate(lastDate) || parsedData[parsedData.length - 1].original
          filledData.push({
            date: lastDateKey,
            rawDate: lastExisting ? (lastExisting.date || lastExisting.rawDate || lastDateKey) : lastDateKey,
            value: lastExisting ? lastExisting.value : 0,
            hasData: !!lastExisting
          })
        }

        // Merge filled data with all original data points
        // Strategy: Use filled data for alignment, but ensure ALL original data points are included
        const resultMap = new Map()
        
        // First, add all filled points (for alignment)
        filledData.forEach(d => {
          const key = d.date || d.rawDate || ''
          resultMap.set(key, d)
        })
        
        // Then, add ALL original data points (they override filled points at same date)
        // This ensures every date with actual data is included
        parsedData.forEach(({ date, original }) => {
          const dateKey = date.toISOString().split('T')[0]
          const originalKey = original.date || original.rawDate || ''
          
          // Use original data - preserve original date string
          const dataPoint = {
            ...original,
            date: original.rawDate ?? original.date ?? dateKey,
            rawDate: original.rawDate ?? original.date ?? dateKey,
            originalDate: original.date || original.rawDate || dateKey, // Preserve for tooltip
            hasData: true
          }
          
          // Set by normalized date key
          resultMap.set(dateKey, dataPoint)
          
          // Also set by original key if different (to catch all variations)
          if (originalKey && originalKey !== dateKey) {
            resultMap.set(originalKey, dataPoint)
          }
        })

        // Convert to array and sort by date
        const result = Array.from(resultMap.values())
          .sort((a, b) => {
            const dateA = parseDate(a.date || a.rawDate)
            const dateB = parseDate(b.date || b.rawDate)
            if (!dateA || !dateB) return 0
            return dateA - dateB
          })
          .map((d) => ({ 
            ...d, 
            date: d.rawDate ?? d.date ?? '',
            // Preserve original date string for tooltip display
            originalDate: d.originalDate || (d.rawDate ?? d.date ?? '')
          }))

        return result
      }
    }

    return filteredData.map((d) => ({ 
      ...d, 
      date: d.rawDate ?? d.date ?? '' 
    }))
  }, [kpiData?.date_data, kpiData?.revenue_data, kpiData?.profit_data, selectedTab, selectedRange])

  // Analyze date range and determine X-axis strategy
  const dateStrategy = useMemo(() => {
    return analyzeDateRange(chartData)
  }, [chartData])

  // Generate X-axis labels based on strategy
  const xAxisLabels = useMemo(() => {
    return generateXAxisLabels(chartData, dateStrategy)
  }, [chartData, dateStrategy])

  const chartWidth = 1200
  const chartHeight = 400
  const padding = { top: 20, right: 30, bottom: 60, left: 50 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const values = chartData.map((d) => d.value)
  const yMin = Math.min(...values)
  const yMax = Math.max(...values)
  const yAxisMin = 0
  const yPadding = (yMax - yMin) * 0.05 || 1
  const yAxisMax = yMax + yPadding

  const valueToY = (value) => {
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

  // Generate Y-axis ticks based on data range
  const yAxisTicks = useMemo(() => {
    if (values.length === 0) return [0]
    
    const range = yAxisMax - yAxisMin
    if (range === 0) return [0, yAxisMax]
    
    // Determine optimal number of ticks (4-6 ticks)
    const targetTicks = 5
    const roughStep = range / targetTicks
    
    // Round to nice numbers
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
    const normalizedStep = roughStep / magnitude
    
    // Round to 1, 2, 5, or 10
    let niceStep
    if (normalizedStep <= 1) niceStep = 1
    else if (normalizedStep <= 2) niceStep = 2
    else if (normalizedStep <= 5) niceStep = 5
    else niceStep = 10
    
    const step = niceStep * magnitude
    
    // Generate ticks
    const ticks = []
    
    // Always include 0 if it's in range
    if (yAxisMin <= 0 && yAxisMax >= 0) {
      ticks.push(0)
    }
    
    // Add ticks above 0
    let tick = Math.ceil(yAxisMin / step) * step
    while (tick <= yAxisMax) {
      if (tick > 0 && !ticks.includes(tick)) {
        ticks.push(tick)
      }
      tick += step
    }
    
    // Ensure max value is included if close
    if (ticks.length === 0 || ticks[ticks.length - 1] < yAxisMax * 0.95) {
      const maxTick = Math.ceil(yAxisMax / step) * step
      if (!ticks.includes(maxTick)) {
        ticks.push(maxTick)
      }
    }
    
    return [...new Set(ticks)].sort((a, b) => a - b)
  }, [values, yAxisMin, yAxisMax])

  const getSharpPath = () => {
    if (points.length < 2) return ''
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
    }
    
    let path = `M ${points[0].x} ${points[0].y} `
    
    // Add subtle smoothing with small cubic bezier curves
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      
      // Get adjacent points for smooth corner calculation
      const p0 = i > 0 ? points[i - 1] : p1
      const p3 = i < points.length - 2 ? points[i + 2] : p2
      
      // Small tension value for subtle smoothing (0.15 = very subtle)
      const t = 0.15
      const cp1x = p1.x + (p2.x - p0.x) * t
      const cp1y = p1.y + (p2.y - p0.y) * t
      const cp2x = p2.x - (p3.x - p1.x) * t
      const cp2y = p2.y - (p3.y - p1.y) * t
      
      // Use cubic Bezier for subtle smooth edges
      path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `
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
    const mouseX = (e.clientX - rect.left) * (chartWidth / rect.width)
    const mouseY = (e.clientY - rect.top) * (chartHeight / rect.height)
    
    // Find closest point - check both X and Y distance to only show when cursor is ON the line
    let closestIndex = -1
    let minDistance = Infinity
    const threshold = 15 // Maximum distance in pixels to consider cursor "on" the line
    
    points.forEach((pt, index) => {
      // Calculate distance in both X and Y directions
      const xDistance = Math.abs(mouseX - pt.x)
      const yDistance = Math.abs(mouseY - pt.y)
      // Use Euclidean distance to check if cursor is close to the actual point
      const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
      
      if (distance < minDistance && distance < threshold) { 
        minDistance = distance
        closestIndex = index 
      }
    })
    
    // Show tooltip only if cursor is directly on the line (within threshold)
    if (closestIndex !== -1 && minDistance < threshold) {
      setHoveredPoint(closestIndex)
      
      // Position tooltip above cursor (not at cursor) to avoid blocking the line
      const tooltipHeight = 80 // Approximate tooltip height
      const tooltipOffset = 20 // Offset above cursor
      let left = e.clientX
      let top = e.clientY - tooltipHeight - tooltipOffset // Position above cursor
      
      // Keep tooltip within viewport bounds
      if (left - 88 < 0) left = 88
      else if (left + 88 > window.innerWidth) left = window.innerWidth - 88
      
      // If tooltip would go off top of screen, position it below cursor instead
      if (top < 0) {
        top = e.clientY + tooltipOffset
      }
      
      setTooltipPosition({ x: left, y: top })
      if (!mouseMoved && !tooltipTimeoutRef.current) {
        tooltipTimeoutRef.current = setTimeout(() => { 
          setShowTooltip(true)
          tooltipTimeoutRef.current = null 
        }, 300) // Reduced delay for faster response
      }
    } else {
      setHoveredPoint(null)
      setShowTooltip(false)
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
      {!hideTabs && (
        <div className="line-chart-header">
          <div className="chart-header-left">
            <div className="line-chart-tabs">
              <button className={`line-chart-tab ${selectedTab === 'Revenue' ? 'line-chart-tab--active' : ''}`} onClick={() => setSelectedTab('Revenue')}>Revenue</button>
              <button className={`line-chart-tab ${selectedTab === 'Profit' ? 'line-chart-tab--active' : ''}`} onClick={() => setSelectedTab('Profit')}>Profit</button>
            </div>
          </div>
        </div>
      )}
      <div className="line-chart-container">
        <svg ref={chartRef} className="line-chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <defs>
            <linearGradient id="wealthsimpleGreenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.02" />
            </linearGradient>
            {/* Clip path to ensure graph doesn't cross boundaries */}
            <clipPath id="chart-clip">
              <rect 
                x={padding.left} 
                y={padding.top} 
                width={graphWidth} 
                height={graphHeight}
              />
            </clipPath>
          </defs>
          <g className="chart-y-axis" aria-hidden="true">
            {yAxisTicks.map((value) => {
              const yPos = value === 0 
                ? baselineY + 4
                : valueToY(value) + 4
              return (
                <text key={value} x={padding.left - 10} y={yPos} textAnchor="end" className="chart-axis-label">
                  {formatCurrency(value)}
                </text>
              )
            })}
          </g>
          {/* Y-axis vertical line */}
          <line 
            x1={padding.left} 
            y1={padding.top} 
            x2={padding.left} 
            y2={baselineY} 
            className="chart-y-axis-line" 
            strokeWidth="1" 
            stroke="#e5e7eb"
          />
          {/* Boundary lines */}
          <line 
            x1={padding.left} 
            y1={baselineY} 
            x2={padding.left + graphWidth} 
            y2={baselineY} 
            className="chart-baseline" 
            strokeWidth="1" 
          />
          <line 
            x1={padding.left + graphWidth} 
            y1={padding.top} 
            x2={padding.left + graphWidth} 
            y2={baselineY} 
            className="chart-boundary" 
            strokeWidth="0.5" 
            stroke="rgba(0,0,0,0.05)"
            strokeDasharray="2,2"
          />
          
          {/* Graph elements clipped to boundaries */}
          <g clipPath="url(#chart-clip)">
            {chartData.length > 0 && (
              <line x1={padding.left} y1={valueToY(chartData[0].value)} x2={padding.left + graphWidth} y2={valueToY(chartData[0].value)} className="chart-reference-line" strokeWidth="1" />
            )}
            <path d={areaPath} className="chart-area-wealthsimple" fill="url(#wealthsimpleGreenGradient)" />
            <path d={linePath} className="chart-line-wealthsimple" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {lastPoint && <circle cx={lastPoint.x} cy={lastPoint.y} r="5" className="chart-last-point" />}
            {points.map((pt, index) => (
              <circle key={index} cx={pt.x} cy={pt.y} r="14" fill="transparent" className="data-point-hit" />
            ))}
          </g>
          <g className="chart-x-axis" aria-hidden="true">
            {xAxisLabels.map((label, idx) => {
              const x = indexToX(label.index)
              const isFirst = idx === 0
              const isLast = idx === xAxisLabels.length - 1
              const textAnchor = isFirst ? 'start' : isLast ? 'end' : 'middle'
              const xOffset = isFirst ? 2 : isLast ? -2 : 0
              return (
                <text 
                  key={`${label.index}-${idx}`} 
                  x={x + xOffset} 
                  y={baselineY + 25} 
                  textAnchor={textAnchor} 
                  className="chart-axis-label"
                >
                  {formatDateLabel(label.original, dateStrategy)}
                </text>
              )
            })}
          </g>
        </svg>
        {hoveredPoint !== null && showTooltip && chartData[hoveredPoint] && (
          <div className={`chart-tooltip chart-tooltip--wealthsimple ${showTooltip ? 'chart-tooltip--visible' : ''}`} style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
            <div className="tooltip-date">
              {chartData[hoveredPoint].originalDate || chartData[hoveredPoint].date || chartData[hoveredPoint].rawDate || ''}
            </div>
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
