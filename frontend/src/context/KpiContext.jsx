import React, { createContext, useState } from 'react'

export const KpiContext = createContext(null)

export function KpiProvider({ children }) {
  const [kpiData, setKpiData] = useState(null)

  return (
    <KpiContext.Provider value={{ kpiData, setKpiData }}>
      {children}
    </KpiContext.Provider>
  )
}
