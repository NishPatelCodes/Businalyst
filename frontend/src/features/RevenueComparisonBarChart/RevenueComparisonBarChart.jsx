import React, { useState, useContext, useMemo, useRef, useEffect } from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { KpiContext } from '../../context/KpiContext'
import './RevenueComparisonBarChart.css'

const COMPARE_OPTIONS = [
  { key: 'expense', label: 'Expense' },
  { key: 'profit', label: 'Profit' },
  { key: 'orders', label: 'Orders' },
]

const REVENUE_COLOR_LIGHT = '#93C5FD'
const EXPENSE_COLOR = '#2563EB'
const PROFIT_COLOR = '#1E40AF'
const ORDERS_COLOR = '#1D4ED8'

function getCompareColor(key) {
  switch (key) {
    case 'expense': return EXPENSE_COLOR
    case 'profit': return PROFIT_COLOR
    case 'orders': return ORDERS_COLOR
    default: return EXPENSE_COLOR
  }
}

function parseSeries(kpiData) {
  const dates = kpiData?.date_data
  const revenue = kpiData?.revenue_data || []
  const profit = kpiData?.profit_data || []
  const orders = kpiData?.orders_data
  if (!dates?.length || !revenue?.length) return []
  const len = Math.min(
    dates.length,
    revenue.length,
    Array.isArray(profit) ? profit.length : dates.length
  )
  const arr = []
  for (let i = 0; i < len; i++) {
    const rev = Number(revenue[i]) || 0
    const pr = Number(profit[i]) || 0
    arr.push({
      date: new Date(dates[i]),
      revenue: rev,
      profit: pr,
      expense: rev - pr,
      orders: Array.isArray(orders) && orders[i] !== undefined ? Number(orders[i]) || 0 : 0,
    })
  }
  return arr.filter((d) => !isNaN(d.date.getTime()))
}

function autoAggregate(series, compareKey) {
  if (!series.length) return getFallbackData()

  const compareLabel = compareKey.charAt(0).toUpperCase() + compareKey.slice(1)

  if (series.length <= 7) {
    return series.map((d) => {
      const date = d.date instanceof Date ? d.date : new Date(d.date)
      return {
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: d.revenue,
        [compareLabel]: d[compareKey] || 0,
      }
    })
  }

  if (series.length <= 30) {
    const bucketSize = 5
    const buckets = []
    for (let i = 0; i < series.length; i += bucketSize) {
      const slice = series.slice(i, i + bucketSize)
      const startDate = slice[0].date instanceof Date ? slice[0].date : new Date(slice[0].date)
      const endDate = slice[slice.length - 1].date instanceof Date ? slice[slice.length - 1].date : new Date(slice[slice.length - 1].date)
      const name = `${startDate.getDate()}-${endDate.getDate()} ${endDate.toLocaleDateString('en-US', { month: 'short' })}`
      buckets.push({
        name,
        revenue: slice.reduce((s, d) => s + d.revenue, 0),
        [compareLabel]: slice.reduce((s, d) => s + (d[compareKey] || 0), 0),
      })
    }
    return buckets
  }

  const pairNames = ['Jan-Feb', 'Mar-Apr', 'May-Jun', 'Jul-Aug', 'Sep-Oct', 'Nov-Dec']
  const pairs = pairNames.map(name => ({ name, revenue: 0, [compareLabel]: 0 }))

  series.forEach((d) => {
    const date = d.date instanceof Date ? d.date : new Date(d.date)
    const pairIndex = Math.floor(date.getMonth() / 2)
    if (pairs[pairIndex]) {
      pairs[pairIndex].revenue += d.revenue
      pairs[pairIndex][compareLabel] += d[compareKey] || 0
    }
  })

  return pairs.filter(p => p.revenue > 0 || p[Object.keys(p).find(k => k !== 'name' && k !== 'revenue')] > 0)
}

