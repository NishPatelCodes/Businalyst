import React from 'react'
import ProductPlaceholder from './ProductPlaceholder'

const CheckIcon = () => (
  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
)

const sections = [
  {
    label: 'Revenue',
    title: 'Understand your revenue at a glance',
    description:
      'See where your money comes from. Identify top-performing products, peak seasons, and growth opportunities — all from a single view.',
    bullets: [
      'Track revenue by product, category, and channel',
      'Spot seasonal trends and patterns automatically',
      'Compare performance across custom time periods',
    ],
  },
  {
    label: 'Expenses',
    title: 'Track every expense automatically',
    description:
      'Spot hidden costs and optimize spending before small problems become big ones. Category breakdowns, vendor analysis, and anomaly detection — built in.',
    bullets: [
      'Categorize expenses automatically',
      'Identify cost outliers and anomalies',
      'Set budgets and track variance in real time',
    ],
  },
  {
    label: 'Customers',
    title: 'Know your customers deeply',
    description:
      'Understand buying patterns, segment behavior, and customer lifetime value. Build loyalty with data, not guesswork.',
    bullets: [
      'Segment customers by behavior and value',
      'Track retention and repeat purchase rates',
      'Identify your most profitable customer groups',
    ],
  },
  {
    label: 'Profitability',
    title: 'See your true profitability',
    description:
      'Revenue is vanity, profit is sanity. See margins by product, customer, and time period to understand the real health of your business.',
    bullets: [
      'Gross and net margin breakdowns',
      'Profit trends over time',
      'Identify which products actually make you money',
    ],
  },
]

export default function Showcase() {
  return (
    <section id="showcase" className="py-24 sm:py-32 bg-blue-50/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
            Product
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Four dashboards. One complete picture.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every angle of your business, visualized and explained.
          </p>
        </div>

        <div className="mt-20 space-y-24 lg:space-y-32">
          {sections.map((section, i) => (
            <div
              key={i}
              className={`flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16 ${
                i % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-600">
                  {section.label}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {section.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {section.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {section.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="text-sm text-slate-700">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <ProductPlaceholder />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
