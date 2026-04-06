import React from 'react'

// Note: this component only handles layout + classnames.
// Export handlers are passed in by the page.
const InsightsPageHeader = ({
  titlePrefix,
  exportPrefix,
  title,
  subtitle,
  dateRange,
  setDateRange,
  RANGES,
  exportOpen,
  setExportOpen,
  onExportCSV,
  onExportPDF,
}) => {
  return (
    <div className={`${titlePrefix}-page-header`}>
      <div>
        <h1 className={`${titlePrefix}-page-title`}>{title}</h1>
        <p className={`${titlePrefix}-page-subtitle`}>{subtitle}</p>
      </div>

      <div className={`${titlePrefix}-page-header-actions`}>
        <div className={`${titlePrefix}-range-tabs`}>
          {RANGES.map((r) => (
            <button
              key={r}
              className={`${titlePrefix}-range-tab${dateRange === r ? ` ${titlePrefix}-range-tab--active` : ''}`}
              onClick={() => setDateRange(r)}
              type="button"
            >
              {r}
            </button>
          ))}
        </div>

        <div className={`${exportPrefix}-export-wrap`}>
          <button
            className={`${exportPrefix}-export-btn`}
            onClick={() => setExportOpen((prev) => !prev)}
            aria-expanded={exportOpen}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v8M5 7l3 3 3-3M3 13h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Export
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {exportOpen && (
            <>
              <div
                className={`${exportPrefix}-export-backdrop`}
                onClick={() => setExportOpen(false)}
                aria-hidden="true"
              />
              <div className={`${exportPrefix}-export-menu`}>
                <button
                  className={`${exportPrefix}-export-menu-item`}
                  type="button"
                  onClick={() => {
                    onExportCSV()
                    setExportOpen(false)
                  }}
                >
                  Export CSV
                </button>
                <button
                  className={`${exportPrefix}-export-menu-item`}
                  type="button"
                  onClick={() => {
                    onExportPDF()
                    setExportOpen(false)
                  }}
                >
                  Export PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default InsightsPageHeader

