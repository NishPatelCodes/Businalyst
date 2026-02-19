import React from 'react'
import GaugeChart from './GaugeChart'
import MetricCards from './MetricCards'

/**
 * Metrics row: gauge chart + KPI metric cards.
 */
const DashboardMetrics = () => {
  return (
    <>
      <GaugeChart />
      <MetricCards />
    </>
  )
}

export default DashboardMetrics
