import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LineChart from '../features/LineChart'
import DateRangePicker from '../components/DateRangePicker'
import ProfitBreakdownChart from '../features/DonutChart/ProfitBreakdownChart'
import TopMonthsBarChart from '../features/BarChart/TopMonthsBarChart'
import { KpiContext } from '../context/KpiContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import './ProfitInsights.css'

// Custom Tooltip component to remove index numbers
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div style={{
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        backgroundColor: '#fff',
        padding: '8px 12px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
          {data.label}
        </div>
        <div style={{ color: '#6b7280' }}>
          ${data.value.toLocaleString()}
        </div>
      </div>
    )
  }
  return null
}

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
  { label: 'Instagram',   value: 85000,  color: '#3b82f6' },
  { label: 'Website',     value: 126000, color: '#8b5cf6' },
  { label: 'Offline',     value: 50000,  color: '#f59e0b' },
  { label: 'Marketplace', value: 32000,  color: '#34d399' },
]

/* ── Most Profitable Products table (left col) ───────────────────*/
const TOP_PRODUCTS = [
  { icon: '🔷', name: 'Widget A', profit: 128962, margin: 42, orders: 1387, location: 'New York, US' },
  { icon: '⚙️',  name: 'Widget B', profit: 99573,  margin: 37, orders: 1165, location: 'London, UK' },
  { icon: '🟦', name: 'Widget C', profit: 52801,  margin: 34, orders: 936,  location: 'Tokyo, Japan' },
  { icon: '🔶', name: 'Widget D', profit: 45230,  margin: 32, orders: 824,  location: 'Sydney, Australia' },
  { icon: '🔸', name: 'Widget E', profit: 38945,  margin: 30, orders: 712,  location: 'Toronto, Canada' },
  { icon: '🔹', name: 'Widget F', profit: 32156,  margin: 28, orders: 645,  location: 'Berlin, Germany' },
  { icon: '🔺', name: 'Widget G', profit: 28734,  margin: 26, orders: 589,  location: 'Paris, France' },
  { icon: '🔻', name: 'Widget H', profit: 25432,  margin: 24, orders: 534,  location: 'Mumbai, India' },
  { icon: '🔴', name: 'Widget I', profit: 22345,  margin: 22, orders: 487,  location: 'São Paulo, Brazil' },
  { icon: '🟠', name: 'Widget J', profit: 19876,  margin: 20, orders: 432,  location: 'Dubai, UAE' },
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

  /* top products count */
  const [topProductsCount, setTopProductsCount] = useState(3)
  
  /* pie chart hover state */
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState(null)
  
  /* profit trend duration */
  const [profitTrendDuration, setProfitTrendDuration] = useState('1M')

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
  
  // Calculate percentage increase for profit trend
  const profitPercentageIncrease = useMemo(() => {
    if (!kpiData?.profit_data || kpiData.profit_data.length < 2) {
      return null
    }
    const profits = kpiData.profit_data.map(p => Number(p) || 0)
    const firstValue = profits[0] || 0
    const lastValue = profits[profits.length - 1] || 0
    
    if (firstValue === 0) return null
    
    const change = ((lastValue - firstValue) / firstValue) * 100
    return change
  }, [kpiData?.profit_data])
  
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
            <h1 className="pi-page-title">Profit Growth</h1>
          </div>

          {/* ═══ BODY: 2-column layout ════════════════════════════════════ */}
          <div className="pi-body">

            {/* ── Columns wrapper ─────────────────────────────────────────── */}
            <div className="pi-cols-wrapper">
              {/* ── LEFT MAIN COLUMN ────────────────────────────────────────── */}
              <div className="pi-col-main">

                {/* ┌ Profit Trend card ─────────────────────────────────────── */}
                <div className="pi-card pi-trend-card">
                  <div className="pi-trend-header">
                    <h2 className="pi-card-title">Profit Trend</h2>
                    <div className="pi-trend-controls-group">
                      <div className="pi-trend-duration-group">
                        <button 
                          className={`pi-trend-duration-btn ${profitTrendDuration === '1M' ? 'active' : ''}`}
                          onClick={() => setProfitTrendDuration('1M')}
                        >
                          1M
                        </button>
                        <button 
                          className={`pi-trend-duration-btn ${profitTrendDuration === '3M' ? 'active' : ''}`}
                          onClick={() => setProfitTrendDuration('3M')}
                        >
                          3M
                        </button>
                        <button 
                          className={`pi-trend-duration-btn ${profitTrendDuration === '6M' ? 'active' : ''}`}
                          onClick={() => setProfitTrendDuration('6M')}
                        >
                          6M
                        </button>
                        <button 
                          className={`pi-trend-duration-btn ${profitTrendDuration === '1Y' ? 'active' : ''}`}
                          onClick={() => setProfitTrendDuration('1Y')}
                        >
                          1Y
                        </button>
                        <button 
                          className={`pi-trend-duration-btn ${profitTrendDuration === 'ALL' ? 'active' : ''}`}
                          onClick={() => setProfitTrendDuration('ALL')}
                        >
                          ALL
                        </button>
                      </div>
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

                  {/* big value */}
                  <div className="pi-trend-meta">
                    <div className="pi-trend-value">
                      <span className="pi-trend-amount">
                        {kpiData ? fmtCur(kpiData.profit_sum) : '$367,857'}
                      </span>
                      {profitPercentageIncrease !== null && (
                        <span className="pi-trend-percentage" style={{ color: '#10b981' }}>
                          {profitPercentageIncrease >= 0 ? '+' : ''}{profitPercentageIncrease.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Line chart */}
                  <div className="pi-trend-chart-area">
                    <LineChart hideTabs={true} />
                  </div>
                </div>

                {/* Top 3 Profitable Months and Average Profit Per Order */}
                <div className="pi-top-months-row">
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

                  {/* Average Profit Per Order */}
                  <div className="pi-card pi-drivers-card">
                    <h3 className="pi-card-title">Average Profit Per Order</h3>
                    
                    <div className="pi-average-profit-content">
                      <div className="pi-average-profit-main">
                        <div className="pi-average-profit-value">
                          {kpiData?.profit_sum && kpiData?.orders_sum
                            ? fmtCur(kpiData.profit_sum / kpiData.orders_sum)
                            : '$168'}
                        </div>
                        <div className="pi-average-profit-stats">
                          <div className="pi-stat-item">
                            <div className="pi-stat-label-row">
                              <span className="pi-stat-glow-circle"></span>
                              <span className="pi-stat-label">Total Orders</span>
                            </div>
                            <span className="pi-stat-value">
                              {kpiData?.orders_sum ? kpiData.orders_sum.toLocaleString() : '2,187'}
                            </span>
                          </div>
                          <div className="pi-stat-item">
                            <div className="pi-stat-label-row">
                              <span className="pi-stat-glow-circle"></span>
                              <span className="pi-stat-label">Total Profit</span>
                            </div>
                            <span className="pi-stat-value">
                              {kpiData?.profit_sum ? fmtCur(kpiData.profit_sum) : '$367,857'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ┌ Profit Breakdown ────────────── */}
                <div className="pi-mid-row">
                  {/* Profit Breakdown */}
                  <div className="pi-card pi-breakdown-card">
                    <h3 className="pi-card-title">Profit Breakdown</h3>
                    <ProfitBreakdownChart />
                    
                    {/* PROs and CONs Section */}
                    <div className="pi-pros-cons-section">
                      <div className="pi-pros-cons-column">
                        <h4 className="pi-pros-cons-title pi-pros-title">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6 11L13 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          PROs
                        </h4>
                        <ul className="pi-pros-cons-list">
                          {(() => {
                            const pros = []
                            const revenueSegment = BREAKDOWN_SEGMENTS.find(s => s.label.toLowerCase().includes('revenue'))
                            const profitSegment = BREAKDOWN_SEGMENTS.find(s => s.label.toLowerCase().includes('profit'))
                            const costSegment = BREAKDOWN_SEGMENTS.find(s => s.label.toLowerCase().includes('cost'))
                            
                            if (revenueSegment && revenueSegment.pct > 50) {
                              pros.push(`Strong revenue generation (${revenueSegment.pct}% of total)`)
                            }
                            if (profitSegment && profitSegment.pct >= 8) {
                              pros.push(`Healthy profit margin at ${profitSegment.pct}%`)
                            }
                            if (costSegment && costSegment.pct < 20) {
                              pros.push(`Cost management is efficient (${costSegment.pct}%)`)
                            }
                            if (kpiData?.profit_sum && kpiData.profit_sum > 300000) {
                              pros.push(`Total profit exceeds $300k threshold`)
                            }
                            if (pros.length === 0) {
                              pros.push('Revenue streams are diversified')
                              pros.push('Breakdown shows balanced allocation')
                            }
                            return pros.map((pro, i) => (
                              <li key={i} className="pi-pros-item">
                                <span className="pi-pros-cons-icon">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))
                          })()}
                        </ul>
                      </div>
                      
                      <div className="pi-pros-cons-divider"></div>
                      
                      <div className="pi-pros-cons-column">
                        <h4 className="pi-pros-cons-title pi-cons-title">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4L12 12M12 4L4 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          CONs
                        </h4>
                        <ul className="pi-pros-cons-list">
                          {(() => {
                            const cons = []
                            const adSpendSegment = BREAKDOWN_SEGMENTS.find(s => s.label.toLowerCase().includes('ad spend') || s.label.toLowerCase().includes('adspend'))
                            const profitSegment = BREAKDOWN_SEGMENTS.find(s => s.label.toLowerCase().includes('profit'))
                            const shippingSegment = BREAKDOWN_SEGMENTS.find(s => s.label.toLowerCase().includes('shipping'))
                            
                            if (adSpendSegment && adSpendSegment.pct > 12) {
                              cons.push(`Ad spend is high (${adSpendSegment.pct}%) - consider optimization`)
                            }
                            if (profitSegment && profitSegment.pct < 10) {
                              cons.push(`Profit margin below 10% (${profitSegment.pct}%) - needs improvement`)
                            }
                            if (shippingSegment && shippingSegment.pct > 12) {
                              cons.push(`Shipping costs are elevated (${shippingSegment.pct}%)`)
                            }
                            if (cons.length === 0) {
                              cons.push('Monitor cost trends closely')
                              cons.push('Review discount strategies regularly')
                            }
                            return cons.map((con, i) => (
                              <li key={i} className="pi-cons-item">
                                <span className="pi-pros-cons-icon">✗</span>
                                <span>{con}</span>
                              </li>
                            ))
                          })()}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>{/* /pi-cols-wrapper */}

            {/* ┌ Most Profitable Products table ─────────────────────────── */}
            <div className="pi-card pi-table-card">
              <div className="pi-table-header">
                <h3 className="pi-card-title">Most Profitable Products</h3>
                <div className="pi-top-products-dropdown-wrapper">
                  <select 
                    className="pi-top-products-dropdown"
                    value={topProductsCount}
                    onChange={(e) => setTopProductsCount(Number(e.target.value))}
                  >
                    <option value={3}>TOP 3</option>
                    <option value={5}>TOP 5</option>
                    <option value={10}>TOP 10</option>
                  </select>
                </div>
              </div>

              <table className="pi-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Profit <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></th>
                    <th>Margin <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></th>
                    <th>Orders <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_PRODUCTS.slice(0, topProductsCount).map((p, i) => (
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
                        <div className="pi-location-cell">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginRight: '6px' }}>
                            <path d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4zm0 5.5c-.8 0-1.5-.7-1.5-1.5S7.2 4.5 8 4.5 9.5 5.2 9.5 6 8.8 7.5 8 7.5z" fill="#6b7280"/>
                          </svg>
                          <span className="pi-location-text">{p.location}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Profit by Categories – donut chart */}
            <div className="pi-card pi-bar-card">
              <h3 className="pi-card-title">Profit by Categories</h3>

              <div className="pi-pie-chart-container">
                {/* Donut chart with center overlay */}
                <div className="pi-donut-wrapper">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={CHANNEL_BARS}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={88}
                        innerRadius={62}
                        dataKey="value"
                        paddingAngle={5}
                        strokeWidth={0}
                      >
                        {CHANNEL_BARS.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            className="pi-donut-segment"
                            onMouseEnter={() => setHoveredSegmentIndex(index)}
                            onMouseLeave={() => setHoveredSegmentIndex(null)}
                            style={{ 
                              cursor: 'pointer',
                              transition: 'opacity 0.2s ease',
                              opacity: hoveredSegmentIndex !== null && hoveredSegmentIndex !== index ? 0.5 : 1
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text */}
                  <div className="pi-donut-center">
                    <span className="pi-donut-center-label">Total Profit</span>
                    <span className="pi-donut-center-value">
                      ${(CHANNEL_BARS.reduce((s, b) => s + b.value, 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>

                {/* Custom legend */}
                <div className="pi-donut-legend">
                  {CHANNEL_BARS.map((item, i) => {
                    const total = CHANNEL_BARS.reduce((s, b) => s + b.value, 0)
                    const pct = Math.round((item.value / total) * 100)
                    const isHovered = hoveredSegmentIndex === i
                    return (
                      <div 
                        key={i} 
                        className={`pi-donut-legend-item ${isHovered ? 'pi-donut-legend-item-focused' : ''}`}
                        onMouseEnter={() => setHoveredSegmentIndex(i)}
                        onMouseLeave={() => setHoveredSegmentIndex(null)}
                      >
                        <span className="pi-donut-legend-dot" style={{ background: item.color }} />
                        <span className="pi-donut-legend-name">{item.label}</span>
                        <span className="pi-donut-legend-pct">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>{/* /pi-body */}
        </div>{/* /pi-content */}
      </div>{/* /pi-shell */}
    </div>
  )
}

export default ProfitInsights
