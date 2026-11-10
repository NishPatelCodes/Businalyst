# Businalyst Frontend Design Specification

This is the design reference for the whole frontend: the authenticated app, the auth pages and the marketing landing page. Read it before generating or changing any frontend UI, and match it.

**Scope.** Sections 1–9 describe the app (dashboard, insight pages, orders, upload, settings, login/signup). The landing page in `src/landing/` uses the same colours, radii, elevation, motion and gradients, with the marketing-specific differences listed in section 11. The older `src/pages/landing/` and `src/pages/LandingPage.jsx` are unused legacy files; do not build on them.

**How to read it.** Sections 1–9 and 11 are the rules. Section 10 lists places where the existing code disagrees with itself; when you touch those, follow the rule here instead of the nearby legacy value.

---

## 1. Stack and conventions

| Area | Convention |
|---|---|
| Framework | React 18, Vite, React Router 6 |
| Styling | Plain CSS, one `.css` file next to each component or page (`Foo.jsx` + `Foo.css`) |
| Tokens | CSS custom properties in `src/index.css` (`:root`) |
| Tailwind | Installed (v4) but not used for styling. Do not use Tailwind utility classes |
| Charts | Recharts for new charts. A few older dashboard charts are hand-written SVG |
| Icons | Inline `<svg>` in JSX. No icon library is installed; do not add one |
| Animation | CSS transitions and keyframes. `framer-motion` is not used in app pages |
| Fonts | Inter (300–800) and Plus Jakarta Sans, loaded from Google Fonts in `index.html` |

**Class naming.** Each page or component owns a short prefix, and every class in its CSS file starts with it. Use `block-element` with `--modifier` for states.

| Prefix | Owner |
|---|---|
| `dashboard-`, `kpi-`, `chart-` | Dashboard |
| `pi-` (shell, top nav), `pil-` (content) | Profit Insights, also reused by Customers Insights |
| `ei-` | Expense Insights |
| `ri-` | Revenue Insights |
| `omi-` | Orders |
| `ost-` | Orders status table |
| `settings-`, `setting-` | Settings |
| `auth-` | Login, Signup, Forgot Password |
| `upload-`, `file-dropzone`, `dropzone-` | Upload |
| `sidebar-`, `nav-` | Sidebar and top navigation |

A new page gets its own new prefix. Do not reuse another page's classes except the shared shell components in section 4.

---

## 2. Design tokens

All tokens live in `src/index.css`. Use the variable, not the raw value, whenever a variable exists.

### 2.1 Colour

**Brand and semantic**

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#2563eb` | Primary buttons, links, active states, focus rings, main chart series |
| `--color-primary-hover` | `#1d4ed8` | Hover on primary |
| `--color-success` | `#16a34a` | Positive deltas in KPI cards, success text |
| `--color-danger` | `#dc2626` | Negative deltas, errors, destructive text |

Values used alongside the tokens (no variable yet; use these exact hexes):

| Role | Value |
|---|---|
| Primary tint (active background) | `#eff6ff` |
| Positive value in tables and charts | `#059669` |
| Negative chart series | `#ef4444` |
| Warning / amber | `#f59e0b` |
| Secondary chart accent | `#6366f1` |
| Danger tint background / border | `#fef2f2` / `#fecaca` |
| Danger button background / text | `#fee2e2` / `#991b1b` |
| Success tint background / border / text | `#dcfce7` / `#86efac` / `#166534` |
| Warning tint background / text | `#fef3c7` / `#b45309` |
| Info tint background / border / text | `#f0f9ff` / `#bae6fd` / `#0369a1` |

**Neutrals** (`--color-neutral-*`)

| Token | Value | Typical use |
|---|---|---|
| `50` | `#f9fafb` | Hover background, input background, flat page background |
| `100` | `#f3f4f6` | Active nav item, row dividers, hover on menus |
| `200` | `#e5e7eb` | Default border everywhere |
| `300` | `#d1d5db` | Hover border, input border in Settings |
| `400` | `#9ca3af` | Placeholder, muted text, axis ticks, eyebrow labels |
| `500` | `#6b7280` | Secondary text |
| `600` | `#4b5563` | Rare |
| `700` | `#374151` | Body text in nav, menus, ghost buttons |
| `800` | `#1f2937` | Top-nav heading |
| `900` | `#111827` | Headings, primary text, dark active tabs |

**Surfaces and text**

| Token | Light | Dark (`html[data-theme="dark"]`) |
|---|---|---|
| `--bg-primary` | `#ffffff` | `#111827` |
| `--bg-secondary` (page) | `#f1f5f9` | `#0b1220` |
| `--bg-tertiary` | `#e8edf3` | `#1f2937` |
| `--text-primary` | `#111827` | `#f9fafb` |
| `--text-secondary` | `#6b7280` | `#d1d5db` |
| `--text-tertiary`, `--text-muted` | `#9ca3af` | `#9ca3af` |
| `--card-bg` | `#f3f4f6` | `#111827` |
| `--card-border` | `1px solid rgba(0,0,0,0.05)` | `1px solid rgba(255,255,255,0.14)` |

### 2.2 Typography

**Family.** `var(--font-family)`: `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif`. Set it once on the page container and use `font-family: inherit` on buttons, inputs and selects. Plus Jakarta Sans (`--font-display`) is for the landing page only.

