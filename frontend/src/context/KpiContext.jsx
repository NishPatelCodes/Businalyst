import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEMO_KPI_DATA } from '../data/demoData'
import { useAuth } from './AuthContext'

export const KpiContext = createContext(null)
export const KpiDataContext = createContext(null)
export const CurrencyContext = createContext(null)
export const DatasetMetaContext = createContext(null)

const DATA_STORAGE_KEY = 'businalyst_kpi_data'
const CURRENCY_STORAGE_KEY = 'businalyst_currency_code'
const STORAGE_VERSION_KEY = 'businalyst_kpi_version'
const CURRENT_VERSION = 2
const DATA_SCOPE_BOOTSTRAP = 'bootstrap'
const DATA_SCOPE_FULL = 'full'
const FEATURE_BOOTSTRAP_PAYLOAD = (import.meta.env.VITE_FEATURE_BOOTSTRAP_PAYLOAD ?? 'true') !== 'false'

const CURRENCY_LOCALES = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  AUD: 'en-AU',
}

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
const isSupportedCurrency = (code) => CURRENCIES.some((c) => c.code === code)

export function KpiProvider({ children }) {
  const formatterCacheRef = useRef(new Map())
  const { isAuthenticated, authFetch, API_BASE, initializing } = useAuth()

  const [kpiData, setKpiDataState] = useState(() => {
    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
      const stored = localStorage.getItem(DATA_STORAGE_KEY)
      if (stored && Number(storedVersion) >= CURRENT_VERSION) {
        return JSON.parse(stored)
      }
      localStorage.removeItem(DATA_STORAGE_KEY)
      localStorage.removeItem(STORAGE_VERSION_KEY)
      return DEMO_KPI_DATA
    } catch {
      return DEMO_KPI_DATA
    }
  })

  const [isDemoData, setIsDemoData] = useState(() => {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    return !localStorage.getItem(DATA_STORAGE_KEY) || Number(storedVersion) < CURRENT_VERSION
  })

  const [datasetMeta, setDatasetMeta] = useState(null)
  const [datasetLoading, setDatasetLoading] = useState(false)

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (isSupportedCurrency(stored)) return stored
    try {
      const storedData = localStorage.getItem(DATA_STORAGE_KEY)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        if (isSupportedCurrency(parsed?.source_currency)) return parsed.source_currency
      }
    } catch {}
    return DEFAULT_CURRENCY.code
  })

  const sourceCurrencyCode = useMemo(() => {
    const code = kpiData?.source_currency
    return isSupportedCurrency(code) ? code : DEFAULT_CURRENCY.code
  }, [kpiData?.source_currency])

  const selectedCurrency = useMemo(() => {
    return CURRENCIES.find((c) => c.code === selectedCurrencyCode) || DEFAULT_CURRENCY
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

  const getCurrencyFormatter = useCallback((compact, options = {}) => {
    const locale = CURRENCY_LOCALES[selectedCurrency.code] || 'en-US'
    const key = JSON.stringify({
      locale,
      currency: selectedCurrency.code,
      compact,
      options,
    })
    if (formatterCacheRef.current.has(key)) {
      return formatterCacheRef.current.get(key)
    }
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: compact ? 1 : 0,
      ...(compact ? { notation: 'compact' } : {}),
      ...options,
    })
    formatterCacheRef.current.set(key, formatter)
    return formatter
  }, [selectedCurrency.code])

  const formatCurrency = useCallback((value, options = {}) => {
    const numeric = convertCurrencyValue(value)
    if (!Number.isFinite(numeric)) return '--'
    return getCurrencyFormatter(false, options).format(numeric)
  }, [convertCurrencyValue, getCurrencyFormatter])

  const formatCompactCurrency = useCallback((value, options = {}) => {
    const numeric = convertCurrencyValue(value)
    if (!Number.isFinite(numeric)) return '--'
    return getCurrencyFormatter(true, options).format(numeric)
  }, [convertCurrencyValue, getCurrencyFormatter])

  const setKpiData = useCallback((data) => {
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
        setSelectedCurrencyCode(sourceCurrency)
        localStorage.setItem(CURRENCY_STORAGE_KEY, sourceCurrency)

        if (data.dataset_id) {
          setDatasetMeta({
            id: data.dataset_id,
            name: data.dataset_name,
            uploaded_at: data.uploaded_at,
          })
        }
      } else {
        localStorage.removeItem(DATA_STORAGE_KEY)
        localStorage.removeItem(STORAGE_VERSION_KEY)
        setKpiDataState(DEMO_KPI_DATA)
        setIsDemoData(true)
        setDatasetMeta(null)
        setSelectedCurrencyCode(DEFAULT_CURRENCY.code)
        localStorage.removeItem(CURRENCY_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Error saving KPI data:', error)
    }
  }, [])

  useEffect(() => {
    if (initializing || !isAuthenticated) return

    const loadSavedDataset = async () => {
      setDatasetLoading(true)
      try {
        const initialScope = FEATURE_BOOTSTRAP_PAYLOAD ? DATA_SCOPE_BOOTSTRAP : DATA_SCOPE_FULL
        const res = await authFetch(`${API_BASE}/api/dataset/?scope=${initialScope}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.has_dataset) {
          setKpiData(data)
          // Load full payload in the background to hydrate deferred sections.
          if (FEATURE_BOOTSTRAP_PAYLOAD) {
            authFetch(`${API_BASE}/api/dataset/?scope=${DATA_SCOPE_FULL}`)
              .then((fullRes) => (fullRes.ok ? fullRes.json() : null))
              .then((fullData) => {
                if (fullData?.has_dataset) setKpiData(fullData)
              })
              .catch(() => {})
          }
        }
      } catch (err) {
        console.error('Failed to load saved dataset:', err)
      } finally {
        setDatasetLoading(false)
      }
    }

    loadSavedDataset()
  }, [isAuthenticated, initializing]) // eslint-disable-line react-hooks/exhaustive-deps

  const kpiDataValue = useMemo(() => ({
    kpiData,
    setKpiData,
    isDemoData,
  }), [kpiData, setKpiData, isDemoData])

  const currencyValue = useMemo(() => ({
    currencies: CURRENCIES,
    selectedCurrency,
    setSelectedCurrency,
    sourceCurrencyCode,
    convertCurrencyValue,
    formatCurrency,
    formatCompactCurrency,
  }), [
    selectedCurrency,
    setSelectedCurrency,
    sourceCurrencyCode,
    convertCurrencyValue,
    formatCurrency,
    formatCompactCurrency,
  ])

  const datasetMetaValue = useMemo(() => ({
    datasetMeta,
    datasetLoading,
  }), [datasetMeta, datasetLoading])

  const legacyValue = useMemo(() => ({
    ...kpiDataValue,
    ...currencyValue,
    ...datasetMetaValue,
  }), [kpiDataValue, currencyValue, datasetMetaValue])

  return (
    <KpiContext.Provider value={legacyValue}>
      <KpiDataContext.Provider value={kpiDataValue}>
        <CurrencyContext.Provider value={currencyValue}>
          <DatasetMetaContext.Provider value={datasetMetaValue}>
            {children}
          </DatasetMetaContext.Provider>
        </CurrencyContext.Provider>
      </KpiDataContext.Provider>
    </KpiContext.Provider>
  )
}
