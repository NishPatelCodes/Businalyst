import React, { useState, useContext, useMemo } from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { KpiContext } from '../../context/KpiContext'
import './RevenueLineChart.css'

const TIME_RANGES = [
  { key: '12M', label: '12 months' },
  { key: '30D', label: '30 days' },
  { key: '7D', label: '7 days' },
  { key: '24H', label: '24 hours' },
]

const THIS_PERIOD_COLOR = '#5856D6'
const PREVIOUS_PERIOD_COLOR = '#8E8E93'

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

const formatDateLabel = (d) => {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Aggregate by month; previous period = ~65% of this period for demo */
function buildMonthlyChartData(dates, revenues) {
  const monthMap = new Map()
  const len = Math.min(dates.length, revenues.length)

  for (let i = 0; i < len; i++) {
    const date = new Date(dates[i])
    if (isNaN(date.getTime())) continue
    const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
    const rev = Number(revenues[i]) || 0
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { key: monthKey, thisPeriod: 0, month: date.toLocaleDateString('en-US', { month: 'short' }) })
    }
    monthMap.get(monthKey).thisPeriod += rev
  }

  const sorted = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-12)
  return sorted.map(([, row]) => ({
    name: row.month,
    thisPeriod: Math.round(row.thisPeriod * 100) / 100,
    previousPeriod: Math.round(row.thisPeriod * 0.65 * 100) / 100,
    dateLabel: `${row.month} ${row.key.split('-')[0]}`,
    prevDateLabel: `${row.month} ${parseInt(row.key.split('-')[0], 10) - 1}`,
  }))
}

function buildChartData(kpiData, rangeKey) {
  const dates = kpiData?.date_data
  const revenues = kpiData?.revenue_data

  if (!dates?.length || !revenues?.length) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((name, i) => ({
      name,
      thisPeriod: 12000 + i * 800,
      previousPeriod: Math.round((8000 + i * 500) * 100) / 100,
      dateLabel: `${name} 2024`,
      prevDateLabel: `${name} 2023`,
    }))
  }

  if (rangeKey === '12M') {
    const data = buildMonthlyChartData(dates, revenues)
    if (data.length > 0) return data
  }

  const len = Math.min(dates.length, revenues.length)
  const step = rangeKey === '30D' ? Math.max(1, Math.floor(len / 30)) : rangeKey === '7D' ? Math.max(1, Math.floor(len / 7)) : 1
  const result = []
  for (let i = 0; i < len; i += step) {
    const date = new Date(dates[i])
    const rev = Number(revenues[i]) || 0
    result.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      thisPeriod: rev,
      previousPeriod: Math.round(rev * 0.65 * 100) / 100,
      dateLabel: formatDateLabel(dates[i]),
      prevDateLabel: formatDateLabel(dates[i]),
    })
  }
  return result.slice(-12)
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const p1 = payload.find((p) => p.dataKey === 'thisPeriod')
  const p2 = payload.find((p) => p.dataKey === 'previousPeriod')
  const point = payload[0]?.payload
  return (
    <div className="ri-chart-tooltip">
      {p1 && (
        <div className="ri-chart-tooltip-row">
          <span className="ri-chart-tooltip-dot" style={{ background: THIS_PERIOD_COLOR }} />
          <span>{formatCurrency(p1.value)} {point?.dateLabel ?? ''}</span>
        </div>
      )}
      {p2 && (
        <div className="ri-chart-tooltip-row">
          <span className="ri-chart-tooltip-dot" style={{ background: PREVIOUS_PERIOD_COLOR }} />
          <span>{formatCurrency(p2.value)} {point?.prevDateLabel ?? ''}</span>
        </div>
      )}
    </div>
  )
}

const RevenueLineChart = ({ dateLabel, onOpenDatePicker, totalRevenue, changePercent = 15 }) => {
  const { kpiData } = useContext(KpiContext)
  const [timeRange, setTimeRange] = useState('12M')

  const chartData = useMemo(
    () => buildChartData(kpiData, timeRange),
    [kpiData, timeRange]
  )

  const displayTotal = totalRevenue ?? kpiData?.revenue_sum ?? 88820.44
  const displayChange = typeof changePercent === 'number' ? changePercent : 15

  return (
    <div className="ri-chart-card">
      <div className="ri-chart-header">
        <div className="ri-chart-header-left">
          <h2 className="ri-chart-title">
            Revenue
            <svg className="ri-chart-title-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </h2>
          <div className="ri-chart-total">{formatCurrency(displayTotal)}</div>
          <div className="ri-chart-change">
            <span className="ri-chart-change-arrow">↑</span>
            {displayChange}%
          </div>
        </div>

        <div className="ri-chart-controls">
          <div className="ri-chart-time-pills">
            {TIME_RANGES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`ri-chart-pill ${timeRange === key ? 'ri-chart-pill-active' : ''}`}
                onClick={() => setTimeRange(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="ri-chart-date-btn" onClick={onOpenDatePicker}>
            <svg className="ri-chart-date-filter" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{dateLabel}</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="ri-chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <RechartsLineChart
            data={chartData}
            margin={{ top: 12, right: 12, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" horizontal={true} vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8E8E93', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              hide
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e5ea', strokeWidth: 1 }} />
            <Legend
              layout="horizontal"
              align="right"
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: 8 }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="ri-chart-legend-label">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="thisPeriod"
              name="This period"
              stroke={THIS_PERIOD_COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: THIS_PERIOD_COLOR, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="previousPeriod"
              name="Previous period"
              stroke={PREVIOUS_PERIOD_COLOR}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4, fill: PREVIOUS_PERIOD_COLOR, strokeWidth: 0 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RevenueLineChart
