import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LineChart from '../features/LineChart'
import DateRangePicker from '../components/DateRangePicker'
import DonutChart from '../features/DonutChart'
import TopRevenueMonthsBarChart from '../features/BarChart/TopRevenueMonthsBarChart'
import { KpiContext } from '../context/KpiContext'
import './RevenueInsights.css'

/* Apple blue accent */
const ACCENT = '#007AFF'
const ACCENT_SUCCESS = '#34C759'

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
  const dateLabel = dateRange.start && dateRange.end
    ? `${fmt(dateRange.start)} – ${fmt(dateRange.end)}`
    : 'Select dates'

  const fmtCur = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const aov = useMemo(() => {
    const rev = kpiData?.revenue_sum ?? 0
    const ord = kpiData?.orders_sum ?? 1
    return rev / ord
  }, [kpiData?.revenue_sum, kpiData?.orders_sum])

  const topProducts = useMemo(() => {
    const raw = kpiData?.revenue_bar_data
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      return [
        { name: 'Tablet Stand', revenue: 24500 },
        { name: 'Tablet Case', revenue: 23800 },
        { name: 'Bluetooth Adapter', revenue: 22900 },
        { name: 'USB-C Cable', revenue: 22100 },
        { name: 'USB-C Adapter', revenue: 20900 },
      ]
    }
    return raw.slice(0, 8).map((d) => ({
      name: d.name ?? '—',
      revenue: Number(d.value) ?? 0,
    }))
  }, [kpiData?.revenue_bar_data])

  const totalRevenue = topProducts.reduce((s, p) => s + p.revenue, 0) || 1
  const regionBars = useMemo(() => {
    const raw = kpiData?.map_data
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      return [
        { label: 'East', value: 185420, color: ACCENT },
        { label: 'West', value: 162840, color: '#5AC8FA' },
        { label: 'South', value: 91820, color: '#AF52DE' },
        { label: 'North', value: 58844, color: '#34C759' },
      ]
    }
    const colors = [ACCENT, '#5AC8FA', '#AF52DE', '#34C759', '#FF9500']
    return raw.slice(0, 5).map((d, i) => ({
      label: d.name ?? '—',
      value: Number(d.value) ?? 0,
      color: colors[i % colors.length],
    }))
  }, [kpiData?.map_data])

  const maxRegion = Math.max(...regionBars.map((b) => b.value), 1)
  const insights = useMemo(() => {
    const pie = kpiData?.pie_data
    const map = kpiData?.map_data
    const topCat = pie && pie.length > 0 ? pie[0] : null
    const topReg = map && map.length > 0 ? map[0] : null
    const items = []
    if (topCat?.name) {
      items.push(`Focus on ${topCat.name} — ${topCat.value}% of revenue. Consider promotions to grow share.`)
    }
    if (topReg?.name) {
      items.push(`${topReg.name} is your top region. Explore similar markets.`)
    }
    items.push(`AOV is ${fmtCur(aov)}. Test bundling or upsells to increase order value.`)
    return items
  }, [kpiData?.pie_data, kpiData?.map_data, aov])

  return (
    <div className="ri-page">
      <Sidebar />

      <div className="ri-shell">
        <header className="ri-topnav">
          <div className="ri-breadcrumbs">
            <Link to="/dashboard" className="ri-bc-link">Dashboard</Link>
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
            <button className="ri-nav-btn" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 4C2 2.9 2.9 2 4 2H16C17.1 2 18 2.9 18 4V12C18 13.1 17.1 14 16 14H6L2 18V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="6.5" cy="8" r=".8" fill="currentColor" />
                <circle cx="10" cy="8" r=".8" fill="currentColor" />
                <circle cx="13.5" cy="8" r=".8" fill="currentColor" />
              </svg>
            </button>
            <button className="ri-nav-btn" aria-label="Settings">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 3V4M10 16V17M17 10H16M4 10H3M15.66 4.34L14.95 5.05M5.05 14.95L4.34 15.66M15.66 15.66L14.95 14.95M5.05 5.05L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="ri-profile">
              <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className="ri-avatar" />
              <span className="ri-profile-name">Nish Patel</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </header>

        <div className="ri-content">
          <div className="ri-page-header">
            <h1 className="ri-page-title">Revenue Overview</h1>
            <div className="ri-page-actions">
              <div style={{ position: 'relative' }}>
                <button className="ri-action-btn" onClick={() => setIsDatePickerOpen((v) => !v)}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="5" cy="9" r=".5" fill="currentColor" />
                    <circle cx="8" cy="9" r=".5" fill="currentColor" />
                    <circle cx="11" cy="9" r=".5" fill="currentColor" />
                  </svg>
                  <span>{dateLabel}</span>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <DateRangePicker
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  onApply={(r) => setDateRange(r)}
                  initialRange={dateRange}
                />
              </div>
            </div>
          </div>

          <div className="ri-body">
            <div className="ri-col-main">
              {/* Revenue Hero Card */}
              <div className="ri-card ri-trend-card">
                <div className="ri-trend-header">
                  <h2 className="ri-card-title">Revenue Trend</h2>
                </div>
                <div className="ri-trend-meta">
                  <span className="ri-trend-date">{dateLabel}</span>
                  <div className="ri-trend-value">
                    <span className="ri-trend-amount">
                      {kpiData ? fmtCur(kpiData.revenue_sum) : '$498,924'}
                    </span>
                    <span className="ri-trend-badge">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 9l4-4 3 3 4-4" stroke={ACCENT_SUCCESS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 5h2v2" stroke={ACCENT_SUCCESS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      +12%
                    </span>
                  </div>
                </div>
                <div className="ri-trend-chart-area">
                  <LineChart hideTabs metric="revenue" />
                </div>
              </div>

              {/* Mid row: Revenue by Category + Revenue by Region */}
              <div className="ri-mid-row">
                <div className="ri-card ri-breakdown-card">
                  <h3 className="ri-card-title">Revenue by Category</h3>
                  <DonutChart />
                </div>

                <div className="ri-card ri-region-card">
                  <h3 className="ri-card-title">Revenue by Region</h3>
                  <div className="ri-region-bars">
                    {regionBars.map((b, i) => {
                      const pct = Math.round((b.value / maxRegion) * 100)
                      return (
                        <div key={i} className="ri-region-row">
                          <span className="ri-region-label">{b.label}</span>
                          <div className="ri-region-track">
                            <div
                              className="ri-region-bar"
                              style={{
                                width: `${pct}%`,
                                background: b.color,
                              }}
                            />
                          </div>
                          <span className="ri-region-value">{fmtCur(b.value)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Top Products by Revenue */}
              <div className="ri-card ri-table-card">
                <div className="ri-table-header">
                  <h3 className="ri-card-title">Top Products by Revenue</h3>
                </div>
                <table className="ri-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Revenue</th>
                      <th>Share</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => {
                      const share = totalRevenue > 0 ? Math.round((p.revenue / totalRevenue) * 100) : 0
                      return (
                        <tr key={i}>
                          <td>
                            <div className="ri-product-cell">
                              <span className="ri-product-icon">{String.fromCharCode(65 + (i % 26))}</span>
                              {p.name}
                            </div>
                          </td>
                          <td>
                            <b>{fmtCur(p.revenue)}</b>
                          </td>
                          <td>{share}%</td>
                          <td>
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                              <path d="M4 14l4-4 3 3 5-6" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel */}
            <div className="ri-col-right">
              <div className="ri-card ri-drivers-card">
                <h3 className="ri-card-title">Top 3 Revenue Months</h3>
                <p className="ri-insights-description">
                  Study seasonal peaks to plan inventory and campaigns for stronger performance.
                </p>
                <div className="ri-bar-chart-wrapper">
                  <TopRevenueMonthsBarChart />
                </div>
              </div>

              <div className="ri-card ri-avg-card">
                <h3 className="ri-card-title">Average Order Value</h3>
                <div className="ri-avg-value">{fmtCur(aov)}</div>
                <p className="ri-avg-hint">Revenue ÷ Orders in selected period</p>
              </div>

              <div className="ri-card ri-insights-card">
                <h3 className="ri-card-title">Actionable Insights</h3>
                <ul className="ri-drivers-list">
                  {insights.map((item, i) => (
                    <li key={i}>
                      <span className="ri-driver-dot" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueInsights
