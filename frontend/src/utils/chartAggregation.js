/**
 * Aggregates time-series data based on the selected timeframe to reduce x-axis congestion
 *
 * Strategy:
 * - 7D, 30D: No aggregation (daily data)
 * - 90D: Weekly aggregation
 * - 1Y: Monthly aggregation
 * - ALL: Smart adaptive based on data range
 */

/**
 * Determines the aggregation granularity from actual date-range size.
 * Goal: keep enough points to feel informative, but not congested.
 */
function getAggregationGranularity(timeframe, dateRange) {
  const dayMs = 1000 * 60 * 60 * 24
  const daysInRange = dateRange ? dateRange / dayMs : null

  // Fallback when date range isn't available.
  if (!daysInRange || daysInRange <= 0) {
    if (timeframe === '7D') return null
    if (timeframe === '30D') return null
    if (timeframe === '90D') return 'week'
    if (timeframe === '1Y') return 'month'
    return null
  }

  // Adaptive buckets:
  // - <= ~45 days: daily (dense enough, still readable with interval logic)
  // - <= ~180 days: weekly
  // - <= ~540 days: bi-weekly
  // - larger: monthly
  if (daysInRange <= 45) return null
  if (daysInRange <= 180) return 'week'
  if (daysInRange <= 540) return 'biweek'
  return 'month'
}

export function getGranularityForTimeframe(timeframe, dateRange = null) {
  return getAggregationGranularity(timeframe, dateRange)
}

function toDate(input) {
  if (input instanceof Date) return input
  const parsed = new Date(input)
  return isNaN(parsed.getTime()) ? null : parsed
}

function formatDay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
}

function formatDayMonth(date) {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

function formatMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'short' })
}

function formatMonthYear(date) {
  return date
    .toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    .replace(' ', " '")
}

export function getXAxisConfig(timeframe) {
  const safeTimeframe = timeframe || '30D'

  const formatLabel = (input) => {
    const date = toDate(input)
    if (!date) return String(input ?? '')

    if (safeTimeframe === '7D') return formatDay(date)
    if (safeTimeframe === '30D' || safeTimeframe === '90D') return formatDayMonth(date)
    if (safeTimeframe === '1Y') {
      // If points were weekly (not monthly), keep day precision.
      return date.getDate() === 1 ? formatMonth(date) : formatDayMonth(date)
    }
    if (safeTimeframe === 'ALL') {
      return date.getDate() === 1 ? formatMonthYear(date) : formatDayMonth(date)
    }
    return formatDayMonth(date)
  }

  const getInterval = (dataLength = 0) => {
    const size = Number(dataLength) || 0
    if (size <= 2) return 0
    if (size <= 12) return 0
    // Keep roughly ~10 labels visible regardless of selected timeframe.
    return Math.max(0, Math.ceil(size / 10) - 1)
  }

  return { formatLabel, getInterval }
}

/**
 * Gets the start of a week (Monday)
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
}

/**
 * Gets the start of a bi-week (every 14 days, Monday-based)
 */
function getBiweekStart(date) {
  const weekStart = getWeekStart(date);
  const yearStart = new Date(weekStart.getFullYear(), 0, 1);
  const weekNum = Math.floor((weekStart - yearStart) / (7 * 24 * 60 * 60 * 1000));
  const biweekNum = Math.floor(weekNum / 2);
  const biweekStart = new Date(yearStart);
  biweekStart.setDate(biweekStart.getDate() + biweekNum * 14);
  return biweekStart;
}

/**
 * Gets the start of a month
 */
function getMonthStart(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Gets a unique key for the aggregation period
 */
function getPeriodKey(date, granularity) {
  if (granularity === 'week') {
    const weekStart = getWeekStart(date);
    // Use ISO week format: year-week number (0-indexed from Jan 1)
    const yearStart = new Date(weekStart.getFullYear(), 0, 1);
    const weekNum = Math.floor((weekStart - yearStart) / (7 * 24 * 60 * 60 * 1000));
    return `${weekStart.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }
  if (granularity === 'biweek') {
    const biweekStart = getBiweekStart(date);
    const yearStart = new Date(biweekStart.getFullYear(), 0, 1);
    const biweekNum = Math.floor((biweekStart - yearStart) / (14 * 24 * 60 * 60 * 1000));
    return `${biweekStart.getFullYear()}-BW${String(biweekNum).padStart(2, '0')}`;
  }
  if (granularity === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Aggregates a time series by the specified granularity
 */
function aggregateSeries(series, granularity) {
  if (!granularity || !series || series.length === 0) {
    return series;
  }

  const aggregated = {};
  const dateMap = {}; // Keep track of period representative dates

  series.forEach((point) => {
    const date = point.date instanceof Date ? point.date : new Date(point.date);
    const key = getPeriodKey(date, granularity);

    if (!aggregated[key]) {
      aggregated[key] = 0;
      // Store the first date or the start of the period for label purposes
      if (granularity === 'month') {
        dateMap[key] = getMonthStart(date);
      } else if (granularity === 'biweek') {
        dateMap[key] = getBiweekStart(date);
      } else if (granularity === 'week') {
        dateMap[key] = getWeekStart(date);
      } else {
        dateMap[key] = date;
      }
    }

    aggregated[key] += point.value || 0;
  });

  // Convert back to array format
  return Object.keys(aggregated)
    .sort()
    .map((key) => ({
      date: dateMap[key],
      value: aggregated[key],
    }));
}

/**
 * Main aggregation function
 *
 * @param {Array} series - Array of {date, value} objects
 * @param {string} timeframe - One of: '7D', '30D', '90D', '1Y', 'ALL'
 * @returns {Array} - Aggregated series
 */
export function aggregateSeriesByTimeframe(series, timeframe) {
  if (!series || series.length === 0 || !timeframe) {
    return series;
  }

  // Calculate date range for adaptive granularity logic
  let dateRange = null;
  if (series.length > 1) {
    const firstDate = series[0].date instanceof Date ? series[0].date : new Date(series[0].date);
    const lastDate = series[series.length - 1].date instanceof Date ? series[series.length - 1].date : new Date(series[series.length - 1].date);
    dateRange = lastDate - firstDate;
  }

  const granularity = getAggregationGranularity(timeframe, dateRange);
  return aggregateSeries(series, granularity);
}

/**
 * Gets appropriate date format label based on granularity
 * Useful for updating x-axis labels
 */
export function getDateFormatForGranularity(granularity) {
  if (granularity === 'month') {
    return 'month'; // e.g., "Jan 2024"
  }
  if (granularity === 'week') {
    return 'week'; // e.g., "Week 1 2024"
  }
  return 'day'; // e.g., "Jan 15"
}
