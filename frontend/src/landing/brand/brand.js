// Single source for brand copy, assets and routes used by the landing page.

export const BRAND = {
  name: 'Businalyst',
  wordmark: 'businalyst.',
  domain: 'www.businalyst.com',
  tagline: 'Smarter Analytics for Modern Businesses.',
  headline: 'Understand your business metrics in minutes, not hours',
  description:
    'We help founders and teams track key business metrics, spot trends, and make data-driven decisions without complex dashboards or manual reports.',
  subTagline: 'Understand revenue, expenses, customers and growth — all from one intelligent dashboard.',
}

// "light" assets are for light backgrounds, "dark" assets for dark backgrounds.
export const LOGO = {
  light: '/logo.png',
  dark: '/logo-dark.png',
}

export const FAVICON = {
  light: '/favicon.png',
  dark: '/favicon-dark.png',
}

export const SCREENSHOTS = {
  main: '/images/dashboard-main.png',
  revenue: '/images/dashboard-revenue.png',
  profit: '/images/dashboard-profit.png',
  expenses: '/images/dashboard-expenses.png',
  customers: '/images/dashboard-customers.png',
}

// `label` is the marketing name; `appLabel` is the exact sidebar label inside the product.
export const PRODUCT_AREAS = [
  { id: 'dashboard', label: 'Dashboard', appLabel: 'Dashboard', route: '/dashboard', screenshot: SCREENSHOTS.main },
  { id: 'revenue', label: 'Revenue Insights', appLabel: 'Revenue', route: '/revenue-insights', screenshot: SCREENSHOTS.revenue },
  { id: 'profit', label: 'Profit Insights', appLabel: 'Profit', route: '/profit-insights', screenshot: SCREENSHOTS.profit },
  { id: 'expenses', label: 'Expense Tracking', appLabel: 'Expense', route: '/expense-insights', screenshot: SCREENSHOTS.expenses },
  { id: 'customers', label: 'Customer Intelligence', appLabel: 'Customer', route: '/analytics/customers', screenshot: SCREENSHOTS.customers },
  { id: 'orders', label: 'Orders', appLabel: 'Orders', route: '/orders', screenshot: null },
]

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  upload: '/upload',
  comingSoon: '/coming-soon',
}

export const SUPPORTED_UPLOADS = ['.csv', '.xlsx', '.xls']
