import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LineChart from '../features/LineChart'
import DateRangePicker from '../components/DateRangePicker'
import ProfitBreakdownChart from '../features/DonutChart/ProfitBreakdownChart'
import TopMonthsBarChart from '../features/BarChart/TopMonthsBarChart'
import { KpiContext } from '../context/KpiContext'
import './ProfitInsights.css'

/* ── Profit Breakdown stacked bar ─────────────────────────────── */
const BREAKDOWN_SEGMENTS = [
  { label: 'Revenue',  color: '#3b82f6', pct: 58 },
  { label: 'Cost',     color: '#a78bfa', pct: 14 },
  { label: 'Ad Spend', color: '#fb923c', pct: 10 },
  { label: 'Shipping', color: '#34d399', pct: 10 },
  { label: 'Discount', color: '#93c5fd', pct:  8 },
]

const BREAKDOWN_ROWS = [
  { label: 'Revenue', dot: '#3b82f6', cols: ['$94,562', '$2,367',  'Ad Spend', 'Shipping', 'Total'] },
  { label: 'Total',   dot: '#6366f1', cols: ['$03,652', '$55,59',  '$11,459',  '$3,446',   '3.30K'] },
  { label: 'Profit',  dot: '#10b981', cols: ['$03,652', '$55,59',  '$11,459',  '$3,446',   '↑3.30K'] },
]

/* ── Right-panel: Most Profitable Products vertical bar chart ─── */
const CHANNEL_BARS = [
  { label: 'Instagram',   value: 85000,  color: '#60a5fa' },
  { label: 'Website',     value: 126000, color: '#2563eb' },
  { label: 'Offline',     value: 50000,  color: '#60a5fa' },
  { label: 'Marketplace', value: 32000,  color: '#93c5fd' },
]

/* ── Right-panel: Loss Making Products vertical bar chart ──────── */
const LOSS_BARS = [
  { label: 'Sun', value: 3000, color: '#2563eb' },
  { label: 'Tue', value: 1800, color: '#2563eb' },
  { label: 'Wed', value: 1600, color: '#22d3ee' },
  { label: 'Thu', value: 1200, color: '#22d3ee' },
  { label: 'Fri', value: 800,  color: '#22d3ee' },
  { label: 'Sxt', value: 4443, color: '#06b6d4' },
]

/* ── Most Profitable Products table (left col) ───────────────────*/
const TOP_PRODUCTS = [
  { icon: '🔷', name: 'Widget A', profit: 128962, margin: 42, orders: 1387 },
  { icon: '⚙️',  name: 'Widget B', profit: 99573,  margin: 37, orders: 1165 },
  { icon: '🟦', name: 'Widget C', profit: 52801,  margin: 34, orders: 936  },
]

const LOSS_PRODUCTS = [
  { name: 'Widget D', loss: 2586 },
  { name: 'Widget E', loss: 1743 },
]

