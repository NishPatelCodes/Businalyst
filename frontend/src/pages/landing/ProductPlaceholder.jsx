import React from 'react'

export default function ProductPlaceholder({ className = '' }) {
  return (
    <div className={`rounded-2xl bg-white shadow-2xl shadow-slate-900/10 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <div className="flex gap-1.5">
          <span className="block w-3 h-3 rounded-full bg-slate-300/80" />
          <span className="block w-3 h-3 rounded-full bg-slate-300/80" />
          <span className="block w-3 h-3 rounded-full bg-slate-300/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="h-5 w-48 max-w-full rounded-full bg-slate-100" />
        </div>
        <div className="w-[52px]" />
      </div>
      <div className="flex items-center justify-center aspect-[16/10] bg-slate-50/80">
        <p className="text-sm text-slate-400 italic select-none">Replace with product screenshot</p>
      </div>
    </div>
  )
}
