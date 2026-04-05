import React from 'react'

const metrics = [
  { label: 'Users', value: '2,847', change: '↑ 12%' },
  { label: 'Conversion', value: '3.6%', change: '↑ 0.8%' },
  { label: 'Avg. Order', value: '$142', change: '↑ 5.3%' },
  { label: 'Retention', value: '94.2%', change: '↑ 2.1%' },
]

export default function HeroDashboard() {
  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 lg:p-10 shadow-2xl shadow-blue-950/[0.06]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </p>
          <p className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight font-display">
            $48.2K
          </p>
          <p className="mt-1 text-sm text-slate-500">Monthly recurring revenue</p>
        </div>

        <div className="hidden sm:flex items-center gap-1 rounded-full bg-slate-100/80 p-1">
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm">
            6M
          </span>
          <span className="rounded-full px-3 py-1.5 text-xs text-slate-400">1Y</span>
          <span className="rounded-full px-3 py-1.5 text-xs text-slate-400">All</span>
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        <svg
          className="w-full"
          style={{ height: 200 }}
          viewBox="0 0 500 160"
          fill="none"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

          <defs>
            <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          <path
            d="M0,135 C35,130 70,124 105,115 C140,106 175,96 210,86 C245,76 280,65 315,54 C350,43 385,34 420,26 C455,20 480,16 500,14 L500,160 L0,160Z"
            fill="url(#heroAreaGrad)"
          />
          <path
            d="M0,135 C35,130 70,124 105,115 C140,106 175,96 210,86 C245,76 280,65 315,54 C350,43 385,34 420,26 C455,20 480,16 500,14"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="flex justify-between mt-3 text-[11px] text-slate-300 select-none">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 border-t border-slate-100 pt-5">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">{m.label}</p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-900">{m.value}</span>
              <span className="text-xs font-medium text-emerald-600">{m.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
