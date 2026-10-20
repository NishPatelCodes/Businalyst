import React from 'react'
import { Container, Reveal } from '../components'
import './Testimonial.css'

// TODO(copy): placeholder testimonial; replace with a real, approved customer quote.
const QUOTE = {
  text: 'Our Monday numbers used to take half a day in spreadsheets. Now we upload last week’s export and revenue, profit and expenses are just there.',
  name: 'Priya Shah',
  role: 'Founder, Northwind Goods',
  initials: 'PS',
}

const Testimonial = () => (
  <section className="lp-quote" aria-label="Customer testimonial">
    <Container>
      <Reveal as="figure" className="lp-quote-figure">
        <blockquote className="lp-quote-text">
          <p>{QUOTE.text}</p>
        </blockquote>
        <figcaption className="lp-quote-author">
          <span className="lp-quote-avatar" aria-hidden="true">{QUOTE.initials}</span>
          <span>
            <span className="lp-quote-name">{QUOTE.name}</span>
            <span className="lp-quote-role">{QUOTE.role}</span>
          </span>
        </figcaption>
      </Reveal>
    </Container>
  </section>
)

export default Testimonial
