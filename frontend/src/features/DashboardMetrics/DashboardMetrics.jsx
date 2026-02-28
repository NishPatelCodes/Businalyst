import React, { useContext } from 'react'
import GaugeChart from './GaugeChart'
import MetricCards from './MetricCards'
import { KpiContext } from '../../context/KpiContext'

/**
 * Metrics row: gauge chart + KPI metric cards.
 */
const DashboardMetrics = () => {
  const { kpiData } = useContext(KpiContext)
  const profitMargin = kpiData?.revenue_sum
    ? Math.round((kpiData.profit_sum / kpiData.revenue_sum) * 100)
    : 68
  const target = 28
  const gaugeValue = Math.min(100, Math.max(0, profitMargin))
  return (
    <>
      <GaugeChart value={gaugeValue} target={target} />
      <MetricCards />
    </>
  )
}

export default DashboardMetrics
