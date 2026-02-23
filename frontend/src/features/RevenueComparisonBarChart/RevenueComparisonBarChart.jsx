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

const TIME_FRAMES = [
  { key: '7D', label: 'Week' },
  { key: '30D', label: '30 days' },
  { key: '12M', label: '12 months' },
]

const COMPARE_OPTIONS = [
  { key: 'expense', label: 'Expense' },
  { key: 'profit', label: 'Profit' },
  { key: 'orders', label: 'Orders' },
]

const REVENUE_COLOR_LIGHT = '#93C5FD'
const REVENUE_COLOR = '#60A5FA'
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
      dateStr: dates[i],
      date: new Date(dates[i]),
      revenue: rev,
      profit: pr,
      expense: rev - pr,
      orders: Array.isArray(orders) && orders[i] !== undefined ? Number(orders[i]) || 0 : 0,
    })
  }
  return arr.filter((d) => !isNaN(d.date.getTime()))
}

/** Aggregate into buckets by time frame. Returns { name, revenue, compareValue }[] */
function aggregateByFrame(series, frameKey, compareKey) {
  if (!series.length) return getFallbackData(frameKey)

  const revKey = 'revenue'
  const compareKeyCap = compareKey.charAt(0).toUpperCase() + compareKey.slice(1)

  if (frameKey === '7D') {
    const slice = series.slice(-7)
    return slice.map((d, i) => ({
      name: `Day ${i + 1}`,
      revenue: d.revenue,
      [compareKeyCap]: d[compareKey],
    }))
  }

  if (frameKey === '30D') {
    const slice = series.slice(-30)
    const buckets = [
      { name: '1-5', start: 0, end: 5, revenue: 0, [compareKeyCap]: 0 },
      { name: '6-10', start: 5, end: 10, revenue: 0, [compareKeyCap]: 0 },
      { name: '11-15', start: 10, end: 15, revenue: 0, [compareKeyCap]: 0 },
      { name: '16-20', start: 15, end: 20, revenue: 0, [compareKeyCap]: 0 },
      { name: '21-25', start: 20, end: 25, revenue: 0, [compareKeyCap]: 0 },
      { name: '26-30', start: 25, end: 30, revenue: 0, [compareKeyCap]: 0 },
    ]
    slice.forEach((d, i) => {
      const b = buckets[Math.min(Math.floor(i / 5), 5)]
      if (b) {
        b.revenue += d.revenue
        b[compareKeyCap] += d[compareKey]
      }
    })
    return buckets.map(({ name, revenue, [compareKeyCap]: cv }) => ({ name, revenue, [compareKeyCap]: cv }))
  }

  if (frameKey === '12M') {
    const pairs = [
      { name: 'Jan-Feb', months: [0, 1], revenue: 0, [compareKeyCap]: 0 },
      { name: 'Mar-Apr', months: [2, 3], revenue: 0, [compareKeyCap]: 0 },
      { name: 'May-Jun', months: [4, 5], revenue: 0, [compareKeyCap]: 0 },
      { name: 'Jul-Aug', months: [6, 7], revenue: 0, [compareKeyCap]: 0 },
      { name: 'Sep-Oct', months: [8, 9], revenue: 0, [compareKeyCap]: 0 },
      { name: 'Nov-Dec', months: [10, 11], revenue: 0, [compareKeyCap]: 0 },
    ]
    const byMonth = new Map()
    series.forEach((d) => {
      const key = `${d.date.getFullYear()}-${d.date.getMonth()}`
      if (!byMonth.has(key)) byMonth.set(key, { revenue: 0, [compareKeyCap]: 0 })
      const m = byMonth.get(key)
      m.revenue += d.revenue
      m[compareKeyCap] += d[compareKey]
    })
    pairs.forEach((p) => {
      byMonth.forEach((m, key) => {
        const month = parseInt(key.split('-')[1], 10)
        if (p.months.includes(month)) {
          p.revenue += m.revenue
          p[compareKeyCap] += m[compareKeyCap]
        }
      })
    })
    return pairs
  }

  return getFallbackData(frameKey)
}