**Rendering.** Body sets `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`, default `letter-spacing: -0.01em`, `line-height: 1.4`.

**Scale tokens**

| Token | Size | Token | Size |
|---|---|---|---|
| `--font-size-xs` | 11px | `--font-size-xl` | 20px |
| `--font-size-sm` | 13px | `--font-size-2xl` | 22px |
| `--font-size-base` | 14px | `--font-size-3xl` | 26px |
| `--font-size-md` | 15px | `--font-size-4xl` | 31px |
| `--font-size-lg` | 18px | | |

The app is dense: most text is 11–14px. 12px is the most common size in the codebase and has no token; using `12px` directly is accepted.

**Roles**

| Role | Size | Weight | Colour | Other |
|---|---|---|---|---|
| Page title | 20–22px | 600–700 | `#111827` | `letter-spacing: -0.02em` |
| Page subtitle | 13px | 400 | `#6b7280` or `#9ca3af` | |
| Section eyebrow | 10–11px | 600 | `#9ca3af` | uppercase, `letter-spacing: 0.08em` |
| Section / card heading | 14–15px | 600 | `#111827` | `letter-spacing: -0.01em` |
| Body, table cell, menu item | 13px | 400–500 | `#111827` / `#374151` | |
| Control label (tabs, small buttons) | 12–13px | 500 | `#6b7280` → `#111827` | |
| Meta / caption | 11–12px | 400–500 | `#9ca3af` | |
| KPI value | 23px | 700 | `#000000` | `letter-spacing: -0.02em`, `line-height: 1` |
| KPI label | 11px | 500 | `--text-secondary` | |
| Hero number in a chart card | 30px | 700 | `#111827` | `letter-spacing: -0.03em` |
| Chart axis tick | 10–11px | 500 | `#9ca3af` | |

**Weights.** 400 body, 500 controls and labels, 600 headings and emphasis, 700 only for page titles and large numbers.

**Numbers.** Every numeric value (KPIs, table amounts, axis ticks, tooltips) uses `font-variant-numeric: tabular-nums`. Right-align numeric table columns. Format with the helpers in `src/utils/formatters.js` and `src/utils/axisFormatters.js`.

### 2.3 Spacing

Token scale (deliberately off the 4px grid; it is a 1.1× scaled compact scale):

| Token | Value | Token | Value |
|---|---|---|---|
| `--spacing-1` | 4px | `--spacing-5` | 22px |
| `--spacing-2` | 9px | `--spacing-6` | 26px |
| `--spacing-3` | 13px | `--spacing-8` | 35px |
| `--spacing-4` | 18px | `--spacing-12` | 53px |

Raw pixel values are also common and accepted. Stay within this set:

| Use | Values |
|---|---|
| Gap inside a control (icon + label) | 6px |
| Gap between controls | 8px, 10px, 12px |
| Gap between cards / sections | 14px (insight pages), 16px (dashboard), 18px (`--grid-gap`) |
| Small control padding | `6px 12px`, `5px 11px` |
| Menu item / input padding | `8px 12px`, `10px 12px`, `10px 14px` |
| Card padding | 18–20px (dashboard), `22px 24px` (insight sections) |
| Page content padding | `18px 22px` (dashboard), `20px 28px` or `22px 24px` (insight pages) |

### 2.4 Radius

| Element | Radius |
|---|---|
| Insight-page sections, their buttons, tabs, tooltips, menus | 4px |
| Table badges, small icon buttons, selects | 6px |
| Toolbar controls on the dashboard, nav items, sidebar search | 7–8px |
| Auth inputs and buttons, dropdown menus, segmented-tab track | 10px |
| Table container, profile dropdown | 12px |
| Dashboard cards, modal date picker, dropzone | 16px |
| Pills, progress bars | 999px |
| Avatars, status dots | 50% |

`--card-border-radius` is `0` globally and overridden to `16px` inside `.dashboard-content`. Dashboard components read the variable so they round automatically; do not hardcode the radius on a dashboard card.

### 2.5 Elevation

The look is border-first. Shadows are soft, layered and low-opacity; never use a single heavy shadow.

| Level | Use | Value |
|---|---|---|
| Flat | Insight-page sections | `border: 1px solid #e5e7eb`, no shadow |
| Card | Dashboard chart cards | `0 0 0 0.5px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.05)` with `border: 1px solid rgba(0,0,0,.06)` |
| Card hover | Same cards on hover | `0 0 0 0.5px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.06), 0 8px 20px rgba(0,0,0,.07)` |
| Control | Dashboard toolbar buttons | `0 1px 2px rgba(0,0,0,.04), 0 1px 0 rgba(255,255,255,.6) inset` |
| Menu | Small dropdown menus | `0 4px 12px rgba(0,0,0,.08)` |
| Popover | Larger dropdowns | `0 8px 24px rgba(0,0,0,.08–.12), 0 2px 6px rgba(0,0,0,.04)` |
| Modal | Date picker | `0 20px 60px rgba(0,0,0,.3), 0 0 0 1px rgba(0,0,0,.1)` |
| Primary button | Export, auth submit hover | `0 2px 6px rgba(37,99,235,.35)` / `0 4px 14px rgba(37,99,235,.3)` |
| Focus ring | Inputs | `0 0 0 3px rgba(37,99,235,.12)` plus `border-color: var(--color-primary)` |

