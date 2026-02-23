import React, { useContext, useMemo } from 'react'
import { KpiContext } from '../context/KpiContext'
import './InsightsStrip.css'

const InsightsStrip = () => {
  const { kpiData, isDemoData } = useContext(KpiContext)

  const insights = useMemo(() => {
    if (!kpiData) return null

    const revenue = kpiData.revenue_sum || 0
    const profit = kpiData.profit_sum || 0
    const orders = kpiData.orders_sum || 0
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0

    return [
      {
        type: 'change',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 11L5.5 7.5L8.5 10.5L14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 5H14V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        label: 'What Changed',
        text: isDemoData
          ? 'Demo mode active — upload data for real insights'
          : `Profit margin is at ${margin}% across ${orders.toLocaleString()} orders`,
      },
      {
        type: 'opportunity',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5V8.5L10.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
        label: 'Opportunities',
        text: isDemoData
          ? 'Upload your sales data to discover growth areas'
          : profit > 0
            ? `Strong profitability — consider scaling top performers`
            : 'Review expense categories for cost optimization',
      },
      {
        type: 'risk',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14.9282 14H1.0718L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
          </svg>
        ),
        label: 'Risks',
        text: isDemoData
          ? 'No risk signals available until data is uploaded'
          : Number(margin) < 15
            ? `Margin below 15% — monitor expense growth`
            : 'No critical risks detected in current period',
      },
    ]
  }, [kpiData, isDemoData])

  if (!insights) return null

  return (
    <div className="insights-strip">
      <div className="insights-strip__badge">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L10 6L15 6.5L11.5 10L12.5 15L8 12.5L3.5 15L4.5 10L1 6.5L6 6L8 1Z" fill="currentColor"/>
        </svg>
        AI Insights
      </div>
      <div className="insights-strip__items">
        {insights.map((insight, i) => (
          <div key={i} className={`insights-strip__item insights-strip__item--${insight.type}`}>
            <span className="insights-strip__icon">{insight.icon}</span>
            <div className="insights-strip__content">
              <span className="insights-strip__label">{insight.label}</span>
              <span className="insights-strip__text">{insight.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InsightsStrip
