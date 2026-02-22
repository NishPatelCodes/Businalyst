import React, { createContext, useState } from 'react'
import { DEMO_KPI_DATA } from '../data/demoData'

export const KpiContext = createContext(null)

const STORAGE_KEY = 'businalyst_kpi_data'

export function KpiProvider({ children }) {
  // Load data from localStorage on mount; use demo data for first-time visitors
  const [kpiData, setKpiDataState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      return DEMO_KPI_DATA
    } catch (error) {
      console.error('Error loading KPI data from localStorage:', error)
      return DEMO_KPI_DATA
    }
  })

  const [isDemoData, setIsDemoData] = useState(() => !localStorage.getItem(STORAGE_KEY))

  const setKpiData = (data) => {
    try {
      if (data) {
        setKpiDataState(data)
        setIsDemoData(false)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } else {
        localStorage.removeItem(STORAGE_KEY)
        setKpiDataState(DEMO_KPI_DATA)
        setIsDemoData(true)
      }
    } catch (error) {
      console.error('Error saving KPI data to localStorage:', error)
    }
  }

  return (
    <KpiContext.Provider value={{ kpiData, setKpiData, isDemoData }}>
      {children}
    </KpiContext.Provider>
  )
}