### 2.6 Motion

| Token | Value | Use |
|---|---|---|
| `--transition-fast` | `0.15s ease` | Hover colour and background changes, menus |
| `--transition-base` | `0.2s ease` | Default for buttons, inputs, cards |
| `--transition-slow` | `0.3s ease` | Larger state changes |

- Emphasised easing: `cubic-bezier(0.4, 0, 0.2, 1)`.
- Menus and popovers enter with opacity 0→1 and `translateY(-4px)`→0 over 0.15–0.2s.
- Cards enter with opacity 0→1 and `translateY(8–10px)`→0 over 0.35–0.4s.
- Hover lift is at most `translateY(-1px)` (`-2px` on KPI cards). Pressed state is `scale(0.95–0.98)`.
- No bounces, no long or looping animations in the app. The looping glow and float on the auth brand panel are the only exception.

### 2.7 Layers

| Layer | z-index |
|---|---|
| In-card overlays | 1–10 |
| Click-away backdrop for a menu | 88 |
| Page-level menus | 89–92 |
| Top navigation | 90 |
| Sidebar | 100 |
| Top-nav dropdown | 200 |
| Toolbar dropdowns | 1000 |
| Modal backdrop / modal | 9999 / 10000 |

### 2.8 Breakpoints

Desktop-first, `max-width` queries only.

| Breakpoint | Change |
|---|---|
| 1280px | KPI grid 6 → 3 columns; three-column rows → two |
| 1024px | Sidebar slides off-canvas (`.sidebar.open` shows it); content margin-left → 0; multi-column rows stack |
| 768px | Padding shrinks to 9px; toolbars stack full-width; tables drop to 12px text |

### 2.9 Gradients

Four mesh gradients, built only from colours already in the palette. A rendered swatch page is at `frontend/design/gradient-palette.html` (open `/design/gradient-palette.html` on the dev server).

| Gradient | Character | Colours | Text on top |
|---|---|---|---|
| 1 · Daybreak | Light, airy | `#eff6ff`, `#93c5fd`, `#2563eb` on `#e8edf3` | `#111827` |
| 2 · Signal | Bright brand blue into indigo | `#93c5fd`, `#3b82f6`, `#6366f1`, `#1d4ed8` on `#2563eb` | White |
| 3 · Deep Blue | Saturated blue falling to near-black | `#3b82f6`, `#2563eb`, `#1e40af`, `#070b18` on `#1d4ed8` | White |
| 4 · Midnight | Dark navy with a soft blue highlight | `#93c5fd`, `#1d4ed8`, `#1e40af`, `#111827` on `#070b18` | White |

Each is a stack of radial gradients over a solid base colour:

```css
--gradient-1:
  radial-gradient(at 12% 18%, #eff6ff 0%, transparent 52%),
  radial-gradient(at 28% 88%, #93c5fd 0%, transparent 58%),
  radial-gradient(at 88% 62%, #2563eb 0%, transparent 62%),
  radial-gradient(at 78% 8%,  #93c5fd 0%, transparent 50%),
  #e8edf3;
--gradient-2:
  radial-gradient(at 14% 16%, #93c5fd 0%, transparent 55%),
  radial-gradient(at 86% 84%, #6366f1 0%, transparent 60%),
  radial-gradient(at 80% 12%, #3b82f6 0%, transparent 55%),
  radial-gradient(at 18% 92%, #1d4ed8 0%, transparent 55%),
  #2563eb;
--gradient-3:
  radial-gradient(at 20% 12%, #3b82f6 0%, transparent 55%),
  radial-gradient(at 70% 45%, #2563eb 0%, transparent 60%),
  radial-gradient(at 12% 96%, #070b18 0%, transparent 58%),
  radial-gradient(at 94% 94%, #1e40af 0%, transparent 55%),
  #1d4ed8;
--gradient-4:
  radial-gradient(at 62% 22%, #93c5fd 0%, transparent 46%),
  radial-gradient(at 34% 58%, #1d4ed8 0%, transparent 58%),
  radial-gradient(at 92% 78%, #1e40af 0%, transparent 50%),
  radial-gradient(at 4% 4%,   #111827 0%, transparent 55%),
  #070b18;
```

Two-stop linear versions (135°) for small elements where a mesh does not read:

```css
--gradient-1-linear: linear-gradient(135deg, #eff6ff 0%, #93c5fd 100%);
--gradient-2-linear: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
--gradient-3-linear: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
--gradient-4-linear: linear-gradient(135deg, #1d4ed8 0%, #070b18 100%);
```

All eight variables are defined on `:root` in `src/index.css`. Use them as `background: var(--gradient-2);`.

**Where gradients are allowed**
- Large brand surfaces: the auth brand panel, onboarding or upgrade screens, full-width hero bands, empty-state illustrations.
- Small accents, using the linear versions: avatar fallbacks, the AI-insight badge, a promo card image.
- Gradient 4 is the match for the existing auth brand panel (`#070b18`).

**Where they are not allowed**
- Card, section, table or page backgrounds in the app; these stay white or neutral.
- Buttons, inputs, tabs and other controls; these stay flat.
- Chart series fills, other than the single-colour area fade described in section 6.
- Text fills (`background-clip: text`).

**Rules**
- At most one mesh gradient per view.
- Do not alter the stops, add colours or build new gradients; choose one of the four.
- Keep body text off the light hotspot in gradients 2 and 4. Place text over the darker region or add a solid backing.
- Do not animate the gradient itself.

---

## 3. App shell

Every authenticated page uses the same three-part shell.

```
┌──────────┬──────────────────────────────────────────┐
│ Sidebar  │ Top navigation (fixed, 61px, glass)      │
│ fixed    ├──────────────────────────────────────────┤
│ full     │ Content (margin-top: 62px, scrolls)      │
│ height   │                                          │
└──────────┴──────────────────────────────────────────┘
```

| Token | Value |
|---|---|
| `--layout-sidebar-width` | 198px (content `margin-left`) |
| `--layout-topnav-height` | 61px |
| `--layout-topnav-offset-left` | 209px (top nav `left`) |
| `--layout-content-margin-top` | 62px |

Page skeleton (replace `xx` with the page prefix):

```jsx
<div className="xx-page">            {/* display:flex; min-height:100vh; page background */}
  <Sidebar />
  <div className="xx-shell">         {/* flex:1; min-width:0; margin-left: var(--layout-sidebar-width) */}
    <TopNavigation />                {/* or InsightsTopNav on insight pages */}
    <main className="xx-content">    {/* margin-top: var(--layout-content-margin-top); padding */}
      …
    </main>
  </div>
</div>
```

Always set `min-width: 0` on flex and grid children that contain charts, otherwise Recharts forces horizontal scroll.

**Page background.** `var(--bg-secondary)` (`#f1f5f9`) for the dashboard and card-based pages; `#f9fafb` for flat insight pages.

---

## 4. Shared components

Reuse these; do not rebuild them per page.

| Component | File | Use |
|---|---|---|
| `Sidebar` | `src/components/Sidebar.jsx` | Every authenticated page |
| `TopNavigation` | `src/components/TopNavigation.jsx` | Dashboard, Upload, Settings |
| `InsightsTopNav` | `src/components/InsightsTopNav.jsx` | Insight pages (breadcrumb variant) |
| `InsightsPageHeader` | `src/components/InsightsPageHeader.jsx` | Title, subtitle and actions on insight pages |
| `DateRangePicker` | `src/components/DateRangePicker.jsx` | Custom date ranges |
| `OrdersStatusTable` | `src/components/OrdersStatusTable.jsx` | Reference implementation for data tables |
| `FileDropzone` | `src/components/FileDropzone.jsx` | File upload |
| `ErrorBoundary`, `ProtectedRoute` | `src/components/` | Wrappers |

### Sidebar
- White, `border-right: 1px solid #e5e7eb`, fixed, full height.
- Brand row: 24px logo with 6px radius, name at 14px/600.
- Nav item: `padding: 7px 10px`, 7px radius, 13.5px/500, `#374151`, 18px icon with 1.6 stroke, 10px gap.
- Hover and active: background `#f3f4f6`, text `#111827`; active is also 600 weight. There is no coloured active indicator.
- Count badge: 11px/600, `#374151` on `#e5e7eb`, 10px radius.
- User row at the bottom: top border, 32px round avatar, name 13px/600, email 11px `#9ca3af`.

### Top navigation
- Fixed, 61px tall, `background: rgba(255,255,255,0.8–0.85)` with `backdrop-filter: blur(20px)`, bottom border `#e5e7eb`, horizontal padding 26px.
- Left: greeting (20px/600) or breadcrumbs (14px; links `#6b7280`, separator `#d1d5db`, current 600 `#111827`).
- Centre: search, max 480–500px, 38–40px tall, `#f9fafb` background, icon at left.
- Right: 38–40px ghost icon buttons (20px icons, `#6b7280`, hover `#f9fafb`), then avatar (35px round) with name and chevron.
- Profile dropdown: white, 12px radius, 6px padding, items 13px/500 with 8px radius; destructive item is `#dc2626` with `#fef2f2` hover.

---

## 5. Component patterns

### 5.1 Buttons

| Variant | Spec |
|---|---|
| **Primary** | Background `var(--color-primary)`, white text, weight 600, no visible border. Hover: `var(--color-primary-hover)`. One per view at most |
| **Secondary / ghost** | White background, `1px solid #e5e7eb`, text `#374151`, weight 500. Hover: background `#f9fafb`, border `#d1d5db`. Open state (`aria-expanded="true"`): border `#2563eb`, background `#eff6ff`, text `#2563eb` |
| **Danger** | Background `#fee2e2`, text `#991b1b`, border `#fecaca`. Hover: `#fecaca` |
| **Icon** | 32–40px square, transparent or white with a light border, icon `#6b7280` → `#111827` on hover |
| **Text link** | No background, 11–12px/500–600, opacity or colour change on hover |

Sizes:

| Size | Padding | Font | Where |
|---|---|---|---|
| Small | `5–7px 11–13px` (about 30px tall) | 12–13px | Page headers, toolbars, tables |
| Medium | `10px 14px` | 13px | Settings, forms |
| Large | `11px 18px`, full width | 14px/600 | Auth submit |

All buttons: `display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-family: inherit;` and a 0.15–0.2s transition. Disabled: `opacity: 0.4–0.65; cursor: not-allowed`, no hover effect. Icons inside buttons are 12–14px.

