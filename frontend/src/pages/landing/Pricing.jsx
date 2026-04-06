import React from 'react'
import { Link } from 'react-router-dom'

const CheckIcon = ({ className = '' }) => (
  <svg className={`h-5 w-5 flex-shrink-0 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
)

const tiers = [
  {
    name: 'Starter',
    price: '$9',
    description: 'For individuals and small teams getting started.',
    features: [
      '1 user',
      'Up to 5,000 rows',
      'Core dashboards',
      'CSV upload',
      'Email support',
    ],
    cta: 'Get started',
    featured: false,
  },
  {
    name: 'Professional',
    price: '$29',
    description: 'For growing businesses that need more power.',
    features: [
      '5 users',
      'Up to 100,000 rows',
      'All dashboards + custom views',
      'API integrations',
      'Priority support',
      'Export reports',
    ],
    cta: 'Get started',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '$79',
    description: 'For organizations that need scale and control.',
    features: [
      'Unlimited users',
      'Unlimited rows',
      'Custom dashboards',
      'Dedicated account manager',
      'SSO & audit logs',
      'SLA guarantee',
    ],
    cta: 'Contact sales',
    featured: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
            Pricing
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            No hidden fees. No surprise charges. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl p-8 ${
                tier.featured
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600 shadow-xl shadow-blue-600/20'
                  : 'bg-white ring-1 ring-slate-200'
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                  Most popular
                </span>
              )}

              <h3
                className={`text-lg font-semibold ${
                  tier.featured ? 'text-white' : 'text-slate-900'
                }`}
              >
                {tier.name}
              </h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    tier.featured ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {tier.price}
                </span>
                <span
                  className={`text-sm ${
                    tier.featured ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  /month
                </span>
              </div>

              <p
                className={`mt-4 text-sm leading-relaxed ${
                  tier.featured ? 'text-blue-100' : 'text-slate-600'
                }`}
              >
                {tier.description}
              </p>

              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckIcon
                      className={
                        tier.featured ? 'text-blue-200' : 'text-blue-600'
                      }
                    />
                    <span
                      className={`text-sm ${
                        tier.featured ? 'text-blue-100' : 'text-slate-700'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`mt-8 block w-full rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${
                  tier.featured
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
