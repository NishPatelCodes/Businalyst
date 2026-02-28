import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { KpiContext } from '../../context/KpiContext'
import './MetricCards.css'

const formatCurrency = (n) =>
  Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const MetricCards = () => {
  const { kpiData, isDemoData } = useContext(KpiContext)
  const navigate = useNavigate()

  const profitIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.58 12.58L19.97 10.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  const revenueIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 14H7.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 14H11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  const ordersIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 10C16 11.1046 15.1046 12 14 12C12.8954 12 12 11.1046 12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  const conversionIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  const customersIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const kpis = [
    {
      title: 'Profit',
      value: kpiData != null ? formatCurrency(kpiData.profit_sum) : '—',
      current: kpiData?.profit_sum ?? 0,
      target: kpiData?.profit_sum ? Math.ceil(kpiData.profit_sum * 1.2) : 30000,
      change: '—',
      changeType: 'positive',
      comparison: kpiData ? (isDemoData ? 'Demo data — upload to see yours' : 'From your uploaded file') : 'Upload a file to see data',
      icon: profitIcon,
      insightsPath: '/profit-insights',
    },
    {
      title: 'Revenue',
      value: kpiData != null ? formatCurrency(kpiData.revenue_sum) : '—',
      current: kpiData?.revenue_sum ?? 0,
      target: kpiData?.revenue_sum ? Math.ceil(kpiData.revenue_sum * 1.1) : 200000,
      change: '—',
      changeType: 'positive',
      comparison: kpiData ? (isDemoData ? 'Demo data — upload to see yours' : 'From your uploaded file') : 'Upload a file to see data',
      icon: revenueIcon,
      insightsPath: '/revenue-insights',
    },
    {
      title: 'Orders',
      value: kpiData != null ? Number(kpiData.orders_sum).toLocaleString() : '—',
      current: kpiData?.orders_sum ?? 0,
      target: kpiData?.orders_sum ? Math.ceil(kpiData.orders_sum * 1.2) : 1500,
      change: '—',
      changeType: 'positive',
      comparison: kpiData ? (isDemoData ? 'Demo data — upload to see yours' : 'From your uploaded file') : 'Upload a file to see data',
      icon: ordersIcon,
      insightsPath: '/orders',
    },
    {
      title: 'Expense',
      value: kpiData != null ? formatCurrency(kpiData.expense_sum) : '—',
      current: kpiData?.expense_sum ?? 0,
      target: kpiData?.expense_sum ? Math.ceil(kpiData.expense_sum * 1.2) : 50000,
      change: '—',
      changeType: 'positive',
      comparison: kpiData ? (isDemoData ? 'Demo data — upload to see yours' : 'From your uploaded file') : 'Upload a file to see data',
      icon: conversionIcon,
      insightsPath: '/dashboard',
    },
    {
      title: 'Customers',
      value: kpiData != null ? Number(kpiData.customers_sum).toLocaleString() : '—',
      current: kpiData?.customers_sum ?? 0,
      target: kpiData?.customers_sum ? Math.ceil(kpiData.customers_sum * 1.2) : 10000,
      change: '—',
      changeType: 'positive',
      comparison: kpiData ? (isDemoData ? 'Demo data — upload to see yours' : 'From your uploaded file (row count)') : 'Upload a file to see data',
      icon: customersIcon,
      insightsPath: '/dashboard',
    },
  ]

  const formatTarget = (current, target) => {
    if (target >= 1000000) return `${(current / 1000000).toFixed(1)}M / ${(target / 1000000).toFixed(1)}M`
    if (target >= 1000) return `${(current / 1000).toFixed(0)}k / ${(target / 1000).toFixed(0)}k`
    return `${current.toFixed(1)}% / ${target.toFixed(1)}%`
  }

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  return (
    <>
      {kpis.map((kpi, index) => {
        const progress = calculateProgress(kpi.current, kpi.target)
        const path = kpi.insightsPath
        return (
          <div key={index} className="kpi-card">
            <div className="kpi-card-content">
              <div className="kpi-header">
                <div className="kpi-icon">{kpi.icon}</div>
                <div className="kpi-title">{kpi.title}</div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-progress-section">
                <div className="kpi-progress-bar">
                  <div className="kpi-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="kpi-target-text">{formatTarget(kpi.current, kpi.target)}</div>
              </div>
            </div>
            <div className="kpi-footer">
              <button
                type="button"
                className="kpi-more-insights-button"
                onClick={() => path && navigate(path)}
                title="More insights"
              >
                More insights
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default MetricCards
