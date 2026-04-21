import React, { useContext, useMemo, useState, useEffect } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { KpiContext } from '../../context/KpiContext'
import './TrendsRadarChart.css'

const REVENUE_COLOR = '#93c5fd'
const PROFIT_COLOR = '#2563eb'

const DIMENSION_CANDIDATES = [
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subcategory' },
  { key: 'product_name', label: 'Product' },
  { key: 'productname', label: 'Product', alias: 'product_name' },
  { key: 'product', label: 'Product', alias: 'product_name' },
  { key: 'region', label: 'Region' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'payment_method', label: 'Payment Method' },
  { key: 'channel', label: 'Channel' },
  { key: 'sales_rep', label: 'Sales Rep' },
  { key: 'customer_name', label: 'Customer' },
]

const normalizeKey = (k) => String(k || '').trim().toLowerCase().replace(/\s+/g, '_')

const truncate = (s, max = 12) => {
  if (s == null) return ''
  const str = String(s).trim()
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}

const formatCompact = (n) => {
  const abs = Math.abs(n || 0)
  if (abs >= 1e6) return `${(n / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}k`
  return Math.round(n || 0).toLocaleString()
}

/** Find the actual column key that exists on the row matching a canonical dim key. */
const resolveKey = (row, canonical) => {
  if (!row) return null
  const want = normalizeKey(canonical)
  for (const k of Object.keys(row)) {
    if (normalizeKey(k) === want) return k
  }
  return null
}

const AngleTick = ({ payload, x, y, cx, cy }) => {
  const raw = payload?.value ?? ''
  const short = truncate(raw, 11)
  const dx = (x ?? 0) - (cx ?? 0)
  const dy = (y ?? 0) - (cy ?? 0)
  const dist = Math.max(1, Math.hypot(dx, dy))
  const extra = 8
  const nx = (x ?? 0) + (dx / dist) * extra
  const ny = (y ?? 0) + (dy / dist) * extra
  const anchor = Math.abs(dx) < 2 ? 'middle' : dx > 0 ? 'start' : 'end'
  return (
    <text x={nx} y={ny} dy={4} textAnchor={anchor} className="trc-axis-label">
      <title>{String(raw)}</title>
      {short}
    </text>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="trc-tooltip">
      <div className="trc-tooltip-label">{d.name}</div>
      <div className="trc-tooltip-row">
        <span className="trc-tooltip-swatch trc-tooltip-swatch--revenue" />
        <span className="trc-tooltip-key">Revenue</span>
        <strong>{formatCompact(d.revenue)}</strong>
      </div>
      <div className="trc-tooltip-row">
        <span className="trc-tooltip-swatch trc-tooltip-swatch--profit" />
        <span className="trc-tooltip-key">Profit</span>
        <strong>{formatCompact(d.profit)}</strong>
      </div>
      <div className="trc-tooltip-row trc-tooltip-row--muted">
        <span className="trc-tooltip-key">Share</span>
        <strong>
          {d.revenueShare.toFixed(1)}% · {d.profitShare.toFixed(1)}%
        </strong>
      </div>
    </div>
  )
}

