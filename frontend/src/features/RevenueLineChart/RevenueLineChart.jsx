import React, { useContext, useMemo } from 'react'
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
import { aggregateSeriesByTimeframe, getXAxisConfig } from '../../utils/chartAggregation'
import './RevenueLineChart.css'

const THIS_PERIOD_COLOR = '#2563eb'
const PREVIOUS_PERIOD_COLOR = '#93c5fd'

const formatDateLabel = (d) => {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function buildChartDataFromSeries(filteredSeries, formatLabel) {
  if (!filteredSeries || !filteredSeries.length) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((name, i) => ({
      name,
      thisPeriod: 12000 + i * 800,
      previousPeriod: Math.round((8000 + i * 500) * 100) / 100,
      dateLabel: `${name} 2024`,
      prevDateLabel: `${name} 2023`,
    }))
  }

  return filteredSeries.map(pt => {
    const date = new Date(pt.date)
    return {
      name: formatLabel ? formatLabel(date) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      thisPeriod: pt.revenue,
      previousPeriod: Math.round(pt.revenue * 0.65 * 100) / 100,
      dateLabel: formatDateLabel(pt.date),
      prevDateLabel: formatDateLabel(pt.date),
    }
  })
}

const CustomTooltip = ({ active, payload, formatCurrency }) => {
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

const RevenueLineChart = ({ filteredSeries = [], totalRevenue, changePercent = 15, timeframe = '30D' }) => {
  const { kpiData, formatCurrency } = useContext(KpiContext)
  const xAxisConfig = useMemo(() => getXAxisConfig(timeframe), [timeframe])

  // First aggregate the series based on timeframe
  const aggregatedSeries = useMemo(
    () => {
      if (!filteredSeries.length) return []
      // Convert to format expected by aggregateSeriesByTimeframe
      const convertedSeries = filteredSeries.map(pt => ({
        date: pt.date,
        value: pt.revenue || 0,
      }))
      return aggregateSeriesByTimeframe(convertedSeries, timeframe)
    },
    [filteredSeries, timeframe]
  )

  // Then build chart data from aggregated series
  const chartData = useMemo(
    () => {
      // Convert back to the format buildChartDataFromSeries expects
      const revenueOnlySeries = aggregatedSeries.map(pt => ({
        ...pt,
        revenue: pt.value,
      }))
      return buildChartDataFromSeries(revenueOnlySeries, xAxisConfig.formatLabel)
    },
    [aggregatedSeries, xAxisConfig]
  )

  const displayTotal = totalRevenue ?? kpiData?.revenue_sum ?? 88820.44
  const displayChange = typeof changePercent === 'number' ? changePercent : 15
  const isPositive = displayChange >= 0

  return (
    <div className="ri-chart-card">
      <div className="ri-chart-header">
        <div className="ri-chart-header-left">
          <h2 className="ri-chart-title">Revenue</h2>
          <div className="ri-chart-total">{formatCurrency(displayTotal)}</div>
          <div className={`ri-chart-change ${isPositive ? '' : 'ri-chart-change--neg'}`}>
            <span className="ri-chart-change-arrow">{isPositive ? '↑' : '↓'}</span>
            {Math.abs(displayChange)}%
          </div>
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
              interval={xAxisConfig.getInterval(chartData.length)}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ stroke: '#e5e5ea', strokeWidth: 1 }} />
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
