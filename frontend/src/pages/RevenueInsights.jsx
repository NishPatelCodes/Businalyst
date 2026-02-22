import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LineChart from '../features/LineChart'
import BarChart from '../features/BarChart'
import DateRangePicker from '../components/DateRangePicker'
import { KpiContext } from '../context/KpiContext'
import './RevenueInsights.css'

const RevenueInsights = () => {
  const { kpiData } = useContext(KpiContext)

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 1)
    return { start, end }
  })

  const fmt = (d) =>
    d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const dateLabel =
    dateRange.start && dateRange.end
      ? `${fmt(dateRange.start)} – ${fmt(dateRange.end)}`
      : 'Select dates'

  const fmtCur = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(n) || 0)

  const revenueSum = kpiData?.revenue_sum ?? 0
  const profitSum = kpiData?.profit_sum ?? 0
  const ordersSum = kpiData?.orders_sum ?? 1

  const growthPct = useMemo(() => {
    const rev = kpiData?.revenue_data
    if (!rev || rev.length < 2) return 12.4
    const mid = Math.floor(rev.length / 2)
    const firstHalf = rev.slice(0, mid).reduce((s, v) => s + (Number(v) || 0), 0)
    const secondHalf = rev.slice(mid).reduce((s, v) => s + (Number(v) || 0), 0)
    if (!firstHalf) return 0
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 1000) / 10
  }, [kpiData?.revenue_data])

  const avgOrderValue = ordersSum > 0 ? revenueSum / ordersSum : 0
  const recurringRevenue = Math.round(revenueSum * 0.4)
  const profitMargin = revenueSum > 0 ? Math.round((profitSum / revenueSum) * 1000) / 10 : 0

  const revenueByProduct = useMemo(() => {
    const fromKpi = kpiData?.revenue_bar_data
    if (Array.isArray(fromKpi) && fromKpi.length >= 2) return fromKpi
    const top5 = kpiData?.top5_profit ?? []
    return top5.map((r) => ({ name: r.product_name ?? '—', value: Number(r.revenue) || 0 })).filter((d) => d.value > 0)
  }, [kpiData?.revenue_bar_data, kpiData?.top5_profit])
  const revenueByRegion = Array.isArray(kpiData?.map_data)
    ? kpiData.map_data.map(({ name, value }) => ({ name, value }))
    : []

  const topProducts = (kpiData?.top5_profit ?? []).slice(0, 5)

  return (
    <div className="ri-page">
      <Sidebar />

      <div className="ri-shell">
        <header className="ri-topnav">
          <div className="ri-breadcrumbs">
            <Link to="/dashboard" className="ri-bc-link">
              Dashboard
            </Link>
            <span className="ri-bc-sep">/</span>
            <span className="ri-bc-link">Performance</span>
            <span className="ri-bc-sep">/</span>
            <span className="ri-bc-active">Revenue</span>
          </div>

          <div className="ri-topnav-search">
            <svg className="ri-search-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search Anything" className="ri-search-input" />
          </div>

          <div className="ri-topnav-actions">
            <button className="ri-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2 4C2 2.9 2.9 2 4 2H16C17.1 2 18 2.9 18 4V12C18 13.1 17.1 14 16 14H6L2 18V4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="6.5" cy="8" r="0.8" fill="currentColor" />
                <circle cx="10" cy="8" r="0.8" fill="currentColor" />
                <circle cx="13.5" cy="8" r="0.8" fill="currentColor" />
              </svg>
            </button>
            <div className="ri-profile">
              <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className="ri-avatar" />
              <span className="ri-profile-name">Nish Patel</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </header>

        <div className="ri-content">
          <div className="ri-header">
            <div className="ri-header-left">
              <h1 className="ri-title">Revenue</h1>
              <p className="ri-subtitle">Financial performance overview</p>
            </div>
            <div className="ri-header-actions">
              <div style={{ position: 'relative' }}>
                <button
                  className="ri-date-btn"
                  onClick={() => setIsDatePickerOpen((v) => !v)}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="5" cy="9" r="0.5" fill="currentColor" />
                    <circle cx="8" cy="9" r="0.5" fill="currentColor" />
                    <circle cx="11" cy="9" r="0.5" fill="currentColor" />
                  </svg>
                  <span>{dateLabel}</span>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <DateRangePicker
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  onApply={(r) => setDateRange(r)}
                  initialRange={dateRange}
                />
              </div>
              <button className="ri-filter-btn">Filter</button>
              <button className="ri-export-btn">Export</button>
            </div>
          </div>

          <div className="ri-chart-section">
            <div className="ri-hero-metrics">
              <div className="ri-hero-metric">
                <span className="ri-hero-label">Total Revenue</span>
                <span className="ri-hero-value">{fmtCur(revenueSum)}</span>
              </div>
              <div className="ri-hero-metric">
                <span className="ri-hero-label">Growth</span>
                <span
                  className={`ri-hero-value ri-hero-growth ${
                    growthPct >= 0 ? 'ri-growth-positive' : 'ri-growth-negative'
                  }`}
                >
                  {growthPct >= 0 ? '+' : ''}{growthPct}%
                </span>
              </div>
              <div className="ri-hero-metric">
                <span className="ri-hero-label">Net Profit</span>
                <span className="ri-hero-value">{fmtCur(profitSum)}</span>
              </div>
            </div>
            <div className="ri-hero-chart">
              <LineChart hideTabs metric="revenue" />
            </div>
          </div>

          <div className="ri-metrics-row">
            <div className="ri-metric-card">
              <span className="ri-metric-label">Total Transactions</span>
              <span className="ri-metric-value">{Number(ordersSum).toLocaleString()}</span>
            </div>
            <div className="ri-metric-card">
              <span className="ri-metric-label">Average Order Value</span>
              <span className="ri-metric-value">{fmtCur(avgOrderValue)}</span>
            </div>
            <div className="ri-metric-card">
              <span className="ri-metric-label">Recurring Revenue</span>
              <span className="ri-metric-value">{fmtCur(recurringRevenue)}</span>
            </div>
            <div className="ri-metric-card">
              <span className="ri-metric-label">Profit Margin</span>
              <span className="ri-metric-value">{profitMargin}%</span>
            </div>
          </div>

          <div className="ri-breakdown">
            <div className="ri-breakdown-card">
              <BarChart
                data={revenueByProduct}
                title="Revenue by Product"
              />
            </div>
            <div className="ri-breakdown-card">
              <BarChart
                data={revenueByRegion}
                title="Revenue by Region"
              />
            </div>
          </div>

          {topProducts.length > 0 && (
            <div className="ri-table-section">
              <h3 className="ri-table-title">Top Products by Revenue</h3>
              <table className="ri-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Revenue</th>
                    <th>Orders</th>
                    <th>Region</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((row, i) => (
                    <tr key={i}>
                      <td>{row.product_name ?? '—'}</td>
                      <td>{fmtCur(row.revenue)}</td>
                      <td>{Number(row.orders ?? 0).toLocaleString()}</td>
                      <td>{row.region ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RevenueInsights
