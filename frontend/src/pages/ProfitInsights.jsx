import React, { useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { KpiContext } from '../context/KpiContext'
import {
  ComposedChart, BarChart, LineChart as RechartLineChart,
  Area, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea,
  Cell,
} from 'recharts'
import './ProfitInsights.css'

/* ── Formatting helpers ─────────────────────────────────────── */
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
const TrendTooltip = ({ active, payload, label, formatCurrency }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="pil-tooltip">
      <div className="pil-tooltip-date">{fmtDate(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="pil-tooltip-row">
          <span className="pil-tooltip-dot" style={{ background: p.color }} />
          <span className="pil-tooltip-label">{p.name}</span>
          <span className="pil-tooltip-val">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const BarTooltip = ({ active, payload, label, formatCurrency }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="pil-tooltip">
      <div className="pil-tooltip-date">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="pil-tooltip-row">
          <span className="pil-tooltip-dot" style={{ background: p.color || p.fill }} />
          <span className="pil-tooltip-label">{p.name}</span>
          <span className="pil-tooltip-val">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const MarginTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="pil-tooltip">
      <div className="pil-tooltip-date">{fmtDate(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="pil-tooltip-row">
          <span className="pil-tooltip-dot" style={{ background: p.color }} />
          <span className="pil-tooltip-label">{p.name}</span>
          <span className="pil-tooltip-val">{fmtPct(p.value)}</span>
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

/* ── Risk badge ────────────────────────────────────────────── */
const RiskBadge = ({ level }) => {
  const styles = {
    Low: { bg: '#dcfce7', color: '#166534' },
    Moderate: { bg: '#fef9c3', color: '#854d0e' },
    High: { bg: '#fee2e2', color: '#991b1b' },
  }
  const s = styles[level] || styles['Moderate']
  return (
    <span className="pil-risk-badge" style={{ background: s.bg, color: s.color }}>
      {level} Risk
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const ProfitInsights = () => {
  const { kpiData, formatCurrency, formatCompactCurrency } = useContext(KpiContext)

  const [dateRange, setDateRange] = useState('30D')
  const [showRevenue, setShowRevenue] = useState(false)
  const [showCost, setShowCost] = useState(false)
  const [marginMode, setMarginMode] = useState('pct') // 'pct' | 'abs'
  const [exportOpen, setExportOpen] = useState(false)

  /* ── Raw per-row arrays ──────────────────────────────────── */
  const dateData    = useMemo(() => kpiData?.date_data || [], [kpiData])
  const profitData  = useMemo(() => (kpiData?.profit_data || []).map(Number), [kpiData])
  const revenueData = useMemo(() => (kpiData?.revenue_data || []).map(Number), [kpiData])
  const costData    = useMemo(() => revenueData.map((r, i) => r - (profitData[i] || 0)), [revenueData, profitData])
  const productData = useMemo(() => kpiData?.product_data || [], [kpiData])

  /* ── Single filtered timeline (drives every component) ───── */
  const filteredSeries = useMemo(() => {
    const all = dateData.map((d, i) => ({
      date: d,
      profit: profitData[i] || 0,
      revenue: revenueData[i] || 0,
      cost: costData[i] || 0,
      product: productData[i] || '',
    }))
    if (!all.length) return []
    const sorted = [...all].sort((a, b) => new Date(a.date) - new Date(b.date))
    const limits = { '7D': 7, '30D': 30, '90D': 90, '1Y': 365 }
    const n = limits[dateRange]
    return n ? sorted.slice(-n) : sorted
  }, [dateData, profitData, revenueData, costData, productData, dateRange])

  /* ── Negative profit periods for ReferenceArea ──────────── */
  const negativeRanges = useMemo(() => {
    const ranges = []
    let inNeg = false
    let start = null
    filteredSeries.forEach((pt, i) => {
      if (pt.profit < 0 && !inNeg) { inNeg = true; start = pt.date }
      if (pt.profit >= 0 && inNeg) { inNeg = false; ranges.push({ x1: start, x2: filteredSeries[i - 1].date }) }
    })
    if (inNeg && start) ranges.push({ x1: start, x2: filteredSeries[filteredSeries.length - 1].date })
    return ranges
  }, [filteredSeries])

  /* ── Volatility stats (from filtered timeline) ───────────────── */
  const stats = useMemo(() => {
    if (!filteredSeries.length) return { mean: 0, stdDev: 0, cv: 0, riskLevel: 'Low', best: null, worst: null, negFreq: 0 }
    const profits = filteredSeries.map(p => p.profit)
    const mean = profits.reduce((a, b) => a + b, 0) / profits.length
    const variance = profits.reduce((a, b) => a + (b - mean) ** 2, 0) / profits.length
    const stdDev = Math.sqrt(variance)
    const cv = mean !== 0 ? Math.abs(stdDev / mean) * 100 : 0
    const riskLevel = cv < 20 ? 'Low' : cv < 40 ? 'Moderate' : 'High'

    const maxIdx = profits.indexOf(Math.max(...profits))
    const minIdx = profits.indexOf(Math.min(...profits))
    const negFreq = (profits.filter(p => p < 0).length / profits.length) * 100

    return {
      mean, stdDev, cv, riskLevel,
      best: { date: filteredSeries[maxIdx]?.date, value: profits[maxIdx] },
      worst: { date: filteredSeries[minIdx]?.date, value: profits[minIdx] },
      negFreq,
    }
  }, [filteredSeries])

  /* ── Drawdown series (from peak) ─────────────────────────── */
  const drawdownSeries = useMemo(() => {
    let peak = -Infinity
    return filteredSeries.map(pt => {
      if (pt.profit > peak) peak = pt.profit
      const dd = peak > 0 ? ((pt.profit - peak) / peak) * 100 : 0
      return { date: pt.date, drawdown: dd }
    })
  }, [filteredSeries])

  /* ── Margin series ───────────────────────────────────────── */
  const marginSeries = useMemo(() => {
    const series = filteredSeries.map(pt => ({
      date: pt.date,
      netMargin: pt.revenue > 0 ? (pt.profit / pt.revenue) * 100 : 0,
      profit: pt.profit,
    }))
    // Compute 7-period rolling average net margin as a smoothed trend line.
    // 7 periods provides a balance: short enough to follow trends, long enough to smooth daily noise.
    const WINDOW = 7
    return series.map((pt, i) => {
      const start = Math.max(0, i - WINDOW + 1)
      const slice = series.slice(start, i + 1)
      const avg = slice.reduce((s, p) => s + p.netMargin, 0) / slice.length
      return { ...pt, rollingAvgMargin: avg }
    })
  }, [filteredSeries])

  const avgNetMargin  = useMemo(() => marginSeries.length ? marginSeries.reduce((a, b) => a + b.netMargin, 0) / marginSeries.length : 0, [marginSeries])
  const avgRollingMargin = useMemo(() => marginSeries.length ? marginSeries[marginSeries.length - 1].rollingAvgMargin : 0, [marginSeries])

  /* ── Composition chart (grouped from filtered timeline) ──── */
  const hasProductData = useMemo(() => filteredSeries.some(pt => pt.product), [filteredSeries])
  const profitByProductFallback = useMemo(
    () => kpiData?.profit_by_product_data || kpiData?.bar_data || [],
    [kpiData]
  )
  const compositionData = useMemo(() => {
    if (hasProductData) {
      const byProduct = {}
      filteredSeries.forEach(pt => {
        if (!pt.product) return
        byProduct[pt.product] = (byProduct[pt.product] || 0) + pt.profit
      })
      const entries = Object.entries(byProduct)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
      const total = entries.reduce((s, [, v]) => s + v, 0)
      return entries.map(([name, profit]) => ({
        name,
        profit,
        pct: total > 0 ? (profit / total) * 100 : 0,
      }))
    }
    const fallback = [...profitByProductFallback]
      .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
    const total = fallback.reduce((s, b) => s + (Number(b.value) || 0), 0)
    return fallback.map(b => ({
      name: b.name,
      profit: Number(b.value) || 0,
      pct: total > 0 ? ((Number(b.value) || 0) / total) * 100 : 0,
    }))
  }, [hasProductData, filteredSeries, profitByProductFallback])

  /* ── Cost series for cost-pressure chart ─────────────────── */
  const costPressureSeries = useMemo(() => filteredSeries.map(pt => ({
    date: fmtDate(pt.date),
    profit: pt.profit,
    cost: pt.cost,
  })), [filteredSeries])

  /* ── Mean profit for filtered range (reference line) ────── */
  const filteredMean = useMemo(() => {
    if (!filteredSeries.length) return 0
    return filteredSeries.reduce((s, p) => s + p.profit, 0) / filteredSeries.length
  }, [filteredSeries])

  /* ── Fixed/variable cost split (period totals from filtered timeline) ── */
  const periodSums = useMemo(() => {
    if (!filteredSeries.length) return { revenue: 0, cost: 0, expense: 0 }
    const revenue = filteredSeries.reduce((s, p) => s + p.revenue, 0)
    const cost = filteredSeries.reduce((s, p) => s + p.cost, 0)
    return { revenue, cost, expense: cost }
  }, [filteredSeries])
  const expenseSum = periodSums.expense
  const fixedCost  = expenseSum * 0.35
  const varCost    = expenseSum * 0.65
  const revenueSum = periodSums.revenue || 1
  const costRatio  = (expenseSum / revenueSum) * 100

  /* ── Auto-generate insights ──────────────────────────────── */
  const insights = useMemo(() => {
    const list = []
    if (compositionData.length) {
      const top = compositionData[0]
      list.push({ type: 'up', text: `${top.name} is the top profit driver at ${fmtPct(top.pct)} of total product profit (${formatCurrency(top.profit)}).` })
      const bottom = compositionData[compositionData.length - 1]
      const bottomType = bottom.pct < 10 ? 'warn' : 'ok'
      list.push({ type: bottomType, text: `${bottom.name} contributes only ${fmtPct(bottom.pct)} — review pricing or consider deprioritizing.` })
    }
    const nm = avgNetMargin
    // 20% net margin: widely cited SMB health threshold (SBA / Harvard Business Review benchmarks)
    if (nm < 20) {
      list.push({ type: 'warn', text: `Net margin ${fmtPct(nm)} is below 20% threshold — cost structure review recommended.` })
    } else {
      list.push({ type: 'ok', text: `Net margin ${fmtPct(nm)} exceeds 20% target — margin health is acceptable.` })
    }
    // 80% cost-to-revenue: threshold at which profit margin drops below 20%, flagging structural cost pressure
    if (costRatio > 80) {
      list.push({ type: 'down', text: `Cost-to-revenue ratio is ${fmtPct(costRatio)} — expenses consume most of revenue, limiting profit ceiling.` })
    } else {
      list.push({ type: 'ok', text: `Cost-to-revenue ratio is ${fmtPct(costRatio)}, leaving ${fmtPct(100 - costRatio)} margin headroom.` })
    }
    const riskType = stats.riskLevel === 'Low' ? 'ok' : stats.riskLevel === 'Moderate' ? 'warn' : 'down'
    list.push({ type: riskType, text: `Profit volatility is ${stats.riskLevel} (CV ${fmtPct(stats.cv)}). Std deviation: ${formatCurrency(stats.stdDev)}.` })
    if (filteredSeries.length >= 2) {
      const first = filteredSeries[0].profit
      const last  = filteredSeries[filteredSeries.length - 1].profit
      const chg = first !== 0 ? ((last - first) / first) * 100 : 0
      const changeType = chg >= 0 ? 'up' : 'down'
      list.push({ type: changeType, text: `Period-over-period profit change: ${chg >= 0 ? '+' : ''}${fmtPct(chg)} (${formatCurrency(first)} -> ${formatCurrency(last)}).` })
    }
    return list.slice(0, 6)
  }, [compositionData, avgNetMargin, costRatio, stats, filteredSeries, formatCurrency])

  const RANGES = ['7D', '30D', '90D', '1Y', 'ALL']

  /* ── Export handlers (use filtered data for timeline consistency) ── */
  const handleExportCSV = () => {
    if (!filteredSeries.length) return
    const cols = ['date', 'profit', 'revenue', 'cost']
    const csvRows = [cols.join(',')]
    filteredSeries.forEach((row) => {
      csvRows.push(cols.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profit-insights-${dateRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="pi-page">
      <Sidebar />

      <div className="pi-shell">
        {/* ═══ TOP NAV ════════════════════════════════════════════════ */}
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

        {/* ═══ SCROLLABLE CONTENT ════════════════════════════════════ */}
        <div className="pi-content">

          {/* ── Page Header (gap below top nav): title + time range + export ── */}
          <div className="pil-page-header">
            <div>
              <h1 className="pil-page-title">Profit Intelligence</h1>
              <p className="pil-page-subtitle">Financial diagnostic analysis · {dateRange} timeline</p>
            </div>
            <div className="pil-page-header-actions">
              <div className="pil-range-tabs">
                {RANGES.map(r => (
                  <button
                    key={r}
                    className={`pil-range-tab${dateRange === r ? ' pil-range-tab--active' : ''}`}
                    onClick={() => setDateRange(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="pi-export-wrap">
                <button className="pi-export-btn" onClick={() => setExportOpen(prev => !prev)} aria-expanded={exportOpen}>
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
                    <div className="pi-export-backdrop" onClick={() => setExportOpen(false)} aria-hidden="true" />
                    <div className="pi-export-menu">
                      <button className="pi-export-menu-item" onClick={() => { handleExportCSV(); setExportOpen(false); }}>
                        Export CSV
                      </button>
                      <button className="pi-export-menu-item" onClick={() => { handleExportPDF(); setExportOpen(false); }}>
                        Export PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ═══ SECTION 1: Profit Trend Analysis (Hero, full width) ═ */}
          <div className="pil-section">
            <div className="pil-section-header">
              <div>
                <p className="pil-section-title">Section 01</p>
                <h2 className="pil-section-heading">Profit Trend Analysis</h2>
              </div>
              <div className="pil-trend-controls">
                <div className="pil-overlays">
                  <label className="pil-overlay-toggle">
                    <input type="checkbox" checked={showRevenue} onChange={e => setShowRevenue(e.target.checked)} />
                    <span className="pil-overlay-swatch" style={{ background: '#9ca3af' }} />
                    Revenue
                  </label>
                  <label className="pil-overlay-toggle">
                    <input type="checkbox" checked={showCost} onChange={e => setShowCost(e.target.checked)} />
                    <span className="pil-overlay-swatch" style={{ background: '#ef4444' }} />
                    Total Cost
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
                  tickFormatter={(v) => formatCompactCurrency(v, { maximumFractionDigits: 0 })}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<TrendTooltip formatCurrency={formatCurrency} />} />
                {negativeRanges.map((r, i) => (
                  <ReferenceArea key={i} x1={r.x1} x2={r.x2} fill="#fee2e2" fillOpacity={0.4} />
                ))}
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1} />
                {filteredMean !== 0 && (
                  <ReferenceLine
                    y={filteredMean}
                    stroke="#2563eb"
                    strokeDasharray="5 3"
                    strokeWidth={1}
                    strokeOpacity={0.45}
                    label={{ value: `Avg ${formatCompactCurrency(filteredMean)}`, fill: '#2563eb', fontSize: 10, position: 'insideTopRight' }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="#eff6ff"
                  fillOpacity={0.7}
                  dot={false}
                  activeDot={{ r: 4, fill: '#2563eb' }}
                />
                {showRevenue && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#9ca3af"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                )}
                {showCost && (
                  <Line
                    type="monotone"
                    dataKey="cost"
                    name="Total Cost"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* ═══ SECTION 2: 2-col (55/45) ══════════════════════════════ */}
          <div className="pil-two-col">

            {/* Left: Profit Composition */}
            <div className="pil-section" style={{ marginBottom: 0 }}>
              <div className="pil-section-header">
                <div>
                  <p className="pil-section-title">Section 02</p>
                  <h2 className="pil-section-heading">Profit Composition</h2>
                </div>
                <span className="pil-meta">by product, sorted by contribution</span>
              </div>

              {compositionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={compositionData.length * 38 + 20}>
                  <BarChart
                    layout="vertical"
                    data={compositionData}
                    margin={{ top: 0, right: 72, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatCompactCurrency(v, { maximumFractionDigits: 0 })}
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
                      width={110}
                    />
                    <Tooltip content={<BarTooltip formatCurrency={formatCurrency} />} />
                    <Bar dataKey="profit" name="Profit" fill="#2563eb" radius={[0, 2, 2, 0]} barSize={16}
                      label={(props) => <CompositionLabel {...props} pct={compositionData[props.index]?.pct} />}
                    >
                      {compositionData.map((entry, index) => (
                        <Cell key={index} fill="#2563eb" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                  No product-level profit data for the selected period.
                </p>
              )}
            </div>

            {/* Right: Margin Intelligence */}
            <div className="pil-section" style={{ marginBottom: 0 }}>
              <div className="pil-section-header">
                <div>
                  <p className="pil-section-title">Section 02</p>
                  <h2 className="pil-section-heading">Margin Intelligence</h2>
                </div>
                <div className="pil-mode-toggle">
                  <button
                    className={`pil-mode-btn${marginMode === 'pct' ? ' pil-mode-btn--active' : ''}`}
                    onClick={() => setMarginMode('pct')}
                  >%</button>
                  <button
                    className={`pil-mode-btn${marginMode === 'abs' ? ' pil-mode-btn--active' : ''}`}
                    onClick={() => setMarginMode('abs')}
                  >Absolute</button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <RechartLineChart data={marginSeries} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
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
                    tickFormatter={marginMode === 'pct' ? (v) => `${v.toFixed(0)}%` : (v) => formatCompactCurrency(v, { maximumFractionDigits: 0 })}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip content={marginMode === 'pct' ? <MarginTooltip /> : <TrendTooltip formatCurrency={formatCurrency} />} />
                  {marginMode === 'pct' ? (
                    <>
                      <Line type="monotone" dataKey="netMargin" name="Net Margin" stroke="#059669" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                      <Line type="monotone" dataKey="rollingAvgMargin" name="7-Period Avg" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="5 3" dot={false} activeDot={{ r: 3 }} />
                    </>
                  ) : (
                    <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#059669" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                  )}
                </RechartLineChart>
              </ResponsiveContainer>

              <div className="pil-margin-legend">
                <div className="pil-margin-legend-item">
                  <span className="pil-margin-legend-dot" style={{ background: '#059669' }} />
                  <span className="pil-margin-legend-label">Avg Net Margin</span>
                  <span className="pil-margin-legend-val">{fmtPct(avgNetMargin)}</span>
                </div>
                {marginMode === 'pct' && (
                  <div className="pil-margin-legend-item">
                    <span className="pil-margin-legend-dot pil-margin-legend-dot--dashed" style={{ background: '#2563eb' }} />
                    <span className="pil-margin-legend-label">Rolling Avg (7-period)</span>
                    <span className="pil-margin-legend-val">{fmtPct(avgRollingMargin)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ SECTION 3: 2-col equal ═════════════════════════════════ */}
          <div className="pil-two-col-equal">

            {/* Left: Cost Pressure Analysis */}
            <div className="pil-section" style={{ marginBottom: 0 }}>
              <div className="pil-section-header">
                <div>
                  <p className="pil-section-title">Section 03</p>
                  <h2 className="pil-section-heading">Cost Pressure Analysis</h2>
                </div>
              </div>

              {/* Fixed vs Variable bars */}
              <div className="pil-cost-ratios">
                <div className="pil-cost-row">
                  <span className="pil-cost-label">Fixed Cost</span>
                  <div className="pil-cost-bar-track">
                    <div className="pil-cost-bar-fill" style={{ width: '35%', background: '#2563eb' }} />
                  </div>
                  <span className="pil-cost-value">{formatCurrency(fixedCost)}</span>
                </div>
                <div className="pil-cost-row">
                  <span className="pil-cost-label">Variable Cost</span>
                  <div className="pil-cost-bar-track">
                    <div className="pil-cost-bar-fill" style={{ width: '65%', background: '#9ca3af' }} />
                  </div>
                  <span className="pil-cost-value">{formatCurrency(varCost)}</span>
                </div>
                <div className="pil-cost-row">
                  <span className="pil-cost-label">Cost / Revenue</span>
                  <div className="pil-cost-bar-track">
                    <div className="pil-cost-bar-fill" style={{ width: `${Math.min(costRatio, 100)}%`, background: costRatio > 80 ? '#dc2626' : '#059669' }} />
                  </div>
                  <span className="pil-cost-value">{fmtPct(costRatio)}</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={costPressureSeries.slice(-20)} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={2}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tickFormatter={(v) => formatCompactCurrency(v, { maximumFractionDigits: 0 })} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<BarTooltip formatCurrency={formatCurrency} />} />
                  <Bar dataKey="profit" name="Profit" fill="#2563eb" barSize={6} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="cost"   name="Cost"   fill="#fca5a5" barSize={6} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Profit Volatility & Risk */}
            <div className="pil-section" style={{ marginBottom: 0 }}>
              <div className="pil-section-header">
                <div>
                  <p className="pil-section-title">Section 03</p>
                  <h2 className="pil-section-heading">Profit Volatility &amp; Risk</h2>
                </div>
                <RiskBadge level={stats.riskLevel} />
              </div>

              <table className="pil-stats-table">
                <tbody>
                  <tr>
                    <td className="pil-stats-label">Std Deviation</td>
                    <td className="pil-stats-val">{formatCurrency(stats.stdDev)}</td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Best Period</td>
                    <td className="pil-stats-val pil-stats-val--pos">
                      {stats.best ? `${fmtDate(stats.best.date)} · ${formatCurrency(stats.best.value)}` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Worst Period</td>
                    <td className="pil-stats-val pil-stats-val--neg">
                      {stats.worst ? `${fmtDate(stats.worst.date)} · ${formatCurrency(stats.worst.value)}` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="pil-stats-label">Negative Frequency</td>
                    <td className="pil-stats-val">{fmtPct(stats.negFreq)} of periods</td>
                  </tr>
                </tbody>
              </table>

              <p className="pil-chart-sublabel">Drawdown from peak</p>
              <ResponsiveContainer width="100%" height={120}>
                <RechartLineChart data={drawdownSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 0" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="pil-tooltip">
                          <div className="pil-tooltip-date">{fmtDate(label)}</div>
                          <div className="pil-tooltip-row">
                            <span className="pil-tooltip-dot" style={{ background: '#dc2626' }} />
                            <span className="pil-tooltip-label">Drawdown</span>
                            <span className="pil-tooltip-val">{fmtPct(payload[0].value)}</span>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
                  <Line type="monotone" dataKey="drawdown" stroke="#dc2626" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
                </RechartLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ═══ SECTION 4: Insight & Action Panel (full width) ════════ */}
          <div className="pil-section">
            <div className="pil-section-header">
              <div>
                <p className="pil-section-title">Section 04</p>
                <h2 className="pil-section-heading">Insight &amp; Action</h2>
              </div>
            </div>
            <div className="pil-coming-soon">
              <span className="pil-coming-soon-text">Coming soon</span>
            </div>
          </div>

        </div>{/* /pi-content */}
      </div>{/* /pi-shell */}
    </div>
  )
}

export default ProfitInsights