### 5.2 Segmented controls and tabs

| Pattern | Spec | Where |
|---|---|---|
| **Joined range group** | Buttons inside one bordered container (`1px solid #e5e7eb`, `overflow: hidden`), separated by 1px dividers. Item: `5px 10–11px`, 12px/500, `#6b7280` on white. Active: `#eff6ff` background, `#2563eb` text, 600 weight | Time ranges (7D / 30D / 90D), mode toggles |
| **Pill track** | Track `#f4f4f5`, 4px padding, 10px radius. Item 13px/500, 7px radius. Active: white with a hairline shadow | Table filter tabs |
| **Underline tabs** | Bottom border on the bar; item 13px/500 `--text-secondary`; active has `--text-primary` and a 2px `--color-primary` underline | Settings sections, chart metric switchers |

### 5.3 Inputs

- White or `#f9fafb` background, `1px solid #e5e7eb`, text 13–14px `#111827`, placeholder `#9ca3af`.
- Padding `10px 12–14px`; search fields are 38–40px tall with a left icon and `padding-left: 38–42px`.
- Hover: border `#d1d5db`. Focus: `outline: none`, border `var(--color-primary)`, ring `0 0 0 3px rgba(37,99,235,.12)`.
- Error: border `var(--color-danger)`, ring `0 0 0 3px rgba(220,38,38,.1)`.
- Label above the field: 13px/500 `--text-secondary`, 5px gap.
- Checkbox: 16px, 4px radius, `accent-color: #2563eb` for native ones.
- Select: custom chevron as a background SVG, `appearance: none`, 6px radius.

### 5.4 Cards and sections

Two containers exist. Pick by page type and do not mix them on one page.

**Dashboard card** (dashboard only)
- White, `border: 1px solid rgba(0,0,0,.06)`, `border-radius: var(--card-border-radius)`, padding 18–20px, the Card shadow from 2.5, hover shadow on hover.
- KPI card: padding 13px, 8px internal gap, deeper layered shadow, lifts 2px on hover. Layout top to bottom: icon (16px) + label, value, optional 4px progress bar (track `#e5e7eb`, fill `#000`), delta line, comparison caption.
- KPI grid: `repeat(6, 1fr)`, 10px gap. Chart rows: two equal columns, 16px gap, min-height 320px.

**Insight section** (Profit, Expense, Customers, Orders and any new analysis page)
- White, `border: 1px solid #e5e7eb`, `border-radius: 4px`, `padding: 22px 24px`, `margin-bottom: 14px`, no shadow, no hover effect.
- Header: optional uppercase eyebrow (10–11px/600 `#9ca3af`), heading (15px/600), optional meta line (12px `#9ca3af`); controls right-aligned on the same row; 18px below.
- Grids: `1fr 1fr` or `55fr 45fr`, 14px gap.

### 5.5 Tables

Follow `OrdersStatusTable`.

- Container: white, `1px solid rgba(0,0,0,.08)`, 12px radius, `overflow: hidden`; horizontal scroll wrapper inside.
- Header row: background `#f5f5f7`, sticky, cells `12px 16px`, 12px/500, muted text, no uppercase.
- Body cells: `12px 16px`, 13px, `white-space: nowrap`, divider `1px solid rgba(0,0,0,.04)`, none on the last row.
- Row hover `#fafafa`; selected `#f5f5f7`.
- First column is 500 weight. Numeric columns right-aligned with tabular numerals.
- Footer: 13px; row count on the left, page-size select and 32px icon-button pagination on the right.
- Empty state: centred, 16px/600 title with a 14px muted line, 24–48px padding.
- Simple key/value tables inside sections: no container, rows divided by `1px solid #f3f4f6`, label `#6b7280`, value 600 right-aligned.

### 5.6 Badges and pills

| Type | Spec |
|---|---|
| Status badge (table) | White, hairline border, 6px radius, `3px 10px`, 12px/500, with an 8px coloured dot |
| Tint badge | Tinted background + matching dark text from 2.1, `3px 9–10px`, 11px/600, 4px radius (999px for the "estimated" pill) |
| Count badge | 20px tall, 999px radius, 11px/600 |
| Delta | 11–12px/600, `--color-success` or `--color-danger`, with a small arrow icon; never colour alone |

Use the shared `.estimated-badge` class (in `index.css`) for any metric that is modelled rather than read from uploaded rows.

### 5.7 Menus, popovers, modals

- Menu: white, `1px solid #e5e7eb`, 4–6px radius on insight pages or 10–12px elsewhere, 4–6px padding, Menu shadow. Opens 4–8px below its trigger, right-aligned.
- Menu item: `8–10px 12px`, 13px/500 `#374151`, hover `#f3f4f6` or `#f9fafb`. Active item: `#eff6ff` background with `#1d4ed8` text.
- Close on outside click using a transparent fixed backdrop (`inset: 0`) one layer below the menu.
- Modal: centred, backdrop `rgba(0,0,0,.15–.45)`, enters with scale 0.95→1. Actions right-aligned, 10px gap, primary action last.

### 5.8 Feedback

- Inline error: `#fef2f2` background, `#fecaca` border, `var(--color-danger)` text, 10px radius, `10px 14px`, 13px.
- Inline success text: `var(--color-success)`, 13px.
- Info banner: tinted background with a matching 1px border, 13–14px, `10px 14px`.
- Loading and empty states must be designed for every data view; never leave a blank card.

