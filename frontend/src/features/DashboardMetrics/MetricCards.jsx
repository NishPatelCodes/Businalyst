import React, { useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { KpiContext } from '../../context/KpiContext'
import './MetricCards.css'

const INSIGHT_ROUTES = {
  profit: '/profit-insights',
  revenue: '/revenue-insights',
  sales: '/revenue-insights',
  orders: '/orders',
  expense: '/expense-insights',
  expenses: '/expense-insights',
  customers: '/analytics/customers',
}

/** Map AI/column names → Dashboard periodTotals keys when available */
const PERIOD_ALIASES = {
  profit: 'profit_sum',
  revenue: 'revenue_sum',
  sales: 'revenue_sum',
  orders: 'orders_sum',
}

const COUNT_KEY_RE = /(order|customer|count|qty|quantity|unit|users?|visits?)/i

const defaultIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 14L11 10L15 13L20 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const humanize = (key) =>
  String(key || 'Metric')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Build KPI cards from the backend payload shape:
 *   { kpi_col: ["col_a", ...], col_a: 123, ... }
 * Falls back to legacy *_sum keys for demo / older payloads.
 */
function resolveKpiItems(kpiData) {
  if (!kpiData) return []

  if (Array.isArray(kpiData.kpi_col) && kpiData.kpi_col.length > 0) {
    return kpiData.kpi_col
      .map((col) => {
        const raw = kpiData[col]
        const value = Number(raw)
        return {
          key: col,
          label: humanize(col),
          value: Number.isFinite(value) ? value : null,
        }
      })
      .filter((item) => item.value != null)
  }

  const legacy = [
    ['profit', 'Profit', kpiData.profit_sum],
    ['revenue', 'Revenue', kpiData.revenue_sum],
    ['orders', 'Orders', kpiData.orders_sum],
    ['expense', 'Expense', kpiData.expense_sum],
    ['customers', 'Customers', kpiData.customers_sum],
  ]
  return legacy
    .filter(([, , v]) => v != null && Number.isFinite(Number(v)))
    .map(([key, label, value]) => ({ key, label, value: Number(value) }))
}

const MetricCards = ({ periodTotals }) => {
  const { kpiData, isDemoData, formatCurrency, formatCompactCurrency } = useContext(KpiContext)
  const navigate = useNavigate()

  const formatCompactNumber = (n) => {
    const numeric = Number(n)
    if (!Number.isFinite(numeric)) return '--'
    if (Math.abs(numeric) >= 1e6) return `${(numeric / 1e6).toFixed(1)}M`
    if (Math.abs(numeric) >= 1e3) return `${(numeric / 1e3).toFixed(0)}k`
    return `${Math.round(numeric).toLocaleString()}`
  }

  const isCountMetric = (key) => COUNT_KEY_RE.test(String(key || ''))

  const kpis = useMemo(() => {
    return resolveKpiItems(kpiData).map((item) => {
      const keyLower = String(item.key || '').toLowerCase()
      const periodKey = PERIOD_ALIASES[keyLower]
      const fromPeriod = periodTotals?.[periodKey] ?? periodTotals?.[item.key]
      const current = Number(
        fromPeriod != null && Number.isFinite(Number(fromPeriod))
          ? fromPeriod
          : item.value
      )
      const safeCurrent = Number.isFinite(current) ? current : 0
      const asCount = isCountMetric(item.key)

      return {
        key: item.key,
        title: item.label,
        value: asCount
          ? Math.round(safeCurrent).toLocaleString()
          : formatCurrency(safeCurrent),
        current: safeCurrent,
        target: safeCurrent ? Math.ceil(safeCurrent * 1.2) : 1,
        asCount,
        comparison: isDemoData ? 'Demo data — upload to see yours' : 'From your uploaded file',
        icon: defaultIcon,
        insightsRoute: INSIGHT_ROUTES[keyLower] || null,
      }
    })
  }, [kpiData, periodTotals, isDemoData, formatCurrency])

  const formatTarget = (asCount, current, target) => {
    if (asCount) {
      return `${formatCompactNumber(current)} / ${formatCompactNumber(target)}`
    }
    return `${formatCompactCurrency(current)} / ${formatCompactCurrency(target)}`
  }

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  if (!kpis.length) {
    return (
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-title">No KPIs yet</div>
        </div>
        <div className="kpi-value">—</div>
        <div className="kpi-progress-section">
          <div className="kpi-target-text">Upload a file to generate metrics</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {kpis.map((kpi) => {
        const progress = calculateProgress(kpi.current, kpi.target)
        return (
          <div key={kpi.key} className="kpi-card">
            {kpi.insightsRoute && (
              <button
                className="kpi-more-insights-button"
                onClick={() => navigate(kpi.insightsRoute)}
                title="More Insights"
              >
                More Insights
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <div className="kpi-header">
              <div className="kpi-icon">{kpi.icon}</div>
              <div className="kpi-title">{kpi.title}</div>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-progress-section">
              <div className="kpi-progress-bar">
                <div className="kpi-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="kpi-target-text">{formatTarget(kpi.asCount, kpi.current, kpi.target)}</div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default MetricCards
