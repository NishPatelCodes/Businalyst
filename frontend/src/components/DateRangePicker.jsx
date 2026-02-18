import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './DateRangePicker.css'

const PREDEFINED_RANGES = [
  { label: 'Custom', value: 'custom' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' },
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DateRangePicker = ({ isOpen, onClose, onApply, initialRange = null }) => {
  const [tempRange, setTempRange] = useState({ start: null, end: null })
  const [leftMonth, setLeftMonth] = useState(new Date())
  const [rightMonth, setRightMonth] = useState(() => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth
  })
  const [activePreset, setActivePreset] = useState('custom')
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Check if click is not on the button that opens this
        const button = event.target.closest('.time-period-button')
        if (!button) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])


  // Initialize tempRange when opening
  useEffect(() => {
    if (isOpen) {
      setIsVisible(false) // Hide initially
      // Small delay to ensure proper positioning before showing
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 10)
      
      if (initialRange && initialRange.start && initialRange.end) {
        setTempRange(initialRange)
        const startDate = new Date(initialRange.start)
        setLeftMonth(new Date(startDate))
        const nextMonth = new Date(startDate)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        setRightMonth(nextMonth)
      } else {
        // Reset to current month if no initial range
        const now = new Date()
        setLeftMonth(new Date(now))
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        setRightMonth(nextMonth)
        setTempRange({ start: null, end: null })
      }
      
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, initialRange])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isOtherMonth: true
      })
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        isOtherMonth: false
      })
    }
    // Next month days to fill the grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isOtherMonth: true
      })
    }
    return days
  }

  const isDateInRange = (date) => {
    if (!tempRange.start || !tempRange.end) return false
    const dateTime = date.getTime()
    const startTime = tempRange.start.getTime()
    const endTime = tempRange.end.getTime()
    return dateTime >= startTime && dateTime <= endTime
  }

  const isStartDate = (date) => {
    if (!tempRange.start) return false
    return date.getTime() === tempRange.start.getTime()
  }

  const isEndDate = (date) => {
    if (!tempRange.end) return false
    return date.getTime() === tempRange.end.getTime()
  }

  const handleDateClick = (date) => {
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)
    
    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      // Start new selection
      setTempRange({ start: normalizedDate, end: null })
    } else {
      // Complete the range
      const normalizedStart = new Date(tempRange.start)
      normalizedStart.setHours(0, 0, 0, 0)
      
      if (normalizedDate.getTime() < normalizedStart.getTime()) {
        setTempRange({ start: normalizedDate, end: normalizedStart })
      } else {
        setTempRange({ start: normalizedStart, end: normalizedDate })
      }
    }
    setActivePreset('custom')
  }

  const handlePresetClick = (preset) => {
    setActivePreset(preset.value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let start, end

    switch (preset.value) {
      case 'today':
        start = new Date(today)
        end = new Date(today)
        break
      case 'yesterday':
        start = new Date(today)
        start.setDate(start.getDate() - 1)
        end = new Date(start)
        break
      case 'thisWeek':
        start = new Date(today)
        start.setDate(today.getDate() - today.getDay())
        end = new Date(today)
        end.setDate(start.getDate() + 6)
        break
      case 'lastWeek':
        start = new Date(today)
        start.setDate(today.getDate() - today.getDay() - 7)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        break
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1)
        end = new Date(today.getFullYear(), 11, 31)
        break
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1)
        end = new Date(today.getFullYear() - 1, 11, 31)
        break
      case 'custom':
      default:
        return
    }

    setTempRange({ start, end })
    if (start) {
      const startDate = new Date(start)
      setLeftMonth(new Date(startDate))
      const nextMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1)
      setRightMonth(nextMonth)
    }
  }

  const handleApply = () => {
    if (tempRange.start && tempRange.end) {
      onApply(tempRange)
      onClose()
    }
  }

  const handleCancel = () => {
    // Reset to initial range
    if (initialRange && initialRange.start && initialRange.end) {
      setTempRange(initialRange)
    } else {
      setTempRange({ start: null, end: null })
    }
    onClose()
  }

  const formatDateInput = (date) => {
    if (!date) return ''
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  const navigateMonth = (calendar, direction) => {
    if (calendar === 'left') {
      const newDate = new Date(leftMonth)
      newDate.setMonth(leftMonth.getMonth() + direction)
      setLeftMonth(newDate)
      // Keep right month one month ahead
      const newRightDate = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 1)
      setRightMonth(newRightDate)
    } else {
      const newDate = new Date(rightMonth)
      newDate.setMonth(rightMonth.getMonth() + direction)
      setRightMonth(newDate)
      // Keep left month one month behind
      const newLeftDate = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 1)
      setLeftMonth(newLeftDate)
    }
  }

  const renderCalendar = (monthDate, isLeft) => {
    const days = getDaysInMonth(monthDate)
    const monthName = MONTHS[monthDate.getMonth()]
    const year = monthDate.getFullYear()

    return (
      <div className="calendar-view">
        <div className="calendar-header">
          <button 
            className="calendar-nav-btn"
            onClick={() => navigateMonth(isLeft ? 'left' : 'right', -1)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="calendar-month-year">{monthName} {year}</div>
          <button 
            className="calendar-nav-btn"
            onClick={() => navigateMonth(isLeft ? 'left' : 'right', 1)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="calendar-days-header">
          {DAYS.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
        </div>
        <div className="calendar-days-grid">
          {days.map((dayObj, index) => {
            const date = dayObj.date
            const isInRange = isDateInRange(date)
            const isStart = isStartDate(date)
            const isEnd = isEndDate(date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const dateNormalized = new Date(date)
            dateNormalized.setHours(0, 0, 0, 0)
            const isToday = dateNormalized.getTime() === today.getTime()

            return (
              <button
                key={index}
                className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isInRange ? 'in-range' : ''} ${isStart ? 'start-date' : ''} ${isEnd ? 'end-date' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return createPortal(
    <>
      <div 
        className="date-range-picker-backdrop" 
        onClick={handleCancel}
        style={{ opacity: isVisible ? 1 : 0 }}
      ></div>
      <div 
        className="date-range-picker-dropdown" 
        ref={modalRef} 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden'
        }}
      >
        <div className="date-range-picker-header">
          <h2 className="date-range-picker-title">Select Dates</h2>
          <div className="date-range-inputs">
            <div className="date-input-field">
              <label>From</label>
              <input 
                type="text" 
                value={formatDateInput(tempRange.start)} 
                readOnly
                placeholder="MM/DD/YYYY"
              />
            </div>
            <div className="date-input-field">
              <label>To</label>
              <input 
                type="text" 
                value={formatDateInput(tempRange.end)} 
                readOnly
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
        </div>

        <div className="date-range-picker-content">
          <div className="preset-sidebar">
            {PREDEFINED_RANGES.map((preset) => (
              <button
                key={preset.value}
                className={`preset-item ${activePreset === preset.value ? 'active' : ''}`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="calendars-container">
            {renderCalendar(leftMonth, true)}
            {renderCalendar(rightMonth, false)}
          </div>
        </div>

        <div className="date-range-picker-footer">
          <button className="date-range-btn cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button 
            className="date-range-btn apply-btn" 
            onClick={handleApply}
            disabled={!tempRange.start || !tempRange.end}
          >
            Apply
          </button>
        </div>
    </div>
    </>,
    document.body
  )
}

export default DateRangePicker