### 5.9 Icons

- Inline SVG, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
- Stroke width **1.5** by default (1.6 in the sidebar, 2 for very small icons such as chevrons and checks).
- Sizes: 12–14px inside buttons, 16px in KPI headers, 18px in the sidebar, 20px in the top nav.
- Colour comes from the parent's `color`. Do not use emoji as icons.

---

## 6. Charts

Use Recharts inside a `ResponsiveContainer`. The style is quiet: thin lines, faint grid, no chart borders.

| Part | Spec |
|---|---|
| Grid | `<CartesianGrid stroke="#f0f0f0" vertical={false} />`, solid |
| Axes | `axisLine={false}`, `tickLine={false}`, tick `{ fontSize: 11, fill: '#9ca3af' }` (10 for dense charts) |
| Line | `type="monotone"`, `strokeWidth` 1.5–2, `dot={false}`, small active dot with a white stroke |
| Area | Same line plus a vertical gradient of the series colour from about 0.28 opacity to 0 |
| Bar | Thin bars: `barSize` 6 for dense series, 16 for few categories; rounded leading end only, `radius={[2,2,0,0]}` (vertical) or `[0,2,2,0]` (horizontal) |
| Reference / average line | `#9ca3af`, 1px, dashed (`3 3` or `4 3`), with a 10px muted label |
| Comparison / previous period | Same hue lighter, or `#9ca3af`, dashed |
| Tooltip | Custom component: white, `1px solid #e5e7eb`, 4px radius, `8–10px 12px`, 12px text, light shadow. Date line 11px/600; each row is a 7px colour dot, a muted label and a 600-weight value |
| Legend | Custom, below or beside the chart: 8px dot or 10px square swatch (2px radius), 12px `#374151` label. Do not use the default Recharts legend |

**Series colours**

| Meaning | Colour |
|---|---|
| Primary metric (revenue, profit, orders, customers) | `#2563eb` |
| Positive / completed | `#059669` |
| Negative / expense / cancelled | `#ef4444` (line or bar), `#dc2626` (text or status) |
| Warning / returned | `#f59e0b` |
| Secondary category | `#6366f1` |
| Neutral / other / previous | `#9ca3af`, `#d1d5db`, `#374151` |

Order for unrelated categories: `#2563eb`, `#059669`, `#6366f1`, `#f59e0b`, `#dc2626`, then neutrals. Keep a category's colour the same across every chart on a page. Fold anything beyond five or six categories into "Other" in a neutral grey.

Colour must not be the only signal: pair it with a label, legend entry, sign or arrow.

---

## 7. Page templates

| Page type | Background | Top nav | Container | Radius |
|---|---|---|---|---|
| Dashboard | `--bg-secondary` | `TopNavigation` | Dashboard cards with shadow | 16px |
| Insight / analysis page | `#f9fafb` or `--bg-secondary` | `InsightsTopNav` + `InsightsPageHeader` | Flat insight sections | 4px |
| Data table page (Orders) | `#f9fafb` | Breadcrumb top nav | Sections plus `OrdersStatusTable` | 4px sections, 12px table |
| Settings / forms | `--bg-secondary` | `TopNavigation` | One bordered white card with tab bar; rows are a `280px 1fr` grid (label and description left, control right) divided by 1px lines | 0 |
| Upload | `--bg-secondary` | `TopNavigation` | Centred column, max 1000px, 32px gaps, centred 32px/700 title | 16px dropzone |
| Auth | White | none | Split screen: dark brand panel left (`#070b18`, `flex: 1.15`), form right (max 400px, 24px gaps) | 10px |

**Page header (insight pages).** Title and subtitle on the left; on the right a row of small controls with a 14px gap, in this order: range selector, filters, export. 20–22px below the header.

**New analysis pages** should follow the insight template (flat 4px sections, `pil-` as the model). It is the newest and most consistent pattern in the codebase.

---

## 8. Dark mode

- Theme is set by `data-theme="dark"` on `<html>` (toggled in Settings).
- Only the surface, text and card tokens in 2.1 switch. Most existing component CSS hardcodes light hex values, so dark mode is currently partial.
- For new code: use `var(--bg-primary)`, `var(--bg-secondary)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--card-bg)`, `var(--card-border)` for surfaces and text so the component follows the theme. Where a hardcoded value is unavoidable, add an `html[data-theme="dark"] .your-class` override in the same file.

---

## 9. Rules for generated UI

**Do**
- Use tokens from `index.css` first, then the exact values in this document.
- Keep the UI dense and quiet: 13px body, 1px `#e5e7eb` borders, white surfaces, one blue accent.
- Put new styles in a co-located `.css` file with its own class prefix.
- Reuse `Sidebar`, the top nav components, `InsightsPageHeader`, `DateRangePicker` and the table pattern.
- Give every interactive element hover, focus, active and disabled states, and every data view loading and empty states.
- Use tabular numerals and the shared formatters for all numbers.
- Set `min-width: 0` on grid and flex children that hold charts.
- Check the result at 1280px, 1024px and 768px.

