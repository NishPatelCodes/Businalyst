import React from 'react'
import { Container, Icon, Reveal } from '../components'
import './MetricStrip.css'

const ITEMS = [
  { id: 'revenue', icon: 'revenue', label: 'Total Revenue', href: '#features' },
  { id: 'profit', icon: 'profit', label: 'Net Profit', href: '#features' },
  { id: 'expenses', icon: 'expenses', label: 'Expenses', href: '#features' },
  { id: 'orders', icon: 'orders', label: 'Orders', href: '#features' },
  { id: 'customers', icon: 'customers', label: 'Customers', href: '#features' },
  { id: 'csv', icon: 'file', label: 'CSV uploads', href: '#how-it-works' },
  { id: 'excel', icon: 'file', label: 'Excel (.xlsx, .xls)', href: '#how-it-works' },
  { id: 'history', icon: 'history', label: 'Dataset history', href: '#security' },
]

const MetricStrip = () => (
  <section className="lp-strip" aria-labelledby="lp-strip-title">
    <Container>
      <Reveal>
        <h2 id="lp-strip-title" className="lp-strip-caption">
          Every number your business runs on, in one dashboard
        </h2>
        <ul className="lp-strip-grid">
          {ITEMS.map((item) => (
            <li key={item.id} className="lp-strip-cell">
              <span className="lp-strip-item">
                <Icon name={item.icon} size={20} />
                {item.label}
              </span>
              <a href={item.href} className="lp-strip-more">
                Learn more <Icon name="arrowRight" size={14} />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </Container>
  </section>
)

export default MetricStrip
