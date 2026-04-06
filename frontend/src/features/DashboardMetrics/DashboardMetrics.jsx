import React, { useContext } from 'react'
import GaugeChart from './GaugeChart'
import MetricCards from './MetricCards'
import { KpiContext } from '../../context/KpiContext'

/**
 * Metrics row: gauge chart + KPI metric cards.
 */
const DashboardMetrics = ({ periodTotals }) => {
  const { kpiData } = useContext(KpiContext)
  // BUG 2 fix: use period-filtered totals for gauge so it responds to date filter
  const revSum = periodTotals?.revenue_sum ?? kpiData?.revenue_sum
  const profSum = periodTotals?.profit_sum ?? kpiData?.profit_sum
  const profitMargin = revSum
    ? Math.round((profSum / revSum) * 100)
    : 68
  const target = 28
  const gaugeValue = Math.min(100, Math.max(0, profitMargin))
  return (
    <>
      <GaugeChart value={gaugeValue} target={target} />
      <MetricCards periodTotals={periodTotals} />
    </>
  )
}

export default DashboardMetrics
