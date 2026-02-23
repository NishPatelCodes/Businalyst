import React, { useState, useContext, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import DateRangePicker from '../components/DateRangePicker'
import { KpiContext } from '../context/KpiContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import './Orders.css'

// Demo fallbacks when no uploaded data
const DEMO_TREND = [
  { date: 'Jan 1', dateLabel: 'Jan 1', orders: 142 },
  { date: 'Jan 8', dateLabel: 'Jan 8', orders: 198 },
  { date: 'Jan 15', dateLabel: 'Jan 15', orders: 165 },
  { date: 'Jan 22', dateLabel: 'Jan 22', orders: 221 },
  { date: 'Feb 1', dateLabel: 'Feb 1', orders: 189 },
  { date: 'Feb 8', dateLabel: 'Feb 8', orders: 256 },
  { date: 'Feb 15', dateLabel: 'Feb 15', orders: 234 },
  { date: 'Feb 22', dateLabel: 'Feb 22', orders: 312 },
]
const DEMO_STATUS = [
  { name: 'Completed', value: 2840, color: '#16a34a' },
  { name: 'Processing', value: 412, color: '#2563eb' },
  { name: 'Shipped', value: 318, color: '#7c3aed' },
  { name: 'Cancelled', value: 156, color: '#dc2626' },
  { name: 'Returned', value: 116, color: '#f59e0b' },
]
const DEMO_CHANNEL = [
  { name: 'Website', orders: 1842, fill: '#2563eb' },
  { name: 'Mobile App', orders: 1120, fill: '#3b82f6' },
  { name: 'Marketplace', orders: 512, fill: '#60a5fa' },
  { name: 'POS', orders: 268, fill: '#93c5fd' },
  { name: 'Social', orders: 100, fill: '#bfdbfe' },
]
const DEMO_REGION = [
  { name: 'East', orders: 1242 },
  { name: 'West', orders: 982 },
  { name: 'North', orders: 756 },
  { name: 'South', orders: 862 },
]
const DEMO_TOP_PRODUCTS = [
  { product: 'Tablet Stand', orders: 428, revenue: 24500, avgQty: 2.1 },
  { product: 'Tablet Case', orders: 392, revenue: 23800, avgQty: 1.8 },
  { product: 'Bluetooth Adapter', orders: 356, revenue: 22900, avgQty: 2.0 },
  { product: 'USB-C Cable', orders: 318, revenue: 22100, avgQty: 2.4 },
  { product: 'Wireless Headphones', orders: 284, revenue: 19400, avgQty: 1.5 },
]
const DEMO_INSIGHTS = [
  'Mobile orders growing 18% vs last period',
  'West region delivery delays increasing — review carrier SLAs',
  'Returns rising for USB-C Cable — consider quality check',
]

function formatTrendDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const Orders = () => {
  const { kpiData } = useContext(KpiContext)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    return { start, end }
  })

  const fmt = (d) =>
    d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const dateLabel =
    dateRange.start && dateRange.end
      ? `${fmt(dateRange.start)} – ${fmt(dateRange.end)}`
      : 'Select dates'

  const ordersTrendData = useMemo(() => {
    const raw = Array.isArray(kpiData?.orders_trend) && kpiData.orders_trend.length > 0
      ? kpiData.orders_trend
      : DEMO_TREND.map((d) => ({ date: d.date, orders: d.orders }))
    return raw.map((d) => ({
      date: d.date,
      dateLabel: typeof d.date === 'string' && d.date.match(/^\d{4}-\d{2}-\d{2}/) ? formatTrendDate(d.date) : d.date,
      orders: Number(d.orders) || 0,
    }))
  }, [kpiData?.orders_trend])

  const statusData = useMemo(
    () =>
      Array.isArray(kpiData?.orders_by_status) && kpiData.orders_by_status.length > 0
        ? kpiData.orders_by_status
        : DEMO_STATUS,
    [kpiData?.orders_by_status]
  )

  const channelData = useMemo(
    () =>
      Array.isArray(kpiData?.orders_by_channel) && kpiData.orders_by_channel.length > 0
        ? kpiData.orders_by_channel
        : DEMO_CHANNEL,
    [kpiData?.orders_by_channel]
  )

  const regionData = useMemo(
    () =>
      Array.isArray(kpiData?.orders_by_region) && kpiData.orders_by_region.length > 0
        ? kpiData.orders_by_region
        : DEMO_REGION,
    [kpiData?.orders_by_region]
  )

  const topProductsData = useMemo(
    () =>
      Array.isArray(kpiData?.top_products_by_orders) && kpiData.top_products_by_orders.length > 0
        ? kpiData.top_products_by_orders
        : DEMO_TOP_PRODUCTS,
    [kpiData?.top_products_by_orders]
  )

  const totalOrders = kpiData?.orders_sum ?? (ordersTrendData.reduce((s, d) => s + d.orders, 0) || 3842)
  const growth = 8.4
  const completedOrders = useMemo(() => {
    if (!Array.isArray(kpiData?.orders_by_status) || kpiData?.orders_by_status?.length === 0)
      return 2840
    const completed = kpiData.orders_by_status.find(
      (s) => String(s.name).toLowerCase().includes('complete') || String(s.name).toLowerCase().includes('delivered')
    )
    return completed ? completed.value : kpiData.orders_by_status[0]?.value ?? 0
  }, [kpiData?.orders_by_status])
  const cancelledOrders = useMemo(() => {
    if (!Array.isArray(kpiData?.orders_by_status)) return 156
    const cancelled = kpiData.orders_by_status.filter(
      (s) =>
        String(s.name).toLowerCase().includes('cancel') || String(s.name).toLowerCase().includes('return')
    )
    return cancelled.reduce((s, c) => s + (c.value || 0), 0)
  }, [kpiData?.orders_by_status])
  const pendingOrders = Math.max(0, totalOrders - completedOrders - cancelledOrders)

  const maxRegionOrders = Math.max(1, ...regionData.map((r) => Number(r.orders) || 0))
  const insights = Array.isArray(kpiData?.orders_by_region) && kpiData.orders_by_region.length > 0
    ? [`Orders by region: ${kpiData.orders_by_region.map((r) => r.name).join(', ')}`]
    : DEMO_INSIGHTS

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main dashboard-main--orders">
        <TopNavigation />
        <div className="orders-overview">
          <div className="orders-overview__inner">
            {/* Top Header */}
            <header className="orders-header">
              <h1 className="orders-header__title">Orders Overview</h1>
              <div className="orders-header__right">
                <div className="orders-header__search">
                  <svg className="orders-header__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input type="text" placeholder="Search orders..." className="orders-header__search-input" />
                </div>
                <div className="orders-header__date-wrap">
                  <button
                    type="button"
                    className="orders-header__date-btn"
                    onClick={() => setIsDatePickerOpen((o) => !o)}
                  >
                    <span>{dateLabel}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isDatePickerOpen && (
                    <DateRangePicker
                      isOpen={isDatePickerOpen}
                      onClose={() => setIsDatePickerOpen(false)}
                      onApply={(range) => {
                        setDateRange(range)
                        setIsDatePickerOpen(false)
                      }}
                      initialRange={dateRange}
                    />
                  )}
                </div>
                <div className="orders-header__avatar">
                  <img src="https://i.pravatar.cc/150?img=12" alt="Profile" />
                </div>
              </div>
            </header>

            <div className="orders-grid">
              {/* ROW 1: Orders Trend (8) + KPI cards (4) */}
              <div className="orders-card orders-card--8">
                <div className="orders-card__head">
                  <div>
                    <h2 className="orders-card__title">Orders Trend</h2>
                    <p className="orders-card__subtitle">{dateLabel}</p>
                  </div>
                  <div className="orders-card__hero">
                    <span className="orders-card__metric">{totalOrders.toLocaleString()}</span>
                    <span className="orders-card__growth orders-card__growth--positive">+{growth}%</span>
                  </div>
                </div>
                <div className="orders-chart-wrap">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={ordersTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                        labelStyle={{ color: '#6b7280' }}
                        formatter={(value) => [value, 'Orders']}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="orders-card orders-card--4">
                <div className="orders-kpi-stack">
                  <div className="orders-kpi">
                    <span className="orders-kpi__label">Completed Orders</span>
                    <span className="orders-kpi__value orders-kpi__value--green">{completedOrders.toLocaleString()}</span>
                  </div>
                  <div className="orders-kpi">
                    <span className="orders-kpi__label">Pending Orders</span>
                    <span className="orders-kpi__value">{pendingOrders.toLocaleString()}</span>
                  </div>
                  <div className="orders-kpi">
                    <span className="orders-kpi__label">Cancelled Orders</span>
                    <span className="orders-kpi__value orders-kpi__value--red">{cancelledOrders.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* ROW 2: Orders by Status (6) + Orders by Channel (6) */}
              <div className="orders-card orders-card--6">
                <h2 className="orders-card__title">Orders by Status</h2>
                <div className="orders-donut-wrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((entry, i) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value.toLocaleString(), name]}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="orders-donut-legend">
                    {statusData.map((item) => (
                      <div key={item.name} className="orders-legend-item">
                        <span className="orders-legend-dot" style={{ background: item.color }} />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="orders-card orders-card--6">
                <h2 className="orders-card__title">Orders by Channel</h2>
                <div className="orders-bars-wrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 24, left: 80, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} width={72} axisLine={false} tickLine={false} />
                      <Bar dataKey="orders" radius={[0, 6, 6, 0]} />
                      <Tooltip
                        formatter={(value) => [value.toLocaleString(), 'Orders']}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ROW 3: Orders by Region (6) + Fulfillment Performance (6) */}
              <div className="orders-card orders-card--6">
                <h2 className="orders-card__title">Orders by Region</h2>
                <div className="orders-region-list">
                  {regionData.map((r) => (
                    <div key={r.name} className="orders-region-row">
                      <div className="orders-region-info">
                        <span className="orders-region-name">{r.name}</span>
                        <span className="orders-region-count">{r.orders.toLocaleString()}</span>
                      </div>
                      <div className="orders-region-bar-bg">
                        <div
                          className="orders-region-bar-fill"
                          style={{ width: `${(r.orders / maxRegionOrders) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="orders-card orders-card--6">
                <h2 className="orders-card__title">Fulfillment Performance</h2>
                <div className="orders-fulfillment-list">
                  <div className="orders-fulfillment-item">
                    <span className="orders-fulfillment-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </span>
                    <div>
                      <span className="orders-fulfillment-label">Avg fulfillment time</span>
                      <span className="orders-fulfillment-value">2.4 days</span>
                    </div>
                  </div>
                  <div className="orders-fulfillment-item">
                    <span className="orders-fulfillment-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 6l6 4 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14l6-4 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <div>
                      <span className="orders-fulfillment-label">Avg shipping time</span>
                      <span className="orders-fulfillment-value">3.1 days</span>
                    </div>
                  </div>
                  <div className="orders-fulfillment-item">
                    <span className="orders-fulfillment-icon orders-fulfillment-icon--green">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16 6l-7 7-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/></svg>
                    </span>
                    <div>
                      <span className="orders-fulfillment-label">On-time delivery %</span>
                      <span className="orders-fulfillment-value orders-fulfillment-value--green">94%</span>
                    </div>
                  </div>
                  <div className="orders-fulfillment-item">
                    <span className="orders-fulfillment-icon orders-fulfillment-icon--red">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/></svg>
                    </span>
                    <div>
                      <span className="orders-fulfillment-label">Late shipments</span>
                      <span className="orders-fulfillment-value orders-fulfillment-value--red">127</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 4: Top Products by Orders */}
              <div className="orders-card orders-card--12">
                <h2 className="orders-card__title">Top Products by Orders</h2>
                <div className="orders-table-wrap">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                        <th>Avg Qty</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductsData.map((row, i) => (
                        <tr key={i}>
                          <td className="orders-table__product">{row.product}</td>
                          <td>{Number(row.orders).toLocaleString()}</td>
                          <td>${Number(row.revenue || 0).toLocaleString()}</td>
                          <td>{Number(row.avgQty) || '—'}</td>
                          <td className="orders-table__trend" />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ROW 5: Actionable Insights */}
              <div className="orders-card orders-card--12">
                <h2 className="orders-card__title">Actionable Insights</h2>
                <ul className="orders-insights-list">
                  {insights.map((text, i) => (
                    <li key={i} className="orders-insight-item">
                      <span className="orders-insight-dot" />
                      <span>{text}</span>
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

export default Orders
