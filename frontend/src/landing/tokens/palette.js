// JS mirror of the palette for places CSS variables can't reach
// (Recharts props, inline SVG gradients, framer-motion keyframes).
// Keep in sync with tokens.css.

export const brand = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primarySoft: '#eff6ff',
  ink: '#111827',
  night: '#070b18',
  nightRaised: '#0f1629',
}

export const gray = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
}

export const status = {
  success: '#059669',
  successBright: '#34d399',
  danger: '#dc2626',
  warning: '#f59e0b',
}

// Series colors, in the order set by Design.md section 6.
// Product mockups on the landing page must draw from this list so they
// look like real Businalyst screens.
export const chartSeries = [
  '#2563eb', // primary metric (revenue, profit, orders, customers)
  '#059669', // positive / completed
  '#6366f1', // secondary category
  '#f59e0b', // warning / returned
  '#dc2626', // negative / cancelled
  '#9ca3af', // neutral / other / previous
]

export const chartChrome = {
  light: { grid: '#f0f0f0', axis: '#9ca3af', tooltipBg: '#ffffff', tooltipBorder: '#e5e7eb' },
  dark: { grid: 'rgba(255,255,255,0.06)', axis: 'rgba(255,255,255,0.3)', tooltipBg: '#111827', tooltipBorder: 'rgba(255,255,255,0.1)' },
}
