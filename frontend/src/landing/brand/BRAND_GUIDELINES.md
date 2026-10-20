# Businalyst Brand Guidelines (Landing Page)

Extracted from the live product (`index.css`, auth pages, Coming Soon page, sidebar, dashboard cards).
Code constants live in `brand.js`, `../tokens/tokens.css` and `../tokens/palette.js`.

## 1. Name and wordmark

| Context | Write it as |
|---|---|
| Sentences, titles, alt text, meta tags | **Businalyst** (capital B, one word) |
| Logo lockup next to the mark | **businalyst.** (all lowercase, trailing period) |
| Domain | www.businalyst.com |

Never write "BusinAlyst", "Business Analyst", "BA", or drop the period from the wordmark.

## 2. Logo assets (`frontend/public`)

| File | Use on |
|---|---|
| `/logo.png` | Light backgrounds |
| `/logo-dark.png` | Dark backgrounds (night band, dark theme) |
| `/favicon.png`, `/favicon-dark.png` | Browser tab icons (already wired in `index.html`) |

- Render the mark at 24–32px square with 6–8px corner radius.
- Do **not** use `/images/logo.png`; it is a ~6 MB source file.
- Do not recolor, stretch, add effects, or place the light logo on a dark background.

## 3. Product screenshots (`frontend/public/images`)

`dashboard-main.png`, `dashboard-revenue.png`, `dashboard-profit.png`, `dashboard-expenses.png`,
`dashboard-customers.png` (100–175 KB each, fine for use).
`phone-dashboard.png` / `phone-dashboard-dark.png` are 5–7 MB: lazy-load them and keep them out of the hero until they are compressed.

## 4. Color

The brand is **neutral ink + one blue accent**. Most of the surface is white and gray.
Blue is reserved for primary actions, links, focus rings and the main data series.

| Role | Light | Dark |
|---|---|---|
| Brand / primary CTA | `#2563eb` (hover `#1d4ed8`) | same |
| Ink (headings, ink buttons) | `#111827` | `#ededed` |
| Night band (dramatic dark sections) | `#000000`, raised `#0a0a0a` | same |
| Page background | `#ffffff` | `#000000` |
| Subtle background / surface | `#f9fafb` | `#0a0a0a`, raised `#171717` |
| Border | `#e5e7eb` | `rgba(255,255,255,0.1)` |
| Body text | `#4b5563` | `#a1a1a1` |
| Muted text | `#6b7280` / `#9ca3af` | `#8f8f8f` |

The landing page's dark theme is neutral true-black (Vercel-style, no navy tint). The app shell's dark theme in `src/index.css` still uses the navy values (`#0b1220` / `#111827`).
| Success / positive delta | `#059669` (on night: `#34d399`) | |
| Danger | `#dc2626` | |
| Warning / "estimated" | `#f59e0b`, ink `#b45309` on `#fef3c7` | |

Chart and data-viz series, in order: `#3b82f6` blue, `#8b5cf6` violet, `#14b8a6` teal,
`#f59e0b` amber, `#22c55e` green, `#f97316` orange, `#38bdf8` sky.

Rules:
- One accent per view. Don't introduce purple/teal gradients as brand colors; they are data colors only.
- Allowed glow: radial blue `rgba(37,99,235,0.12)` at large blur on the night band only.
- Text contrast must meet WCAG AA (4.5:1 body, 3:1 large text).

## 5. Typography

| Use | Font | Weight | Tracking |
|---|---|---|---|
| Display / H1–H2 | Plus Jakarta Sans | 700 | -0.02em to -0.03em |
| H3, UI labels, buttons | Inter | 600 | -0.01em |
| Body | Inter | 400 | -0.01em |
| Eyebrow / badge | Inter | 600, uppercase, 11px | +0.05em |

Both fonts are already loaded from Google Fonts in `frontend/index.html`. Don't add another font.
Headline sizes: hero `clamp(34px, 5.5vw, 56px)`, section title `clamp(30px, 4vw, 40px)`; line-height 1.15.

## 6. Shape, depth and motion

- Radius: inputs/buttons 10px, marketing cards 14px, pills 999px.
  **Product mockups use 0 radius**, because dashboard cards in the app are square.
- Shadows are soft, layered and low-opacity (see `--lp-shadow-*`). No hard drop shadows.
- Motion is quiet: fade + 8–24px rise, 150–600ms, `cubic-bezier(0.4,0,0.2,1)`.
  Gentle float loops (≤6px) are fine for product mockups. Always honor `prefers-reduced-motion`.

## 7. Voice and copy

Tone: clear, calm, founder-to-founder. Short sentences, concrete outcomes, no hype words
("revolutionary", "AI-powered magic", "10x").

Approved copy already used in the product:
- Headline: "Understand your business metrics in minutes, not hours"
- Tagline: "Smarter Analytics for Modern Businesses."
- Sub-tagline: "Understand revenue, expenses, customers and growth — all from one intelligent dashboard."
- Description: "We help founders and teams track key business metrics, spot trends, and make data-driven decisions without complex dashboards or manual reports."
- Feature names: Revenue Insights · Expense Tracking · Customer Intelligence · Profit Insights · Orders
- Waitlist success: "Thanks! We'll notify you soon."

Product facts you may claim: upload CSV / Excel (.csv, .xlsx, .xls); automatic KPIs (revenue, profit,
expenses, orders, customers); revenue, profit, expense and customer insight pages; dataset history.
Don't claim integrations, AI forecasting, team seats or pricing tiers unless the product owner confirms them.

## 8. Themes

Light is the default. Dark mode follows the same `businalyst_theme` setting as the app
(`light` / `dark` / `system`). The night band (`tone="night"`) is dark in both themes.
