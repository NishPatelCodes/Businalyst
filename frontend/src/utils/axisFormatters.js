export const formatAxisValueCompact = (v) => {
  const numeric = Number(v)
  if (!Number.isFinite(numeric)) return '0'
  if (numeric >= 1e6) return `${(numeric / 1e6).toFixed(1)}M`
  if (numeric >= 1e3) return `${(numeric / 1e3).toFixed(0)}k`
  return String(Math.round(numeric))
}

