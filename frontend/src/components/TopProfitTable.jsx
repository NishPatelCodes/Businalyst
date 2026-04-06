import React, { useContext } from 'react'
import { KpiContext } from '../context/KpiContext'
import './TopProfitTable.css'

const SortIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3V9M6 3L4 5M6 3L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const MONEY_COLUMN_PATTERN = /(profit|revenue|sales|amount|cost|price|expense|total)/i

const formatCell = (value, key, formatCurrency) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'number') {
    if (MONEY_COLUMN_PATTERN.test(String(key))) {
      return formatCurrency(value)
    }
    if (Number.isInteger(value)) return value.toLocaleString()
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }
  return String(value)
}

const columnLabel = (key) => {
  return key
    .split(/[\s_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

const TopProfitTable = ({ periodRatio = 1 }) => {
  const { kpiData, formatCurrency } = useContext(KpiContext)
  const rows = Array.isArray(kpiData?.top5_profit) ? kpiData.top5_profit : []
  const columns = Array.isArray(kpiData?.top5_columns) && kpiData.top5_columns.length > 0
    ? kpiData.top5_columns
    : (rows.length > 0 ? Object.keys(rows[0]) : [])

  // BUG 3 fix: when periodRatio is 0 (no data in selected range), skip scaling
  // so dollar columns retain their original values instead of becoming $0.
  const scaledRows =
    periodRatio === 1 || periodRatio === 0
      ? rows
      : rows.map((row) => {
          const out = { ...row }
          columns.forEach((col) => {
            if (!MONEY_COLUMN_PATTERN.test(col)) return
            const numeric = Number(out[col])
            if (Number.isFinite(numeric)) out[col] = numeric * periodRatio
          })
          return out
        })

  if (scaledRows.length === 0) {
    return (
      <div className="top-profit-table-container">
        <div className="table-header">
          <h3 className="table-title">Top 5 by Profit</h3>
          <span className="table-badge table-badge--muted">No data</span>
        </div>
        <p className="top-profit-table-empty">Upload a file to see the top 5 highest-profit rows.</p>
      </div>
    )
  }

  const manyColumns = columns.length > 8

  return (
    <div className="top-profit-table-container">
      <div className="table-header">
        <h3 className="table-title">Top 5 by Profit</h3>
      </div>

      {/* BUG 6 fix: always apply scroll wrapper so columns are never clipped */}
      <div className="table-wrapper table-wrapper--scroll">
        <table
          className="data-table data-table--dynamic"
          style={manyColumns ? { minWidth: columns.length * 120 } : undefined}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>
                  <span className="th-content">
                    {columnLabel(col)}
                    <SortIcon />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scaledRows.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col} className="data-cell">
                    {formatCell(row[col], col, formatCurrency)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopProfitTable
