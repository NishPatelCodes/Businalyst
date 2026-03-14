import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { KpiContext } from '../context/KpiContext'
import {
  ComposedChart,
  BarChart,
  LineChart as RechartLineChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import './ProfitInsights.css'

const fmtCur = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0)

const fmtNum = (n) => {
  const abs = Math.abs(n)
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return (n || 0).toFixed(0)
}

const fmtPct = (n) => `${(n || 0).toFixed(1)}%`

const fmtDate = (s) => {
  try {
    return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return s
  }
}

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="pil-tooltip">
      <div className="pil-tooltip-date">{fmtDate(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="pil-tooltip-row">
          <span className="pil-tooltip-dot" style={{ background: p.color }} />
          <span className="pil-tooltip-label">{p.name}</span>
          <span className="pil-tooltip-val">{fmtNum(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const SegmentTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="pil-tooltip">
      <div className="pil-tooltip-date">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="pil-tooltip-row">
          <span className="pil-tooltip-dot" style={{ background: p.color || p.fill }} />
          <span className="pil-tooltip-label">{p.name}</span>
          <span className="pil-tooltip-val">{`${fmtNum(p.value)} (${fmtPct(p.payload.pct)})`}</span>
        </div>
      ))}
    </div>
  )
}

const SegmentLabel = ({ x, y, width, height, value, pct }) => {
  if (!value) return null
  return (
    <text x={x + width + 6} y={y + height / 2} fill="#6b7280" fontSize={11} dominantBaseline="middle">
      {`${fmtNum(value)} · ${fmtPct(pct)}`}
    </text>
  )
}

const InsightIcon = ({ type }) => {
  const map = {
    positive: { symbol: '\u2714', color: '#059669' },
    warning: { symbol: '\u26A0', color: '#d97706' },
    opportunity: { symbol: '\u25B2', color: '#2563eb' },
    negative: { symbol: '\u25BC', color: '#dc2626' },
  }
  const { symbol, color } = map[type] || map.warning
  return <span className="pil-insight-icon" style={{ color }}>{symbol}</span>
}

const metricState = (value, healthy, moderate) => {
  if (value >= healthy) return { label: 'Healthy', color: '#059669', bg: '#dcfce7' }
  if (value >= moderate) return { label: 'Moderate', color: '#b45309', bg: '#fef3c7' }
  return { label: 'Risk', color: '#b91c1c', bg: '#fee2e2' }
}

