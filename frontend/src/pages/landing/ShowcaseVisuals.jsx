import React from 'react'

const UpArrow = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
  </svg>
)

/* ─── Revenue ─────────────────────────────────────────── */

export function RevenueVisual() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xl shadow-blue-950/[0.05]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Monthly Revenue</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight font-display">$48.2K</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            <UpArrow />
            +12.5%
          </span>
        </div>

        <svg className="mt-6 w-full h-28" viewBox="0 0 300 100" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="revAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <line x1="0" y1="33" x2="300" y2="33" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="66" x2="300" y2="66" stroke="#f1f5f9" strokeWidth="1" />
          <path d="M0,85 C50,78 100,60 150,48 C200,38 250,25 300,18 L300,100 L0,100Z" fill="url(#revAreaFill)" />
          <path d="M0,85 C50,78 100,60 150,48 C200,38 250,25 300,18" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          <circle cx="300" cy="18" r="3.5" fill="#3b82f6" />
        </svg>

        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-300 select-none">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-lg shadow-blue-950/[0.04]">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">MRR</p>
          <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">$38.1K</p>
          <p className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-emerald-600"><UpArrow /> 8.2%</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-lg shadow-blue-950/[0.04]">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">ARR</p>
          <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">$458K</p>
          <p className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-emerald-600"><UpArrow /> 15.3%</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Expenses ────────────────────────────────────────── */

const expenseCategories = [
  { name: 'Payroll', amount: '$12.1K', pct: 85 },
  { name: 'Operations', amount: '$8.2K', pct: 58 },
  { name: 'Marketing', amount: '$5.4K', pct: 38 },
  { name: 'Other', amount: '$2.8K', pct: 20 },
]

const barShades = ['bg-blue-600', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300']

export function ExpenseVisual() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xl shadow-blue-950/[0.05]">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Expense Breakdown</p>

        <div className="mt-5 space-y-4">
          {expenseCategories.map((cat, i) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">{cat.name}</span>
                <span className="text-slate-900 font-semibold tabular-nums">{cat.amount}</span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${barShades[i]}`} style={{ width: `${cat.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-lg shadow-blue-950/[0.04]">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Total</p>
          <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">$28.5K</p>
          <p className="mt-1 text-xs text-slate-400">This month</p>
        </div>
        <div className="rounded-2xl bg-blue-600 p-4 shadow-lg shadow-blue-600/20">
          <p className="text-[11px] text-blue-200 uppercase tracking-wider">Budget Used</p>
          <p className="mt-1 text-xl font-bold text-white tabular-nums">72%</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/20">
            <div className="h-1.5 rounded-full bg-white" style={{ width: '72%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Customers ───────────────────────────────────────── */

const customerMonths = [
  { label: 'Jan', h: 40 },
  { label: 'Feb', h: 55 },
  { label: 'Mar', h: 48 },
  { label: 'Apr', h: 68 },
  { label: 'May', h: 62 },
  { label: 'Jun', h: 85 },
]

export function CustomerVisual() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xl shadow-blue-950/[0.05]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Customers</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight font-display">2,847</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400">New this month</p>
            <p className="text-lg font-bold text-emerald-600">+186</p>
          </div>
        </div>

        <div className="mt-6 flex items-end gap-2 h-24">
          {customerMonths.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-md bg-blue-200 hover:bg-blue-300 transition-colors"
                style={{ height: `${m.h}%` }}
              />
              <span className="text-[10px] text-slate-400 select-none">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-lg shadow-blue-950/[0.04]">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Retention</p>
          <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">94.2%</p>
          <p className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-emerald-600"><UpArrow /> 2.1%</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-lg shadow-blue-950/[0.04]">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Avg. LTV</p>
          <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">$1,240</p>
          <p className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-emerald-600"><UpArrow /> 5.8%</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Profitability ───────────────────────────────────── */

const margins = [
  { label: 'Gross Margin', value: '68.7%', pct: 68.7 },
  { label: 'Operating', value: '52.4%', pct: 52.4 },
  { label: 'Net Margin', value: '34.2%', pct: 34.2 },
]

export function ProfitVisual() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xl shadow-blue-950/[0.05]">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Profit Margins</p>

        <div className="mt-5 space-y-5">
          {margins.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{m.label}</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">{m.value}</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <svg className="w-full h-12" viewBox="0 0 200 40" fill="none" preserveAspectRatio="none">
            <path d="M0,32 C25,30 50,28 75,24 C100,20 125,16 150,12 C175,8 195,6 200,5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <path d="M0,32 C25,30 50,28 75,24 C100,20 125,16 150,12 C175,8 195,6 200,5 L200,40 L0,40Z" fill="#3b82f6" fillOpacity="0.06" />
          </svg>
          <p className="text-[10px] text-slate-300 select-none text-center">Profit trend — 6 months</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-blue-600 p-4 shadow-lg shadow-blue-600/20">
          <p className="text-[11px] text-blue-200 uppercase tracking-wider">Net Profit</p>
          <p className="mt-1 text-xl font-bold text-white tabular-nums">$16.4K</p>
          <p className="mt-1 text-xs text-blue-100 font-medium">↑ 18.7% vs last Q</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-lg shadow-blue-950/[0.04]">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Revenue</p>
          <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">$48.2K</p>
          <p className="mt-1 text-xs text-slate-400">This month</p>
        </div>
      </div>
    </div>
  )
}
