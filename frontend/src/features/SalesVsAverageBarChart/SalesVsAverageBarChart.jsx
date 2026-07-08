import React, { useContext, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { KpiDataContext } from '../../context/KpiContext'
import './SalesVsAverageBarChart.css'

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const POSITIVE_COLOR = '#93c5fd'
const NEGATIVE_COLOR = '#2563eb'
const GRID_COLOR = '#e5e7eb'

const parseMonthLabel = (label) => {
  if (!label || typeof label !== 'string') return null
  const trimmed = label.trim()
  const m = trimmed.match(/^([A-Za-z]+)[\s-]*(\d{4})?$/)
  if (m) {
    const name = m[1].toLowerCase()
    const idx = MONTH_NAMES_SHORT.findIndex((n) => n.toLowerCase() === name.slice(0, 3))
    if (idx >= 0) {
      return {
        monthIndex: idx,
        year: m[2] ? Number(m[2]) : null,
        long: MONTH_NAMES_LONG[idx],
        short: MONTH_NAMES_SHORT[idx],
      }
    }
  }
  const d = new Date(trimmed)
  if (!Number.isNaN(d.getTime())) {
    const idx = d.getMonth()
    return {
      monthIndex: idx,
      year: d.getFullYear(),
      long: MONTH_NAMES_LONG[idx],
      short: MONTH_NAMES_SHORT[idx],
    }
  }
  return null
}

const buildMonthlyFromDaily = (dates, values) => {
  if (!Array.isArray(dates) || !Array.isArray(values)) return []
  if (dates.length === 0 || dates.length !== values.length) return []
  const buckets = new Map()
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i])
    if (Number.isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const numeric = Number(values[i]) || 0
    const existing = buckets.get(key) || { year: d.getFullYear(), monthIndex: d.getMonth(), total: 0 }
    existing.total += numeric
    buckets.set(key, existing)
  }
  const sorted = Array.from(buckets.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return sorted.map(([, v]) => ({
    monthIndex: v.monthIndex,
    year: v.year,
    long: MONTH_NAMES_LONG[v.monthIndex],
    short: MONTH_NAMES_SHORT[v.monthIndex],
    total: v.total,
  }))
}

const TIMEFRAME_OPTIONS = [
  { id: '3m', months: 3, label: '3M' },
  { id: '6m', months: 6, label: '6M' },
  { id: '12m', months: 12, label: '12M' },
]

const formatCompact = (n) => {
  const abs = Math.abs(n)
  if (abs >= 1e6) return `${(n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1)}M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}k`
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

const formatSigned = (n) => `${n >= 0 ? '+' : '−'}${formatCompact(Math.abs(n))}`

const TrendingUpIcon = ({ className }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  if (!d) return null
  return (
    <div className="svab-tooltip">
      <div className="svab-tooltip-label">
        {d.long} {d.year || ''}
      </div>
      <div className="svab-tooltip-row">
        <span className="svab-tooltip-key">Sales</span>
        <strong>{formatCompact(d.total)}</strong>
      </div>
      <div className="svab-tooltip-row">
        <span className="svab-tooltip-key">Average</span>
        <strong>{formatCompact(d.average)}</strong>
      </div>
      <div className="svab-tooltip-row svab-tooltip-diff">
        <span className="svab-tooltip-key">Vs. avg</span>
        <strong className={d.diff >= 0 ? 'svab-diff-up' : 'svab-diff-down'}>
          {formatSigned(d.diff)}
        </strong>
      </div>
    </div>
  )
}

const makeLabelRenderer = ({ data, side }) => (props) => {
  const { x, y, width, index } = props
  if (index == null || !data || !data[index]) return null
  const row = data[index]
  const isPositive = row.diff >= 0
  if (side === 'top' && !isPositive) return null
  if (side === 'bottom' && isPositive) return null
  const cx = Number(x) + Number(width) / 2
  const cy = side === 'top' ? Number(y) - 8 : Number(y) + 16
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      fill={isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR}
      className="svab-bar-label"
    >
      {row.displayLabel}
    </text>
  )
}