**Don't**
- Don't use Tailwind classes, inline style objects for static styling, or CSS-in-JS in app pages.
- Don't add an icon, component or chart library.
- Don't introduce new accent colours, coloured card backgrounds or heavy shadows.
- Don't use gradients other than the four in section 2.9, and only in the places that section allows.
- Don't use radii above 16px (pills excepted) or mix the 4px flat style with the 16px card style on one page.
- Don't use font weights above 700, sizes above 32px, or uppercase outside eyebrow labels.
- Don't use any variable that is not defined in `index.css` (see section 10).
- Don't copy landing-only values (section 11) into app pages.

---

## 10. Known inconsistencies in existing code

These exist today. Do not replicate them in new work; align to the rule when you edit the file.

| Area | What the code does | Rule to follow |
|---|---|---|
| Blues | `#007AFF` and `#0051D5` (Revenue Insights, top-nav search focus, dropzone), `#0071e3` (upload button) alongside `#2563eb` | `#2563eb` / `#1d4ed8` only |
| Greens | `#16a34a`, `#059669`, `#34c759`, `#30d158`, `#22c55e` | `--color-success` for UI text and deltas, `#059669` for chart series and table values |
| Date picker accent | Teal `#14b8a6` / `#ccfbf1` for the selected range | Primary blue with `#eff6ff` for the in-range tint |
| Active range tab | `#111827` fill with white text on Profit and Revenue Insights; `#eff6ff` with blue text on Orders and Dashboard | `#eff6ff` background with `#2563eb` text |
| Sidebar width | `Sidebar.css` sets 220px, `--layout-sidebar-width` is 198px, the dashboard hardcodes `margin-left: 215px` and top-nav `left: 230px` | Use the layout tokens; the mismatch itself needs a separate fix |
| Card radius | Global `--card-border-radius: 0`, so Revenue Insights and Settings render square while the dashboard is 16px and insight sections 4px | 16px on the dashboard, 4px on insight pages |
| Undefined variables | `--bg-glass-heavy`, `--color-neutral-150`, `--color-warning`, `--color-warning-subtle`, `--color-success-subtle`, `--color-primary-subtle`, `--accent-primary` are referenced but never defined (`InsightsStrip.css` is the main user) | Don't use them until they are added to `index.css` |
| Apple greys | `#1d1d1f`, `#86868b`, `#6b6b70`, `#f5f5f7` in the table, upload and some charts | Prefer `#111827`, `#6b7280`, `#9ca3af`, `#f9fafb`; keep the existing values when editing those specific files |
| Font stacks | Several files redeclare the Inter stack or lead with `-apple-system` | `var(--font-family)` on the container, `inherit` below it |
| Duplicated top nav | `pi-topnav`, `ei-topnav`, `ri-topnav` reimplement the same bar | Use `InsightsTopNav` |
| Duplicated page CSS | Customers Insights imports `ProfitInsights.css` and uses `pi-`/`pil-` classes | New pages get their own prefix and file |
| KPI accents | KPI cards use pure black (`#000`) values and progress fills, and a grey `#5a5a5a` details button | Keep on existing KPI cards; elsewhere use `#111827` and the standard button variants |
| Off-palette gradients | Sidebar avatar and promo image use yellow-to-pink (`#fde68a` → `#f9a8d4`); the insights badge uses `--color-primary` → `#7B9FFF`; the top-nav avatar uses `#1f2937` → `#374151` | Use the linear gradients in section 2.9 |

---

## 11. Landing page

The landing page (`src/landing/`) follows this document. Its tokens live in `src/landing/tokens/tokens.css` as `--lp-*` variables scoped to `.lp-root`, and must stay in step with `src/index.css`. Classes use the `lp-` prefix.

**Same as the app**

| Area | Rule |
|---|---|
| Colour | `#2563eb` primary, the neutral scale and the semantic colours from 2.1 |
| Radius | Buttons and inputs 10px, nav links and small controls 8px, cards 12px, large panels 16px. Nothing above 16px except badges and round icon buttons |
| Elevation and motion | Sections 2.5 and 2.6 |
| Charts in mockups | Series colours and order from section 6 (`src/landing/tokens/palette.js`). Mock data must look like real store data: a weekly rhythm, day-to-day noise and the odd spike or slow day, never a smooth wave or straight ramp. Show axes, a faint dashed previous-period line, a period total with its change, and a tooltip with date, value and change. Every number shown is computed from the drawn series |
| Section eyebrow | 11px/600, uppercase, `0.08em` tracking, as in 2.2, coloured `#2563eb` |
| Icons | Inline SVG, 1.5 stroke |

**Differences allowed on the landing page only**

| Area | Landing value | Why |
|---|---|---|
| Dark theme | Neutral charcoal: page `#0f0f10`, card `#18181b`, raised `#232326`, border `rgba(255,255,255,0.1)`, text `#f4f4f5` / `#d4d4d8` / `#a1a1aa` | The app's navy dark surfaces (2.1) read too blue across a full marketing page |
| Display font | Plus Jakarta Sans 700 for the hero, section titles and CTA | Marketing headlines need more character than Inter |
| Type scale | Body 16px, lead 18px, section title 30–40px, hero 34–56px, CTA 40–76px | Reading distance and hierarchy differ from a dense app |
| Body text colour | `#4b5563` in light theme | Long-form copy needs more contrast than `#6b7280` |
| Spacing | 4px-based scale (`--lp-space-*`). Section padding `clamp(44px, 5vw, 72px)` top and bottom (`--lp-section-y`), section header 40px above its content, testimonial quote `clamp(44px, 5vw, 64px)` | Enough air for marketing copy without long empty bands between sections |
| Page layout | Full-bleed sections on `#f9fafb`, separated by 1px horizontal dividers; content capped at 1200px | No app shell on the marketing page |
| Animation | `framer-motion` reveals and looping product mockups | Honour `prefers-reduced-motion` |

