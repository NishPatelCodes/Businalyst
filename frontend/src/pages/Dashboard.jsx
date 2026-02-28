import React, { useContext, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import DashboardMetrics from '../features/DashboardMetrics'
import LineChart from '../features/LineChart'
import OrdersComparisonBarChart from '../features/OrdersComparisonBarChart/OrdersComparisonBarChart'
import SegmentedBarChart from '../features/SegmentedBarChart'
import BarChart from '../features/BarChart'
import MapChart from '../features/MapChart'
import TopProfitTable from '../components/TopProfitTable'
import { KpiContext } from '../context/KpiContext'
import DateRangePicker from '../components/DateRangePicker'
import './Dashboard.css'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
]

const Dashboard = () => {
  const { kpiData, isDemoData } = useContext(KpiContext)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0])
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 1)
    return { start, end }
  })
  const currencyDropdownRef = useRef(null)
  const currencyButtonRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

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

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency)
    setIsCurrencyDropdownOpen(false)
  }

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
              <div className="time-period-selector" style={{ position: 'relative' }}>
                <button 
                  className="time-period-button"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="5" cy="9" r="0.5" fill="currentColor"/>
                    <circle cx="8" cy="9" r="0.5" fill="currentColor"/>
                    <circle cx="11" cy="9" r="0.5" fill="currentColor"/>
                  </svg>
                  <span>{getDisplayText()}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                    {CURRENCIES.map((currency) => (
                      <button
                        key={currency.code}
                        className={`currency-option ${selectedCurrency.code === currency.code ? 'active' : ''}`}
                        onClick={() => handleCurrencySelect(currency)}
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
              
              <button className="action-button primary export-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 11L8 2M8 11L5 8M8 11L11 8M2 14L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="dashboard-metrics">
            <DashboardMetrics />
          </div>

          <div className="charts-row">
            <div className="chart-left">
              <LineChart variant="totalSales" />
            </div>
            <div className="chart-right">
              <OrdersComparisonBarChart />
            </div>
          </div>
          
          <div className="analytics-map-row">
            <div className="analytics-left">
              <div className="analytics-card-wrapper">
                <SegmentedBarChart />
              </div>
            </div>
            <div className="orders-middle">
              <div className="analytics-card-wrapper">
                <BarChart />
              </div>
            </div>
            <div className="map-right">
              <div className="analytics-card-wrapper">
                <MapChart />
              </div>
            </div>
          </div>

          <div className="dashboard-top-profit-section">
            <TopProfitTable />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

