import React from 'react'
import { Container, Reveal, Section, SectionHeader } from '../components'
import './WallOfLove.css'

// TODO(copy): placeholder testimonials; replace every quote, name and company with real, approved ones.
const COLUMNS = [
  {
    id: 'a',
    items: [
      { id: 'a1', before: 'I upload our store export on Mondays and ', highlight: 'the weekly numbers are ready in minutes', after: '.', name: 'Daniel Okafor', role: 'Owner at Kettle & Crumb' },
      { id: 'a2', before: 'Seeing ', highlight: 'revenue and expenses side by side', after: ' finally made our margins make sense.', name: 'Mei Lin', role: 'Co-founder at Paper Fox' },
      { id: 'a3', before: 'No setup, no formulas. ', highlight: 'Just a clean dashboard from our spreadsheet', after: '.', name: 'Lucas Romero', role: 'Operations at Brightside Bikes' },
      { id: 'a4', before: 'The date filter is the feature I use most. ', highlight: 'Last month vs this month in one click', after: '.', name: 'Hannah Weiss', role: 'Founder at Wild Thyme' },
    ],
  },
  {
    id: 'b',
    items: [
      { id: 'b1', before: 'Customer Insights showed us ', highlight: 'who our repeat buyers actually are', after: '.', name: 'Omar Haddad', role: 'Owner at Cedar Supply' },
      { id: 'b2', before: 'We stopped building monthly reports by hand. ', highlight: 'Businalyst does the math', after: '.', name: 'Grace Bennett', role: 'Finance lead at Loop Studio' },
      { id: 'b3', before: 'Being able to ', highlight: 'switch back to last quarter’s dataset', after: ' is underrated.', name: 'Arjun Mehta', role: 'Founder at Spice Route' },
      { id: 'b4', before: 'Profit Insights helped us ', highlight: 'spot which months were quietly losing money', after: '.', name: 'Sofia Rossi', role: 'Owner at Nonna’s Pantry' },
    ],
  },
  {
    id: 'c',
    items: [
      { id: 'c1', before: 'Our Excel file goes in, ', highlight: 'clear KPIs come out', after: '. That is all I wanted.', name: 'Tom Fischer', role: 'Owner at Northside Coffee' },
      { id: 'c2', before: 'The revenue chart is ', highlight: 'the first thing I open every morning', after: '.', name: 'Aisha Bello', role: 'Founder at Kora Skincare' },
      { id: 'c3', before: 'Simple enough for the whole team. ', highlight: 'Nobody needs a data background', after: '.', name: 'Chris Morgan', role: 'GM at Harbor Outfitters' },
      { id: 'c4', before: 'We track orders, revenue and expenses ', highlight: 'without juggling five spreadsheets', after: '.', name: 'Yuki Tanaka', role: 'Co-founder at Mochi Lab' },
    ],
  },
]

const initials = (name) => name.split(' ').map((part) => part[0]).join('')

const LoveCard = ({ item, hidden = false }) => (
  <figure className="lp-love-card" aria-hidden={hidden || undefined}>
    <blockquote className="lp-love-quote">
      {item.before}<strong className="lp-love-highlight">{item.highlight}</strong>{item.after}
    </blockquote>
    <figcaption className="lp-love-author">
      <span className="lp-love-avatar" aria-hidden="true">{initials(item.name)}</span>
      <span>
        <span className="lp-love-name">{item.name}</span>
        <span className="lp-love-role">{item.role}</span>
      </span>
    </figcaption>
  </figure>
)

const WallOfLove = () => (
  <Section id="testimonials" tone="subtle">
    <Container>
      <Reveal>
        <SectionHeader
          title="Loved by small business teams"
          description="Founders and operators use Businalyst to read their numbers without the spreadsheet work."
        />
      </Reveal>
      <div className="lp-love">
        {COLUMNS.map((column) => (
          <div key={column.id} className={`lp-love-col lp-love-col--${column.id}`}>
            <div className="lp-love-track">
              {column.items.map((item) => <LoveCard key={item.id} item={item} />)}
              {column.items.map((item) => <LoveCard key={`${item.id}-dup`} item={item} hidden />)}
            </div>
          </div>
        ))}
      </div>
    </Container>
  </Section>
)

export default WallOfLove
