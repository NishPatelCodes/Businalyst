import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import RevenueComparisonBarChart from '../features/RevenueComparisonBarChart/RevenueComparisonBarChart'
import RevenueByPaymentMethod from '../features/RevenueByPaymentMethod/RevenueByPaymentMethod'
import RevenueByCategoryBubble from '../features/RevenueByCategoryBubble/RevenueByCategoryBubble'
import RevenueLineChart from '../features/RevenueLineChart/RevenueLineChart'
import GoalsCard from '../features/GoalsCard/GoalsCard'
import RevenueInsightsByColumn from '../features/RevenueInsightsByColumn/RevenueInsightsByColumn'
import { KpiContext } from '../context/KpiContext'
import { filterSeriesByCalendarRange } from '../utils/timeRangeFilter'
import './RevenueInsights.css'

const RANGES = ['7D', '30D', '90D', '1Y', 'ALL']

const RevenueInsights = () => {
  const { kpiData, formatCurrency } = useContext(KpiContext)

  const [dateRange, setDateRange] = useState('30D')
  const [exportOpen, setExportOpen] = useState(false)

  /* ── Per-row arrays ─────────────────────────────────────────── */
  const dateData    = useMemo(() => kpiData?.date_data || [], [kpiData])
  const revenueData = useMemo(() => (kpiData?.revenue_data || []).map(Number), [kpiData])
  const profitData  = useMemo(() => (kpiData?.profit_data || []).map(Number), [kpiData])
  const productData = useMemo(() => kpiData?.product_data || [], [kpiData])

  /* ── Full sorted timeline ───────────────────────────────────── */
  const allSeries = useMemo(() => {
    const series = dateData.map((d, i) => ({
      date: d,
      revenue: revenueData[i] || 0,
      profit: profitData[i] || 0,
      expense: (revenueData[i] || 0) - (profitData[i] || 0),
      product: productData[i] || '',
    }))
    return [...series].sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [dateData, revenueData, profitData, productData])

  /* ── Filtered by selected range (calendar days from last data point) ─ */
  const filteredSeries = useMemo(
    () => filterSeriesByCalendarRange(allSeries, dateRange),
    [allSeries, dateRange]
  )

  const periodRatio = useMemo(() => {
    if (!allSeries.length) return 1
    const totalRev = allSeries.reduce((s, p) => s + p.revenue, 0)
    const filRev = filteredSeries.reduce((s, p) => s + p.revenue, 0)
    return totalRev > 0 ? Math.min(1, filRev / totalRev) : filteredSeries.length / allSeries.length
  }, [allSeries, filteredSeries])

  /* ── Period revenue sum ─────────────────────────────────────── */
  const periodRevenue = useMemo(
    () => filteredSeries.reduce((s, pt) => s + pt.revenue, 0),
    [filteredSeries]
  )

  /* ── Change % (first half vs second half of filtered period) ── */
  const changePercent = useMemo(() => {
    if (filteredSeries.length < 2) return 0
    const mid = Math.floor(filteredSeries.length / 2)
    const firstHalf  = filteredSeries.slice(0, mid).reduce((s, p) => s + p.revenue, 0)
    const secondHalf = filteredSeries.slice(mid).reduce((s, p) => s + p.revenue, 0)
    if (firstHalf === 0) return 0
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
  }, [filteredSeries])

  /* ── Export handlers ────────────────────────────────────────── */
  const handleExportCSV = () => {
    if (!filteredSeries.length) return
    const cols = ['date', 'revenue', 'profit', 'expense']
    const csvRows = [cols.join(',')]
    filteredSeries.forEach((row) => {
      csvRows.push(cols.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-insights-${dateRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => { window.print() }

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
          {/* ── Page Header: title + global time range + export ── */}
          <div className="ri-page-header">
            <div>
              <h1 className="ri-page-title">Revenue Intelligence</h1>
              <p className="ri-page-subtitle">Revenue analysis · {dateRange} timeline</p>
            </div>
            <div className="ri-page-header-actions">
              <div className="ri-range-tabs">
                {RANGES.map(r => (
                  <button
                    key={r}
                    className={`ri-range-tab${dateRange === r ? ' ri-range-tab--active' : ''}`}
                    onClick={() => setDateRange(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="ri-export-wrap">
                <button className="ri-export-btn" onClick={() => setExportOpen(prev => !prev)} aria-expanded={exportOpen}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Export
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {exportOpen && (
                  <>
                    <div className="ri-export-backdrop" onClick={() => setExportOpen(false)} aria-hidden="true" />
                    <div className="ri-export-menu">
                      <button className="ri-export-menu-item" onClick={() => { handleExportCSV(); setExportOpen(false) }}>
                        Export CSV
                      </button>
                      <button className="ri-export-menu-item" onClick={() => { handleExportPDF(); setExportOpen(false) }}>
                        Export PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Full-width revenue line chart */}
          <div className="ri-chart-full">
            <RevenueLineChart
              filteredSeries={filteredSeries}
              totalRevenue={periodRevenue}
              changePercent={changePercent}
              timeframe={dateRange}
            />
          </div>

          {/* Grid below chart */}
          <div className="ri-grid-below">
            <div className="ri-cards-row">
              <RevenueComparisonBarChart filteredSeries={filteredSeries} />
              <RevenueByCategoryBubble periodRatio={periodRatio} />
              <div className="ri-card ri-insights-card">
                <GoalsCard />
              </div>
            </div>

            <div className="ri-mid-row">
              <RevenueByPaymentMethod periodRatio={periodRatio} />
              <RevenueInsightsByColumn periodRatio={periodRatio} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueInsights
