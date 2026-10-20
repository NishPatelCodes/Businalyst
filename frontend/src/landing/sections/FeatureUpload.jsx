import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Icon } from '../components'
import './FeatureUpload.css'

// TODO(copy): sample KPI values for the mockup; replace with real demo-dataset numbers.
const KPIS = [
  { id: 'revenue', label: 'Total Revenue', value: '$48,214' },
  { id: 'profit', label: 'Net Profit', value: '$12,906' },
  { id: 'orders', label: 'Orders', value: '1,284' },
]

const STEP_MS = { uploading: 1800, done: 3200 }

const FeatureUpload = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState('uploading')

  useEffect(() => {
    if (reduceMotion || !inView) return undefined
    const timer = setTimeout(
      () => setPhase((p) => (p === 'uploading' ? 'done' : 'uploading')),
      STEP_MS[phase],
    )
    return () => clearTimeout(timer)
  }, [phase, inView, reduceMotion])

  const done = reduceMotion || phase === 'done'

  return (
    <div ref={ref} className="lp-upload" aria-hidden="true">
      <div className="lp-upload-drop">
        <Icon name="upload" size={20} />
        <span>Drop your file here</span>
        <span className="lp-upload-formats">.csv · .xlsx · .xls</span>
      </div>

      <div className="lp-upload-file">
        <span className="lp-upload-file-icon"><Icon name="file" size={16} /></span>
        <div className="lp-upload-file-body">
          <div className="lp-upload-file-row">
            <span className="lp-upload-file-name">sales_2026.xlsx</span>
            <span className={`lp-upload-file-state ${done ? 'is-done' : ''}`.trim()}>
              {done ? 'KPIs ready' : 'Processing…'}
            </span>
          </div>
          <span className="lp-upload-track">
            <motion.span
              key={phase}
              className="lp-upload-bar"
              initial={{ scaleX: done ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: done ? 0 : STEP_MS.uploading / 1000, ease: 'easeInOut' }}
            />
          </span>
        </div>
      </div>

      <div className="lp-upload-kpis">
        <AnimatePresence>
          {done && KPIS.map((kpi, i) => (
            <motion.div
              key={kpi.id}
              className="lp-upload-kpi"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <span className="lp-upload-kpi-label">{kpi.label}</span>
              <span className="lp-upload-kpi-value">{kpi.value}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FeatureUpload
