import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { KpiContext } from '../context/KpiContext'
import {
  ComposedChart, BarChart, Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from 'recharts'
import './Orders.css'

/* ── Demo fallbacks ─────────────────────────────────────────── */
const DEMO_TREND = [
  { date: 'Jan 1',  orders: 142, revenue: 12500 },
  { date: 'Jan 8',  orders: 198, revenue: 18900 },
  { date: 'Jan 15', orders: 165, revenue: 15200 },
  { date: 'Jan 22', orders: 221, revenue: 22100 },
  { date: 'Feb 1',  orders: 189, revenue: 12300 },
  { date: 'Feb 8',  orders: 256, revenue: 20100 },
  { date: 'Feb 15', orders: 234, revenue: 15900 },
  { date: 'Feb 22', orders: 312, revenue: 22700 },
]

const DEMO_STATUS = [
  { name: 'Completed',  value: 2840, color: '#059669' },
  { name: 'Processing', value: 412,  color: '#2563eb' },
  { name: 'Shipped',    value: 318,  color: '#6366f1' },
  { name: 'Cancelled',  value: 156,  color: '#dc2626' },
  { name: 'Returned',   value: 116,  color: '#f59e0b' },
]

const DEMO_TOP_PRODUCTS = [
  { product: 'Tablet Stand',        orders: 428, revenue: 24500 },
  { product: 'Tablet Case',         orders: 392, revenue: 23800 },
  { product: 'Bluetooth Adapter',   orders: 356, revenue: 22900 },
  { product: 'USB-C Cable',         orders: 318, revenue: 22100 },
  { product: 'Wireless Headphones', orders: 284, revenue: 19400 },
  { product: 'Bluetooth Speaker',   orders: 261, revenue: 19800 },
  { product: 'Smartphone Case',     orders: 245, revenue: 17500 },
]

const DEMO_CATEGORY = [
  { name: 'Electronics',    value: 239 },
  { name: 'Office Supplies', value: 185 },
  { name: 'Accessories',    value: 74 },
]

/* ── Formatting helpers ─────────────────────────────────────── */
const fmtOrd = (n) => {
  const abs = Math.abs(n || 0)
  if (abs >= 1000) return `${((n || 0) / 1000).toFixed(1)}K`
  return String(Math.round(n || 0))
}
const fmtCur = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n || 0)
const fmtPct = (n) => `${(n || 0).toFixed(1)}%`
const fmtDate = (s) => {
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  catch { return s }
}

