# Stack and Config Reference

Snapshot of the project configuration the landing page must integrate with.
**The originals are the source of truth.** This file is read-only context; never copy these configs into the landing folder as real config files.

## Architecture

```
Browser ──► Vercel (static SPA, frontend/dist) ──► React 18 + React Router 6
                                                    │
                                                    └─ fetch(VITE_API_URL) ──► Django 6 + DRF (backend/)
                                                                               ├─ SimpleJWT (Bearer)
                                                                               ├─ pandas analytics pipeline
                                                                               └─ SQLite (db.sqlite3)
```

## Frontend (`frontend/`)

| Concern | Value | Source |
|---|---|---|
| Language | JavaScript (ES modules), JSX. No TypeScript | `package.json` `"type": "module"` |
| Framework | React 18.2 | `package.json` |
| Bundler / dev server | Vite 5, port 3000 | `vite.config.js` |
| Routing | react-router-dom 6 (`BrowserRouter`, lazy routes) | `src/App.jsx` |
| Styling | Plain CSS files co-located with components + CSS variables from `src/index.css`. Tailwind v4 is installed via `@tailwindcss/vite` and imported in `index.css` | `vite.config.js`, `src/index.css` |
| Animation | framer-motion 12 | `package.json` |
| Charts | recharts 3, react-simple-maps 3 | `package.json` |
| State | React Context: `AuthProvider`, `KpiProvider` wrap the whole router | `src/App.jsx` |
| Fonts | Inter + Plus Jakarta Sans (Google Fonts link) | `index.html` |
| Lint / format / tests | None configured | — |
| Deploy | Vercel, SPA rewrite `/(.*) → /index.html`, `/assets/*` immutable cache | `vercel.json`, `frontend/vercel.json` |

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 3000, open: true },
})
```

### Global CSS facts that affect the landing page (`src/index.css`)

- `@import "tailwindcss"` loads Tailwind preflight globally. The reset lives in `@layer base`, so unlayered component CSS wins.
- `body` and `#root` have `background: var(--bg-secondary)` (`#f1f5f9`). `.lp-root` paints its own background.
- Global class names already taken: `.card`, `.dashboard-card`, `.dashboard-card-header`, `.dashboard-card-title`, `.estimated-badge`.
- Unscoped classes in lazily loaded page CSS that persist once loaded: `ComingSoon.css` (`.page-header`, `.main-content`, `.content-wrapper`, `.text-section`, `.description`, `.email-form`, `.avatar`, `.logo-icon`, `.spinner`…), `Login.css` (`.showcase-device`, `.showcase-screen`, `.sc-*`, `.auth-*`).
  → This is why every landing class is prefixed `lp-`.
- Dark theme for the app is `html[data-theme="dark"]`, set by `pages/Settings.jsx` using localStorage key `businalyst_theme`.

### Code style observed in `src/`

- 2-space indent, single quotes, **no semicolons**, trailing commas in multiline literals.
- `import React from 'react'` at the top of component files.
- Components are `const Name = (props) => (...)` + `export default Name`; one component per file, PascalCase filename, sibling `Name.css` imported directly.
- Feature folders expose an `index.js` barrel.

### Environment variables

| Name | Used by | Default |
|---|---|---|
| `VITE_API_URL` | `AuthContext.jsx`, `ComingSoon.jsx`, `landing/lib/api.js` | `http://localhost:8000` |

## Backend (`backend/`)

| Concern | Value |
|---|---|
| Framework | Django (6.x per settings header; requirements pin `>=4.2,<6.1`) + Django REST Framework |
| Auth | `djangorestframework-simplejwt`, `Authorization: Bearer <access>`; access 1h, refresh 7d, rotation on |
| CORS | `django-cors-headers`; allowed: `localhost`/`127.0.0.1` on 3000, 3001, 5173, 5174 (+ 127.0.0.1:8000) |
| Data | pandas + openpyxl; uploads `.csv`, `.xlsx`, `.xls` |
| DB | SQLite |
| Run | `python manage.py runserver` → `http://localhost:8000` |

### API surface

| Method | Path | Auth | Landing may call? |
|---|---|---|---|
| POST | `/api/waitlist/` body `{ email }` → `201 { message }` / `400 { error }` | Public | **Yes** (via `lib/api.js`) |
| POST | `/api/auth/register/`, `/api/auth/login/` | Public | No. Link to `/signup` and `/login` instead |
| POST | `/api/auth/refresh/` | Public | No |
| GET | `/api/auth/me/`, `/api/dataset/`, `/api/datasets/` … | JWT | No |

Any new public endpoint the landing page needs (e.g. contact form) must be added in
`backend/backend/api/`, registered in `backend/backend/urls.py` with `@permission_classes([AllowAny])`,
and return errors as `{ "error": "<message>" }` like `waitlist_views.py`.

## Frontend routes

| Path | Page | Access |
|---|---|---|
| `/` | `pages/LandingPage.jsx` (legacy — to be replaced by the new landing) | Public |
| `/coming-soon` | `pages/ComingSoon.jsx` | Public |
| `/login`, `/signup`, `/forgot-password` | Auth pages | Public |
| `/dashboard`, `/upload`, `/revenue-insights`, `/profit-insights`, `/expense-insights`, `/orders`, `/analytics/customers`, `/settings` | App | `ProtectedRoute` |

After login the app sends users to `/dashboard` if they have a dataset, otherwise `/upload`.

## Git workflow (`Instruction/GitWorkflow.md`)

- Feature branches only: `feature/landing-<component>` (e.g. `feature/landing-hero`). Never commit to `main` or `develop`.
- Commit format: `<Add|Fix|Refactor|Update>: <clear description>`.
- PRs target `develop`; delete the branch after merge.