const ProfitInsights = () => {
  const { kpiData } = useContext(KpiContext)

  /* date picker */
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [dateRange, setDateRange] = useState(() => {
    const end   = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 1)
    return { start, end }
  })

  /* table view */
  const [tableView, setTableView]         = useState('Profit')

  /* ── helpers ── */
  const fmt = (d) =>
    d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const dateLabel = dateRange.start && dateRange.end
    ? `${fmt(dateRange.start)} – ${fmt(dateRange.end)}`
    : 'Select dates'

  const fmtCur = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(n)

  /* ── bar chart helpers ── */
  const maxChannel = Math.max(...CHANNEL_BARS.map(b => b.value))
  const maxLoss    = Math.max(...LOSS_BARS.map(b => b.value))

  const fmtK = (n) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`

  // Calculate top 3 profitable months
  const top3Months = useMemo(() => {
    if (!kpiData?.date_data || !kpiData?.profit_data) {
      return [
        { month: 'Jan', profit: 125000, color: '#2563eb' },
        { month: 'Feb', profit: 98000, color: '#3b82f6' },
        { month: 'Mar', profit: 87000, color: '#60a5fa' },
      ]
    }

    const dates = kpiData.date_data
    const profits = kpiData.profit_data
    const monthData = new Map()

    // Group profits by month
    dates.forEach((dateStr, i) => {
      try {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`
          const monthName = date.toLocaleDateString('en-US', { month: 'short' })
          const profit = Number(profits[i]) || 0
          
          if (monthData.has(monthKey)) {
            monthData.set(monthKey, {
              month: monthName,
              profit: monthData.get(monthKey).profit + profit,
              color: monthData.get(monthKey).color
            })
          } else {
            const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
            monthData.set(monthKey, {
              month: monthName,
              profit: profit,
              color: colors[monthData.size % colors.length]
            })
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    })

    // Sort by profit and get top 3
    return Array.from(monthData.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 3)
  }, [kpiData?.date_data, kpiData?.profit_data])

  const maxMonthProfit = Math.max(...top3Months.map(m => m.profit), 1)
  
  // Calculate Y-axis ticks with nice round numbers
  const yAxisTicks = useMemo(() => {
    if (maxMonthProfit === 0) return [0, 0, 0, 0, 0, 0]
    
    // Round up to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxMonthProfit)))
    const normalized = maxMonthProfit / magnitude
    let niceMax
    if (normalized <= 1) niceMax = magnitude
    else if (normalized <= 2) niceMax = 2 * magnitude
    else if (normalized <= 5) niceMax = 5 * magnitude
    else niceMax = 10 * magnitude
    
    // Generate 6 evenly spaced ticks (including 0)
    const ticks = []
    for (let i = 5; i >= 0; i--) {
      ticks.push(Math.round((niceMax * i) / 5))
    }
    return ticks
  }, [maxMonthProfit])

  return (
    <div className="pi-page">
      <Sidebar />

      <div className="pi-shell">
        {/* ═══ CUSTOM TOP NAV ═══════════════════════════════════════════ */}
        <header className="pi-topnav">
          <div className="pi-breadcrumbs">
            <Link to="/dashboard" className="pi-bc-link">Dashboard</Link>
            <span className="pi-bc-sep">/</span>
            <span className="pi-bc-link">Performance</span>
            <span className="pi-bc-sep">/</span>
            <span className="pi-bc-active">Profit</span>
          </div>

          <div className="pi-topnav-search">
            <svg className="pi-search-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search Anything" className="pi-search-input" />
          </div>

          <div className="pi-topnav-actions">
            <button className="pi-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 4C2 2.9 2.9 2 4 2H16C17.1 2 18 2.9 18 4V12C18 13.1 17.1 14 16 14H6L2 18V4Z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="6.5" cy="8" r=".8" fill="currentColor"/>
                <circle cx="10"  cy="8" r=".8" fill="currentColor"/>
                <circle cx="13.5" cy="8" r=".8" fill="currentColor"/>
              </svg>
            </button>
            <button className="pi-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 3V4M10 16V17M17 10H16M4 10H3M15.66 4.34L14.95 5.05M5.05 14.95L4.34 15.66M15.66 15.66L14.95 14.95M5.05 5.05L4.34 4.34"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="pi-profile">
              <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className="pi-avatar"/>
              <span className="pi-profile-name">Nish Patel</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </header>

        {/* ═══ SCROLLABLE CONTENT ════════════════════════════════════════ */}
        <div className="pi-content">

          {/* ── Page header ── */}
          <div className="pi-page-header">
            <h1 className="pi-page-title">Profit Overview</h1>

            <div className="pi-page-actions">
              {/* Date range */}
              <div style={{ position: 'relative' }}>
                <button className="pi-action-btn"
                        onClick={() => setIsDatePickerOpen(v => !v)}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="2"
                          stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="5" cy="9" r=".5" fill="currentColor"/>
                    <circle cx="8" cy="9" r=".5" fill="currentColor"/>
                    <circle cx="11" cy="9" r=".5" fill="currentColor"/>
                  </svg>
                  <span>{dateLabel}</span>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <DateRangePicker isOpen={isDatePickerOpen}
                                 onClose={() => setIsDatePickerOpen(false)}
                                 onApply={r => setDateRange(r)}
                                 initialRange={dateRange} />
              </div>
            </div>
          </div>

          {/* ═══ BODY: 2-column layout ════════════════════════════════════ */}
          <div className="pi-body">

            {/* ── LEFT MAIN COLUMN ────────────────────────────────────────── */}
            <div className="pi-col-main">

              {/* ┌ Profit Trend card ─────────────────────────────────────── */}
              <div className="pi-card pi-trend-card">
                <div className="pi-trend-header">
                  <h2 className="pi-card-title">Profit Trend</h2>
                </div>

                {/* date sub-label + big value */}
                <div className="pi-trend-meta">
                  <span className="pi-trend-date">{dateLabel}</span>
                  <div className="pi-trend-value">
                    <span className="pi-trend-amount">
                      {kpiData ? fmtCur(kpiData.profit_sum) : '$367,857'}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 9l4-4 3 3 4-4" stroke="#2563eb" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 5h2v2" stroke="#2563eb" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Line chart */}
                <div className="pi-trend-chart-area">
                  <LineChart hideTabs={true} />
                </div>
              </div>

              {/* ┌ Mid row: Profit Breakdown + Profit Drivers ────────────── */}
              <div className="pi-mid-row">

                {/* Profit Breakdown */}
                <div className="pi-card pi-breakdown-card">
                  <h3 className="pi-card-title">Profit Breakdown</h3>
                  <ProfitBreakdownChart />
                </div>

                {/* Profit Drivers (middle col duplicate) */}
                <div className="pi-card pi-drivers-sm-card">
                  <h3 className="pi-card-title">Profit Drivers</h3>
                  <ul className="pi-drivers-list">
                    <li><span className="pi-driver-dot blue"/><b>Highest cost:</b> <em>Ad Spend</em></li>
                    <li><span className="pi-driver-dot blue"/><b>Biggest booster:</b> <em>Reenue from A</em></li>
                    <li><span className="pi-driver-dot blue"/><b>Lowest profit day:</b> <em>Feb 1</em></li>
                    <li><span className="pi-driver-dot blue"/>Returns caused a <b>$6.5k loss</b> during this period</li>
                  </ul>

                  <div className="pi-divider"/>
                  <h3 className="pi-card-title" style={{ marginTop: 14 }}>Actionable Insights</h3>
                  <ul className="pi-drivers-list">
                    <li><span className="pi-driver-dot blue"/>
                      <b>Consider</b> pausing ads on Platform C.
                    </li>
                    <li><span className="pi-driver-dot blue"/>
                      <b>Reduce:</b> Shipping discounts to Platform D
                    </li>
                  </ul>
                </div>
              </div>

              {/* ┌ Most Profitable Products table ─────────────────────────── */}
              <div className="pi-card pi-table-card">
                <div className="pi-table-header">
                  <h3 className="pi-card-title">Most Profitable Products</h3>
                  <div className="pi-table-view-btns">
                    <button className="pi-view-btn">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      Profit
                    </button>
                    <button className={`pi-view-btn ${tableView === 'Trend' ? 'active' : ''}`}
                            onClick={() => setTableView('Trend')}>
                      Trend
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5"
                              strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <table className="pi-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Profit <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></th>
                      <th>Margin <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></th>
                      <th>Orders <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></th>
                      <th/>
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_PRODUCTS.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <div className="pi-product-cell">
                            <span className="pi-product-icon">{p.icon}</span>
                            {p.name}
                          </div>
                        </td>
                        <td><b>{fmtCur(p.profit)}</b></td>
                        <td>{p.margin}%</td>
                        <td>{p.orders.toLocaleString()}</td>
                        <td>
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M4 14l4-4 3 3 5-6" stroke="#2563eb" strokeWidth="1.8"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
            <div className="pi-col-right">

              {/* Top 3 Profitable Months */}
              <div className="pi-card pi-drivers-card">
                <h3 className="pi-card-title">Top 3 Profitable Months</h3>
                
                <p className="pi-insights-description">
                  Study why these months made more profits and implement it in all months to grow your Business
                </p>
                
                <div className="pi-bar-chart-wrapper">
                  <TopMonthsBarChart />
                </div>
              </div>

              {/* Most Profitable Products – vertical bar chart */}
              <div className="pi-card pi-bar-card">
                <h3 className="pi-card-title">Most Profitable Products</h3>

                <div className="pi-vbar-chart">
                  {/* y-axis labels */}
                  <div className="pi-vbar-yaxis">
                    <span>$126k</span>
                    <span>$50K</span>
                    <span>$25K</span>
                  </div>

                  {/* bars */}
                  <div className="pi-vbar-bars">
                    {CHANNEL_BARS.map((b, i) => {
                      const h = Math.round((b.value / maxChannel) * 120)
                      return (
                        <div key={i} className="pi-vbar-col">
                          <div className="pi-vbar-track">
                            <div className="pi-vbar" style={{ height: h, background: b.color }}/>
                          </div>
                          <span className="pi-vbar-label">{b.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Loss Making Products – vertical bar chart */}
              <div className="pi-card pi-bar-card">
                <h3 className="pi-card-title">Loss Making Products</h3>

                <div className="pi-vbar-chart">
                  <div className="pi-vbar-yaxis">
                    <span>$3k</span>
                    <span>$1k</span>
                    <span>$6</span>
                  </div>

                  <div className="pi-vbar-bars">
                    {LOSS_BARS.map((b, i) => {
                      const h = Math.round((b.value / maxLoss) * 120)
                      const isTop = i === LOSS_BARS.length - 1
                      return (
                        <div key={i} className="pi-vbar-col">
                          <div className="pi-vbar-track">
                            {isTop && (
                              <span className="pi-vbar-badge">
                                {fmtK(b.value)}
                              </span>
                            )}
                            <div className="pi-vbar" style={{ height: h, background: b.color }}/>
                          </div>
                          <span className="pi-vbar-label">{b.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="pi-card pi-insights-card">
                <h3 className="pi-card-title">Actionable Insights</h3>
                <ul className="pi-drivers-list">
                  <li>
                    <span className="pi-driver-dot blue-outline"/>
                    <span><b>Consider</b> pausing ads on Platform C.</span>
                  </li>
                  <li>
                    <span className="pi-driver-dot blue-outline"/>
                    <span><b>Reduce:</b> Shipping discounts to Platform D</span>
                  </li>
                </ul>
              </div>

              {/* Loss Heaking Products */}
              <div className="pi-card pi-loss-table-card">
                <h3 className="pi-card-title">Loss Heaking Products</h3>
                <div className="pi-loss-rows">
                  {LOSS_PRODUCTS.map((p, i) => (
                    <div key={i} className="pi-loss-row">
                      <span className="pi-loss-name">{p.name}</span>
                      <span className="pi-loss-amount">-{fmtCur(p.loss)}</span>
                      <span className="pi-loss-icons">
                        {/* red down arrow */}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 3v8M4 8l3 3 3-3" stroke="#dc2626" strokeWidth="1.6"
                                strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {/* green up arrow */}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 11V3M4 6l3-3 3 3" stroke="#16a34a" strokeWidth="1.6"
                                strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>{/* /pi-col-right */}
          </div>{/* /pi-body */}
        </div>{/* /pi-content */}
      </div>{/* /pi-shell */}
    </div>
  )
}

export default ProfitInsights
