import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '../components'
import { PRODUCT_AREAS } from '../brand/brand'
import './ProductTour.css'

const TOUR = PRODUCT_AREAS.filter((area) => area.screenshot)

const ProductTour = () => {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const current = TOUR[index]
  const go = (step) => setIndex((i) => (i + step + TOUR.length) % TOUR.length)

  return (
    <div className="lp-tour">
      <div className="lp-tour-tabs" role="tablist" aria-label="Product areas">
        {TOUR.map((area, i) => (
          <button
            key={area.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`lp-tour-tab ${i === index ? 'is-active' : ''}`.trim()}
            onClick={() => setIndex(i)}
          >
            {area.label}
          </button>
        ))}
      </div>

      <div className="lp-tour-stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={current.id}
            src={current.screenshot}
            alt={`${current.label} page in Businalyst`}
            width="1640"
            height="920"
            className="lp-tour-shot"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
      </div>

      <div className="lp-tour-controls">
        <button type="button" className="lp-tour-arrow" onClick={() => go(-1)} aria-label="Previous screen">
          <Icon name="chevronLeft" size={18} />
        </button>
        <p className="lp-tour-count" aria-live="polite">
          {index + 1} / {TOUR.length} · {current.label}
        </p>
        <button type="button" className="lp-tour-arrow" onClick={() => go(1)} aria-label="Next screen">
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  )
}

export default ProductTour
