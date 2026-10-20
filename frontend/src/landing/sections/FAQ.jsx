import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Container, Icon, Reveal, Section, SectionHeader } from '../components'
import './FAQ.css'

const FAQS = [
  {
    id: 'what',
    question: 'What is Businalyst?',
    answer: 'Businalyst turns your sales and expense exports into a clear dashboard. Upload a file and you get your key business metrics, trends and insight pages without building reports by hand.',
  },
  {
    id: 'files',
    question: 'Which files can I upload?',
    answer: 'CSV files (.csv) and Excel workbooks (.xlsx and .xls). Most store, POS and accounting tools can export one of these formats.',
  },
  {
    id: 'metrics',
    question: 'Which metrics are calculated for me?',
    answer: 'Total Revenue, Net Profit, Expenses, Orders and Customers, plus dedicated Revenue, Profit, Expense and Customer insight pages built from the same data.',
  },
  {
    id: 'private',
    question: 'Who can see my data?',
    answer: 'Your datasets are tied to your account. The dashboard and insight pages are only available after you sign in.',
  },
  {
    id: 'history',
    question: 'Can I switch between datasets?',
    answer: 'Yes. Every upload is kept in your dataset history, and you can make an earlier dataset active again at any time.',
  },
  {
    id: 'setup',
    question: 'Do I need to set up dashboards myself?',
    answer: 'No. Businalyst reads your columns and builds the KPIs and charts automatically. You can then filter everything by date range.',
  },
]

const FAQ = () => {
  const [openId, setOpenId] = useState(FAQS[0].id)
  const reduceMotion = useReducedMotion()

  return (
    <Section id="faq" tone="subtle">
      <Container narrow>
        <Reveal>
          <SectionHeader
            title="Frequently Asked Questions"
            description="Answers to common questions about Businalyst. Have something else in mind? Create an account and take a look around."
          />
        </Reveal>
        <Reveal as="ul" className="lp-faq">
          {FAQS.map((item) => {
            const open = openId === item.id
            return (
              <li key={item.id} className={`lp-faq-item ${open ? 'is-open' : ''}`.trim()}>
                <h3 className="lp-faq-heading">
                  <button
                    type="button"
                    id={`lp-faq-q-${item.id}`}
                    className="lp-faq-trigger"
                    aria-expanded={open}
                    aria-controls={`lp-faq-a-${item.id}`}
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    {item.question}
                    <Icon name="chevronDown" size={18} className="lp-faq-chevron" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`lp-faq-a-${item.id}`}
                      role="region"
                      aria-labelledby={`lp-faq-q-${item.id}`}
                      className="lp-faq-panel"
                      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0 } }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <p className="lp-faq-answer">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </Reveal>
      </Container>
    </Section>
  )
}

export default FAQ