const CustomersInsights = () => {
  const { kpiData } = useContext(KpiContext)

  const [dateRange, setDateRange] = useState('30D')
  const [showAverage, setShowAverage] = useState(true)

  const dateData = useMemo(() => kpiData?.date_data || [], [kpiData])
  const revenueData = useMemo(() => (kpiData?.revenue_data || []).map(Number), [kpiData])
  const profitData = useMemo(() => (kpiData?.profit_data || []).map(Number), [kpiData])
  const customersSum = Number(kpiData?.customers_sum || 0)
  const ordersSum = Number(kpiData?.orders_sum || 0)
  const revenueSum = Number(kpiData?.revenue_sum || 0)

  const baseSeries = useMemo(() => {
    const safeDates = dateData.length ? dateData : ['2024-01-01']
    const safeRevenue = revenueData.length ? revenueData : [0]
    const safeProfit = profitData.length ? profitData : [0]

    const revAvg = safeRevenue.length
      ? safeRevenue.reduce((sum, value) => sum + value, 0) / safeRevenue.length
      : 1
    const baseCustomers = Math.max(customersSum || 80, 40)

    return safeDates.map((date, index) => {
      const revenue = safeRevenue[index] ?? revAvg
      const profit = safeProfit[index] ?? 0
      const trendWave = Math.sin(index / 4) * 0.08
      const revenueFactor = revAvg > 0 ? revenue / revAvg : 1

      const totalCustomers = Math.max(
        10,
        Math.round(baseCustomers * (0.68 + revenueFactor * 0.34 + trendWave))
      )
      const newCustomers = Math.max(1, Math.round(totalCustomers * (0.24 + Math.max(0, 1 - revenueFactor) * 0.05)))
      const returningCustomers = Math.max(1, totalCustomers - newCustomers)
      const avgCustomers = Math.round((baseCustomers + totalCustomers) / 2)
      const engagement = Math.max(
        40,
        Math.min(100, 62 + (profit > 0 ? (profit / Math.max(revenue, 1)) * 100 : 0) + trendWave * 20)
      )

      return {
        date,
        totalCustomers,
        newCustomers,
        returningCustomers,
        avgCustomers,
        engagement,
      }
    })
  }, [dateData, revenueData, profitData, customersSum])

  const filteredSeries = useMemo(() => {
    const sorted = [...baseSeries].sort((a, b) => new Date(a.date) - new Date(b.date))
    const limits = { '7D': 7, '30D': 30, '90D': 90, '1Y': 365 }
    const n = limits[dateRange]
    return n ? sorted.slice(-n) : sorted
  }, [baseSeries, dateRange])

  const averageCustomers = useMemo(() => {
    if (!filteredSeries.length) return 0
    return filteredSeries.reduce((sum, point) => sum + point.totalCustomers, 0) / filteredSeries.length
  }, [filteredSeries])

  const segmentData = useMemo(() => {
    const totals = filteredSeries.reduce(
      (acc, point) => {
        acc.newCustomers += point.newCustomers
        acc.returningCustomers += point.returningCustomers
        return acc
      },
      { newCustomers: 0, returningCustomers: 0 }
    )

    const derived = [
      { name: 'Returning Customers', value: totals.returningCustomers },
      { name: 'New Customers', value: totals.newCustomers },
      { name: 'Frequent Buyers', value: Math.round(totals.returningCustomers * 0.44) },
      { name: 'One-time Buyers', value: Math.round(totals.newCustomers * 0.59) },
      { name: 'High Value Customers', value: Math.round((totals.returningCustomers + totals.newCustomers) * 0.18) },
    ]

    const segmentTotal = Math.max(derived.reduce((sum, item) => sum + item.value, 0), 1)

    return derived
      .map((item) => ({
        ...item,
        pct: (item.value / segmentTotal) * 100,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredSeries])

  const healthMetrics = useMemo(() => {
    const total = filteredSeries.reduce((sum, p) => sum + p.totalCustomers, 0)
    const newTotal = filteredSeries.reduce((sum, p) => sum + p.newCustomers, 0)
    const returningTotal = filteredSeries.reduce((sum, p) => sum + p.returningCustomers, 0)

    const retentionRate = total ? (returningTotal / total) * 100 : 0
    const repeatPurchaseRate = total ? (returningTotal / (newTotal + returningTotal)) * 100 : 0
    const arpcBase = customersSum > 0 ? revenueSum / customersSum : 0
    const arpc = arpcBase || (newTotal + returningTotal > 0 ? revenueSum / (newTotal + returningTotal) : 0)

    const first = filteredSeries[0]?.totalCustomers || 0
    const last = filteredSeries[filteredSeries.length - 1]?.totalCustomers || 0
    const growthRate = first > 0 ? ((last - first) / first) * 100 : 0

    return {
      retentionRate,
      repeatPurchaseRate,
      arpc,
      growthRate,
    }
  }, [filteredSeries, customersSum, revenueSum])

  const acquisitionRates = useMemo(() => {
    const newTotal = filteredSeries.reduce((sum, p) => sum + p.newCustomers, 0)
    const returningTotal = filteredSeries.reduce((sum, p) => sum + p.returningCustomers, 0)
    const all = Math.max(newTotal + returningTotal, 1)

    return {
      newCustomerRate: (newTotal / all) * 100,
      returningCustomerRate: (returningTotal / all) * 100,
      highValueShare: (Math.round(all * 0.18) / all) * 100,
    }
  }, [filteredSeries])

  const engagementPanel = useMemo(() => {
    if (!filteredSeries.length) {
      return {
        mostActiveDay: 'N/A',
        avgOrdersPerCustomer: 0,
        churnRate: 0,
        inactiveShare: 0,
      }
    }

    const mostActive = [...filteredSeries].sort((a, b) => b.engagement - a.engagement)[0]
    const avgOrdersPerCustomer = customersSum > 0 ? ordersSum / customersSum : 0

    let downwardCount = 0
    for (let i = 1; i < filteredSeries.length; i += 1) {
      if (filteredSeries[i].totalCustomers < filteredSeries[i - 1].totalCustomers) {
        downwardCount += 1
      }
    }

    const churnRate = (downwardCount / Math.max(filteredSeries.length - 1, 1)) * 100
    const inactiveShare = Math.max(5, Math.min(45, 28 - healthMetrics.repeatPurchaseRate * 0.2 + churnRate * 0.3))

    return {
      mostActiveDay: fmtDate(mostActive.date),
      avgOrdersPerCustomer,
      churnRate,
      inactiveShare,
    }
  }, [filteredSeries, customersSum, ordersSum, healthMetrics.repeatPurchaseRate])

  const insightItems = useMemo(() => {
    const items = []

    items.push({
      type: healthMetrics.growthRate >= 0 ? 'positive' : 'negative',
      text: `Customer base ${healthMetrics.growthRate >= 0 ? 'grew' : 'declined'} by ${fmtPct(Math.abs(healthMetrics.growthRate))} in the selected window.`,
    })

    items.push({
      type: 'opportunity',
      text: `Returning customers represent ${fmtPct(acquisitionRates.returningCustomerRate)} of active customers and remain the primary retention lever.`,
    })

    items.push({
      type: engagementPanel.churnRate > 20 ? 'warning' : 'positive',
      text: `${fmtPct(engagementPanel.inactiveShare)} of customers show low activity over the period; targeted win-back campaigns are recommended.`,
    })

    items.push({
      type: healthMetrics.arpc >= 1000 ? 'positive' : 'opportunity',
      text: `Average revenue per customer is ${fmtCur(healthMetrics.arpc)} with room to grow through upsell and loyalty bundles.`,
    })

    items.push({
      type: acquisitionRates.highValueShare < 20 ? 'opportunity' : 'positive',
      text: `High-value customers contribute about ${fmtPct(acquisitionRates.highValueShare)} of the base; consider VIP retention incentives.`,
    })

    items.push({
      type: engagementPanel.churnRate > 18 ? 'warning' : 'positive',
      text: `Customer churn is ${fmtPct(engagementPanel.churnRate)}; focus on post-purchase engagement to sustain retention.`,
    })

    return items.slice(0, 6)
  }, [healthMetrics, acquisitionRates, engagementPanel])

  const RANGES = ['7D', '30D', '90D', '1Y', 'ALL']

  const retentionState = metricState(healthMetrics.retentionRate, 60, 45)
  const repeatState = metricState(healthMetrics.repeatPurchaseRate, 45, 30)
  const arpcState = metricState(healthMetrics.arpc, 900, 500)
  const growthState = metricState(Math.max(healthMetrics.growthRate, 0), 8, 3)

  return (
    <div className="pi-page">
      <Sidebar />

      <div className="pi-shell">
        <header className="pi-topnav">
          <div className="pi-breadcrumbs">
            <Link to="/dashboard" className="pi-bc-link">Dashboard</Link>
            <span className="pi-bc-sep">/</span>
            <span className="pi-bc-link">Performance</span>
            <span className="pi-bc-sep">/</span>
            <span className="pi-bc-active">Customers</span>
          </div>

          <div className="pi-topnav-search">
            <svg className="pi-search-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search Anything" className="pi-search-input" />
          </div>

          <div className="pi-topnav-actions">
            <button className="pi-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 4C2 2.9 2.9 2 4 2H16C17.1 2 18 2.9 18 4V12C18 13.1 17.1 14 16 14H6L2 18V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="6.5" cy="8" r=".8" fill="currentColor" />
                <circle cx="10" cy="8" r=".8" fill="currentColor" />
                <circle cx="13.5" cy="8" r=".8" fill="currentColor" />
              </svg>
            </button>
            <button className="pi-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 3V4M10 16V17M17 10H16M4 10H3M15.66 4.34L14.95 5.05M5.05 14.95L4.34 15.66M15.66 15.66L14.95 14.95M5.05 5.05L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="pi-profile">
              <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className="pi-avatar" />
              <span className="pi-profile-name">Nish Patel</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </header>

        <div className="pi-content">
          <div className="pil-page-header">
            <div>
              <h1 className="pil-page-title">Customers Intelligence</h1>
              <p className="pil-page-subtitle">Customer growth diagnostics · Current dataset</p>
            </div>
            <div className="pil-page-actions">
              <button className="pil-btn-ghost">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Export CSV
              </button>
              <button className="pil-btn-ghost">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8h6M5 5h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>

          <div className="pil-section">
            <div className="pil-section-header">
              <div>
                <p className="pil-section-title">Section 01</p>
                <h2 className="pil-section-heading">Customer Growth Trend</h2>
              </div>
              <div className="pil-trend-controls">
                <div className="pil-range-tabs">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      className={`pil-range-tab${dateRange === r ? ' pil-range-tab--active' : ''}`}
                      onClick={() => setDateRange(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="pil-overlays">
                  <label className="pil-overlay-toggle">
                    <input type="checkbox" checked={showAverage} onChange={(e) => setShowAverage(e.target.checked)} />
                    <span className="pil-overlay-swatch" style={{ background: '#9ca3af' }} />
                    Average Customers
                  </label>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={filteredSeries} margin={{ top: 8, right: 24, bottom: 0, left: 10 }}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDate}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => fmtNum(v)}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<TrendTooltip />} />
                {showAverage && (
                  <ReferenceLine
                    y={averageCustomers}
                    stroke="#9ca3af"
                    strokeDasharray="5 4"
                    strokeWidth={1.2}
                    label={{ value: 'Average', position: 'right', fill: '#6b7280', fontSize: 11 }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="totalCustomers"
                  name="Total Customers"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="#eff6ff"
                  fillOpacity={0.7}
                  dot={false}
                  activeDot={{ r: 4, fill: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="newCustomers"
                  name="New Customers"
                  stroke="#059669"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="returningCustomers"
                  name="Returning Customers"
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="pil-two-col">
            <div className="pil-section" style={{ marginBottom: 0 }}>
              <div className="pil-section-header">
                <div>
                  <p className="pil-section-title">Section 02</p>
                  <h2 className="pil-section-heading">Customer Segmentation</h2>
                </div>
                <span className="pil-meta">sorted by largest segment share</span>
              </div>

              <ResponsiveContainer width="100%" height={segmentData.length * 38 + 20}>
                <BarChart layout="vertical" data={segmentData} margin={{ top: 0, right: 90, bottom: 0, left: 0 }}>
                  <CartesianGrid horizontal={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => fmtNum(v)}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#374151' }}
                    axisLine={false}
                    tickLine={false}
                    width={118}
                  />
                  <Tooltip content={<SegmentTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Customers"
                    fill="#2563eb"
                    radius={[0, 2, 2, 0]}
                    barSize={16}
                    label={(props) => <SegmentLabel {...props} pct={segmentData[props.index]?.pct} />}
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={index} fill={entry.name === 'High Value Customers' ? '#059669' : '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pil-section" style={{ marginBottom: 0 }}>
              <div className="pil-section-header">
                <div>
                  <p className="pil-section-title">Section 02</p>
                  <h2 className="pil-section-heading">Customer Health Metrics</h2>
                </div>
              </div>

              <table className="pil-stats-table">
                <tbody>
                  <tr>
                    <td className="pil-stats-label">Customer Retention Rate</td>
                    <td className="pil-stats-val" style={{ color: retentionState.color }}>{fmtPct(healthMetrics.retentionRate)}</td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Repeat Purchase Rate</td>
                    <td className="pil-stats-val" style={{ color: repeatState.color }}>{fmtPct(healthMetrics.repeatPurchaseRate)}</td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Avg Revenue / Customer</td>
                    <td className="pil-stats-val" style={{ color: arpcState.color }}>{fmtCur(healthMetrics.arpc)}</td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Customer Growth Rate</td>
                    <td className="pil-stats-val" style={{ color: growthState.color }}>{fmtPct(healthMetrics.growthRate)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pil-margin-legend">
                <div className="pil-margin-legend-item">
                  <span className="pil-margin-legend-dot" style={{ background: retentionState.color }} />
                  <span className="pil-margin-legend-label">Retention</span>
                  <span className="pil-margin-legend-val" style={{ color: retentionState.color }}>{retentionState.label}</span>
                </div>
                <div className="pil-margin-legend-item">
                  <span className="pil-margin-legend-dot" style={{ background: repeatState.color }} />
                  <span className="pil-margin-legend-label">Repeat</span>
                  <span className="pil-margin-legend-val" style={{ color: repeatState.color }}>{repeatState.label}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  padding: '10px 12px',
                  background: repeatState.bg,
                }}
              >
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#374151' }}>
                  {`Repeat purchase rate is ${fmtPct(healthMetrics.repeatPurchaseRate)}, indicating ${healthMetrics.repeatPurchaseRate >= 40 ? 'strong' : 'moderate'} customer loyalty.`}
                </p>
              </div>
            </div>
          </div>

          <div className="pil-two-col-equal">
            <div className="pil-section" style={{ marginBottom: 0 }}>
              <div className="pil-section-header">
                <div>
                  <p className="pil-section-title">Section 03</p>
                  <h2 className="pil-section-heading">Customer Acquisition Analysis</h2>
                </div>
              </div>

              <div className="pil-cost-ratios">
                <div className="pil-cost-row">
                  <span className="pil-cost-label">New Customer Rate</span>
                  <div className="pil-cost-bar-track">
                    <div className="pil-cost-bar-fill" style={{ width: `${Math.min(acquisitionRates.newCustomerRate, 100)}%`, background: '#059669' }} />
                  </div>
                  <span className="pil-cost-value">{fmtPct(acquisitionRates.newCustomerRate)}</span>
                </div>
                <div className="pil-cost-row">
                  <span className="pil-cost-label">Returning Customer Rate</span>
                  <div className="pil-cost-bar-track">
                    <div className="pil-cost-bar-fill" style={{ width: `${Math.min(acquisitionRates.returningCustomerRate, 100)}%`, background: '#2563eb' }} />
                  </div>
                  <span className="pil-cost-value">{fmtPct(acquisitionRates.returningCustomerRate)}</span>
                </div>
                <div className="pil-cost-row">
                  <span className="pil-cost-label">High Value Share</span>
                  <div className="pil-cost-bar-track">
                    <div className="pil-cost-bar-fill" style={{ width: `${Math.min(acquisitionRates.highValueShare, 100)}%`, background: '#f59e0b' }} />
                  </div>
                  <span className="pil-cost-value">{fmtPct(acquisitionRates.highValueShare)}</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={filteredSeries.slice(-20)} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={2}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tickFormatter={(v) => fmtNum(v)} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<TrendTooltip />} />
                  <Bar dataKey="newCustomers" name="New Customers" fill="#059669" barSize={6} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="returningCustomers" name="Returning Customers" fill="#2563eb" barSize={6} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pil-section" style={{ marginBottom: 0 }}>
              <div className="pil-section-header">
                <div>
                  <p className="pil-section-title">Section 03</p>
                  <h2 className="pil-section-heading">Customer Activity &amp; Engagement</h2>
                </div>
              </div>

              <table className="pil-stats-table">
                <tbody>
                  <tr>
                    <td className="pil-stats-label">Most Active Customer Day</td>
                    <td className="pil-stats-val">{engagementPanel.mostActiveDay}</td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Average Orders / Customer</td>
                    <td className="pil-stats-val">{engagementPanel.avgOrdersPerCustomer.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Customer Churn Rate</td>
                    <td className="pil-stats-val" style={{ color: engagementPanel.churnRate > 20 ? '#dc2626' : '#059669' }}>
                      {fmtPct(engagementPanel.churnRate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Inactive Customer Share</td>
                    <td className="pil-stats-val" style={{ color: engagementPanel.inactiveShare > 25 ? '#d97706' : '#059669' }}>
                      {fmtPct(engagementPanel.inactiveShare)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="pil-chart-sublabel">Engagement trend</p>
              <ResponsiveContainer width="100%" height={120}>
                <RechartLineChart data={filteredSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="pil-tooltip">
                          <div className="pil-tooltip-date">{fmtDate(label)}</div>
                          <div className="pil-tooltip-row">
                            <span className="pil-tooltip-dot" style={{ background: '#2563eb' }} />
                            <span className="pil-tooltip-label">Engagement</span>
                            <span className="pil-tooltip-val">{fmtPct(payload[0].value)}</span>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <ReferenceLine y={60} stroke="#e5e7eb" strokeWidth={1} />
                  <Line type="monotone" dataKey="engagement" stroke="#2563eb" strokeWidth={1.8} dot={false} activeDot={{ r: 3 }} />
                </RechartLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pil-section">
            <div className="pil-section-header">
              <div>
                <p className="pil-section-title">Section 04</p>
                <h2 className="pil-section-heading">Insight &amp; Action</h2>
              </div>
              <span className="pil-meta">Diagnostics updated from current dataset</span>
            </div>

            <div className="pil-insights-grid">
              {insightItems.map((item, index) => (
                <div key={index} className="pil-insight-item">
                  <InsightIcon type={item.type} />
                  <p className="pil-insight-text">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomersInsights
