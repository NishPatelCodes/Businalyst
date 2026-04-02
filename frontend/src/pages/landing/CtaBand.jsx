import React from 'react'
import { Link } from 'react-router-dom'

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-blue-600 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start making better decisions today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
          Join hundreds of businesses already using Businalyst to understand
          their data and grow faster.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/signup"
            className="w-full sm:w-auto rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
          >
            Get started for free
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto rounded-full px-6 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/30 hover:ring-white/50 transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  )
}
