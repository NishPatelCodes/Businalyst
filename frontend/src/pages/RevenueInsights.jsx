import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DateRangePicker from '../components/DateRangePicker'
import RevenueComparisonBarChart from '../features/RevenueComparisonBarChart/RevenueComparisonBarChart'
import RevenueByPaymentMethod from '../features/RevenueByPaymentMethod/RevenueByPaymentMethod'
import RevenueByCategoryBubble from '../features/RevenueByCategoryBubble/RevenueByCategoryBubble'
import RevenueLineChart from '../features/RevenueLineChart/RevenueLineChart'
import TopProfitTable from '../components/TopProfitTable'
import GoalsCard from '../features/GoalsCard/GoalsCard'
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
          {/* Full-width revenue line chart (match reference image) */}
          <div className="ri-chart-full">
            <RevenueLineChart
              dateLabel={dateLabel}
              onOpenDatePicker={() => setIsDatePickerOpen(true)}
              totalRevenue={kpiData?.revenue_sum}
              changePercent={15}
            />
            <div style={{ position: 'relative' }}>
              <DateRangePicker
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onApply={(r) => setDateRange(r)}
                initialRange={dateRange}
              />
            </div>
          </div>

          {/* Grid below chart: former right panel + main content */}
          <div className="ri-grid-below">
            <div className="ri-cards-row">
              <RevenueComparisonBarChart />
              <RevenueByCategoryBubble />
              <div className="ri-card ri-insights-card">
                <GoalsCard />
              </div>
            </div>

            {/* Mid row: Revenue by Payment Method + Revenue by Region */}
            <div className="ri-mid-row">
                <RevenueByPaymentMethod />

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

            {/* Same table as Dashboard: Top 5 by Profit */}
            <div className="ri-card ri-table-card">
              <TopProfitTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueInsights
