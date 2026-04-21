import React, { useContext, useMemo, useState, useEffect, useRef } from 'react'
import { KpiContext } from '../context/KpiContext'
import './OrdersStatusTable.css'

const MONEY_COLUMN_PATTERN = /(profit|revenue|sales|amount|cost|price|expense|total)/i
const NUMERIC_COLUMN_PATTERN = /(orders|qty|quantity|count|units)/i
const STATUS_COLUMN_PATTERN = /^(order[\s_-]*)?status$|^state$|^fulfillment$/i
const TYPE_BADGE_PATTERN = /(category|region|channel|payment[\s_-]*method|segment|type|class)/i

const PENDING_PATTERN = /pending|processing|in[\s_-]*process|in[\s_-]*progress|shipped|open|awaiting|hold/i
const COMPLETED_PATTERN = /complete|done|fulfilled|delivered|paid|closed|success/i

const normalize = (v) => String(v == null ? '' : v).trim().toLowerCase()
const isPending = (v) => PENDING_PATTERN.test(normalize(v))
const isCompleted = (v) => COMPLETED_PATTERN.test(normalize(v))

const columnLabel = (key) =>
  String(key)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

const formatCell = (value, key, formatCurrency) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'number') {
    if (MONEY_COLUMN_PATTERN.test(String(key))) return formatCurrency(value)
    if (Number.isInteger(value)) return value.toLocaleString()
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  const num = Number(value)
  if (Number.isFinite(num) && String(value).trim() !== '' && MONEY_COLUMN_PATTERN.test(String(key))) {
    return formatCurrency(num)
  }
  return String(value)
}

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
)
const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
)
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
)
const ChevronsLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
)
const ChevronsRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
)
const ColumnsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" /></svg>
)
const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke="none" /><polyline points="7 12.5 10.5 16 17 9" fill="none" /></svg>
)
const LoaderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6b70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
)

const StatusBadge = ({ value }) => {
  const v = normalize(value)
  const done = isCompleted(v)
  const pending = isPending(v)
  const label = value == null || value === '' ? '—' : String(value)
  return (
    <span className="ost-status-badge">
      {done ? <CheckCircleIcon /> : pending ? <LoaderIcon /> : <span className="ost-status-dot" />}
      <span>{label}</span>
    </span>
  )
}

const useClickOutside = (ref, onOutside) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

const ColumnsDropdown = ({ columns, visibility, onToggle }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))
  return (
    <div className="ost-dropdown" ref={ref}>
      <button
        type="button"
        className="ost-button"
        onClick={() => setOpen((v) => !v)}
      >
        <ColumnsIcon />
        <span className="ost-button-label-full">Customize Columns</span>
        <span className="ost-button-label-short">Columns</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="ost-dropdown-menu">
          {columns.map((col) => (
            <label key={col} className="ost-dropdown-item">
              <input
                type="checkbox"
                checked={visibility[col] !== false}
                onChange={() => onToggle(col)}
              />
              <span>{columnLabel(col)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const OrdersStatusTable = ({ periodRatio = 1 }) => {
  const { kpiData, formatCurrency } = useContext(KpiContext)

  const { sourceRows, sourceColumns } = useMemo(() => {
    const ordersRows = Array.isArray(kpiData?.orders_list) ? kpiData.orders_list : []
    const ordersCols = Array.isArray(kpiData?.orders_columns) ? kpiData.orders_columns : []
    if (ordersRows.length > 0) {
      const cols = ordersCols.length > 0 ? ordersCols : Object.keys(ordersRows[0] || {})
      return { sourceRows: ordersRows, sourceColumns: cols }
    }
    const fallbackRows = Array.isArray(kpiData?.top5_profit) ? kpiData.top5_profit : []
    const fallbackCols = Array.isArray(kpiData?.top5_columns) && kpiData.top5_columns.length > 0
      ? kpiData.top5_columns
      : (fallbackRows[0] ? Object.keys(fallbackRows[0]) : [])
    return { sourceRows: fallbackRows, sourceColumns: fallbackCols }
  }, [kpiData])

  const statusCol = useMemo(
    () => sourceColumns.find((c) => STATUS_COLUMN_PATTERN.test(String(c))) || null,
    [sourceColumns]
  )
  const hasStatus = Boolean(statusCol)

  const scaledRows = useMemo(() => {
    if (!Number.isFinite(periodRatio) || periodRatio === 1 || periodRatio === 0) return sourceRows
    return sourceRows.map((row) => {
      const out = { ...row }
      sourceColumns.forEach((col) => {
        if (!MONEY_COLUMN_PATTERN.test(String(col))) return
        const numeric = Number(out[col])
        if (Number.isFinite(numeric)) out[col] = numeric * periodRatio
      })
      return out
    })
  }, [sourceRows, sourceColumns, periodRatio])

  const pendingRows = useMemo(
    () => (hasStatus ? scaledRows.filter((r) => isPending(r[statusCol])) : []),
    [hasStatus, scaledRows, statusCol]
  )
  const completedRows = useMemo(
    () => (hasStatus ? scaledRows.filter((r) => isCompleted(r[statusCol])) : []),
    [hasStatus, scaledRows, statusCol]
  )
  const top10Rows = useMemo(() => {
    const profitKey = sourceColumns.find((c) => /^profit$/i.test(c)) || 'profit'
    const revenueKey = sourceColumns.find((c) => /^revenue$/i.test(c)) || 'revenue'
    const sortKey = profitKey in (scaledRows[0] || {}) ? profitKey : revenueKey
    return [...scaledRows]
      .sort((a, b) => (Number(b?.[sortKey]) || 0) - (Number(a?.[sortKey]) || 0))
      .slice(0, 10)
  }, [scaledRows, sourceColumns])
  const fallbackTop5 = useMemo(() => scaledRows.slice(0, 5), [scaledRows])

  const [activeTab, setActiveTab] = useState('pending')
  useEffect(() => {
    if (!hasStatus) setActiveTab('top')
    else if (activeTab === 'top' || activeTab === 'completed' || activeTab === 'pending') {
      return
    } else {
      setActiveTab('pending')
    }
  }, [hasStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeRows = hasStatus
    ? activeTab === 'pending'
      ? pendingRows
      : activeTab === 'completed'
      ? completedRows
      : top10Rows
    : fallbackTop5

  const [columnVisibility, setColumnVisibility] = useState({})
  const toggleColumn = (col) =>
    setColumnVisibility((prev) => ({ ...prev, [col]: prev[col] === false ? true : false }))
  const visibleColumns = useMemo(
    () => sourceColumns.filter((c) => columnVisibility[c] !== false),
    [sourceColumns, columnVisibility]
  )

  const [selected, setSelected] = useState(() => new Set())
  useEffect(() => {
    setSelected(new Set())
  }, [activeTab, hasStatus])

  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  useEffect(() => {
    setPageIndex(0)
  }, [activeTab, hasStatus, pageSize])
  const pageCount = Math.max(1, Math.ceil(activeRows.length / pageSize))
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const paginatedRows = useMemo(
    () => activeRows.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize),
    [activeRows, safePageIndex, pageSize]
  )

  const allPageSelected =
    paginatedRows.length > 0 && paginatedRows.every((r, i) => selected.has(`${safePageIndex}-${i}`))
  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        paginatedRows.forEach((_, i) => next.delete(`${safePageIndex}-${i}`))
      } else {
        paginatedRows.forEach((_, i) => next.add(`${safePageIndex}-${i}`))
      }
      return next
    })
  }
  const toggleRow = (i) =>
    setSelected((prev) => {
      const next = new Set(prev)
      const key = `${safePageIndex}-${i}`
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  if (sourceRows.length === 0) {
    return (
      <div className="ost-wrapper">
        <div className="ost-empty">
          <h3 className="ost-empty-title">Orders</h3>
          <p>Upload a file to see pending, completed and top orders.</p>
        </div>
      </div>
    )
  }

  const tabs = hasStatus
    ? [
        { id: 'pending', label: 'Pending Orders', count: pendingRows.length },
        { id: 'completed', label: 'Completed Orders', count: completedRows.length },
        { id: 'top', label: 'Top 10 Orders', count: Math.min(10, scaledRows.length) },
      ]
    : [{ id: 'top', label: 'Top 5 Orders', count: fallbackTop5.length }]

  return (
    <div className="ost-wrapper">
      <div className="ost-toolbar">
        <div className="ost-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              data-active={activeTab === t.id}
              className="ost-tab"
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.label}</span>
              <span className="ost-tab-badge">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="ost-toolbar-actions">
          <ColumnsDropdown
            columns={sourceColumns}
            visibility={columnVisibility}
            onToggle={toggleColumn}
          />
        </div>
      </div>

      <div className="ost-table-container">
        <div className="ost-table-scroll">
          <table className="ost-table">
            <thead>
              <tr>
                <th className="ost-select-cell">
                  <input
                    type="checkbox"
                    className="ost-checkbox"
                    checked={allPageSelected}
                    onChange={toggleAllOnPage}
                    aria-label="Select all"
                  />
                </th>
                {visibleColumns.map((col) => {
                  const isNumeric = MONEY_COLUMN_PATTERN.test(col) || NUMERIC_COLUMN_PATTERN.test(col)
                  return (
                    <th
                      key={col}
                      className={isNumeric ? 'ost-th-right' : undefined}
                    >
                      {columnLabel(col)}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="ost-empty-row">
                    No results.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, i) => {
                  const key = `${safePageIndex}-${i}`
                  const isSelected = selected.has(key)
                  return (
                    <tr key={key} data-selected={isSelected}>
                      <td className="ost-select-cell">
                        <input
                          type="checkbox"
                          className="ost-checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(i)}
                          aria-label="Select row"
                        />
                      </td>
                      {visibleColumns.map((col, idx) => {
                        const value = row[col]
                        const isNumeric = MONEY_COLUMN_PATTERN.test(col) || NUMERIC_COLUMN_PATTERN.test(col)
                        if (statusCol && col === statusCol) {
                          return (
                            <td key={col}>
                              <StatusBadge value={value} />
                            </td>
                          )
                        }
                        if (TYPE_BADGE_PATTERN.test(col)) {
                          return (
                            <td key={col}>
                              <span className="ost-type-badge">
                                {value == null || value === '' ? '—' : String(value)}
                              </span>
                            </td>
                          )
                        }
                        if (idx === 0) {
                          return (
                            <td key={col} className="ost-primary-cell">
                              {formatCell(value, col, formatCurrency)}
                            </td>
                          )
                        }
                        return (
                          <td key={col} className={isNumeric ? 'ost-td-right' : undefined}>
                            {formatCell(value, col, formatCurrency)}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ost-footer">
        <div className="ost-footer-info">
          {selected.size} of {activeRows.length} row(s) selected.
        </div>
        <div className="ost-footer-controls">
          <div className="ost-page-size">
            <span className="ost-page-size-label">Rows per page</span>
            <select
              className="ost-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {[5, 10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="ost-page-info">
            Page {safePageIndex + 1} of {pageCount}
          </div>
          <div className="ost-page-nav">
            <button
              type="button"
              className="ost-icon-button ost-icon-button--wide"
              onClick={() => setPageIndex(0)}
              disabled={safePageIndex === 0}
              aria-label="Go to first page"
            >
              <ChevronsLeftIcon />
            </button>
            <button
              type="button"
              className="ost-icon-button"
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={safePageIndex === 0}
              aria-label="Go to previous page"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="ost-icon-button"
              onClick={() => setPageIndex((i) => Math.min(pageCount - 1, i + 1))}
              disabled={safePageIndex >= pageCount - 1}
              aria-label="Go to next page"
            >
              <ChevronRightIcon />
            </button>
            <button
              type="button"
              className="ost-icon-button ost-icon-button--wide"
              onClick={() => setPageIndex(pageCount - 1)}
              disabled={safePageIndex >= pageCount - 1}
              aria-label="Go to last page"
            >
              <ChevronsRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersStatusTable
