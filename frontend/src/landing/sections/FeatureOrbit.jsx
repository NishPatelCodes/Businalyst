import React from 'react'
import { Icon } from '../components'
import { LOGO } from '../brand/brand'
import './FeatureOrbit.css'

const RINGS = [
  {
    id: 'inner',
    radius: 78,
    items: [
      { id: 'orders', icon: 'orders', angle: -150 },
      { id: 'customers', icon: 'customers', angle: -30 },
    ],
  },
  {
    id: 'middle',
    radius: 126,
    items: [
      { id: 'revenue', icon: 'revenue', angle: -120 },
      { id: 'profit', icon: 'profit', angle: -60 },
      { id: 'expenses', icon: 'expenses', angle: 60 },
    ],
  },
  {
    id: 'outer',
    radius: 176,
    items: [
      { id: 'csv', text: '.csv', angle: -165 },
      { id: 'xlsx', text: '.xlsx', angle: -90 },
      { id: 'xls', text: '.xls', angle: -18 },
    ],
  },
]

const FeatureOrbit = () => (
  <div className="lp-orbit" aria-hidden="true">
    <div className="lp-orbit-center">
      {RINGS.map((ring) => (
        <div
          key={ring.id}
          className={`lp-orbit-ring lp-orbit-ring--${ring.id}`}
          style={{ '--lp-orbit-r': `${ring.radius}px` }}
        >
          {ring.items.map((item) => (
            <span
              key={item.id}
              className="lp-orbit-slot"
              style={{ '--lp-orbit-angle': `${item.angle}deg` }}
            >
              <span className={`lp-orbit-chip ${item.text ? 'lp-orbit-chip--text' : ''}`.trim()}>
                {item.text || <Icon name={item.icon} size={18} />}
              </span>
            </span>
          ))}
        </div>
      ))}
      <span className="lp-orbit-hub">
        <img src={LOGO.light} alt="" width="28" height="28" className="lp-orbit-logo lp-orbit-logo--light" />
        <img src={LOGO.dark} alt="" width="28" height="28" className="lp-orbit-logo lp-orbit-logo--dark" />
      </span>
    </div>
  </div>
)

export default FeatureOrbit
