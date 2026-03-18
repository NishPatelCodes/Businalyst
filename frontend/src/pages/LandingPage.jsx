import React, { useEffect, useRef, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import './LandingPage.css'

/* ---- scroll-reveal hook (IntersectionObserver) ---- */
const useScrollReveal = () => {
  const ref = useRef(null)

  const observe = useCallback((node) => {
    if (!node) return
    ref.current = node

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    // observe the container and all children with data-reveal
    observer.observe(node)
    node.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return observe
}

/* ---- inline SVG icons ---- */
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="M7 16l4-6 4 4 5-8" />
  </svg>
)

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="15" rx="2" /><path d="M16 12h2" /><path d="M2 10h20" />
  </svg>
)

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
)

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 015 5c0 .8-.2 1.5-.5 2.2A5 5 0 0119 14a5 5 0 01-3 4.6V22h-4v-3.4A5 5 0 019 14a5 5 0 012.5-4.8A5 5 0 0112 2z" />
  </svg>
)

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

/* ---- framer-motion hero variants ---- */
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
}

const heroItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
}

/* ===========================
   SECTION 1 — HERO (CINEMATIC)
   =========================== */
const Hero = () => {
  const { scrollY } = useScroll()
  const dashboardY = useTransform(scrollY, [0, 600], [0, 40])

  return (
  <section className="landing-hero">
    <div className="landing-hero-bg">
      <div className="landing-hero-glow landing-hero-glow--1" />
      <div className="landing-hero-glow landing-hero-glow--2" />
      <div className="landing-hero-glow landing-hero-glow--3" />
      <div className="landing-hero-grid-pattern" />
    </div>

    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-nav-brand">
          <div className="landing-logo-mark" />
          <span className="landing-logo-text">businalyst.</span>
        </Link>
        <div className="landing-nav-links">
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#product" className="landing-nav-link">Product</a>
          <a href="#why" className="landing-nav-link">Why Businalyst</a>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-nav-link">Sign In</Link>
          <Link to="/signup" className="landing-btn landing-btn--nav">Get Started</Link>
        </div>
      </div>
    </nav>

    <div className="landing-hero-content">
      <motion.div
        className="landing-hero-center"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={heroItem} className="landing-hero-badge">
          <span className="landing-hero-badge-dot" />
          Built for business owners, not data scientists
        </motion.div>
        <motion.h1 variants={heroItem} className="landing-hero-title">
          Your data. Your dashboard.<br />Instant clarity.
        </motion.h1>
        <motion.p variants={heroItem} className="landing-hero-subtitle">
          Upload a spreadsheet. Get a complete analytics dashboard — revenue trends, expense breakdowns, customer insights, and profit tracking — in under a minute.
        </motion.p>
        <motion.div variants={heroItem} className="landing-hero-ctas">
          <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--lg">
            Get Started Free
            <ArrowRightIcon />
          </Link>
          <Link to="/dashboard" className="landing-btn landing-btn--secondary landing-btn--lg">
            View Demo
          </Link>
        </motion.div>
      </motion.div>

      {/* cinematic product scene with parallax */}
      <motion.div className="landing-hero-scene" style={{ y: dashboardY }}>
        <div className="landing-hero-scene-glow" />
        <div className="landing-hero-dashboard-frame landing-fade-in-up-delayed">
          <div className="landing-hero-browser-bar">
            <span className="landing-hero-browser-dot" />
            <span className="landing-hero-browser-dot" />
            <span className="landing-hero-browser-dot" />
            <span className="landing-hero-browser-url">app.businalyst.com/dashboard</span>
          </div>
          <img
            src="/images/dashboard-main.png"
            alt="Businalyst Dashboard"
            className="landing-hero-screenshot"
          />
        </div>

        {/* floating KPI panels */}
        <div className="landing-float-panel landing-float-panel--revenue">
          <div className="landing-float-panel-icon landing-float-panel-icon--blue"><ChartIcon /></div>
          <div>
            <span className="landing-float-panel-label">Revenue</span>
            <span className="landing-float-panel-value">$940,817</span>
          </div>
          <span className="landing-float-panel-badge landing-float-panel-badge--green">+12.4%</span>
        </div>

        <div className="landing-float-panel landing-float-panel--profit">
          <div className="landing-float-panel-icon landing-float-panel-icon--green"><TrendUpIcon /></div>
          <div>
            <span className="landing-float-panel-label">Profit</span>
            <span className="landing-float-panel-value">$235,204</span>
          </div>
          <span className="landing-float-panel-badge landing-float-panel-badge--green">+8.2%</span>
        </div>

        <div className="landing-float-panel landing-float-panel--customers">
          <div className="landing-float-panel-icon landing-float-panel-icon--purple"><UsersIcon /></div>
          <div>
            <span className="landing-float-panel-label">Customers</span>
            <span className="landing-float-panel-value">3,471</span>
          </div>
          <span className="landing-float-panel-badge landing-float-panel-badge--green">+5.7%</span>
        </div>
      </motion.div>
    </div>
  </section>
  )
}