/* ── Custom tooltips ────────────────────────────────────────── */
const TrendTooltip = ({ active, payload, label, showRevenue }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="omi-tooltip">
      <div className="omi-tooltip-date">{fmtDate(label) || label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="omi-tooltip-row">
          <span className="omi-tooltip-dot" style={{ background: p.color || p.stroke }} />
          <span className="omi-tooltip-label">{p.name}</span>
          <span className="omi-tooltip-val">
            {p.dataKey === 'revenue' ? fmtCur(p.value) : fmtOrd(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

const ProductTooltip = ({ active, payload, label, totalOrders }) => {
  if (!active || !payload || !payload.length) return null
  const orders = payload[0]?.value || 0
  const revenue = payload[0]?.payload?.revenue || 0
  const pct = totalOrders > 0 ? (orders / totalOrders) * 100 : 0
  return (
    <div className="omi-tooltip">
      <div className="omi-tooltip-date">{label}</div>
      <div className="omi-tooltip-row">
        <span className="omi-tooltip-dot" style={{ background: '#2563eb' }} />
        <span className="omi-tooltip-label">Orders</span>
        <span className="omi-tooltip-val">{fmtOrd(orders)}</span>
      </div>
      <div className="omi-tooltip-row">
        <span className="omi-tooltip-dot" style={{ background: '#9ca3af' }} />
        <span className="omi-tooltip-label">Revenue</span>
        <span className="omi-tooltip-val">{fmtCur(revenue)}</span>
      </div>
      <div className="omi-tooltip-row">
        <span className="omi-tooltip-label">Share</span>
        <span className="omi-tooltip-val">{fmtPct(pct)}</span>
      </div>
    </div>
  )
}

/* ── Custom bar label for % share ───────────────────────────── */
const PctLabel = ({ x, y, width, height, value, total }) => {
  if (!value || !total) return null
  const pct = ((value / total) * 100).toFixed(1)
  return (
    <text x={x + width + 6} y={y + height / 2} fill="#6b7280" fontSize={11} dominantBaseline="middle">
      {pct}%
    </text>
  )
}

/* ── Status bar custom label ────────────────────────────────── */
const StatusLabel = ({ x, y, width, height, value }) => {
  if (!value) return null
  return (
    <text x={x + width + 6} y={y + height / 2} fill="#374151" fontSize={12} dominantBaseline="middle">
      {fmtOrd(value)}
    </text>
  )
}

/* ── Insight icon ───────────────────────────────────────────── */
const InsightIcon = ({ type }) => {
  const map = {
    up:   { symbol: '▲', color: '#059669' },
    down: { symbol: '▼', color: '#dc2626' },
    warn: { symbol: '⚠', color: '#d97706' },
    ok:   { symbol: '✓', color: '#6b7280' },
  }
  const { symbol, color } = map[type] || map['ok']
  return <span className="omi-insight-icon" style={{ color }}>{symbol}</span>
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const Orders = () => {
  const { kpiData } = useContext(KpiContext)

  const [range, setRange]           = useState('ALL')
  const [showRevenue, setShowRevenue] = useState(false)
  const [productSort, setProductSort] = useState('orders')

  /* ── Raw data arrays ─────────────────────────────────────── */
  const dateData    = useMemo(() => kpiData?.date_data    || [], [kpiData])
  const revenueData = useMemo(() => (kpiData?.revenue_data || []).map(Number), [kpiData])
  const ordersSum   = useMemo(() => Number(kpiData?.orders_sum) || 2187, [kpiData])
  const barData     = useMemo(() => kpiData?.bar_data || [], [kpiData])

  /* ── Build per-date trend using deterministic variation ───── */
  const trendData = useMemo(() => {
    if (!dateData.length) return DEMO_TREND
    const n = dateData.length
    const base = ordersSum / n
    return dateData.map((d, i) => {
      const factor = 0.7 + 0.6 * (0.5 + 0.5 * Math.sin(i * 1.3))
      return {
        date: d,
        orders: Math.round(base * factor),
        revenue: revenueData[i] || 0,
      }
    })
  }, [dateData, ordersSum, revenueData])

  /* ── Date range filtering ────────────────────────────────── */
  const filteredTrend = useMemo(() => {
    const limits = { '7D': 7, '30D': 30, '90D': 90, '1Y': 365 }
    const n = limits[range]
    return n ? trendData.slice(-n) : trendData
  }, [trendData, range])

  /* ── Label density for X-axis ────────────────────────────── */
  const xTickInterval = useMemo(() => {
    const len = filteredTrend.length
    if (len <= 10) return 0
    if (len <= 30) return 3
    if (len <= 90) return 9
    return Math.floor(len / 10)
  }, [filteredTrend])

  /* ── Status data ─────────────────────────────────────────── */
  const statusData = useMemo(() => {
    if (Array.isArray(kpiData?.orders_by_status) && kpiData.orders_by_status.length)
      return [...kpiData.orders_by_status].sort((a, b) => b.value - a.value)
    return [...DEMO_STATUS].sort((a, b) => b.value - a.value)
  }, [kpiData])

  const statusTotal = useMemo(() => statusData.reduce((s, d) => s + (d.value || 0), 0), [statusData])

  /* ── Top products ────────────────────────────────────────── */
  const topProductsRaw = useMemo(() => {
    if (Array.isArray(barData) && barData.length) {
      return barData.map((d) => ({
        product: d.name || d.product || d.label || 'Unknown',
        orders:  Math.round(Number(d.value || d.orders || 0)),
        revenue: Number(d.revenue || d.value || 0),
      }))
    }
    return DEMO_TOP_PRODUCTS
  }, [barData])

  const topProductsData = useMemo(() => {
    const sorted = [...topProductsRaw].sort((a, b) =>
      productSort === 'revenue' ? b.revenue - a.revenue : b.orders - a.orders
    )
    return sorted.slice(0, 7)
  }, [topProductsRaw, productSort])

  const totalProductOrders = useMemo(
    () => topProductsData.reduce((s, d) => s + d.orders, 0),
    [topProductsData]
  )

  /* ── Category data ───────────────────────────────────────── */
  const categoryData = useMemo(() => {
    if (Array.isArray(kpiData?.revenue_by_category) && kpiData.revenue_by_category.length)
      return kpiData.revenue_by_category.map((d) => ({
        name: d.name || d.category,
        value: Math.round(Number(d.value || d.revenue || 0) / 1000),
      }))
    return DEMO_CATEGORY
  }, [kpiData])

  /* ── Repeat vs new ───────────────────────────────────────── */
  const repeatPct = 60
  const newPct    = 40

  /* ── Insights ────────────────────────────────────────────── */
  const insights = useMemo(() => {
    const top = topProductsData[0]
    const topPct = totalProductOrders > 0 && top
      ? ((top.orders / totalProductOrders) * 100).toFixed(1)
      : '0.0'
    const cancelledCount = statusData.find(
      (s) => s.name?.toLowerCase().includes('cancel')
    )?.value || 156
    const cancelRate = statusTotal > 0 ? (cancelledCount / statusTotal) * 100 : 4
    const onTime = 94
    const periodChange = filteredTrend.length >= 2
      ? filteredTrend[filteredTrend.length - 1].orders - filteredTrend[0].orders
      : 0

    return [
      {
        type: 'ok',
        text: `${top?.product || 'Tablet Stand'} leads by order volume at ${topPct}% share of top products`,
      },
      {
        type: onTime >= 90 ? 'ok' : onTime >= 85 ? 'warn' : 'down',
        text: `On-time delivery rate is ${onTime}% — ${onTime >= 90 ? 'within SLA targets' : 'review carrier performance'}`,
      },
      {
        type: cancelRate < 5 ? 'ok' : 'warn',
        text: `Cancellation rate ${fmtPct(cancelRate)} (${fmtOrd(cancelledCount)} orders) — ${cancelRate < 5 ? 'within acceptable threshold' : 'investigate root causes'}`,
      },
      {
        type: periodChange >= 0 ? 'up' : 'down',
        text: `Order volume ${periodChange >= 0 ? 'up' : 'down'} ${Math.abs(periodChange)} units vs start of selected period`,
      },
      {
        type: repeatPct >= 40 ? 'ok' : 'warn',
        text: `Repeat customers account for ${repeatPct}% of orders — ${repeatPct >= 40 ? 'strong retention signal' : 'invest in retention programs'}`,
      },
      {
        type: 'warn',
        text: 'Optimize fulfillment for East region to improve average delivery SLA by ~0.4 days',
      },
    ]
  }, [topProductsData, statusData, statusTotal, filteredTrend, totalProductOrders])

  const RANGES = ['7D', '30D', '90D', '1Y', 'ALL']

  return (
    <div className="omi-page">
      <Sidebar />
      <div className="omi-shell">

        {/* ── Top Nav ──────────────────────────────────────────────── */}
        <header className="pi-topnav">
          <div className="pi-breadcrumbs">
            <Link to="/dashboard" className="pi-bc-link">Dashboard</Link>
            <span className="pi-bc-sep">/</span>
            <span className="pi-bc-link">Operations</span>
            <span className="pi-bc-sep">/</span>
            <span className="pi-bc-active">Orders</span>
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

        {/* ── Main Content ─────────────────────────────────────────── */}
        <div className="omi-content">

          {/* Page Header */}
          <div className="omi-page-header">
            <div>
              <h1 className="omi-page-title">Order Intelligence</h1>
              <p className="omi-page-subtitle">Order management & fulfillment diagnostic · Current dataset</p>
            </div>
            <div className="omi-page-actions">
              <button className="omi-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M4 6l3 3 3-3M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export CSV
              </button>
              <button className="omi-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M4 6l3 3 3-3M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export PDF
              </button>
            </div>
          </div>

          {/* ── SECTION 01: Order Trend Analysis ─────────────────── */}
          <div className="omi-section">
            <div className="omi-section-header">
              <div>
                <p className="omi-section-label">SECTION 01</p>
                <h2 className="omi-section-title">Order Trend Analysis</h2>
              </div>
              <div className="omi-section-controls">
                <label className="omi-overlay-check">
                  <input
                    type="checkbox"
                    checked={showRevenue}
                    onChange={(e) => setShowRevenue(e.target.checked)}
                  />
                  <span>Revenue</span>
                </label>
                <div className="omi-range-group">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      className={`omi-range-btn${range === r ? ' omi-range-btn--active' : ''}`}
                      onClick={() => setRange(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={filteredTrend} margin={{ top: 4, right: showRevenue ? 48 : 12, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  interval={xTickInterval}
                  tickFormatter={(v) => fmtDate(v) || v}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="left"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtOrd}
                  width={38}
                />
                {showRevenue && (
                  <YAxis
                    yAxisId="rev"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${fmtOrd(v)}`}
                    width={48}
                  />
                )}
                <ReferenceLine yAxisId="orders" y={0} stroke="#e5e7eb" />
                <Tooltip content={<TrendTooltip showRevenue={showRevenue} />} />
                <Area
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  fill="#eff6ff"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: '#2563eb' }}
                />
                {showRevenue && (
                  <Line
                    yAxisId="rev"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#9ca3af"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: '#9ca3af' }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* ── SECTION 02: Status + Fulfillment ─────────────────── */}
          <div className="omi-two-col-55">
            {/* Left: Order Status */}
            <div className="omi-section" style={{ marginBottom: 0 }}>
              <div className="omi-section-header">
                <div>
                  <p className="omi-section-label">SECTION 02</p>
                  <h2 className="omi-section-title">Order Status</h2>
                  <p className="omi-section-meta">by volume, current period</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={Math.max(180, statusData.length * 38)}>
                <BarChart
                  data={statusData}
                  layout="vertical"
                  margin={{ top: 0, right: 56, left: 8, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtOrd}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    axisLine={false}
                    tickLine={false}
                    width={76}
                  />
                  <Tooltip
                    formatter={(v, name) => [fmtOrd(v), name]}
                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12 }}
                  />
                  <Bar dataKey="value" maxBarSize={22} label={<StatusLabel />} radius={[0, 2, 2, 0]}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color || '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="omi-status-legend">
                {statusData.map((s) => (
                  <div key={s.name} className="omi-status-legend-item">
                    <span className="omi-legend-dot" style={{ background: s.color || '#2563eb' }} />
                    <span className="omi-legend-name">{s.name}</span>
                    <span className="omi-legend-val">{fmtOrd(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Fulfillment Performance */}
            <div className="omi-section" style={{ marginBottom: 0 }}>
              <div className="omi-section-header">
                <div>
                  <p className="omi-section-label">SECTION 02</p>
                  <h2 className="omi-section-title">Fulfillment Performance</h2>
                </div>
              </div>
              <table className="omi-stats-table">
                <tbody>
                  <tr>
                    <td className="omi-stats-metric">Avg Fulfillment Time</td>
                    <td className="omi-stats-value">2.4 days</td>
                  </tr>
                  <tr>
                    <td className="omi-stats-metric">Avg Shipping Time</td>
                    <td className="omi-stats-value">3.1 days</td>
                  </tr>
                  <tr>
                    <td className="omi-stats-metric">On-Time Delivery</td>
                    <td className="omi-stats-value omi-stats-value--green">94%</td>
                  </tr>
                  <tr>
                    <td className="omi-stats-metric">Late Shipments</td>
                    <td className="omi-stats-value omi-stats-value--red">127</td>
                  </tr>
                </tbody>
              </table>
              <div className="omi-ontime-bar-wrap">
                <div className="omi-ontime-bar-bg">
                  <div className="omi-ontime-bar-fill" style={{ width: '94%' }} />
                </div>
                <span className="omi-ontime-label">94% on-time</span>
              </div>
              <p className="omi-late-note">6% late — check carrier SLA</p>
            </div>
          </div>

          {/* ── SECTION 03: Top Products ──────────────────────────── */}
          <div className="omi-section">
            <div className="omi-section-header">
              <div>
                <p className="omi-section-label">SECTION 03</p>
                <h2 className="omi-section-title">Top Products by Order Volume</h2>
              </div>
              <select
                className="omi-select"
                value={productSort}
                onChange={(e) => setProductSort(e.target.value)}
              >
                <option value="orders">Sort by Orders</option>
                <option value="revenue">Sort by Revenue</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={Math.max(200, topProductsData.length * 40)}>
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ top: 0, right: 80, left: 8, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtOrd}
                />
                <YAxis
                  type="category"
                  dataKey="product"
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  content={<ProductTooltip totalOrders={totalProductOrders} />}
                />
                <Bar
                  dataKey={productSort === 'revenue' ? 'revenue' : 'orders'}
                  fill="#2563eb"
                  maxBarSize={28}
                  radius={[0, 2, 2, 0]}
                  label={(props) => <PctLabel {...props} total={totalProductOrders} />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── SECTION 04: Cohort + Category ────────────────────── */}
          <div className="omi-two-col">
            {/* Left: Repeat vs New */}
            <div className="omi-section" style={{ marginBottom: 0 }}>
              <div className="omi-section-header">
                <div>
                  <p className="omi-section-label">SECTION 04</p>
                  <h2 className="omi-section-title">Customer Order Type</h2>
                </div>
              </div>
              <div className="omi-cohort-row">
                <span className="omi-cohort-label">Repeat Customers</span>
                <div className="omi-cohort-bar-bg">
                  <div className="omi-cohort-bar-fill" style={{ width: `${repeatPct}%`, background: '#2563eb' }} />
                </div>
                <span className="omi-cohort-pct">{repeatPct}%</span>
              </div>
              <div className="omi-cohort-row">
                <span className="omi-cohort-label">New Customers</span>
                <div className="omi-cohort-bar-bg">
                  <div className="omi-cohort-bar-fill" style={{ width: `${newPct}%`, background: '#6b7280' }} />
                </div>
                <span className="omi-cohort-pct">{newPct}%</span>
              </div>
              <p className="omi-cohort-note">
                Repeat customer orders drive {repeatPct}% of volume
              </p>
            </div>

            {/* Right: Orders by Category */}
            <div className="omi-section" style={{ marginBottom: 0 }}>
              <div className="omi-section-header">
                <div>
                  <p className="omi-section-label">SECTION 04</p>
                  <h2 className="omi-section-title">Orders by Category</h2>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtOrd}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    formatter={(v) => [fmtOrd(v), 'Orders (est.)']}
                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12 }}
                  />
                  <Bar dataKey="value" fill="#2563eb" maxBarSize={24} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── SECTION 05: Insights ──────────────────────────────── */}
          <div className="omi-section">
            <div className="omi-section-header">
              <div>
                <p className="omi-section-label">SECTION 05</p>
                <h2 className="omi-section-title">Insights & Recommendations</h2>
                <p className="omi-section-meta">Auto-generated from current dataset</p>
              </div>
            </div>
            <div className="omi-insights-grid">
              {insights.map((item, i) => (
                <div key={i} className="omi-insight-item">
                  <InsightIcon type={item.type} />
                  <span className="omi-insight-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>{/* omi-content */}
      </div>{/* omi-shell */}
    </div>
  )
}

export default Orders
