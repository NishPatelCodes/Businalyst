import React from 'react'
import { Badge, Container, Icon, Reveal, Section, SectionHeader } from '../components'
import './Security.css'

// TODO(copy): example file names for the mockup.
const DATASETS = [
  { id: 'q3', name: 'sales_q3_2026.xlsx', meta: '1,284 rows · Today', active: true },
  { id: 'q2', name: 'sales_q2_2026.csv', meta: '1,102 rows · 3 months ago', active: false },
  { id: 'q1', name: 'store_export_q1.xls', meta: '968 rows · 6 months ago', active: false },
]

const ShieldVisual = () => (
  <div className="lp-shield" aria-hidden="true">
    <span className="lp-shield-halo" />
    <svg viewBox="0 0 200 230" className="lp-shield-svg">
      <path className="lp-shield-back" d="M100 8l82 30v62c0 56-35 98-82 120C53 198 18 156 18 100V38L100 8z" />
      <path className="lp-shield-face" d="M100 22l68 25v53c0 47-29 83-68 102-39-19-68-55-68-102V47l68-25z" />
      <rect className="lp-shield-lock" x="76" y="104" width="48" height="40" rx="8" />
      <path className="lp-shield-shackle" d="M86 104V92a14 14 0 0 1 28 0v12" />
      <circle className="lp-shield-keyhole" cx="100" cy="122" r="5" />
    </svg>
  </div>
)

const HistoryVisual = () => (
  <ul className="lp-history" aria-hidden="true">
    {DATASETS.map((set) => (
      <li key={set.id} className={`lp-history-card ${set.active ? 'is-active' : ''}`.trim()}>
        <span className="lp-history-icon"><Icon name="file" size={16} /></span>
        <span className="lp-history-text">
          <span className="lp-history-name">{set.name}</span>
          <span className="lp-history-meta">{set.meta}</span>
        </span>
        {set.active && <Badge tone="success">Active</Badge>}
      </li>
    ))}
  </ul>
)

const CELLS = [
  {
    id: 'private',
    title: 'Private to your account',
    description: 'Every dataset is tied to your login, and the pages that show your numbers open only after you sign in.',
    Visual: ShieldVisual,
  },
  {
    id: 'history',
    title: 'Dataset history',
    description: 'Each upload is saved to your account, so you can switch back to an earlier dataset at any time.',
    Visual: HistoryVisual,
  },
]

const Security = () => (
  <Section id="security" tone="subtle">
    <Container>
      <Reveal>
        <SectionHeader
          title="Your numbers, kept private"
          description="Sign-in protected insight pages and a private dataset history for every account."
        />
      </Reveal>
      <Reveal className="lp-secure" y={24}>
        {CELLS.map(({ id, title, description, Visual }) => (
          <article key={id} className="lp-secure-cell">
            <div className="lp-secure-visual"><Visual /></div>
            <h3 className="lp-secure-title">{title}</h3>
            <p className="lp-secure-description">{description}</p>
          </article>
        ))}
      </Reveal>
    </Container>
  </Section>
)

export default Security