/* ===========================
   SECTION 2 — SOCIAL PROOF BAR (animated counters)
   =========================== */
const AnimatedStat = ({ target, label }) => {
  const [value, setValue] = useState(() => {
    const prefix = target.startsWith('$') ? '$' : ''
    const suffix = target.replace(/[0-9,$.]/g, '')
    return prefix + '0' + suffix
  })
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true
        const prefix = target.startsWith('$') ? '$' : ''
        const suffix = target.replace(/[0-9,$.]/g, '')
        const numericStr = target.replace(/[^0-9.]/g, '')
        const numericTarget = parseFloat(numericStr) || 0
        const isDecimal = numericStr.includes('.')
        const duration = 1200
        const start = Date.now()

        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = eased * numericTarget

          let display
          if (isDecimal) {
            display = current.toFixed(0)
          } else {
            display = Math.round(current).toLocaleString()
          }

          setValue(prefix + display + suffix)
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      }
    }, { threshold: 0.5 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <div className="landing-proof-stat" ref={ref}>
      <span className="landing-proof-stat-num">{value}</span>
      <span className="landing-proof-stat-label">{label}</span>
    </div>
  )
}

const SocialProof = () => (
  <section className="landing-social-proof">
    <div className="landing-social-proof-inner">
      <p className="landing-social-proof-text">Trusted by business owners to make better decisions</p>
      <div className="landing-social-proof-stats">
        <AnimatedStat target="2,500+" label="Data files analyzed" />
        <div className="landing-proof-divider" />
        <AnimatedStat target="$50M+" label="Revenue tracked" />
        <div className="landing-proof-divider" />
        <AnimatedStat target="150+" label="Businesses powered" />
      </div>
    </div>
  </section>
)

/* ===========================
   SECTION 3 — HOW IT WORKS (moved up)
   =========================== */
const steps = [
  { num: '01', icon: <UploadIcon />, title: 'Upload your data',                  desc: 'Import your CSV, spreadsheet, or business file. It takes seconds, not hours.' },
  { num: '02', icon: <BrainIcon />,  title: 'Businalyst analyzes automatically', desc: 'Our engine processes your data and generates clear visual analytics instantly.' },
  { num: '03', icon: <ChartIcon />,  title: 'Make smarter decisions',            desc: 'Explore interactive charts, KPIs, and actionable insights that drive growth.' },
]