function getFallbackData(frameKey) {
  if (frameKey === '7D') {
    return Array.from({ length: 7 }, (_, i) => ({
      name: `Day ${i + 1}`,
      revenue: 12000 + i * 800,
      Expense: 8000 + i * 500,
      Profit: 4000 + i * 300,
      Orders: 50 + i * 5,
    }))
  }
  if (frameKey === '30D') {
    return ['1-5', '6-10', '11-15', '16-20', '21-25', '26-30'].map((name, i) => ({
      name,
      revenue: 20000 + i * 3000,
      Expense: 14000 + i * 2000,
      Profit: 6000 + i * 1000,
      Orders: 100 + i * 20,
    }))
  }
  return [
    { name: 'Jan-Feb', revenue: 45000, Expense: 32000, Profit: 13000, Orders: 180 },
    { name: 'Mar-Apr', revenue: 52000, Expense: 36000, Profit: 16000, Orders: 210 },
    { name: 'May-Jun', revenue: 48000, Expense: 34000, Profit: 14000, Orders: 195 },
    { name: 'Jul-Aug', revenue: 55000, Expense: 38000, Profit: 17000, Orders: 220 },
    { name: 'Sep-Oct', revenue: 51000, Expense: 35000, Profit: 16000, Orders: 205 },
    { name: 'Nov-Dec', revenue: 62000, Expense: 42000, Profit: 20000, Orders: 250 },
  ]
}

const CustomTooltip = ({ active, payload, label, compareLabel }) => {
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

function formatVal(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}k`
  return `$${Number(n).toFixed(0)}`
}

const RevenueComparisonBarChart = () => {
  const { kpiData } = useContext(KpiContext)
  const [timeFrame, setTimeFrame] = useState('7D')
  const [compareColumn, setCompareColumn] = useState('expense')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const timeDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target)) setTimeDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const series = useMemo(() => parseSeries(kpiData), [kpiData])
  const compareLabel = COMPARE_OPTIONS.find((o) => o.key === compareColumn)?.label ?? 'Expense'
  const compareDataKey = compareLabel

  const chartData = useMemo(() => {
    const raw = aggregateByFrame(series, timeFrame, compareColumn)
    return raw.map((d) => ({
      name: d.name,
      revenue: d.revenue,
      [compareDataKey]: d[compareDataKey] ?? d.Expense ?? d.Profit ?? d.Orders ?? 0,
    }))
  }, [series, timeFrame, compareColumn, compareDataKey])

  const maxVal = useMemo(
    () => Math.max(1, ...chartData.flatMap((d) => [d.revenue, d[compareDataKey] ?? 0])),
    [chartData, compareDataKey]
  )

  const dateRangeLabel = useMemo(() => {
    if (!series.length) return 'Latest period'
    const first = series[0].date
    const last = series[series.length - 1].date
    return `${first.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }, [series])

  const darkerColor = getCompareColor(compareColumn)

  return (
    <div className="rc-card">
      <div className="rc-header">
        <div className="rc-header-left">
          <h3 className="rc-title">Revenue comparison</h3>
          <span className="rc-date">{dateRangeLabel}</span>
        </div>
        <div className="rc-header-right">
          <div className="rc-dropdown-wrap" ref={timeDropdownRef}>
            <button
              type="button"
              className="rc-time-btn"
              onClick={() => setTimeDropdownOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={timeDropdownOpen}
            >
              {TIME_FRAMES.find((f) => f.key === timeFrame)?.label ?? 'Week'}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {timeDropdownOpen && (
              <div className="rc-dropdown" role="listbox">
                {TIME_FRAMES.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`rc-dropdown-item ${timeFrame === f.key ? 'active' : ''}`}
                    onClick={() => { setTimeFrame(f.key); setTimeDropdownOpen(false) }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              tick={{ fill: '#000000', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000000', fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              domain={[0, (max) => Math.max(max * 1.05, 1)]}
            />
            <Tooltip content={<CustomTooltip compareLabel={compareLabel} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey={compareDataKey} name={compareLabel} fill={darkerColor} radius={[4, 4, 0, 0]} maxBarSize={44} />
            <Bar dataKey="revenue" name="Revenue" fill={REVENUE_COLOR_LIGHT} radius={[4, 4, 0, 0]} maxBarSize={44} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RevenueComparisonBarChart
