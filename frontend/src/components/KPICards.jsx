import React from 'react'
import './KPICards.css'

const KPICards = () => {
  const kpis = [
    {
      title: 'Page Views',
      value: '16.431',
      change: '+15.5%',
      changeType: 'positive',
      comparison: 'vs. 14,653 last period',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      title: 'Visitors',
      value: '6.225',
      change: '+8.4%',
      changeType: 'positive',
      comparison: 'vs. 5,732 last period',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="15" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 19C3 15.5 5.5 13 9 13C12.5 13 15 15.5 15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 19C9 16.5 11.5 14 15 14C18.5 14 21 16.5 21 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: 'Click',
      value: '2.832',
      change: '-10.5%',
      changeType: 'negative',
      comparison: 'vs. 3,294 last period',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      title: 'Orders',
      value: '1.224',
      change: '+4.4%',
      changeType: 'positive',
      comparison: 'vs. 1,188 last period',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7L12 12L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ]

  return (
    <div className="kpi-cards">
      {kpis.map((kpi, index) => (
        <div key={index} className="kpi-card">
          <div className="kpi-card-header">
            <h4 className="kpi-title">{kpi.title}</h4>
            <div className="kpi-icon">{kpi.icon}</div>
          </div>
          
          <div className="kpi-value">{kpi.value}</div>
          
          <div className="kpi-footer">
            <div className={`kpi-change ${kpi.changeType}`}>
              {kpi.changeType === 'positive' ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 10L2 6H5V2H7V6H10L6 10Z" fill="currentColor"/>
                </svg>
              )}
              <span>{kpi.change}</span>
            </div>
            <div className="kpi-comparison">{kpi.comparison}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default KPICards

