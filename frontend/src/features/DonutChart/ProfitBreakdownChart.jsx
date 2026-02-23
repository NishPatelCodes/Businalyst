import React, { useContext, useMemo, useState } from 'react'
import { KpiContext } from '../../context/KpiContext'
import './DonutChart.css'

// Default breakdown segments with colors
const DEFAULT_SEGMENTS = [
  { label: 'Revenue', color: '#3b82f6', percentage: 58 },
  { label: 'Cost', color: '#a78bfa', percentage: 14 },
  { label: 'Ad Spend', color: '#fb923c', percentage: 10 },
  { label: 'Shipping', color: '#34d399', percentage: 10 },
  { label: 'Profit', color: '#93c5fd', percentage: 8 },
]

const ProfitBreakdownChart = () => {
  const { kpiData } = useContext(KpiContext)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Calculate breakdown data from KPI or use defaults
  const segments = useMemo(() => {
    // If we have breakdown data from KPI, use it
    // Otherwise use default segments
    if (kpiData?.profit_breakdown && Array.isArray(kpiData.profit_breakdown)) {
      return kpiData.profit_breakdown.map((item, index) => ({
        label: item.name || item.label || `Item ${index + 1}`,
        color: item.color || DEFAULT_SEGMENTS[index]?.color || '#3b82f6',
        percentage: item.percentage || item.pct || 0,
      }))
    }
    return DEFAULT_SEGMENTS
  }, [kpiData?.profit_breakdown])

  // Calculate total percentage to normalize
  const totalPercentage = segments.reduce((sum, seg) => sum + seg.percentage, 0)
  const normalizedSegments = totalPercentage > 0
    ? segments.map(seg => ({
        ...seg,
        percentage: (seg.percentage / totalPercentage) * 100,
      }))
    : segments

  return (
    <div className="profit-breakdown-bar">
      {/* Horizontal Progress Bar */}
      <div className="profit-breakdown-progress">
        <div className="profit-breakdown-bar-wrapper">
          <div className="profit-breakdown-bar-background"></div>
          <div className="profit-breakdown-bar-segments">
            {normalizedSegments.map((segment, index) => {
              const isFirst = index === 0
              const isLast = index === normalizedSegments.length - 1
              
              return (
                <div
                  key={segment.label}
                  className="profit-breakdown-segment"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    width: `${segment.percentage}%`,
                    backgroundColor: segment.color,
                    borderRadius: isFirst
                      ? '8px 0 0 8px'
                      : isLast
                      ? '0 8px 8px 0'
                      : '0',
                    marginLeft: index === 0 ? '0' : '0',
                    transform: hoveredIndex === index ? 'scaleY(1.4)' : 'scaleY(1)',
                    transformOrigin: 'center',
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="profit-breakdown-legend">
        {normalizedSegments.map((segment) => (
          <div key={segment.label} className="profit-breakdown-legend-item">
            <span
              className="profit-breakdown-legend-dot"
              style={{ backgroundColor: segment.color }}
            />
            <div className="profit-breakdown-legend-content">
              <span className="profit-breakdown-legend-label">{segment.label}</span>
              <span className="profit-breakdown-legend-percentage">
                {segment.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfitBreakdownChart
