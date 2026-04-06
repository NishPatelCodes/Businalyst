import React from 'react'

const testimonials = [
  {
    quote:
      'Businalyst replaced three separate tools for us. The dashboard is clean, fast, and actually useful — our whole team relies on it now.',
    name: 'Sarah Kingsley',
    role: 'CEO, GrowthCo',
    initials: 'SK',
  },
  {
    quote:
      'I used to spend hours in Excel every week. Now I upload a file and have answers in seconds. It has completely changed how I work.',
    name: 'Michael Rodriguez',
    role: 'Finance Manager, Belltower Inc.',
    initials: 'MR',
  },
  {
    quote:
      "Finally, analytics that doesn't require a data science degree. My whole team uses it daily and we've never looked back.",
    name: 'Priya Patel',
    role: 'Founder, ShopLocal',
    initials: 'PP',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-blue-50/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
            Testimonials
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Loved by businesses everywhere
          </h2>
        </div>

        <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100"
            >
              <svg className="h-8 w-8 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.168 11 15c0 1.933-1.567 3.5-3.5 3.5-1.14 0-2.153-.545-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.168 21 15c0 1.933-1.567 3.5-3.5 3.5-1.14 0-2.153-.545-2.917-1.179z" />
              </svg>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {t.quote}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
