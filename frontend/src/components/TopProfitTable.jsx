import React, { useContext } from 'react'
import { KpiContext } from '../context/KpiContext'
import './TopProfitTable.css'

const SortIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3V9M6 3L4 5M6 3L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const formatCell = (value, key) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'number') {
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

const TopProfitTable = () => {
  const { kpiData } = useContext(KpiContext)
  const rows = Array.isArray(kpiData?.top5_profit) ? kpiData.top5_profit : []
  const columns = Array.isArray(kpiData?.top5_columns) && kpiData.top5_columns.length > 0
    ? kpiData.top5_columns
    : (rows.length > 0 ? Object.keys(rows[0]) : [])

  const handleExportCSV = () => {
    if (rows.length === 0 || columns.length === 0) return
    const csvRows = [columns.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')]
    rows.forEach((row) => {
      csvRows.push(
        columns.map((col) => {
          const v = row[col]
          const s = v == null ? '' : String(v)
          return `"${s.replace(/"/g, '""')}"`
        }).join(',')
      )
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'top5-profit.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (rows.length === 0) {
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

      <div className={`table-wrapper ${manyColumns ? 'table-wrapper--scroll' : ''}`}>
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
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col} className="data-cell">
                    {formatCell(row[col], col)}
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
