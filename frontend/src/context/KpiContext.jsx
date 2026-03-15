import React, { createContext, useState } from 'react'
import { DEMO_KPI_DATA } from '../data/demoData'

export const KpiContext = createContext(null)

const STORAGE_KEY = 'businalyst_kpi_data'
const STORAGE_VERSION_KEY = 'businalyst_kpi_version'
const CURRENT_VERSION = 2

export function KpiProvider({ children }) {
  const [kpiData, setKpiDataState] = useState(() => {
    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && Number(storedVersion) >= CURRENT_VERSION) {
        return JSON.parse(stored)
      }
      // Stale or missing version — clear and use fresh demo data
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_VERSION_KEY)
      return DEMO_KPI_DATA
    } catch (error) {
      console.error('Error loading KPI data from localStorage:', error)
      return DEMO_KPI_DATA
    }
  })

  const [isDemoData, setIsDemoData] = useState(() => {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    return !localStorage.getItem(STORAGE_KEY) || Number(storedVersion) < CURRENT_VERSION
  })

  const setKpiData = (data) => {
    try {
      if (data) {
        setKpiDataState(data)
        setIsDemoData(false)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
      } else {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_VERSION_KEY)
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