**Phones (≤768px)**

| Part | Rule |
|---|---|
| Metric strip | Compact two-column list: icon and label left-aligned, 15px labels, 16px cell padding, no "Learn more" links |
| Feature visuals | 220px tall |
| Testimonial wall | One column (middle column hidden), 440px tall |
| Hero buttons | Full width, stacked |

**Gradients on the landing page** (section 2.9)

| Place | Gradient |
|---|---|
| Hero, light theme | Gradient 1 · Daybreak |
| Hero, dark theme | Gradient 4 · Midnight |
| Hero showcase background panel, both themes | Gradient 3 · Deep Blue |
| Closing CTA band, both themes | Gradient 3 · Deep Blue |

No other section uses a gradient.

**Hero showcase** (`src/landing/sections/HeroShowcase.jsx`)

The hero's product visual is a coded mock, not a screenshot: a glass "app window" over Gradient 3 (Deep Blue), matching the closing CTA band.

| Part | Rule |
|---|---|
| Background photo | `src/landing/assets/hero-band.jpg` (from `source/ty5.png`, 1089×923: jet climbing through a blue sky above a colour arc). Drawn by `HeroBand` behind both the hero and the metric strip: full viewport width, from the top of the showcase to the divider under the metric strip (918px tall on desktop), no radius or border. Its top edge starts `clamp(90px, 10vw, 200px)` (`--lp-band-lead`) above the showcase and fades in over twice that on an eased mask, so it blends into the hero gradient with no visible line; inside the band the hero's bottom fade to the page colour is turned off. Cropped at `--lp-band-focus: 45%` so the colour arc glows behind the metric strip; the window covers most of the jet. The window starts 40px down (28px on phones); the hero copy sits 32px above the showcase. The photo eases from `scale(1.08)` to `1` while scrolling. The metric strip sits on it as one glass panel with a white caption |
| Window | `min(100% - 48px, 980px)` wide, starts part-way down the panel and overhangs its bottom edge. 16px radius, 1px border, large shadow, translucent fill (`rgba(255,255,255,0.78)` light, `rgba(24,24,27,0.78)` dark) with `backdrop-filter: blur(22px)` |
| Title bar | Three 10px gray dots, a centred pill-track tab group (5.2), the date range right-aligned in 12px muted text |
| Tabs | Profit, Expenses, Orders. They auto-advance every 6s while the showcase is on screen, and pause on hover or focus |
| Body | Left: three KPI tiles (label 12px, value 22px/700, optional delta or note). Right: one chart panel with eyebrow, 15px/600 title and a dot legend. Inner panels are solid, 12px radius, 1px border |
| Charts | Section 6 rules: faint horizontal grid, no axis lines, 11px ticks, 2px lines, area fade on the primary series, dashed average line with a 10px label, a marker and tooltip on the peak. Profit `#2563eb`; total expense `#ef4444` with fixed expense `#2563eb`; orders as `#2563eb` bars with 2px top radius |
| Data | Demo values generated from fixed seeds. Every KPI is computed from the series drawn, so the numbers always agree with the chart |
| Scroll animation | Linked to scroll position: the window moves from `translateY(32px)` to `translateY(-32px)` and the background panel eases from `scale(1.12)` to `1` as the showcase crosses the viewport. This is the one scroll-linked animation on the page |
| Entrance | Lines wipe in left to right (1.2s), bars grow from the baseline, the tooltip fades in last |
| Reduced motion | No scroll movement and no auto-advance |
| Phone | KPI tiles sit in a row above the chart, the date range and tooltip card are hidden |

**Feature cards** (`src/landing/sections/FeatureBento.jsx`)

| Card | Visual |
|---|---|
| Upload CSV or Excel | `FeatureUpload`: a file uploading with a live percentage, then four spreadsheet columns matched one by one to Date, Revenue, Expenses and Customer, then three KPI tiles. Loops while on screen |
| Every metric, one place | `FeatureFanout`: one source file wired to five insight pages (Revenue, Profit, Expense, Customer, Orders), each with its figure and a mini trend; a blue pulse runs to each page in turn |
| See trends at a glance | `FeatureRevenueChart`: 30 days of revenue with axes, a dashed previous period, the period total and change, and a dated tooltip |
| Filter any date range | `FeatureRangeFilter` |

The mockups share one set of demo figures (`src/landing/sections/demoNumbers.js`: revenue $79,900, profit $18,420, expenses $61,480, 1,284 orders, 842 customers), so every card tells the same story. On phones the upload and fan-out cards grow to fit their content.

**Media placeholders.** Product screenshots and demo video are not final. Until they are, use `MediaPlaceholder` (`src/landing/components/MediaPlaceholder.jsx`), a blank block filled with `--lp-placeholder` (`#e5e7eb` light, `#232326` dark) at the final aspect ratio. It is currently used in the "How it works" steps and the product tour component (which is no longer opened from the hero).
