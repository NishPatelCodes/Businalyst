import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Icon } from '../components'
import { DEMO } from './demoNumbers'
import './FeatureUpload.css'

// What a real import looks like: the file uploads, Businalyst matches the
// spreadsheet's columns to the fields it needs, then the KPIs appear. The KPI
// values are shared with the other landing mockups (demoNumbers.js).
const FILE = { name: 'store_orders_sep.csv', size: '2.4 MB', rows: DEMO.orders }

const COLUMNS = [
  { from: 'order_date', to: 'Date' },
  { from: 'order_total', to: 'Revenue' },
  { from: 'cost_of_goods', to: 'Expenses' },
  { from: 'customer_email', to: 'Customer' },
]

const KPIS = [
  { id: 'revenue', label: 'Total Revenue', value: DEMO.revenueLabel },
  { id: 'profit', label: 'Net Profit', value: DEMO.profitLabel },
  { id: 'orders', label: 'Orders', value: DEMO.orders.toLocaleString('en-US') },
]

// phase timings in ms
const UPLOAD_MS = 1600
const MAP_STEP_MS = 320
const DONE_MS = 3400

const FeatureUpload = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduceMotion = useReducedMotion()
  // 0..100 upload, then mapped column count, then done
  const [progress, setProgress] = useState(reduceMotion ? 100 : 0)
  const [mapped, setMapped] = useState(reduceMotion ? COLUMNS.length : 0)
  const done = mapped === COLUMNS.length

  useEffect(() => {
    if (reduceMotion || !inView) return undefined
    let timer
    if (progress < 100) {
      timer = setTimeout(() => setProgress((p) => Math.min(100, p + 4 + Math.round(Math.random() * 6))), UPLOAD_MS / 18)
    } else if (!done) {
      timer = setTimeout(() => setMapped((m) => m + 1), MAP_STEP_MS)
    } else {
      timer = setTimeout(() => { setProgress(0); setMapped(0) }, DONE_MS)
    }
    return () => clearTimeout(timer)
  }, [progress, mapped, done, inView, reduceMotion])

  const status = progress < 100 ? `Uploading ${progress}%` : done ? 'KPIs ready' : 'Matching columns…'

  return (
    <div ref={ref} className="lp-upload" aria-hidden="true">
      <div className="lp-upload-file">
        <span className="lp-upload-file-icon"><Icon name="file" size={16} /></span>
        <div className="lp-upload-file-body">
          <div className="lp-upload-file-row">
            <span className="lp-upload-file-name">{FILE.name}</span>
            <span className={`lp-upload-file-state ${done ? 'is-done' : ''}`.trim()}>
              {done && <Icon name="check" size={12} strokeWidth={2.5} />}
              {status}
            </span>
          </div>
          <span className="lp-upload-file-meta">
            {FILE.size} · {FILE.rows.toLocaleString('en-US')} rows
          </span>
          <span className="lp-upload-track">
            <span className="lp-upload-bar" style={{ transform: `scaleX(${progress / 100})` }} />
          </span>
        </div>
      </div>

      <div className="lp-upload-map">
        <p className="lp-upload-map-title">
          <span>Columns found</span>
          <span>Mapped to</span>
        </p>
        <ul className="lp-upload-map-list">
          {COLUMNS.map((col, i) => {
            const isMapped = i < mapped
            return (
              <li key={col.from} className={`lp-upload-map-row ${isMapped ? 'is-mapped' : ''}`.trim()}>
                <code className="lp-upload-col">{col.from}</code>
                <span className="lp-upload-arrow"><Icon name="arrowRight" size={12} /></span>
                <span className="lp-upload-field">
                  {isMapped ? (
                    <>
                      <span className="lp-upload-tick"><Icon name="check" size={10} strokeWidth={3} /></span>
                      {col.to}
                    </>
                  ) : (
                    <span className="lp-upload-pending" />
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="lp-upload-kpis">
        <AnimatePresence>
          {done && KPIS.map((kpi, i) => (
            <motion.div
              key={kpi.id}
              className="lp-upload-kpi"
              style={{ gridColumn: i + 1 }}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
            >
              <span className="lp-upload-kpi-label">{kpi.label}</span>
              <span className="lp-upload-kpi-value">{kpi.value}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {!done && KPIS.map((kpi, i) => (
          <div key={kpi.id} className="lp-upload-kpi lp-upload-kpi--ghost" style={{ gridColumn: i + 1 }}>
            <span className="lp-upload-kpi-label">{kpi.label}</span>
            <span className="lp-upload-skeleton" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeatureUpload
