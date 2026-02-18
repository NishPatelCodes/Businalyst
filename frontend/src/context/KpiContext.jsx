import React, { createContext, useState, useEffect } from 'react'

export const KpiContext = createContext(null)

const STORAGE_KEY = 'businalyst_kpi_data'

export function KpiProvider({ children }) {
  // Load data from localStorage on mount
  const [kpiData, setKpiDataState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading KPI data from localStorage:', error)
    }
    return null
  })

  // Custom setKpiData that also saves to localStorage
  const setKpiData = (data) => {
    setKpiDataState(data)
    try {
      if (data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Error saving KPI data to localStorage:', error)
    }
  }

  return (
    <KpiContext.Provider value={{ kpiData, setKpiData }}>
      {children}
    </KpiContext.Provider>
  )
}
