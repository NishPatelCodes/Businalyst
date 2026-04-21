import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { KpiContext } from '../../context/KpiContext'
import { formatAxisValueCompact } from '../../utils/axisFormatters'
import './BarChart.css'

const BAR_COLOR = '#2563eb'
const MAX_BARS = 6

const DIMENSION_LABELS = {
  category: 'Category',
  subcategory: 'Subcategory',
  product_name: 'Product',
  productname: 'Product',
  product: 'Product',
  region: 'Region',
  state: 'State',
  country: 'Country',
  payment_method: 'Payment method',
  paymentmethod: 'Payment method',
  channel: 'Channel',
  sales_rep: 'Sales rep',
  customer_name: 'Customer',
  segment: 'Segment',
}

const normalizeKey = (k) => String(k || '').trim().toLowerCase().replace(/\s+/g, '_')

const prettify = (k) =>
  String(k || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

const labelForKey = (key) => {
  const norm = normalizeKey(key)
  return DIMENSION_LABELS[norm] || prettify(key)
}

const truncate = (s, max = 18) => {
  if (s == null) return ''
  const str = String(s).trim()
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}

const CustomTooltip = ({ active, payload, formatValue }) => {
  if (!active || !payload || !payload.length) return null
  const row = payload[0].payload
  return (
    <div className="tbpn-tooltip">
      <div className="tbpn-tooltip-row">
        <span className="tbpn-tooltip-swatch" style={{ background: BAR_COLOR }} />
        <span className="tbpn-tooltip-name">{row.fullName}</span>
      </div>
      <div className="tbpn-tooltip-value">{formatValue(row.value)}</div>
    </div>
  )
}

const BarChart = ({ periodRatio = 1 }) => {
  const { kpiData, formatCurrency } = useContext(KpiContext)

  const safeRatio = periodRatio === 0 ? 1 : periodRatio

  // Collect available dimensions
  const availableDims = useMemo(() => {
    const map = new Map()

    const revenueByCol = kpiData?.revenue_by_column
    if (revenueByCol && typeof revenueByCol === 'object') {
      for (const [key, rows] of Object.entries(revenueByCol)) {
        if (Array.isArray(rows) && rows.length > 0) {
          map.set(normalizeKey(key), { id: key, label: labelForKey(key) })
        }
      }
    }

    // Always include the original `bar_column` dimension from `bar_data`
    const barColumn = kpiData?.bar_column
    if (barColumn && Array.isArray(kpiData?.bar_data) && kpiData.bar_data.length > 0) {
      const k = normalizeKey(barColumn)
      if (!map.has(k)) {
        map.set(k, { id: barColumn, label: labelForKey(barColumn) })
      }
    }

    return Array.from(map.values())
  }, [kpiData])

  const defaultDim = useMemo(() => {
    if (availableDims.length === 0) return null
    // Prefer original bar_column (what the backend picked), else first available
    const preferred = kpiData?.bar_column
    const match =
      preferred &&
      availableDims.find((d) => normalizeKey(d.id) === normalizeKey(preferred))
    return (match || availableDims[0]).id
  }, [availableDims, kpiData])

  const [dim, setDim] = useState(defaultDim)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (defaultDim && (!dim || !availableDims.find((d) => d.id === dim))) {
      setDim(defaultDim)
    }
  }, [defaultDim, availableDims, dim])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  const dimLabel = useMemo(() => {
    const match = availableDims.find((d) => d.id === dim)
    return match?.label || labelForKey(dim) || 'Item'
  }, [availableDims, dim])

  const chartData = useMemo(() => {
    let rows = null

    const revenueByCol = kpiData?.revenue_by_column
    if (dim && revenueByCol && Array.isArray(revenueByCol[dim])) {
      rows = revenueByCol[dim]
    } else if (
      dim &&
      kpiData?.bar_column &&
      normalizeKey(dim) === normalizeKey(kpiData.bar_column) &&
      Array.isArray(kpiData?.bar_data)
    ) {
      rows = kpiData.bar_data
    } else if (Array.isArray(kpiData?.bar_data) && kpiData.bar_data.length > 0) {
      rows = kpiData.bar_data
    } else {
      rows = [
        { name: 'Item 1', value: 2100 },
        { name: 'Item 2', value: 3000 },
        { name: 'Item 3', value: 1800 },
        { name: 'Item 4', value: 1100 },
        { name: 'Item 5', value: 2200 },
      ]
    }

    const base = rows
      .map((d) => ({
        fullName: String(d?.name ?? '—'),
        name: truncate(d?.name ?? '—', 18),
        value: (Number(d?.value) || 0) * safeRatio,
      }))
      .filter((d) => d.value > 0 || d.fullName !== '—')
      .sort((a, b) => b.value - a.value)
      .slice(0, MAX_BARS)

    // Rescale widths so even similar values visually differ:
    //   min value → 20% of the axis, max value → 90%.
    // Others interpolate linearly between. Axis domain is fixed at 0–100.
    if (base.length === 0) return base
    const values = base.map((d) => d.value)
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const MIN_PCT = 20
    const MAX_PCT = 90
    return base.map((d) => {
      let displayValue
      if (base.length === 1 || maxV === minV) {
        displayValue = MAX_PCT
      } else {
        const t = (d.value - minV) / (maxV - minV)
        displayValue = MIN_PCT + t * (MAX_PCT - MIN_PCT)
      }
      return { ...d, displayValue }
    })
  }, [kpiData, dim, safeRatio])

  // Adaptive sizing — thicker bars for fewer categories
  const barSize = useMemo(() => {
    const n = Math.max(1, chartData.length)
    if (n <= 2) return 68
    if (n === 3) return 58
    if (n === 4) return 50
    if (n === 5) return 44
    return 38
  }, [chartData.length])

  const barCategoryGap = useMemo(() => {
    const n = Math.max(1, chartData.length)
    if (n <= 3) return '18%'
    if (n === 4) return '14%'
    if (n === 5) return '12%'
    return '10%'
  }, [chartData.length])

  const formatValue = (v) => {
    if (formatCurrency) return formatCurrency(v)
    return formatAxisValueCompact(v)
  }

  const title = `Top by ${dimLabel.toLowerCase()}`
  const description = chartData.length > 0 ? `Top ${chartData.length} by revenue` : 'No data'

  return (
    <div className="tbpn-wrapper">
      <div className="tbpn-header">
        <div className="tbpn-header-text">
          <h3 className="tbpn-title">{title}</h3>
          <p className="tbpn-description">{description}</p>
        </div>

        {availableDims.length > 1 && (
          <div className="tbpn-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="tbpn-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
            >
              <span className="tbpn-menu-label">{dimLabel}</span>
              <svg
                className={`tbpn-menu-chevron ${menuOpen ? 'is-open' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {menuOpen && (
              <ul className="tbpn-menu" role="listbox">
                {availableDims.map((d) => (
                  <li key={d.id} role="option" aria-selected={d.id === dim}>
                    <button
                      type="button"
                      className={
                        d.id === dim
                          ? 'tbpn-menu-item tbpn-menu-item--active'
                          : 'tbpn-menu-item'
                      }
                      onClick={() => {
                        setDim(d.id)
                        setMenuOpen(false)
                      }}
                    >
                      {d.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="tbpn-chart-wrap">
        {chartData.length === 0 ? (
          <div className="tbpn-empty">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 6, right: 56, left: 4, bottom: 6 }}
              barCategoryGap={barCategoryGap}
            >
              <CartesianGrid
                horizontal={false}
                stroke="#eef2f7"
                strokeDasharray="3 3"
              />
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis dataKey="name" type="category" hide />
              <Tooltip
                cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }}
                content={<CustomTooltip formatValue={formatValue} />}
              />
              <Bar
                dataKey="displayValue"
                fill={BAR_COLOR}
                radius={6}
                barSize={barSize}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="name"
                  position="insideLeft"
                  offset={10}
                  fill="#ffffff"
                  fontSize={12}
                  style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
                />
                <LabelList
                  dataKey="value"
                  position="right"
                  offset={10}
                  fill="#1d1d1f"
                  fontSize={12}
                  style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
                  formatter={(v) => formatValue(Number(v) || 0)}
                />
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default BarChart
