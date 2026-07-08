/**
 * Filter time-series rows by calendar span ending at the latest data point.
 * "7D" = last 7 days of data (not last 7 rows).
 */
const DAY_LIMITS = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
}

export function filterSeriesByCalendarRange(series, dateRange) {
  if (!Array.isArray(series) || series.length === 0) return []
  const sorted = [...series].sort((a, b) => new Date(a.date) - new Date(b.date))
  if (dateRange === 'ALL') return sorted

  const days = DAY_LIMITS[dateRange]
  if (!days) return sorted

  let lastTs = -Infinity
  for (const pt of sorted) {
    const t = new Date(pt.date).getTime()
    if (!Number.isNaN(t)) lastTs = Math.max(lastTs, t)
  }
  if (!Number.isFinite(lastTs) || lastTs < 0) return sorted

  const startTs = lastTs - days * 86400000
  return sorted.filter((pt) => {
    const t = new Date(pt.date).getTime()
    return !Number.isNaN(t) && t >= startTs && t <= lastTs
  })
}
