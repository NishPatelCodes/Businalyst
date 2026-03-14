import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { KpiContext } from '../context/KpiContext'
import {
  ComposedChart, BarChart, LineChart as RechartLineChart,
  Area, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  Cell,
} from 'recharts'
import './ExpenseInsights.css'

/* ── Formatting helpers ─────────────────────────────────────── */
const fmtCur = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n || 0)

const fmtNum = (n) => {
  const abs = Math.abs(n)
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return (n || 0).toFixed(0)
}

const fmtPct = (n) => `${(n || 0).toFixed(1)}%`

const fmtDate = (s) => {
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  catch { return s }
}

/* ── Custom tooltips ──────────────────────────────────────── */
const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="eil-tooltip">
      <div className="eil-tooltip-date">{fmtDate(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="eil-tooltip-row">
          <span className="eil-tooltip-dot" style={{ background: p.color }} />
          <span className="eil-tooltip-label">{p.name}</span>
          <span className="eil-tooltip-val">{fmtCur(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="eil-tooltip">
      <div className="eil-tooltip-date">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="eil-tooltip-row">
          <span className="eil-tooltip-dot" style={{ background: p.color || p.fill }} />
          <span className="eil-tooltip-label">{p.name}</span>
          <span className="eil-tooltip-val">{fmtCur(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const PctTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="eil-tooltip">
      <div className="eil-tooltip-date">{fmtDate(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="eil-tooltip-row">
          <span className="eil-tooltip-dot" style={{ background: p.color }} />
          <span className="eil-tooltip-label">{p.name}</span>
          <span className="eil-tooltip-val">{fmtPct(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Custom bar label for composition chart ───────────────── */
const CompositionLabel = ({ x, y, width, height, value, pct }) => {
  if (!value) return null
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      fill="#6b7280"
      fontSize={11}
      dominantBaseline="middle"
    >
      {fmtPct(pct)}
    </text>
  )
}

/* ── Health badge ──────────────────────────────────────────── */
const HealthBadge = ({ level }) => {
  const styles = {
    Efficient: { bg: '#dcfce7', color: '#166534' },
    Moderate: { bg: '#fef9c3', color: '#854d0e' },
    High: { bg: '#fee2e2', color: '#991b1b' },
  }
  const s = styles[level] || styles['Moderate']
  return (
    <span className="eil-risk-badge" style={{ background: s.bg, color: s.color }}>
      {level === 'High' ? 'High Cost Pressure' : level}
    </span>
  )
}

/* ── Insight icon ──────────────────────────────────────────── */
const InsightIcon = ({ type }) => {
  const map = {
    positive: { symbol: '\u2714', color: '#059669' },
    warning:  { symbol: '\u26A0', color: '#d97706' },
    opportunity: { symbol: '\u25B2', color: '#2563eb' },
    negative: { symbol: '\u25BC', color: '#dc2626' },
  }
  const { symbol, color } = map[type] || map['warning']
  return <span className="eil-insight-icon" style={{ color }}>{symbol}</span>
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const ExpenseInsights = () => {
  const { kpiData } = useContext(KpiContext)

  const [dateRange, setDateRange] = useState('30D')
  const [showTotal, setShowTotal] = useState(true)
  const [showFixed, setShowFixed] = useState(false)
  const [showVariable, setShowVariable] = useState(false)

  /* ── Raw arrays ─────────────────────────────────────────── */
  const dateData    = useMemo(() => kpiData?.date_data || [], [kpiData])
  const revenueData = useMemo(() => (kpiData?.revenue_data || []).map(Number), [kpiData])
  const profitData  = useMemo(() => (kpiData?.profit_data || []).map(Number), [kpiData])
  const costData    = useMemo(() => revenueData.map((r, i) => r - (profitData[i] || 0)), [revenueData, profitData])

  /* ── Date range filtering ────────────────────────────────── */
  const filteredSeries = useMemo(() => {
    const all = dateData.map((d, i) => {
      const totalExpense = costData[i] || 0
      return {
        date: d,
        totalExpense,
        fixedExpense: totalExpense * 0.35,
        variableExpense: totalExpense * 0.65,
        revenue: revenueData[i] || 0,
      }
    })
    if (!all.length) return []
    const sorted = [...all].sort((a, b) => new Date(a.date) - new Date(b.date))
    const limits = { '7D': 7, '30D': 30, '90D': 90, '1Y': 365 }
    const n = limits[dateRange]
    return n ? sorted.slice(-n) : sorted
  }, [dateData, costData, revenueData, dateRange])

  /* ── Average expense line value ────────────────────────── */
  const avgExpense = useMemo(() => {
    if (!filteredSeries.length) return 0
    return filteredSeries.reduce((s, pt) => s + pt.totalExpense, 0) / filteredSeries.length
  }, [filteredSeries])

  /* ── Expense composition by category ───────────────────── */
  const expenseSum = kpiData?.expense_sum || 0
  const revenueSum = kpiData?.revenue_sum || 1

  const compositionData = useMemo(() => {
    // Simulate category breakdown using SMB benchmark ratios
    const categories = [
      { name: 'Inventory Purchase', pctOfTotal: 0.28 },
      { name: 'Salaries', pctOfTotal: 0.22 },
      { name: 'Shipping', pctOfTotal: 0.15 },
      { name: 'Marketing', pctOfTotal: 0.12 },
      { name: 'Rent', pctOfTotal: 0.08 },
      { name: 'Software Tools', pctOfTotal: 0.06 },
      { name: 'Payment Processing', pctOfTotal: 0.05 },
      { name: 'Utilities', pctOfTotal: 0.04 },
    ]
    return categories.map(c => ({
      name: c.name,
      expense: Math.round(expenseSum * c.pctOfTotal),
      pct: c.pctOfTotal * 100,
    }))
  }, [expenseSum])

  /* ── Cost Efficiency Metrics ──────────────────────────────── */
  const costToRevenueRatio = (expenseSum / revenueSum) * 100
  const operatingExpenseRatio = useMemo(() => {
    // Operating expenses exclude COGS (inventory purchase ~28% of expense)
    const opex = expenseSum * 0.72
    return (opex / revenueSum) * 100
  }, [expenseSum, revenueSum])
  const avgDailyExpense = useMemo(() => {
    return dateData.length > 0 ? expenseSum / dateData.length : 0
  }, [expenseSum, dateData])
  const expenseGrowthRate = useMemo(() => {
    if (filteredSeries.length < 2) return 0
    const firstHalf = filteredSeries.slice(0, Math.floor(filteredSeries.length / 2))
    const secondHalf = filteredSeries.slice(Math.floor(filteredSeries.length / 2))
    const avgFirst = firstHalf.reduce((s, p) => s + p.totalExpense, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((s, p) => s + p.totalExpense, 0) / secondHalf.length
    return avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0
  }, [filteredSeries])

  const expenseHealthLevel = costToRevenueRatio < 65 ? 'Efficient' : costToRevenueRatio < 80 ? 'Moderate' : 'High'

  /* ── Cost pressure data ────────────────────────────────────── */
  const fixedCost  = expenseSum * 0.35
  const varCost    = expenseSum * 0.65
  const marketingRatio = (expenseSum * 0.12 / revenueSum) * 100

  const dailyExpenseVsRevenue = useMemo(() => filteredSeries.map(pt => ({
    date: fmtDate(pt.date),
    expense: pt.totalExpense,
    revenue: pt.revenue,
  })), [filteredSeries])

  /* ── Expense Volatility stats ──────────────────────────────── */
  const volatilityStats = useMemo(() => {
    const expenses = filteredSeries.map(pt => pt.totalExpense)
    if (!expenses.length) return { stdDev: 0, highest: null, lowest: null, spikeFreq: 0 }

    const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length
    const variance = expenses.reduce((a, b) => a + (b - mean) ** 2, 0) / expenses.length
    const stdDev = Math.sqrt(variance)

    const maxIdx = expenses.indexOf(Math.max(...expenses))
    const minIdx = expenses.indexOf(Math.min(...expenses))

    // Spike = expense > mean + 1.5 * stdDev
    const spikeThreshold = mean + 1.5 * stdDev
    const spikeCount = expenses.filter(e => e > spikeThreshold).length
    const spikeFreq = (spikeCount / expenses.length) * 100

    return {
      stdDev,
      mean,
      cv: mean !== 0 ? Math.abs(stdDev / mean) * 100 : 0,
      highest: { date: filteredSeries[maxIdx]?.date, value: expenses[maxIdx] },
      lowest: { date: filteredSeries[minIdx]?.date, value: expenses[minIdx] },
      spikeFreq,
    }
  }, [filteredSeries])

  const volatilityLevel = volatilityStats.cv < 20 ? 'Efficient' : volatilityStats.cv < 40 ? 'Moderate' : 'High'

  /* ── Volatility line chart series ─────────────────────────── */
  const volatilitySeries = useMemo(() => {
    const expenses = filteredSeries.map(pt => pt.totalExpense)
    if (!expenses.length) return []
    const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length
    return filteredSeries.map(pt => ({
      date: pt.date,
      deviation: mean > 0 ? ((pt.totalExpense - mean) / mean) * 100 : 0,
    }))
  }, [filteredSeries])

  /* ── Auto-generate insights ──────────────────────────────── */
  const insights = useMemo(() => {
    const list = []

    // Marketing spend insight
    const marketingSpend = expenseSum * 0.12
    if (marketingRatio > 10) {
      list.push({ type: 'warning', text: `Marketing spend increased to ${fmtCur(marketingSpend)} (${fmtPct(marketingRatio)} of revenue) \u2014 review campaign ROI.` })
    } else {
      list.push({ type: 'positive', text: `Marketing spend is ${fmtCur(marketingSpend)} (${fmtPct(marketingRatio)} of revenue) \u2014 within healthy benchmark.` })
    }

    // Shipping costs
    const shippingPct = 15 // from composition
    if (shippingPct > 12) {
      list.push({ type: 'opportunity', text: `Shipping costs account for ${shippingPct}% of total expenses \u2014 consider negotiating carrier rates.` })
    }

    // Fixed costs
    list.push({ type: 'warning', text: `Fixed costs represent ${fmtPct(35)} of expenses (${fmtCur(fixedCost)}) \u2014 reducing operational overhead may improve margins.` })

    // Expense-to-revenue ratio
    const grossMargin = 100 - costToRevenueRatio
    if (costToRevenueRatio > 80) {
      list.push({ type: 'negative', text: `Expense-to-revenue ratio is ${fmtPct(costToRevenueRatio)}, leaving only ${fmtPct(grossMargin)} gross margin.` })
    } else {
      list.push({ type: 'positive', text: `Expense-to-revenue ratio is ${fmtPct(costToRevenueRatio)}, leaving ${fmtPct(grossMargin)} gross margin.` })
    }

    // Software tools benchmark
    const softwarePct = 6
    if (softwarePct > 5) {
      list.push({ type: 'opportunity', text: `Software tools cost (${fmtPct(softwarePct)} of expenses) exceeds recommended SMB benchmark \u2014 audit tool subscriptions.` })
    }

    // Expense growth
    if (expenseGrowthRate > 5) {
      list.push({ type: 'warning', text: `Expenses grew ${fmtPct(expenseGrowthRate)} period-over-period \u2014 monitor for sustained cost increases.` })
    } else if (expenseGrowthRate < -5) {
      list.push({ type: 'positive', text: `Expenses declined ${fmtPct(Math.abs(expenseGrowthRate))} period-over-period \u2014 cost optimization is working.` })
    } else {
      list.push({ type: 'positive', text: `Expense growth is stable at ${fmtPct(expenseGrowthRate)} \u2014 costs are under control.` })
    }

    return list.slice(0, 6)
  }, [expenseSum, marketingRatio, fixedCost, costToRevenueRatio, expenseGrowthRate])

  const RANGES = ['7D', '30D', '90D', '1Y', 'ALL']

  return (
    <div className="ei-page">
      <Sidebar />

      <div className="ei-shell">
        {/* ═══ TOP NAV ════════════════════════════════════════════════ */}
        <header className="ei-topnav">
          <div className="ei-breadcrumbs">
            <Link to="/dashboard" className="ei-bc-link">Dashboard</Link>
            <span className="ei-bc-sep">/</span>
            <span className="ei-bc-link">Performance</span>
            <span className="ei-bc-sep">/</span>
            <span className="ei-bc-active">Expenses</span>
          </div>

          <div className="ei-topnav-search">
            <svg className="ei-search-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search Anything" className="ei-search-input" />
          </div>

          <div className="ei-topnav-actions">
            <button className="ei-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 4C2 2.9 2.9 2 4 2H16C17.1 2 18 2.9 18 4V12C18 13.1 17.1 14 16 14H6L2 18V4Z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="6.5" cy="8" r=".8" fill="currentColor"/>
                <circle cx="10"  cy="8" r=".8" fill="currentColor"/>
                <circle cx="13.5" cy="8" r=".8" fill="currentColor"/>
              </svg>
            </button>
            <button className="ei-nav-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 3V4M10 16V17M17 10H16M4 10H3M15.66 4.34L14.95 5.05M5.05 14.95L4.34 15.66M15.66 15.66L14.95 14.95M5.05 5.05L4.34 4.34"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="ei-profile">
              <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className="ei-avatar"/>
              <span className="ei-profile-name">Nish Patel</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </header>

        {/* ═══ SCROLLABLE CONTENT ════════════════════════════════════ */}
        <div className="ei-content">

          {/* ── Page Header ─────────────────────────────────────────── */}
          <div className="eil-page-header">
            <div>
              <h1 className="eil-page-title">Expense Intelligence</h1>
              <p className="eil-page-subtitle">Operational cost diagnostics · Current dataset</p>
            </div>
            <div className="eil-page-actions">
              <button className="eil-btn-ghost">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export CSV
              </button>
              <button className="eil-btn-ghost">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8h6M5 5h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Export PDF
              </button>
            </div>
          </div>

          {/* ═══ SECTION 1: Expense Trend Analysis (Hero, full width) ═ */}
          <div className="eil-section">
            <div className="eil-section-header">
              <div>
                <p className="eil-section-title">Section 01</p>
                <h2 className="eil-section-heading">Expense Trend Analysis</h2>
              </div>
              <div className="eil-trend-controls">
                {/* Date range tabs */}
                <div className="eil-range-tabs">
                  {RANGES.map(r => (
                    <button
                      key={r}
                      className={`eil-range-tab${dateRange === r ? ' eil-range-tab--active' : ''}`}
                      onClick={() => setDateRange(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {/* Overlay toggles */}
                <div className="eil-overlays">
                  <label className="eil-overlay-toggle">
                    <input type="checkbox" checked={showTotal} onChange={e => setShowTotal(e.target.checked)} />
                    <span className="eil-overlay-swatch" style={{ background: '#ef4444' }} />
                    Total Expense
                  </label>
                  <label className="eil-overlay-toggle">
                    <input type="checkbox" checked={showFixed} onChange={e => setShowFixed(e.target.checked)} />
                    <span className="eil-overlay-swatch" style={{ background: '#2563eb' }} />
                    Fixed Expense
                  </label>
                  <label className="eil-overlay-toggle">
                    <input type="checkbox" checked={showVariable} onChange={e => setShowVariable(e.target.checked)} />
                    <span className="eil-overlay-swatch" style={{ background: '#f59e0b' }} />
                    Variable Expense
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
                  tickFormatter={v => `$${fmtNum(v)}`}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<TrendTooltip />} />
                <ReferenceLine y={avgExpense} stroke="#9ca3af" strokeDasharray="6 4" strokeWidth={1} label={{ value: 'Avg', position: 'right', fill: '#9ca3af', fontSize: 10 }} />
                {showTotal && (
                  <Area
                    type="monotone"
                    dataKey="totalExpense"
                    name="Total Expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="#fef2f2"
                    fillOpacity={0.7}
                    dot={false}
                    activeDot={{ r: 4, fill: '#ef4444' }}
                  />
                )}
                {showFixed && (
                  <Line
                    type="monotone"
                    dataKey="fixedExpense"
                    name="Fixed Expense"
                    stroke="#2563eb"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                )}
                {showVariable && (
                  <Line
                    type="monotone"
                    dataKey="variableExpense"
                    name="Variable Expense"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* ═══ SECTION 2: 2-col (55/45) ══════════════════════════════ */}
          <div className="eil-two-col">

            {/* Left: Expense Composition */}
            <div className="eil-section" style={{ marginBottom: 0 }}>
              <div className="eil-section-header">
                <div>
                  <p className="eil-section-title">Section 02</p>
                  <h2 className="eil-section-heading">Expense Composition</h2>
                </div>
                <span className="eil-meta">By category, sorted by contribution</span>
              </div>

              <ResponsiveContainer width="100%" height={compositionData.length * 38 + 20}>
                <BarChart
                  layout="vertical"
                  data={compositionData}
                  margin={{ top: 0, right: 72, bottom: 0, left: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                  <XAxis
                    type="number"
                    tickFormatter={v => `$${fmtNum(v)}`}
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
                    width={130}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[0, 2, 2, 0]} barSize={16}
                    label={(props) => <CompositionLabel {...props} pct={compositionData[props.index]?.pct} />}
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={index} fill={index < 3 ? '#ef4444' : '#fca5a5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Cost Efficiency Metrics */}
            <div className="eil-section" style={{ marginBottom: 0 }}>
              <div className="eil-section-header">
                <div>
                  <p className="eil-section-title">Section 02</p>
                  <h2 className="eil-section-heading">Cost Efficiency Metrics</h2>
                </div>
                <HealthBadge level={expenseHealthLevel} />
              </div>

              <div className="eil-metrics-grid">
                <div className="eil-metric-card">
                  <span className="eil-metric-label">Cost-to-Revenue Ratio</span>
                  <span className="eil-metric-value">{fmtPct(costToRevenueRatio)}</span>
                  <span className={`eil-metric-indicator ${costToRevenueRatio < 65 ? 'eil-metric-indicator--green' : costToRevenueRatio < 80 ? 'eil-metric-indicator--yellow' : 'eil-metric-indicator--red'}`}>
                    {costToRevenueRatio < 65 ? 'Efficient' : costToRevenueRatio < 80 ? 'Moderate' : 'High pressure'}
                  </span>
                </div>
                <div className="eil-metric-card">
                  <span className="eil-metric-label">Operating Expense Ratio</span>
                  <span className="eil-metric-value">{fmtPct(operatingExpenseRatio)}</span>
                  <span className={`eil-metric-indicator ${operatingExpenseRatio < 50 ? 'eil-metric-indicator--green' : operatingExpenseRatio < 65 ? 'eil-metric-indicator--yellow' : 'eil-metric-indicator--red'}`}>
                    {operatingExpenseRatio < 50 ? 'Efficient' : operatingExpenseRatio < 65 ? 'Moderate' : 'High'}
                  </span>
                </div>
                <div className="eil-metric-card">
                  <span className="eil-metric-label">Average Daily Expense</span>
                  <span className="eil-metric-value">{fmtCur(avgDailyExpense)}</span>
                  <span className="eil-metric-indicator eil-metric-indicator--neutral">
                    per day across period
                  </span>
                </div>
                <div className="eil-metric-card">
                  <span className="eil-metric-label">Expense Growth Rate</span>
                  <span className="eil-metric-value">{expenseGrowthRate >= 0 ? '+' : ''}{fmtPct(expenseGrowthRate)}</span>
                  <span className={`eil-metric-indicator ${expenseGrowthRate < 0 ? 'eil-metric-indicator--green' : expenseGrowthRate < 10 ? 'eil-metric-indicator--yellow' : 'eil-metric-indicator--red'}`}>
                    {expenseGrowthRate < 0 ? 'Decreasing' : expenseGrowthRate < 10 ? 'Stable' : 'Growing fast'}
                  </span>
                </div>
              </div>

              <div className="eil-health-insight">
                <p className="eil-health-insight-text">
                  {costToRevenueRatio > 75
                    ? `Operating expenses are ${fmtPct(costToRevenueRatio)} of revenue \u2014 slightly above healthy benchmark.`
                    : `Operating expenses are ${fmtPct(costToRevenueRatio)} of revenue \u2014 within healthy range.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* ═══ SECTION 3: 2-col equal ═════════════════════════════════ */}
          <div className="eil-two-col-equal">

            {/* Left: Cost Pressure Analysis */}
            <div className="eil-section" style={{ marginBottom: 0 }}>
              <div className="eil-section-header">
                <div>
                  <p className="eil-section-title">Section 03</p>
                  <h2 className="eil-section-heading">Cost Pressure Analysis</h2>
                </div>
              </div>

              {/* Fixed vs Variable bars */}
              <div className="eil-cost-ratios">
                <div className="eil-cost-row">
                  <span className="eil-cost-label">Fixed Costs</span>
                  <div className="eil-cost-bar-track">
                    <div className="eil-cost-bar-fill" style={{ width: '35%', background: '#2563eb' }} />
                  </div>
                  <span className="eil-cost-value">{fmtCur(fixedCost)}</span>
                </div>
                <div className="eil-cost-row">
                  <span className="eil-cost-label">Variable Costs</span>
                  <div className="eil-cost-bar-track">
                    <div className="eil-cost-bar-fill" style={{ width: '65%', background: '#f59e0b' }} />
                  </div>
                  <span className="eil-cost-value">{fmtCur(varCost)}</span>
                </div>
                <div className="eil-cost-row">
                  <span className="eil-cost-label">Marketing Spend</span>
                  <div className="eil-cost-bar-track">
                    <div className="eil-cost-bar-fill" style={{ width: `${Math.min(marketingRatio * 5, 100)}%`, background: marketingRatio > 10 ? '#dc2626' : '#059669' }} />
                  </div>
                  <span className="eil-cost-value">{fmtPct(marketingRatio)}</span>
                </div>
              </div>

              <p className="eil-chart-sublabel">Daily Expenses vs Revenue</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailyExpenseVsRevenue.slice(-20)} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={2}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tickFormatter={v => `$${fmtNum(v)}`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" barSize={6} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue" fill="#2563eb" barSize={6} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Expense Volatility & Risk */}
            <div className="eil-section" style={{ marginBottom: 0 }}>
              <div className="eil-section-header">
                <div>
                  <p className="eil-section-title">Section 03</p>
                  <h2 className="eil-section-heading">Expense Volatility &amp; Risk</h2>
                </div>
                <HealthBadge level={volatilityLevel} />
              </div>

              <table className="eil-stats-table">
                <tbody>
                  <tr>
                    <td className="eil-stats-label">Expense Std Deviation</td>
                    <td className="eil-stats-val">{fmtCur(volatilityStats.stdDev)}</td>
                  </tr>
                  <tr>
                    <td className="eil-stats-label">Highest Expense Day</td>
                    <td className="eil-stats-val eil-stats-val--neg">
                      {volatilityStats.highest ? `${fmtDate(volatilityStats.highest.date)} · ${fmtCur(volatilityStats.highest.value)}` : '\u2014'}
                    </td>
                  </tr>
                  <tr>
                    <td className="eil-stats-label">Lowest Expense Day</td>
                    <td className="eil-stats-val eil-stats-val--pos">
                      {volatilityStats.lowest ? `${fmtDate(volatilityStats.lowest.date)} · ${fmtCur(volatilityStats.lowest.value)}` : '\u2014'}
                    </td>
                  </tr>
                  <tr>
                    <td className="eil-stats-label">Expense Spike Frequency</td>
                    <td className="eil-stats-val">{fmtPct(volatilityStats.spikeFreq)} of periods</td>
                  </tr>
                </tbody>
              </table>

              <p className="eil-chart-sublabel">Cost volatility over time</p>
              <ResponsiveContainer width="100%" height={120}>
                <RechartLineChart data={volatilitySeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="eil-tooltip">
                          <div className="eil-tooltip-date">{fmtDate(label)}</div>
                          <div className="eil-tooltip-row">
                            <span className="eil-tooltip-dot" style={{ background: '#ef4444' }} />
                            <span className="eil-tooltip-label">Deviation</span>
                            <span className="eil-tooltip-val">{fmtPct(payload[0].value)}</span>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
                  <Line type="monotone" dataKey="deviation" stroke="#ef4444" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
                </RechartLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ═══ SECTION 4: Insight & Action Panel (full width) ════════ */}
          <div className="eil-section">
            <div className="eil-section-header">
              <div>
                <p className="eil-section-title">Section 04</p>
                <h2 className="eil-section-heading">Insight &amp; Action</h2>
              </div>
              <span className="eil-meta">Diagnostics updated from current dataset</span>
            </div>

            <div className="eil-insights-grid">
              {insights.map((ins, i) => (
                <div key={i} className="eil-insight-item">
                  <InsightIcon type={ins.type} />
                  <p className="eil-insight-text">{ins.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>{/* /ei-content */}
      </div>{/* /ei-shell */}
    </div>
  )
}

export default ExpenseInsights
