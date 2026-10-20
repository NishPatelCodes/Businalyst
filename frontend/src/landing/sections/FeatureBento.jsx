import React from 'react'
import { Container, Reveal, Section, SectionHeader } from '../components'
import FeatureUpload from './FeatureUpload'
import FeatureOrbit from './FeatureOrbit'
import FeatureRevenueChart from './FeatureRevenueChart'
import FeatureRangeFilter from './FeatureRangeFilter'
import './FeatureBento.css'

const CELLS = [
  {
    id: 'upload',
    title: 'Upload CSV or Excel',
    description: 'Drop in a .csv, .xlsx or .xls export. Businalyst reads it and calculates your KPIs automatically.',
    Visual: FeatureUpload,
  },
  {
    id: 'areas',
    title: 'Every metric, one place',
    description: 'Revenue, profit, expense and customer insight pages, all built from the same upload.',
    Visual: FeatureOrbit,
  },
  {
    id: 'trends',
    title: 'See trends at a glance',
    description: 'Revenue and profit over time, with the exact value for any day on hover.',
    Visual: FeatureRevenueChart,
  },
  {
    id: 'range',
    title: 'Filter any date range',
    description: 'Pick a timeframe and every chart and KPI updates to match the period you care about.',
    Visual: FeatureRangeFilter,
  },
]

const FeatureBento = () => (
  <Section id="features" tone="subtle">
    <Container>
      <Reveal>
        <SectionHeader
          title="Your business, explained in one dashboard"
          description="We help founders and teams track key business metrics and spot trends without complex dashboards or manual reports."
        />
      </Reveal>
      <Reveal className="lp-bento" y={24}>
        {CELLS.map(({ id, title, description, Visual }) => (
          <article key={id} className="lp-bento-cell">
            <div className="lp-bento-visual">
              <Visual />
            </div>
            <div className="lp-bento-copy">
              <h3 className="lp-bento-title">{title}</h3>
              <p className="lp-bento-description">{description}</p>
            </div>
          </article>
        ))}
      </Reveal>
    </Container>
  </Section>
)

export default FeatureBento
