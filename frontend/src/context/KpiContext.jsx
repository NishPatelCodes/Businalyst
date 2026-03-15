import React, { createContext, useCallback, useMemo, useState } from 'react'
import { DEMO_KPI_DATA } from '../data/demoData'

export const KpiContext = createContext(null)

const DATA_STORAGE_KEY = 'businalyst_kpi_data'
const CURRENCY_STORAGE_KEY = 'businalyst_currency_code'
const STORAGE_VERSION_KEY = 'businalyst_kpi_version'
const CURRENT_VERSION = 2

const CURRENCY_LOCALES = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  AUD: 'en-AU',
}

// Approximate FX rates relative to 1 unit in each currency -> USD.
const FX_TO_USD = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.28,
  INR: 0.012,
  JPY: 0.0067,
  CAD: 0.74,
  AUD: 0.66,
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
]

const DEFAULT_CURRENCY = CURRENCIES[0]
const isSupportedCurrency = (code) => CURRENCIES.some((currency) => currency.code === code)

export function KpiProvider({ children }) {
  const [kpiData, setKpiDataState] = useState(() => {
    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
      const stored = localStorage.getItem(DATA_STORAGE_KEY)
      if (stored && Number(storedVersion) >= CURRENT_VERSION) {
        return JSON.parse(stored)
      }
      // Stale or missing version — clear and use fresh demo data
      localStorage.removeItem(DATA_STORAGE_KEY)
      localStorage.removeItem(STORAGE_VERSION_KEY)
      return DEMO_KPI_DATA
    } catch (error) {
      console.error('Error loading KPI data from localStorage:', error)
      return DEMO_KPI_DATA
    }
  })

  const [isDemoData, setIsDemoData] = useState(() => {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    return !localStorage.getItem(DATA_STORAGE_KEY) || Number(storedVersion) < CURRENT_VERSION
  })
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (isSupportedCurrency(stored)) return stored

    try {
      const storedData = localStorage.getItem(DATA_STORAGE_KEY)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        if (isSupportedCurrency(parsed?.source_currency)) return parsed.source_currency
      }
    } catch (error) {
      console.error('Error reading stored source currency:', error)
    }

    return DEFAULT_CURRENCY.code
  })

  const sourceCurrencyCode = useMemo(() => {
    const code = kpiData?.source_currency
    return isSupportedCurrency(code) ? code : DEFAULT_CURRENCY.code
  }, [kpiData?.source_currency])

  const selectedCurrency = useMemo(() => {
    return CURRENCIES.find((currency) => currency.code === selectedCurrencyCode) || DEFAULT_CURRENCY
  }, [selectedCurrencyCode])

  const setSelectedCurrency = useCallback((currencyCode) => {
    if (!isSupportedCurrency(currencyCode)) return
    setSelectedCurrencyCode(currencyCode)
    localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode)
  }, [])

  const convertCurrencyValue = useCallback((value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return Number.NaN

    const sourceRate = FX_TO_USD[sourceCurrencyCode] || FX_TO_USD.USD
    const targetRate = FX_TO_USD[selectedCurrency.code] || FX_TO_USD.USD
    return numeric * (sourceRate / targetRate)
  }, [selectedCurrency.code, sourceCurrencyCode])

  const formatCurrency = useCallback((value, options = {}) => {
    const numeric = convertCurrencyValue(value)
    if (!Number.isFinite(numeric)) return '--'

    return new Intl.NumberFormat(CURRENCY_LOCALES[selectedCurrency.code] || 'en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options,
    }).format(numeric)
  }, [selectedCurrency.code, convertCurrencyValue])

  const formatCompactCurrency = useCallback((value, options = {}) => {
    const numeric = convertCurrencyValue(value)
    if (!Number.isFinite(numeric)) return '--'

    return new Intl.NumberFormat(CURRENCY_LOCALES[selectedCurrency.code] || 'en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      ...options,
    }).format(numeric)
  }, [selectedCurrency.code, convertCurrencyValue])

  const setKpiData = (data) => {
    try {
      if (data) {
        const sourceCurrency = isSupportedCurrency(data.source_currency)
          ? data.source_currency
          : DEFAULT_CURRENCY.code
        const normalizedData = { ...data, source_currency: sourceCurrency }

        setKpiDataState(normalizedData)
        setIsDemoData(false)
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(normalizedData))
        localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
        // For newly uploaded data, default UI currency to the dataset currency.
        setSelectedCurrencyCode(sourceCurrency)
        localStorage.setItem(CURRENCY_STORAGE_KEY, sourceCurrency)
      } else {
        localStorage.removeItem(DATA_STORAGE_KEY)
        localStorage.removeItem(STORAGE_VERSION_KEY)
        setKpiDataState(DEMO_KPI_DATA)
        setIsDemoData(true)
        setSelectedCurrencyCode(DEFAULT_CURRENCY.code)
        localStorage.removeItem(CURRENCY_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Error saving KPI data to localStorage:', error)
    }
  }

  return (
    <KpiContext.Provider
      value={{
        kpiData,
        setKpiData,
        isDemoData,
        currencies: CURRENCIES,
        selectedCurrency,
        setSelectedCurrency,
        sourceCurrencyCode,
        convertCurrencyValue,
        formatCurrency,
        formatCompactCurrency,
      }}
    >
      {children}
    </KpiContext.Provider>
  )
}