const TrendsRadarChart = ({ periodRatio = 1 }) => {
  const { kpiData } = useContext(KpiContext)

  const sourceRows = useMemo(() => {
    const orders = Array.isArray(kpiData?.orders_list) ? kpiData.orders_list : []
    if (orders.length > 0) return orders
    return Array.isArray(kpiData?.top5_profit) ? kpiData.top5_profit : []
  }, [kpiData?.orders_list, kpiData?.top5_profit])

  const hasRevenue = useMemo(
    () => sourceRows.some((r) => resolveKey(r, 'revenue') != null),
    [sourceRows]
  )
  const hasProfit = useMemo(
    () => sourceRows.some((r) => resolveKey(r, 'profit') != null),
    [sourceRows]
  )

  const availableDims = useMemo(() => {
    const seen = new Set()
    const out = []
    sourceRows.forEach((r) => {
      if (!r) return
      for (const cand of DIMENSION_CANDIDATES) {
        const col = resolveKey(r, cand.key)
        if (col != null) {
          const val = r[col]
          if (val != null && String(val).trim() !== '') {
            const id = cand.alias || cand.key
            if (!seen.has(id)) {
              seen.add(id)
              out.push({ id, label: cand.label, actualKey: col })
            }
          }
        }
      }
    })

    if (out.length === 0) {
      const revBy = kpiData?.revenue_by_column
      if (revBy && typeof revBy === 'object') {
        Object.keys(revBy).forEach((k) => {
          const found = DIMENSION_CANDIDATES.find((c) => (c.alias || c.key) === k)
          if (Array.isArray(revBy[k]) && revBy[k].length > 0) {
            out.push({
              id: k,
              label: found ? found.label : k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' '),
              actualKey: null,
              fallback: 'revenue_by_column',
            })
          }
        })
      }
    }

    return out
  }, [sourceRows, kpiData?.revenue_by_column])

  const [dim, setDim] = useState(() => availableDims[0]?.id || null)
  useEffect(() => {
    if (availableDims.length === 0) {
      if (dim != null) setDim(null)
      return
    }
    if (!availableDims.find((d) => d.id === dim)) setDim(availableDims[0].id)
  }, [availableDims, dim])

  const chartData = useMemo(() => {
    if (!dim) return []
    const selected = availableDims.find((d) => d.id === dim)
    if (!selected) return []

    const safeRatio = Number.isFinite(periodRatio) && periodRatio !== 0 ? periodRatio : 1

    let rows = []
    if (selected.fallback === 'revenue_by_column') {
      const series = kpiData?.revenue_by_column?.[selected.id] || []
      rows = series.map((s) => ({
        name: String(s.name),
        revenue: (Number(s.value) || 0) * safeRatio,
        profit: (Number(s.value) || 0) * 0.22 * safeRatio,
      }))
    } else if (sourceRows.length > 0) {
      const buckets = new Map()
      sourceRows.forEach((r) => {
        if (!r) return
        const dimKey = selected.actualKey || resolveKey(r, selected.id)
        if (!dimKey) return
        const rawName = r[dimKey]
        if (rawName == null || String(rawName).trim() === '') return
        const name = String(rawName).trim()
        const revenueKey = resolveKey(r, 'revenue')
        const profitKey = resolveKey(r, 'profit')
        const revenue = revenueKey ? Number(r[revenueKey]) || 0 : 0
        const profit = profitKey ? Number(r[profitKey]) || 0 : 0
        const b = buckets.get(name) || { name, revenue: 0, profit: 0 }
        b.revenue += revenue
        b.profit += profit
        buckets.set(name, b)
      })
      rows = Array.from(buckets.values()).map((b) => ({
        ...b,
        revenue: b.revenue * safeRatio,
        profit: b.profit * safeRatio,
      }))
    }

    if (rows.length === 0) return []

    rows.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    const top = rows.slice(0, 6)

    const totalRev = top.reduce((a, b) => a + (b.revenue || 0), 0) || 1
    const totalProf = top.reduce((a, b) => a + (b.profit || 0), 0) || 1

    return top.map((r) => ({
      name: r.name,
      shortName: truncate(r.name, 11),
      revenue: r.revenue || 0,
      profit: r.profit || 0,
      revenueShare: ((r.revenue || 0) / totalRev) * 100,
      profitShare: ((r.profit || 0) / totalProf) * 100,
    }))
  }, [dim, availableDims, sourceRows, kpiData?.revenue_by_column, periodRatio])

  const currentDim = availableDims.find((d) => d.id === dim)
  const dimLabel = currentDim?.label || 'Category'

  return (
    <div className="trc-wrapper">
      <div className="trc-header">
        <div className="trc-header-text">
          <h3 className="trc-title">Trends</h3>
          <p className="trc-description">
            Revenue &amp; Profit share · Top {chartData.length || 6} by {dimLabel}
          </p>
        </div>
        {availableDims.length > 1 && (
          <div className="trc-select-wrap">
            <select
              className="trc-select"
              value={dim || ''}
              onChange={(e) => setDim(e.target.value)}
              aria-label="Select dimension"
            >
              {availableDims.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="trc-chart-wrap">
        {chartData.length === 0 ? (
          <div className="trc-empty">No revenue data available to chart.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={chartData}
              outerRadius="88%"
              margin={{ top: 20, right: 44, bottom: 12, left: 44 }}
            >
              <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="name" tick={AngleTick} />
              <Tooltip cursor={false} content={<CustomTooltip />} />
              {hasRevenue && (
                <Radar
                  name="Revenue"
                  dataKey="revenueShare"
                  stroke={REVENUE_COLOR}
                  fill={REVENUE_COLOR}
                  fillOpacity={0.55}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              )}
              {hasProfit && (
                <Radar
                  name="Profit"
                  dataKey="profitShare"
                  stroke={PROFIT_COLOR}
                  fill={PROFIT_COLOR}
                  fillOpacity={0.8}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="trc-legend">
        <span className="trc-legend-item">
          <span className="trc-legend-dot trc-legend-dot--revenue" />
          Revenue
        </span>
        {hasProfit && (
          <span className="trc-legend-item">
            <span className="trc-legend-dot trc-legend-dot--profit" />
            Profit
          </span>
        )}
      </div>
    </div>
  )
}

export default TrendsRadarChart