const SalesVsAverageBarChart = ({ series }) => {
  const { kpiData } = useContext(KpiDataContext)
  const [timeframe, setTimeframe] = useState('6m')

  const providedTimelineSeries = useMemo(() => {
    if (!Array.isArray(series)) return null
    return series
      .map((pt) => {
        const d = pt?.date instanceof Date ? pt.date : new Date(pt?.date)
        if (Number.isNaN(d.getTime())) return null
        return { date: d, orders: Number(pt?.orders) || 0 }
      })
      .filter(Boolean)
  }, [series])

  const months = useMemo(() => {
    if (providedTimelineSeries) {
      const dates = providedTimelineSeries.map((pt) => pt.date.toISOString())
      const values = providedTimelineSeries.map((pt) => pt.orders)
      return buildMonthlyFromDaily(dates, values)
    }

    const fromDaily = buildMonthlyFromDaily(kpiData?.date_data, kpiData?.orders_data)
    if (fromDaily.length > 0) return fromDaily

    const labels = Array.isArray(kpiData?.multiline_labels) ? kpiData.multiline_labels : []
    const values = Array.isArray(kpiData?.multiline_orders) ? kpiData.multiline_orders : []
    if (labels.length > 0 && labels.length === values.length) {
      return labels.map((lbl, i) => {
        const parsed = parseMonthLabel(lbl)
        return {
          monthIndex: parsed?.monthIndex ?? i,
          year: parsed?.year ?? null,
          long: parsed?.long ?? String(lbl),
          short: parsed?.short ?? String(lbl),
          total: Number(values[i]) || 0,
        }
      })
    }

    return [
      { monthIndex: 0, year: 2024, long: 'January', short: 'Jan', total: 186 },
      { monthIndex: 1, year: 2024, long: 'February', short: 'Feb', total: 205 },
      { monthIndex: 2, year: 2024, long: 'March', short: 'Mar', total: 93 },
      { monthIndex: 3, year: 2024, long: 'April', short: 'Apr', total: 173 },
      { monthIndex: 4, year: 2024, long: 'May', short: 'May', total: 91 },
      { monthIndex: 5, year: 2024, long: 'June', short: 'Jun', total: 214 },
    ]
  }, [
    providedTimelineSeries,
    kpiData?.date_data,
    kpiData?.orders_data,
    kpiData?.multiline_labels,
    kpiData?.multiline_orders,
  ])

  const availableMonths = months.length
  const windowed = useMemo(() => months, [months])

  const chartData = useMemo(() => {
    if (windowed.length === 0) return []
    const total = windowed.reduce((a, b) => a + b.total, 0)
    const average = total / windowed.length
    return windowed.map((m) => {
      const diff = m.total - average
      return {
        ...m,
        average,
        diff,
        absDiff: Math.abs(diff),
        fill: diff >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR,
        displayLabel: windowed.length > 9 ? m.short : m.long,
      }
    })
  }, [windowed])

  const windowAverage = chartData[0]?.average ?? 0

  const trendPct = useMemo(() => {
    if (chartData.length < 2) return null
    const last = chartData[chartData.length - 1]?.total ?? 0
    const prev = chartData[chartData.length - 2]?.total ?? 0
    if (prev === 0) return null
    return ((last - prev) / Math.abs(prev)) * 100
  }, [chartData])

  const periodLabel = useMemo(() => {
    if (chartData.length === 0) return ''
    const first = chartData[0]
    const last = chartData[chartData.length - 1]
    const firstYear = first.year ? ` ${first.year}` : ''
    const lastYear = last.year && last.year !== first.year ? ` ${last.year}` : ''
    if (first === last) return `${first.long}${firstYear}`
    return `${first.long}${firstYear} – ${last.long}${lastYear || firstYear}`
  }, [chartData])

  const n = windowed.length
  const barGap = n > 9 ? 2 : n > 6 ? 4 : 8
  const barCategoryGap = n > 9 ? '18%' : n > 6 ? '20%' : n > 3 ? '12%' : '18%'
  const maxBarSize = n > 9 ? 44 : n > 6 ? 68 : n > 3 ? 88 : 110

  const chartHeight = 260

  return (
    <div className="svab-wrapper">
      <div className="svab-header">
        <div className="svab-header-text">
          <h3 className="svab-title">Sales vs Average</h3>
          <p className="svab-description">{periodLabel}</p>
        </div>
        <div className="svab-timeframe" role="tablist" aria-label="Timeframe">
          {TIMEFRAME_OPTIONS.map((tf) => {
            const disabled = tf.months > availableMonths && tf.id !== '3m'
            return (
              <button
                key={tf.id}
                type="button"
                role="tab"
                aria-selected={timeframe === tf.id}
                data-active={timeframe === tf.id}
                className="svab-timeframe-btn"
                onClick={() => setTimeframe(tf.id)}
                disabled={disabled}
                title={
                  disabled
                    ? `Only ${availableMonths} month${availableMonths === 1 ? '' : 's'} of data available`
                    : 'Display-only selector (timeline controlled by dashboard range)'
                }
              >
                {tf.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="svab-chart-wrap">
        {chartData.length === 0 ? (
          <div className="svab-empty">No monthly sales data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              margin={{ top: 28, right: 12, left: 12, bottom: 28 }}
              barGap={barGap}
              barCategoryGap={barCategoryGap}
            >
              <CartesianGrid
                vertical={false}
                stroke={GRID_COLOR}
                strokeDasharray="4 4"
              />
              <ReferenceLine y={0} stroke={GRID_COLOR} strokeWidth={1} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="diff"
                radius={[4, 4, 4, 4]}
                maxBarSize={maxBarSize}
                isAnimationActive={false}
              >
                {chartData.map((item, i) => (
                  <Cell key={i} fill={item.fill} />
                ))}
                <LabelList
                  dataKey="displayLabel"
                  position="top"
                  content={makeLabelRenderer({ data: chartData, side: 'top' })}
                />
                <LabelList
                  dataKey="displayLabel"
                  position="bottom"
                  content={makeLabelRenderer({ data: chartData, side: 'bottom' })}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="svab-footer">
        <div className="svab-footer-line svab-footer-line--primary">
          {trendPct == null ? (
            <span>Average baseline: {formatCompact(windowAverage)} sales / month</span>
          ) : (
            <>
              <span>
                Trending {trendPct >= 0 ? 'up' : 'down'} by {Math.abs(trendPct).toFixed(1)}% this month
              </span>
              <TrendingUpIcon
                className={trendPct >= 0 ? 'svab-trend-icon' : 'svab-trend-icon svab-trend-icon--down'}
              />
            </>
          )}
        </div>
        <div className="svab-footer-line svab-footer-line--muted">
          Showing sales vs average for the dashboard timeline (last {chartData.length} month
          {chartData.length === 1 ? '' : 's'}
          )
        </div>
      </div>
    </div>
  )
}

export default SalesVsAverageBarChart
