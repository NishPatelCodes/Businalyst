export function exportCSV({ columns, rows, filename }) {
  if (!Array.isArray(rows) || !Array.isArray(columns) || !filename) return
  if (rows.length === 0) return

  const escapeCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csvRows = [columns.map(escapeCell).join(',').replace(/^"|"$/g, '')] // Keep headers plain
  // NOTE: headers are often already safe; we still escape values.

  rows.forEach((row) => {
    csvRows.push(columns.map((c) => escapeCell(row?.[c])).join(','))
  })

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportPDF() {
  window.print()
}