function getFallbackData() {
  return [
    { name: 'Jan-Feb', revenue: 45000, Expense: 32000 },
    { name: 'Mar-Apr', revenue: 52000, Expense: 36000 },
    { name: 'May-Jun', revenue: 48000, Expense: 34000 },
    { name: 'Jul-Aug', revenue: 55000, Expense: 38000 },
    { name: 'Sep-Oct', revenue: 51000, Expense: 35000 },
    { name: 'Nov-Dec', revenue: 62000, Expense: 42000 },
  ]
}

const CustomTooltip = ({ active, payload, label, compareLabel, formatVal }) => {
  if (!active || !payload?.length) return null
  const rev = payload.find((p) => p.dataKey === 'revenue')
  const comp = payload.find((p) => p.dataKey !== 'revenue')
  return (
    <div className="rc-tooltip">
      <div className="rc-tooltip-label">{label}</div>
      {rev && <div className="rc-tooltip-row">Revenue: {formatVal(rev.value)}</div>}
      {comp && <div className="rc-tooltip-row">{compareLabel}: {formatVal(comp.value)}</div>}
    </div>
  )
}

const RevenueComparisonBarChart = ({ filteredSeries: propSeries }) => {
  const { kpiData, formatCompactCurrency } = useContext(KpiContext)
  const [compareColumn, setCompareColumn] = useState('expense')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const series = useMemo(() => {
    if (propSeries && propSeries.length) {
      return propSeries.map(pt => ({
        ...pt,
        date: pt.date instanceof Date ? pt.date : new Date(pt.date),
      }))
    }
    return parseSeries(kpiData)
  }, [propSeries, kpiData])

  const compareLabel = COMPARE_OPTIONS.find((o) => o.key === compareColumn)?.label ?? 'Expense'
  const compareDataKey = compareLabel

  const chartData = useMemo(
    () => autoAggregate(series, compareColumn),
    [series, compareColumn]
  )

  const dateRangeLabel = useMemo(() => {
    if (!series.length) return 'Latest period'
    const first = series[0].date
    const last = series[series.length - 1].date
    return `${first.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }, [series])

  const darkerColor = getCompareColor(compareColumn)
  const formatVal = (n) => formatCompactCurrency(n, { maximumFractionDigits: 1 })

  return (
    <div className="rc-card">
      <div className="rc-header">
        <div className="rc-header-left">
          <h3 className="rc-title">Revenue comparison</h3>
          <span className="rc-date">{dateRangeLabel}</span>
        </div>
        <div className="rc-header-right">
          <div className="rc-dropdown-wrap" ref={dropdownRef}>
            <button
              type="button"
              className="rc-menu-btn"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              <span className="rc-menu-btn-text">Compare: {compareLabel}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="rc-dropdown" role="listbox">
                {COMPARE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`rc-dropdown-item ${compareColumn === opt.key ? 'active' : ''}`}
                    onClick={() => {
                      setCompareColumn(opt.key)
                      setDropdownOpen(false)
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rc-legend">
        <span className="rc-legend-item">
          <span className="rc-legend-dot" style={{ background: darkerColor }} />
          {compareLabel}
        </span>
        <span className="rc-legend-item">
          <span className="rc-legend-dot rc-legend-dot-light" style={{ background: REVENUE_COLOR_LIGHT }} />
          Revenue
        </span>
      </div>

      <div className="rc-chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <RechartsBarChart
            data={chartData}
            margin={{ top: 16, right: 16, bottom: 24, left: 8 }}
            barCategoryGap="20%"
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              domain={[0, (max) => Math.max(max * 1.05, 1)]}
            />
            <Tooltip
              content={<CustomTooltip compareLabel={compareLabel} formatVal={formatVal} />}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Bar dataKey={compareDataKey} name={compareLabel} fill={darkerColor} radius={[4, 4, 0, 0]} maxBarSize={44} />
            <Bar dataKey="revenue" name="Revenue" fill={REVENUE_COLOR_LIGHT} radius={[4, 4, 0, 0]} maxBarSize={44} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RevenueComparisonBarChart
