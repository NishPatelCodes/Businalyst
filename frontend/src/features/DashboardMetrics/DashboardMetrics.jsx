import React, { useContext, useMemo } from 'react'
import GaugeChart from './GaugeChart'
import MetricCards from './MetricCards'
import { KpiContext } from '../../context/KpiContext'

function pickValue(kpiData, periodTotals, candidates) {
  for (const key of candidates) {
    const alias = `${key}_sum`
    const fromPeriod = periodTotals?.[alias] ?? periodTotals?.[key]
    if (fromPeriod != null && Number.isFinite(Number(fromPeriod))) {
      return Number(fromPeriod)
    }
    if (kpiData?.[key] != null && Number.isFinite(Number(kpiData[key]))) {
      return Number(kpiData[key])
    }
    if (kpiData?.[alias] != null && Number.isFinite(Number(kpiData[alias]))) {
      return Number(kpiData[alias])
    }
  }
  return null
}

/**
 * Metrics row: gauge chart + KPI metric cards.
 */
const DashboardMetrics = ({ periodTotals }) => {
  const { kpiData } = useContext(KpiContext)

  const profitMargin = useMemo(() => {
    const revSum = pickValue(kpiData, periodTotals, ['revenue', 'sales', 'income'])
    const profSum = pickValue(kpiData, periodTotals, ['profit', 'net_profit', 'margin'])
    if (revSum && profSum != null) {
      return Math.round((profSum / revSum) * 100)
    }
    return 68
  }, [kpiData, periodTotals])

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
