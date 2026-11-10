import React from 'react'
import { Icon } from '../components'
import { DEMO } from './demoNumbers'
import './FeatureFanout.css'

// "Every metric, one place": one uploaded file feeds every insight page.
// A pulse runs from the file to each page in turn and the page lights up as
// it arrives. Figures come from demoNumbers.js so they match the other cards.
const k = (n) => `$${(n / 1000).toFixed(1)}K`

const PAGES = [
  { id: 'revenue', icon: 'revenue', name: 'Revenue Insights', value: k(DEMO.revenue), trend: [4, 6, 5, 8, 7, 10, 12], tone: 'up' },
  { id: 'profit', icon: 'profit', name: 'Profit Insights', value: k(DEMO.profit), trend: [5, 4, 6, 6, 8, 7, 9], tone: 'up' },
  { id: 'expenses', icon: 'expenses', name: 'Expense Tracking', value: k(DEMO.expenses), trend: [7, 8, 7, 9, 8, 8, 9], tone: 'cost' },
  { id: 'customers', icon: 'customers', name: 'Customer Intelligence', value: DEMO.customers.toLocaleString('en-US'), trend: [3, 4, 4, 6, 7, 7, 9], tone: 'up' },
  { id: 'orders', icon: 'orders', name: 'Orders', value: DEMO.orders.toLocaleString('en-US'), trend: [6, 5, 7, 8, 7, 9, 10], tone: 'up' },
]

// Connector geometry in a 100 x 200 box: from the file (left middle) to the
// middle of each page row on the right.
const ROW_Y = PAGES.map((_, i) => 20 + i * 40)
const curve = (y) => `M0,100 C55,100 45,${y} 100,${y}`

const spark = (vals) => {
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  return vals
    .map((v, i) => `${(i / (vals.length - 1)) * 40},${14 - ((v - min) / (max - min || 1)) * 12 - 1}`)
    .join(' ')
}

const FeatureFanout = () => (
  <div className="lp-fan" aria-hidden="true">
    <div className="lp-fan-source">
      <span className="lp-fan-file-icon"><Icon name="file" size={18} /></span>
      <span className="lp-fan-file-name">store_<wbr />orders_<wbr />sep.csv</span>
      <span className="lp-fan-file-meta">{DEMO.orders.toLocaleString('en-US')} rows</span>
    </div>

    <svg className="lp-fan-wires" viewBox="0 0 100 200" preserveAspectRatio="none">
      {ROW_Y.map((y) => (
        <path key={`base-${y}`} className="lp-fan-wire" d={curve(y)} />
      ))}
      {ROW_Y.map((y, i) => (
        <path
          key={`pulse-${y}`}
          className="lp-fan-pulse"
          d={curve(y)}
          pathLength="100"
          style={{ animationDelay: `${i * 0.55}s` }}
        />
      ))}
    </svg>

    <ul className="lp-fan-pages">
      {PAGES.map((page, i) => (
        <li
          key={page.id}
          className={`lp-fan-page lp-fan-page--${page.tone}`}
          style={{ animationDelay: `${i * 0.55 + 0.45}s` }}
        >
          <span className="lp-fan-page-icon"><Icon name={page.icon} size={14} /></span>
          <span className="lp-fan-page-name">{page.name}</span>
          <svg className="lp-fan-spark" viewBox="0 0 40 14">
            <polyline points={spark(page.trend)} />
          </svg>
          <span className="lp-fan-page-value">{page.value}</span>
        </li>
      ))}
    </ul>
  </div>
)

export default FeatureFanout
