import React, { useContext, useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import DashboardMetrics from '../features/DashboardMetrics'
import LineChart from '../features/LineChart'
import OrdersComparisonBarChart from '../features/OrdersComparisonBarChart/OrdersComparisonBarChart'
import DashboardMultilineChart from '../features/DashboardMultilineChart/DashboardMultilineChart'
import BarChart from '../features/BarChart'
import MapChart from '../features/MapChart'
import TopProfitTable from '../components/TopProfitTable'
import { KpiContext } from '../context/KpiContext'
import DateRangePicker from '../components/DateRangePicker'
import './Dashboard.css'

// new Date('YYYY-MM-DD') is spec'd to produce UTC midnight, but the calendar
// picker creates dates at local midnight via new Date(y,m,d). Comparing them
// causes off-by-one filtering at timezone boundaries. This helper parses an
// ISO date string into local midnight so all dates in the app are comparable.
function parseDateLocal(dateStr) {
  if (dateStr instanceof Date) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    return d
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

const Dashboard = () => {
  const { kpiData, isDemoData, currencies, selectedCurrency, setSelectedCurrency } = useContext(KpiContext)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false)
  const [activeQuickRangeMonths, setActiveQuickRangeMonths] = useState(null)
  // Derive initial date range from actual data bounds using local-midnight dates
  // so they match the calendar picker's dates and filtering works correctly.
  const [dateRange, setDateRange] = useState(() => {
    const dates = kpiData?.date_data
    if (Array.isArray(dates) && dates.length > 0) {
      const parsed = dates.map(d => parseDateLocal(d)).filter(Boolean)
      if (parsed.length > 0) {
        const min = new Date(Math.min(...parsed))
        const max = new Date(Math.max(...parsed))
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return { start: min, end: max > today ? today : max }
      }
    }
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const start = new Date(end)
    start.setMonth(end.getMonth() - 1)
    return { start, end }
  })
  // Re-derive date range when the underlying dataset changes (e.g. new upload)
  const prevDateDataRef = useRef(kpiData?.date_data)
  useEffect(() => {
    const prev = prevDateDataRef.current
    const curr = kpiData?.date_data
    if (curr === prev) return
    prevDateDataRef.current = curr
    if (Array.isArray(curr) && curr.length > 0) {
      const parsed = curr.map(d => parseDateLocal(d)).filter(Boolean)
      if (parsed.length > 0) {
        const min = new Date(Math.min(...parsed))
        const max = new Date(Math.max(...parsed))
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setDateRange({ start: min, end: max > today ? today : max })
      }
    }
  }, [kpiData?.date_data])

  const currencyDropdownRef = useRef(null)
  const currencyButtonRef = useRef(null)
  const exportButtonRef = useRef(null)
  const exportDropdownRef = useRef(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const [exportDropdownPosition, setExportDropdownPosition] = useState({ top: 0, right: 0 })

  // BUG 5 fix: force scroll to top on mount so KPI cards aren't hidden
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const formatDate = (date) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDisplayText = () => {
    if (dateRange.start && dateRange.end) {
      return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
    }
    return 'Select dates'
  }

  const handleDateRangeApply = (range) => {
    setDateRange(range)
    setActiveQuickRangeMonths(null)
  }

  const dataDateBounds = useMemo(() => {
    const dates = Array.isArray(kpiData?.date_data) ? kpiData.date_data : []
    const parsed = dates.map((d) => parseDateLocal(d)).filter(Boolean)
    if (!parsed.length) return null
    const min = new Date(Math.min(...parsed))
    const max = new Date(Math.max(...parsed))
    min.setHours(0, 0, 0, 0)
    max.setHours(0, 0, 0, 0)
    return { min, max }
  }, [kpiData?.date_data])

  const handleQuickRangeSelect = (months) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const end = dataDateBounds?.max && dataDateBounds.max < today ? new Date(dataDateBounds.max) : new Date(today)
    const start = new Date(end)
    start.setMonth(end.getMonth() - months)
    start.setHours(0, 0, 0, 0)

    const boundedStart = dataDateBounds?.min && start < dataDateBounds.min ? new Date(dataDateBounds.min) : start

    setDateRange({ start: boundedStart, end })
    setActiveQuickRangeMonths(months)
    setIsDatePickerOpen(false)
  }

  // Calculate dropdown position and handle click outside
  useEffect(() => {
    const updatePosition = () => {
      if (currencyButtonRef.current && isCurrencyDropdownOpen) {
        const rect = currencyButtonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right
        })
      }
    }

    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        const button = event.target.closest('.currency-button')
        if (!button) {
          setIsCurrencyDropdownOpen(false)
        }
      }
    }

    if (isCurrencyDropdownOpen) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isCurrencyDropdownOpen])

  const handleCurrencySelect = (currencyCode) => {
    setSelectedCurrency(currencyCode)
    setIsCurrencyDropdownOpen(false)
  }

  const dashboardSeries = useMemo(() => {
    const dates = Array.isArray(kpiData?.date_data) ? kpiData.date_data : []
    const revenues = Array.isArray(kpiData?.revenue_data) ? kpiData.revenue_data : []
    const profits = Array.isArray(kpiData?.profit_data) ? kpiData.profit_data : []
    const orders = Array.isArray(kpiData?.orders_data) ? kpiData.orders_data : []
    const hasOrdersData = Array.isArray(kpiData?.orders_data) && kpiData.orders_data.length > 0

    const len = Math.min(dates.length, revenues.length, profits.length)
    const allSeries = []
    for (let i = 0; i < len; i++) {
      // Parse as local midnight so comparisons with the date picker
      // (which also uses local midnight) are timezone-consistent.
      const dt = parseDateLocal(dates[i])
      if (!dt) continue
      allSeries.push({
        date: dt,
        revenue: Number(revenues[i]) || 0,
        profit: Number(profits[i]) || 0,
        orders: hasOrdersData && orders[i] !== undefined ? Number(orders[i]) || 0 : 0,
      })
    }

    const start = dateRange?.start
    const end = dateRange?.end
    const filteredSeries =
      start instanceof Date && end instanceof Date
        ? allSeries.filter((pt) => pt.date >= start && pt.date <= end)
        : allSeries

    const sum = (arr, key) => arr.reduce((s, pt) => s + (Number(pt[key]) || 0), 0)
    const totalRevenue = sum(allSeries, 'revenue')
    const totalProfit = sum(allSeries, 'profit')

    const periodRevenue = sum(filteredSeries, 'revenue')
    const periodProfit = sum(filteredSeries, 'profit')

    const revenueRatio = totalRevenue > 0 ? periodRevenue / totalRevenue : 1
    const profitRatio = totalProfit > 0 ? periodProfit / totalProfit : revenueRatio

    const totalOrders = hasOrdersData ? sum(allSeries, 'orders') : Number(kpiData?.orders_sum ?? 0)
    const periodOrders = hasOrdersData ? sum(filteredSeries, 'orders') : totalOrders * revenueRatio
    const ordersRatio = totalOrders > 0 ? periodOrders / totalOrders : revenueRatio

    return {
      allSeries,
      filteredSeries,
      periodTotals: {
        profit_sum: periodProfit,
        revenue_sum: periodRevenue,
        orders_sum: periodOrders,
      },
      ratios: { revenueRatio, profitRatio, ordersRatio },
    }
  }, [kpiData, dateRange?.start, dateRange?.end])

  // BUG 2/12 fix: always pass filtered series so LineChart never falls back to
  // raw unfiltered kpiData. When the date range yields no data, the chart correctly
  // shows an empty state instead of stale unfiltered data.
  const lineSeriesOverride = useMemo(() => {
    return dashboardSeries.filteredSeries.map((pt) => ({
      date: pt.date,
      revenue: pt.revenue,
      profit: pt.profit,
    }))
  }, [dashboardSeries.filteredSeries])

  const exportSeries = dashboardSeries.filteredSeries.length ? dashboardSeries.filteredSeries : dashboardSeries.allSeries
  const exportStartStr = dateRange?.start instanceof Date
    ? `${dateRange.start.getFullYear()}-${String(dateRange.start.getMonth() + 1).padStart(2, '0')}-${String(dateRange.start.getDate()).padStart(2, '0')}`
    : 'start'
  const exportEndStr = dateRange?.end instanceof Date
    ? `${dateRange.end.getFullYear()}-${String(dateRange.end.getMonth() + 1).padStart(2, '0')}-${String(dateRange.end.getDate()).padStart(2, '0')}`
    : 'end'

  const handleExportCSV = () => {
    if (!exportSeries.length) return
    const cols = ['date', 'revenue', 'profit', 'orders']
    const csvRows = [cols.join(',')]
    exportSeries.forEach((row) => {
      const y = row.date.getFullYear()
      const m = String(row.date.getMonth() + 1).padStart(2, '0')
      const d = String(row.date.getDate()).padStart(2, '0')
      csvRows.push([
        `"${y}-${m}-${d}"`,
        Number(row.revenue ?? 0),
        Number(row.profit ?? 0),
        Number(row.orders ?? 0),
      ].join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-${exportStartStr}-${exportEndStr}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    window.print()
  }

  // Export dropdown positioning + click-outside
  useEffect(() => {
    if (!exportOpen) return
    if (exportButtonRef.current) {
      const rect = exportButtonRef.current.getBoundingClientRect()
      setExportDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      })
    }

    const handleClickOutside = (event) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target) &&
        exportButtonRef.current &&
        !exportButtonRef.current.contains(event.target)
      ) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [exportOpen])

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavigation />
        
        <div className="dashboard-content">
          {isDemoData && (
            <div className="dashboard-demo-banner">
              <span>Showing demo data —</span>
              <Link to="/upload">Upload your file</Link>
              <span>to see your own analytics</span>
            </div>
          )}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <div className="dashboard-actions">
              <div className="quick-range-group" role="group" aria-label="Quick date ranges">
                <button
                  type="button"
                  className={`quick-range-button ${activeQuickRangeMonths === 1 ? 'active' : ''}`}
                  onClick={() => handleQuickRangeSelect(1)}
                >
                  1 month
                </button>
                <button
                  type="button"
                  className={`quick-range-button ${activeQuickRangeMonths === 3 ? 'active' : ''}`}
                  onClick={() => handleQuickRangeSelect(3)}
                >
                  3 months
                </button>
                <button
                  type="button"
                  className={`quick-range-button ${activeQuickRangeMonths === 6 ? 'active' : ''}`}
                  onClick={() => handleQuickRangeSelect(6)}
                >
                  6 months
                </button>
              </div>

              <div className="time-period-selector" style={{ position: 'relative' }}>
<button 
  className="time-period-button"
  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
>
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>

  <span>{getDisplayText()}</span>

  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path 
      d="M3 4.5L6 7.5L9 4.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
</button>
                
                <DateRangePicker
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  onApply={handleDateRangeApply}
                  initialRange={dateRange}
                />
              </div>
              
              <div className="currency-selector" style={{ position: 'relative' }}>
                <button 
                  ref={currencyButtonRef}
                  className="action-button currency-button"
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                >
                  <span>{selectedCurrency.code} ({selectedCurrency.symbol})</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {isCurrencyDropdownOpen && createPortal(
                  <div 
                    ref={currencyDropdownRef}
                    className="currency-dropdown"
                    style={{
                      position: 'fixed',
                      top: `${dropdownPosition.top}px`,
                      right: `${dropdownPosition.right}px`,
                      zIndex: 99999,
                      maxHeight: '280px',
                      overflowY: 'scroll',
                      overflowX: 'hidden'
                    }}
                  >
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        className={`currency-option ${selectedCurrency.code === currency.code ? 'active' : ''}`}
                        onClick={() => handleCurrencySelect(currency.code)}
                      >
                        <span className="currency-symbol">{currency.symbol}</span>
                        <span className="currency-code">{currency.code}</span>
                        <span className="currency-name">{currency.name}</span>
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
              
              <button
                ref={exportButtonRef}
                className="action-button export-button"
                onClick={() => setExportOpen((prev) => !prev)}
                aria-expanded={exportOpen}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 11L8 2M8 11L5 8M8 11L11 8M2 14L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Export</span>
              </button>

              {exportOpen && createPortal(
                <div
                  ref={exportDropdownRef}
                  className="time-period-dropdown"
                  style={{
                    position: 'fixed',
                    top: `${exportDropdownPosition.top}px`,
                    right: `${exportDropdownPosition.right}px`,
                    zIndex: 2000,
                    minWidth: '220px',
                    padding: '8px 0',
                  }}
                >
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      handleExportCSV()
                      setExportOpen(false)
                    }}
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      handleExportPDF()
                      setExportOpen(false)
                    }}
                  >
                    Export PDF
                  </button>
                </div>,
                document.body
              )}
            </div>
          </div>
          
          <div className="dashboard-metrics">
            <DashboardMetrics periodTotals={dashboardSeries.periodTotals} />
          </div>

          <div className="charts-row">
            <div className="chart-left">
              <LineChart seriesOverride={lineSeriesOverride} />
            </div>
            <div className="chart-right">
              <OrdersComparisonBarChart periodRatio={dashboardSeries.ratios.revenueRatio} />
            </div>
          </div>
          
          <div className="analytics-map-row">
            <div className="analytics-left">
              <div className="analytics-card-wrapper">
                <DashboardMultilineChart
                  revenueRatio={dashboardSeries.ratios.revenueRatio}
                  ordersRatio={dashboardSeries.ratios.ordersRatio}
                />
              </div>
            </div>
            <div className="orders-middle">
              <div className="analytics-card-wrapper">
                <BarChart periodRatio={dashboardSeries.ratios.revenueRatio} />
              </div>
            </div>
            <div className="map-right">
              <div className="analytics-card-wrapper">
                <MapChart periodRatio={dashboardSeries.ratios.ordersRatio} />
              </div>
            </div>
          </div>

          <div className="dashboard-top-profit-section">
            <TopProfitTable periodRatio={dashboardSeries.ratios.profitRatio} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

