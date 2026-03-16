import React, { useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
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

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
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

/* ===========================
   SECTION 1 — HERO (CINEMATIC)
   =========================== */
const Hero = () => (
  <section className="landing-hero">
    <div className="landing-hero-bg">
      <div className="landing-hero-glow landing-hero-glow--1" />
      <div className="landing-hero-glow landing-hero-glow--2" />
      <div className="landing-hero-glow landing-hero-glow--3" />
      {/* grid pattern overlay */}
      <div className="landing-hero-grid-pattern" />
    </div>

    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-nav-brand">
          <div className="landing-logo-mark" />
          <span className="landing-logo-text">businalyst.</span>
        </Link>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#product" className="landing-nav-link">Product</a>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-nav-link">Sign In</Link>
          <Link to="/signup" className="landing-btn landing-btn--nav">Get Started</Link>
        </div>
      </div>
    </nav>

    <div className="landing-hero-content">
      <div className="landing-hero-center landing-fade-in-up">
        <div className="landing-hero-badge">
          <span className="landing-hero-badge-dot" />
          Analytics platform for SMBs
        </div>
        <h1 className="landing-hero-title">
          Understand your business<br />like never before.
        </h1>
        <p className="landing-hero-subtitle">
          Your business already has the answers — they're hidden in your data. Businalyst reveals what's driving revenue, where costs are leaking, and how your customers actually behave.
        </p>
        <div className="landing-hero-ctas">
          <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--lg">
            Get Started Free
            <ArrowRightIcon />
          </Link>
          <Link to="/dashboard" className="landing-btn landing-btn--secondary landing-btn--lg">
            View Demo
          </Link>
        </div>
      </div>

      {/* cinematic product scene */}
      <div className="landing-hero-scene landing-fade-in-up-delayed">
        <div className="landing-hero-scene-glow" />
        <div className="landing-hero-dashboard-frame">
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
      </div>
    </div>
  </section>
)

/* ===========================
   SECTION 2 — SOCIAL PROOF BAR
   =========================== */
const SocialProof = () => (
  <section className="landing-social-proof">
    <div className="landing-social-proof-inner">
      <p className="landing-social-proof-text">Trusted by business owners to make better decisions</p>
      <div className="landing-social-proof-stats">
        <div className="landing-proof-stat">
          <span className="landing-proof-stat-num">2,500+</span>
          <span className="landing-proof-stat-label">Data files analyzed</span>
        </div>
        <div className="landing-proof-divider" />
        <div className="landing-proof-stat">
          <span className="landing-proof-stat-num">$50M+</span>
          <span className="landing-proof-stat-label">Revenue tracked</span>
        </div>
        <div className="landing-proof-divider" />
        <div className="landing-proof-stat">
          <span className="landing-proof-stat-num">150+</span>
          <span className="landing-proof-stat-label">Businesses powered</span>
        </div>
      </div>
    </div>
  </section>
)

/* ===========================
   SECTION 3 — PROBLEM → SOLUTION
   =========================== */
const ProblemSolution = () => (
  <section className="landing-section landing-problem" id="why">
    <div className="landing-problem-grid">
      <div className="landing-problem-left">
        <span className="landing-section-label">The Problem</span>
        <h2 className="landing-problem-title">
          Running a business shouldn't mean drowning in spreadsheets.
        </h2>
        <div className="landing-problem-points">
          <div className="landing-problem-point">
            <span className="landing-problem-x">&times;</span>
            <p>Scattered data across spreadsheets, invoices, and tools</p>
          </div>
          <div className="landing-problem-point">
            <span className="landing-problem-x">&times;</span>
            <p>No clear picture of what's growing and what's costing you</p>
          </div>
          <div className="landing-problem-point">
            <span className="landing-problem-x">&times;</span>
            <p>Hours spent manually building reports instead of running your business</p>
          </div>
        </div>
      </div>
      <div className="landing-problem-right">
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

/* ===========================
   SECTION 4 — PRODUCT DEEP DIVES
   =========================== */
const ProductDeepDive = () => {
  const revealRef = useScrollReveal()

  return (
  <section className="landing-section landing-deep-dive" id="product" ref={revealRef}>
    <div className="landing-section-header">
      <span className="landing-section-label">Product</span>
      <h2 className="landing-section-title">Powerful analytics, beautifully simple</h2>
      <p className="landing-section-desc">
        Revenue, expenses and customers tell the real story of your business. Businalyst makes that story clear.
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
          <img src="/images/dashboard-main.png" alt="Businalyst Revenue Dashboard" className="landing-dive-img" />
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
  </section>
  )
}

/* ===========================
   SECTION 5 — FEATURES GRID
   =========================== */
const features = [
  { icon: <ChartIcon />,   title: 'Revenue Analytics',    desc: 'Track revenue streams, trends, and growth patterns across your entire business.' },
  { icon: <WalletIcon />,  title: 'Expense Intelligence', desc: 'Break down spending categories, spot anomalies, and control costs effectively.' },
  { icon: <UsersIcon />,   title: 'Customer Insights',    desc: 'Understand customer behavior, segmentation, and lifetime value at a glance.' },
  { icon: <TrendUpIcon />, title: 'Profit Tracking',      desc: 'Monitor profit margins, identify high-performing products, and optimize pricing.' },
  { icon: <BrainIcon />,   title: 'Automated Insights',   desc: 'Get AI-powered observations about your data without manual analysis.' },
  { icon: <UploadIcon />,  title: 'Easy Data Upload',     desc: 'Upload CSV or spreadsheet files — Businalyst handles the rest automatically.' },
]

const Features = () => (
  <section className="landing-section landing-features" id="features">
    <div className="landing-section-header">
      <span className="landing-section-label">Features</span>
      <h2 className="landing-section-title">Everything your business needs to grow</h2>
      <p className="landing-section-desc">
        Successful businesses don't guess. They analyze. These tools make it effortless.
      </p>
    </div>

    <div className="landing-features-grid">
      {features.map((f, i) => (
        <div key={i} className="landing-feature-card">
          <div className="landing-feature-icon">{f.icon}</div>
          <h3 className="landing-feature-title">{f.title}</h3>
          <p className="landing-feature-desc">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
)

/* ===========================
   SECTION 6 — HOW IT WORKS
   =========================== */
const steps = [
  { num: '01', icon: <UploadIcon />, title: 'Upload your data',                  desc: 'Import your CSV, spreadsheet, or business file. It takes seconds, not hours.' },
  { num: '02', icon: <BrainIcon />,  title: 'Businalyst analyzes automatically', desc: 'Our engine processes your data and generates clear visual analytics instantly.' },
  { num: '03', icon: <ChartIcon />,  title: 'Make smarter decisions',            desc: 'Explore interactive charts, KPIs, and actionable insights that drive growth.' },
]

const HowItWorks = () => (
  <section className="landing-section landing-how" id="how-it-works">
    <div className="landing-section-header">
      <span className="landing-section-label">How It Works</span>
      <h2 className="landing-section-title">From raw data to insights in three steps</h2>
      <p className="landing-section-desc">
        No data science degree required. If you can upload a file, you can use Businalyst.
      </p>
    </div>

    <div className="landing-steps">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="landing-step">
            <div className="landing-step-num">{s.num}</div>
            <div className="landing-step-icon">{s.icon}</div>
            <h3 className="landing-step-title">{s.title}</h3>
            <p className="landing-step-desc">{s.desc}</p>
          </div>
          {i < steps.length - 1 && (
            <div className="landing-step-connector">
              <ArrowRightIcon />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </section>
)

/* ===========================
   SECTION 7 — BENEFITS
   =========================== */
const benefits = [
  { icon: <TargetIcon />, title: 'Understand performance instantly',       desc: 'Know exactly how every part of your business is performing — no manual reports needed.' },
  { icon: <WalletIcon />, title: 'Identify cost problems early',           desc: 'Spot expense anomalies and budget overruns before they become expensive mistakes.' },
  { icon: <UsersIcon />,  title: 'Track customer growth',                  desc: "See who your best customers are, who's leaving, and what drives retention." },
  { icon: <ZapIcon />,    title: 'Make smarter financial decisions',       desc: 'Replace gut feelings with clear data. Every decision backed by real numbers.' },
]

const Benefits = () => (
  <section className="landing-section landing-benefits">
    <div className="landing-section-header">
      <span className="landing-section-label">Benefits</span>
      <h2 className="landing-section-title">What you gain with Businalyst</h2>
      <p className="landing-section-desc">
        Smart decisions come from clear insights. Here's what changes when you see the full picture.
      </p>
    </div>

    <div className="landing-benefits-grid">
      {benefits.map((b, i) => (
        <div key={i} className="landing-benefit-card">
          <div className="landing-benefit-icon">{b.icon}</div>
          <h3 className="landing-benefit-title">{b.title}</h3>
          <p className="landing-benefit-desc">{b.desc}</p>
        </div>
      ))}
    </div>
  </section>
)

/* ===========================
   SECTION 8 — PLATFORM STRENGTHS
   =========================== */
const strengths = [
  { icon: <BrainIcon />,  text: 'Smart analytics engine' },
  { icon: <ChartIcon />,  text: 'Clean visual dashboards' },
  { icon: <UploadIcon />, text: 'Easy CSV & spreadsheet upload' },
  { icon: <ZapIcon />,    text: 'Instant actionable insights' },
  { icon: <ShieldIcon />, text: 'Secure data handling' },
  { icon: <TargetIcon />, text: 'Built for real business owners' },
]

const PlatformStrengths = () => (
  <section className="landing-strengths">
    <div className="landing-strengths-inner">
      <h2 className="landing-strengths-title">Built to make business analytics effortless</h2>
      <div className="landing-strengths-grid">
        {strengths.map((s, i) => (
          <div key={i} className="landing-strength-item">
            <span className="landing-strength-icon">{s.icon}</span>
            <span className="landing-strength-text">{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ===========================
   SECTION 9 — FINAL CTA
   =========================== */
const FinalCTA = () => (
  <section className="landing-section landing-cta">
    <div className="landing-cta-inner">
      <div className="landing-cta-glow" />
      <span className="landing-cta-badge">Start for free</span>
      <h2 className="landing-cta-title">Start understanding your business today.</h2>
      <p className="landing-cta-desc">
        No complicated setup. No credit card required. Upload your data and get insights in minutes.
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
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#product">Dashboard</a>
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
    <ProblemSolution />
    <ProductDeepDive />
    <Features />
    <HowItWorks />
    <Benefits />
    <PlatformStrengths />
    <FinalCTA />
    <Footer />
  </div>
)

export default LandingPage
