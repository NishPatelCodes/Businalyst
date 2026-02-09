import React from 'react'
import HealthMeter from './HealthMeter'
import KPICards from './KPICards'

/**
 * Single feature component: HealthMeter + all KPI cards.
 * Maps to one backend slice (e.g. /api/metrics/ or /api/dashboard/summary/).
 */
const DashboardMetrics = () => {
  return (
    <>
      <HealthMeter />
      <KPICards />
    </>
  )
}

export default DashboardMetrics
