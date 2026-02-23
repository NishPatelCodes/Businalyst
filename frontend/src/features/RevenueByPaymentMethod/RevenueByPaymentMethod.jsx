import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import './RevenueByPaymentMethod.css'

const PREPAID_COLOR = '#1e40af'
const CASH_ON_DELIVERY_COLOR = '#0ea5e9'
const INACTIVE_BAR = '#e5e7eb'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Mock monthly revenue by payment method (Prepaid vs Cash on Delivery). Scale in thousands for readable axis. */
function getMockData(year) {
  const rnd = (seed) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
  return MONTHS.map((month, i) => {
    const base = 12000 + (year - 2023) * 2000 + i * 400
    const prepaidPct = 0.65 + rnd(year + i) * 0.2
    const prepaid = Math.round(base * prepaidPct)
    const cod = Math.round(base * (1 - prepaidPct))
    return {
      month,
      Prepaid: prepaid,
      'Cash on Delivery': cod,
      total: prepaid + cod,
    }
  })
}

function formatAxis(val) {
  if (val >= 1e6) return `${(val / 1e6).toFixed(0)} B`
  if (val >= 1e3) return `${(val / 1e3).toFixed(0)} K`
  return String(val)
}

function formatTooltipVal(val) {
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}b`
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}k`
  return String(val)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rpm-tooltip">
      {payload.map((entry) => (
        <div key={entry.dataKey} className="rpm-tooltip-row">
          <span className="rpm-tooltip-dot" style={{ background: entry.color }} />
          <span className="rpm-tooltip-label">{entry.name}</span>
          <span className="rpm-tooltip-value">{formatTooltipVal(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

const RevenueByPaymentMethod = () => {
  const [year, setYear] = useState(2024)
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const yearDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
        setYearDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const chartData = useMemo(() => getMockData(year), [year])

  const maxTotal = useMemo(
    () => Math.max(1, ...chartData.map((d) => d.total)),
    [chartData]
  )

  const handleDownload = () => {
    const csv = [
      ['Month', 'Prepaid', 'Cash on Delivery', 'Total'].join(','),
      ...chartData.map((d) => [d.month, d.Prepaid, d['Cash on Delivery'], d.total].join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `revenue-by-payment-method-${year}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="rpm-card">
      <div className="rpm-header">
        <h3 className="rpm-title">Revenue by Payment Method</h3>
        <div className="rpm-legend">
          <span className="rpm-legend-item">
            <span className="rpm-legend-dot" style={{ background: PREPAID_COLOR }} />
            Prepaid
          </span>
          <span className="rpm-legend-item">
            <span className="rpm-legend-dot" style={{ background: CASH_ON_DELIVERY_COLOR }} />
            Cash on Delivery
          </span>
        </div>
        <div className="rpm-controls">
          <button type="button" className="rpm-download-btn" onClick={handleDownload} aria-label="Download">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <div className="rpm-dropdown-wrap" ref={yearDropdownRef}>
            <button
              type="button"
              className="rpm-year-btn"
              onClick={() => setYearDropdownOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={yearDropdownOpen}
            >
              {year}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {yearDropdownOpen && (
              <ul className="rpm-dropdown" role="listbox">
                {[2022, 2023, 2024, 2025].map((y) => (
                  <li key={y} role="option" aria-selected={y === year}>
                    <button
                      type="button"
                      className={y === year ? 'rpm-dropdown-item rpm-dropdown-item--active' : 'rpm-dropdown-item'}
                      onClick={() => {
                        setYear(y)
                        setYearDropdownOpen(false)
                      }}
                    >
                      {y}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="rpm-chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, left: 8, bottom: 8 }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              dy={8}
            />
            <YAxis
              tickFormatter={formatAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={36}
              domain={[0, Math.ceil(maxTotal * 1.1)]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              position={{ y: 0 }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar
              dataKey="Prepaid"
              stackId="payment"
              fill={PREPAID_COLOR}
              radius={[0, 0, 0, 0]}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`prepaid-${index}`}
                  fill={hoveredIndex === null || hoveredIndex === index ? PREPAID_COLOR : INACTIVE_BAR}
                />
              ))}
            </Bar>
            <Bar
              dataKey="Cash on Delivery"
              stackId="payment"
              fill={CASH_ON_DELIVERY_COLOR}
              radius={[4, 4, 0, 0]}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cod-${index}`}
                  fill={hoveredIndex === null || hoveredIndex === index ? CASH_ON_DELIVERY_COLOR : INACTIVE_BAR}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RevenueByPaymentMethod
