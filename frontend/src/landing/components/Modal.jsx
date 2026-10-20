import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import useFocusTrap from '../hooks/useFocusTrap'
import './Modal.css'

// Rendered inside the nearest .lp-root so landing tokens and theme still apply.
const Modal = ({ open, onClose, title, returnFocusRef, children }) => {
  const panelRef = useRef(null)
  const reduceMotion = useReducedMotion()
  useFocusTrap(panelRef, open, onClose, returnFocusRef)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const host = typeof document !== 'undefined' ? document.querySelector('.lp-root') : null
  if (!host) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="lp-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <button type="button" className="lp-modal-backdrop" aria-label="Close dialog" tabIndex={-1} onClick={onClose} />
          <motion.div
            ref={panelRef}
            className="lp-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="lp-modal-header">
              <h2 className="lp-modal-title">{title}</h2>
              <button type="button" className="lp-modal-close" onClick={onClose} aria-label="Close dialog">
                <Icon name="close" size={18} />
              </button>
            </header>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    host,
  )
}

export default Modal
