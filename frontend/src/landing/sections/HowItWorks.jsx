import React, { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Container, Reveal, Section, SectionHeader } from '../components'
import { SCREENSHOTS } from '../brand/brand'
import './HowItWorks.css'

const STEPS = [
  {
    id: 'account',
    title: 'Create your free account',
    description: 'Sign up with your email and you are ready to bring in your first dataset.',
    image: SCREENSHOTS.main,
    alt: 'Businalyst dashboard overview',
  },
  {
    id: 'upload',
    title: 'Upload a CSV or Excel file',
    description: 'Export from your store, POS or spreadsheet and upload it as .csv, .xlsx or .xls.',
    image: SCREENSHOTS.revenue,
    alt: 'Revenue Insights page built from an uploaded file',
  },
  {
    id: 'kpis',
    title: 'Get your KPIs automatically',
    description: 'Total Revenue, Net Profit, Expenses, Orders and Customers are calculated for you.',
    image: SCREENSHOTS.profit,
    alt: 'Profit Insights page with automatic KPIs',
  },
  {
    id: 'explore',
    title: 'Explore your insight pages',
    description: 'Dig into revenue, profit, expense and customer trends for any date range you choose.',
    image: SCREENSHOTS.customers,
    alt: 'Customer Intelligence page',
  },
]

const HowItWorks = () => {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const listRef = useRef(null)
  const inView = useInView(listRef, { amount: 0.5 })
  const step = STEPS[active]
  const next = () => setActive((i) => (i + 1) % STEPS.length)

  return (
    <Section id="how-it-works" tone="subtle">
      <Container>
        <Reveal>
          <SectionHeader
            title="Simple. Seamless. Smart."
            description="From spreadsheet export to clear answers in four steps."
          />
        </Reveal>

        <Reveal
          className="lp-steps"
          y={24}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <ol ref={listRef} className="lp-steps-list">
            {STEPS.map((item, i) => {
              const isActive = i === active
              return (
                <li key={item.id} className={`lp-steps-item ${isActive ? 'is-active' : ''}`.trim()}>
                  <button
                    type="button"
                    className="lp-steps-trigger"
                    aria-expanded={isActive}
                    aria-controls={`lp-step-${item.id}`}
                    onClick={() => setActive(i)}
                  >
                    <span className="lp-steps-number">{String(i + 1).padStart(2, '0')}</span>
                    {item.title}
                  </button>
                  <div id={`lp-step-${item.id}`} className="lp-steps-body" hidden={!isActive}>
                    <p className="lp-steps-description">{item.description}</p>
                    <span className="lp-steps-progress" aria-hidden="true">
                      {!reduceMotion && (
                        <span
                          key={active}
                          className={`lp-steps-progress-bar ${paused || !inView ? 'is-paused' : ''}`.trim()}
                          onAnimationEnd={next}
                        />
                      )}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="lp-steps-media">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={step.id}
                src={step.image}
                alt={step.alt}
                width="1640"
                height="920"
                loading="lazy"
                decoding="async"
                className="lp-steps-image"
                initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              />
            </AnimatePresence>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

export default HowItWorks
