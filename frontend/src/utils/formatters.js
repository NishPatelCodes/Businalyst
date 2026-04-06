/** Shared number/date formatting helpers used across pages. */

export const fmtCur = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n || 0)

export const fmtNum = (n) => {
  const abs = Math.abs(n)
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return (n || 0).toFixed(0)
}

export const fmtPct = (n) => `${(n || 0).toFixed(1)}%`

export const fmtDate = (s) => {
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  catch { return s }
}
