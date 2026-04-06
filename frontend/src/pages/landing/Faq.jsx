import React, { useState } from 'react'

const faqs = [
  {
    q: 'What kind of data can I upload?',
    a: 'Businalyst accepts standard CSV files with columns for common business metrics like revenue, expenses, dates, products, and customers. We automatically detect and organize your columns.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. All data is encrypted at rest and in transit using AES-256 encryption. We follow industry best practices and never share your data with third parties.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: "Yes. There are no long-term contracts or cancellation fees. You can cancel anytime from your account settings, and you'll retain access until the end of your billing period.",
  },
  {
    q: 'Do you offer a free trial?',
    a: 'Yes! Every plan comes with a 14-day free trial. No credit card required. Start exploring your data today.',
  },
  {
    q: 'What integrations do you support?',
    a: "Currently, Businalyst supports CSV file uploads. We're actively building integrations with popular tools like QuickBooks, Shopify, Stripe, and Google Sheets.",
  },
  {
    q: 'How is this different from Excel or Google Sheets?',
    a: 'Businalyst automatically generates interactive dashboards from your raw data. No formulas, no pivot tables, no manual chart building. Just upload and get insights instantly.',
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="py-24 sm:py-32 bg-blue-50/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
            FAQ
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mx-auto mt-16 max-w-3xl divide-y divide-slate-200">
          {faqs.map((faq, i) => (
            <div key={i} className="py-6">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="text-base font-semibold text-slate-900 pr-4">
                  {faq.q}
                </span>
                <svg
                  className={`ml-4 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === i ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm leading-relaxed text-slate-600">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
