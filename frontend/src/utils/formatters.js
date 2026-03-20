// Shared formatting helpers used across insight pages.

export const fmtNum = (n) => {
  const numeric = Number(n)
  const abs = Math.abs(numeric)
  if (!Number.isFinite(numeric)) return '0'
  if (abs >= 1e6) return `${(numeric / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${(numeric / 1e3).toFixed(0)}K`
  return numeric.toFixed(0)
}

export const fmtPct = (n) => `${(Number(n) || 0).toFixed(1)}%`

export const fmtDate = (s) => {
  try {
    return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return s
  }
}