const HowItWorks = () => {
  const revealRef = useScrollReveal()

  return (
  <section className="landing-section landing-how" id="how-it-works" ref={revealRef}>
    <div className="landing-section-header scroll-reveal" data-reveal>
      <span className="landing-section-label">How It Works</span>
      <h2 className="landing-section-title">How it works — three steps, under a minute</h2>
      <p className="landing-section-desc">
        No data science degree required. If you can upload a file, you can use Businalyst.
      </p>
    </div>

    <div className="landing-steps">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="landing-step scroll-reveal-card" data-reveal>
            <div className="landing-step-num">{s.num}</div>
            <div className="landing-step-icon">{s.icon}</div>
            <h3 className="landing-step-title">{s.title}</h3>
            <p className="landing-step-desc">{s.desc}</p>
          </div>
          {i < steps.length - 1 && (
            <div className="landing-step-connector scroll-reveal-card" data-reveal>
              <ArrowRightIcon />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </section>
  )
}

/* ===========================
   SECTION 4 — PRODUCT SHOWCASE (merged Deep Dives + Capabilities)
   =========================== */
const capabilities = [
  { icon: <BrainIcon />,    title: 'AI-Powered Insights',   desc: 'Get automated observations about your data without manual analysis.' },
  { icon: <UploadIcon />,   title: 'Easy Data Upload',      desc: 'Upload CSV or spreadsheet files — Businalyst handles the rest automatically.' },
  { icon: <ShieldIcon />,   title: 'Secure Data Handling',  desc: 'Your business data is encrypted and handled with enterprise-grade security.' },
  { icon: <ActivityIcon />, title: 'Real-Time KPIs',        desc: 'Track key performance indicators that update as soon as your data does.' },
]

const ProductShowcase = () => {
  const revealRef = useScrollReveal()
  const capsRef = useScrollReveal()

  return (
  <section className="landing-section landing-showcase" id="product" ref={revealRef}>
    <div className="landing-section-header scroll-reveal" data-reveal>
      <span className="landing-section-label">Product</span>
      <h2 className="landing-section-title">Four dashboards. One complete picture.</h2>
      <p className="landing-section-desc">
        Every angle of your business — revenue, costs, customers, and profit — visualized and ready to act on.
      </p>
    </div>

    {/* Deep dive 1 — Revenue */}
    <div className="landing-dive-row scroll-reveal" data-reveal>
      <div className="landing-dive-text scroll-reveal-text" data-reveal>
        <div className="landing-dive-icon-wrap"><ChartIcon /></div>
        <h3 className="landing-dive-title">Revenue Intelligence</h3>
        <p className="landing-dive-quote">Data reveals where money is being made — and where growth opportunities hide.</p>
        <p className="landing-dive-desc">
          Track every revenue stream with trend analysis, period comparisons, and sales breakdowns. Know exactly where your money comes from.
        </p>
        <ul className="landing-dive-list">
          <li><CheckIcon /> Revenue trend & growth tracking</li>
          <li><CheckIcon /> Sales comparison by period</li>
          <li><CheckIcon /> Product & category breakdown</li>
        </ul>
      </div>
      <div className="landing-dive-visual scroll-reveal-visual" data-reveal>
        <div className="landing-dive-frame">
          <img src="/images/dashboard-revenue.png" alt="Businalyst Revenue Dashboard" className="landing-dive-img" />
        </div>
      </div>
    </div>

    {/* Deep dive 2 — Expenses (reversed) */}
    <div className="landing-dive-row landing-dive-row--reverse scroll-reveal" data-reveal>
      <div className="landing-dive-text scroll-reveal-text" data-reveal>
        <div className="landing-dive-icon-wrap landing-dive-icon-wrap--red"><WalletIcon /></div>
        <h3 className="landing-dive-title">Expense Tracking</h3>
        <p className="landing-dive-quote">You can't cut costs you can't see. Analytics identifies problems before they compound.</p>
        <p className="landing-dive-desc">
          Break down costs by category, spot unusual spending patterns, and optimize your operating expenses before they eat into profits.
        </p>
        <ul className="landing-dive-list">
          <li><CheckIcon /> Expense trend analysis</li>
          <li><CheckIcon /> Category-level cost breakdown</li>
          <li><CheckIcon /> Cost efficiency metrics</li>
        </ul>
      </div>
      <div className="landing-dive-visual scroll-reveal-visual" data-reveal>
        <div className="landing-dive-frame">
          <img src="/images/dashboard-expenses.png" alt="Businalyst Expense Analytics" className="landing-dive-img" />
        </div>
      </div>
    </div>

    {/* Deep dive 3 — Customers */}
    <div className="landing-dive-row scroll-reveal" data-reveal>
      <div className="landing-dive-text scroll-reveal-text" data-reveal>
        <div className="landing-dive-icon-wrap landing-dive-icon-wrap--purple"><UsersIcon /></div>
        <h3 className="landing-dive-title">Customer Insights</h3>
        <p className="landing-dive-quote">Businesses cannot grow without understanding who their customers really are.</p>
        <p className="landing-dive-desc">
          Understand who your customers are, how they behave, and what drives them to stay or leave. Track segments, retention rates, and growth trends.
        </p>
        <ul className="landing-dive-list">
          <li><CheckIcon /> Customer growth tracking</li>
          <li><CheckIcon /> Segmentation analysis</li>
          <li><CheckIcon /> Retention & health metrics</li>
        </ul>
      </div>
      <div className="landing-dive-visual scroll-reveal-visual" data-reveal>
        <div className="landing-dive-frame">
          <img src="/images/dashboard-customers.png" alt="Businalyst Customer Intelligence" className="landing-dive-img" />
        </div>
      </div>
    </div>

    {/* Deep dive 4 — Profit (reversed) */}
    <div className="landing-dive-row landing-dive-row--reverse scroll-reveal" data-reveal>
      <div className="landing-dive-text scroll-reveal-text" data-reveal>
        <div className="landing-dive-icon-wrap landing-dive-icon-wrap--green"><TrendUpIcon /></div>
        <h3 className="landing-dive-title">Profit Intelligence</h3>
        <p className="landing-dive-quote">Revenue is vanity, profit is sanity. See the real health of your business.</p>
        <p className="landing-dive-desc">
          Track gross and net margins, compare profitability across products and periods, and identify what's actually driving your bottom line.
        </p>
        <ul className="landing-dive-list">
          <li><CheckIcon /> Margin trend analysis</li>
          <li><CheckIcon /> Product-level profitability</li>
          <li><CheckIcon /> Period-over-period comparison</li>
        </ul>
      </div>
      <div className="landing-dive-visual scroll-reveal-visual" data-reveal>
        <div className="landing-dive-frame">
          <img src="/images/dashboard-profit.png" alt="Businalyst Profit Intelligence" className="landing-dive-img" />
        </div>
      </div>
    </div>

    {/* Capabilities strip */}
    <div className="landing-capabilities" ref={capsRef}>
      <div className="landing-capabilities-grid">
        {capabilities.map((c, i) => (
          <div key={i} className="landing-capability-card scroll-reveal-card" data-reveal>
            <div className="landing-capability-icon">{c.icon}</div>
            <h3 className="landing-capability-title">{c.title}</h3>
            <p className="landing-capability-desc">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}

/* ===========================
   SECTION 5 — MID-PAGE CTA (demo link)
   =========================== */
const MidPageCTA = () => {
  const revealRef = useScrollReveal()

  return (
  <section className="landing-mid-cta" ref={revealRef}>
    <div className="landing-mid-cta-inner scroll-reveal-scale" data-reveal>
      <h2 className="landing-mid-cta-title">See it in action</h2>
      <p className="landing-mid-cta-desc">
        Explore a live dashboard with real sample data. No signup required.
      </p>
      <Link to="/dashboard" className="landing-btn landing-btn--primary landing-btn--lg">
        View Live Demo
        <ArrowRightIcon />
      </Link>
    </div>
  </section>
  )
}

/* ===========================
   SECTION 6 — PROBLEM → SOLUTION (objection handler)
   =========================== */
const ProblemSolution = () => {
  const revealRef = useScrollReveal()

  return (
  <section className="landing-section landing-problem" id="why" ref={revealRef}>
    <div className="landing-problem-grid">
      <div className="landing-problem-left scroll-reveal-text" data-reveal>
        <span className="landing-section-label landing-section-label--red">The Problem</span>
        <h2 className="landing-problem-title">
          Running a business shouldn't mean drowning in spreadsheets.
        </h2>
        <div className="landing-problem-points">
          <div className="landing-problem-point">
            <span className="landing-problem-x">&times;</span>
            <p>You have the data, but it sits in spreadsheets nobody reads</p>
          </div>
          <div className="landing-problem-point">
            <span className="landing-problem-x">&times;</span>
            <p>You make financial decisions based on gut feeling, not evidence</p>
          </div>
          <div className="landing-problem-point">
            <span className="landing-problem-x">&times;</span>
            <p>Every month you promise yourself you'll "look at the numbers" — but you never do</p>
          </div>
        </div>
      </div>
      <div className="landing-problem-right scroll-reveal-text" data-reveal style={{ transitionDelay: '0.2s' }}>
        <span className="landing-section-label landing-section-label--green">The Solution</span>
        <h2 className="landing-solution-title">
          Businalyst turns your raw data into clear, actionable insights.
        </h2>
        <div className="landing-solution-points">
          <div className="landing-solution-point">
            <span className="landing-solution-check"><CheckIcon /></span>
            <p>Upload your business data and get instant visual analytics</p>
          </div>
          <div className="landing-solution-point">
            <span className="landing-solution-check"><CheckIcon /></span>
            <p>See revenue, expenses, customers, and profit in one dashboard</p>
          </div>
          <div className="landing-solution-point">
            <span className="landing-solution-check"><CheckIcon /></span>
            <p>Make smarter financial decisions backed by real data</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}

/* ===========================
   SECTION 7 — FINAL CTA (signup push)
   =========================== */
const FinalCTA = () => {
  const revealRef = useScrollReveal()

  return (
  <section className="landing-section landing-cta" ref={revealRef}>
    <div className="landing-cta-inner scroll-reveal-scale" data-reveal>
      <div className="landing-cta-glow" />
      <span className="landing-cta-badge">Start for free</span>
      <h2 className="landing-cta-title">Your data is already waiting.<br />Let's put it to work.</h2>
      <p className="landing-cta-desc">
        Free to start. No credit card. Upload your first file and see your dashboard in under 60 seconds.
      </p>
      <div className="landing-cta-actions">
        <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--lg">
          Create Your Account
          <ArrowRightIcon />
        </Link>
        <Link to="/dashboard" className="landing-btn landing-btn--secondary landing-btn--lg landing-btn--ghost">
          Try the Demo
        </Link>
      </div>
    </div>
  </section>
  )
}

/* ===========================
   FOOTER
   =========================== */
const Footer = () => (
  <footer className="landing-footer">
    <div className="landing-footer-inner">
      <div className="landing-footer-brand">
        <div className="landing-logo-mark" />
        <span className="landing-logo-text">businalyst.</span>
        <p className="landing-footer-tagline">Smarter analytics for modern businesses.</p>
      </div>

      <div className="landing-footer-links">
        <div className="landing-footer-col">
          <h4>Product</h4>
          <a href="#how-it-works">How It Works</a>
          <a href="#product">Dashboard</a>
          <a href="#why">Why Businalyst</a>
        </div>
        <div className="landing-footer-col">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Careers</a>
        </div>
        <div className="landing-footer-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Contact</a>
          <a href="#">Status</a>
        </div>
        <div className="landing-footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </div>

    <div className="landing-footer-bottom">
      <span>&copy; 2026 Businalyst. All rights reserved.</span>
    </div>
  </footer>
)

/* ===========================
   LANDING PAGE (main)
   =========================== */
const LandingPage = () => (
  <div className="landing-page">
    <Hero />
    <SocialProof />
    <HowItWorks />
    <ProductShowcase />
    <MidPageCTA />
    <ProblemSolution />
    <FinalCTA />
    <Footer />
  </div>
)

export default LandingPage
