import React from 'react'
import { Link } from 'react-router-dom'
import HeroDashboard from './HeroDashboard'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-16 sm:pt-40 sm:pb-24 lg:px-8 lg:pt-44 lg:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900sm:text-5xl lg:text-7xl">
            Analytics{' '}
            <span className="relative text-blue-600">
              made simple
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 281 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M1 8.5C51 2.5 121 1.5 141 4C161 6.5 231 11.5 280 3.5"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            for growing businesses.
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-slate-500">
            Most analytics tools are complex and overwhelming. We give you
            clear, actionable insights from your data in minutes, not months.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Get 6 months free
            </Link>
            <a
              href="#features"
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300 transition-all"
            >
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
              Watch video
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <HeroDashboard />
        </div>
      </div>
    </section>
  )
}
