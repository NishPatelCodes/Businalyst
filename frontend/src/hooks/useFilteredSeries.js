import { useMemo } from 'react'
import { filterSeriesByCalendarRange } from '../utils/timeRangeFilter'

export default function useFilteredSeries(series, dateRange) {
  return useMemo(() => {
    if (!Array.isArray(series) || series.length === 0) return []
    return filterSeriesByCalendarRange(series, dateRange)
  }, [series, dateRange])
}

