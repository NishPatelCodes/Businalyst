import React from 'react'
import './KPICards.css'

const KPICards = () => {
  const kpis = [
    {
      title: 'Profit',
      value: '$24,580',
      change: '+12.3%',
      changeType: 'positive',
      comparison: 'vs. $21,890 last period',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.58 12.58L19.97 10.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: 'Revenue',
      value: '$186,420',
      change: '+7.9%',
      changeType: 'positive',
      comparison: 'vs. $172,700 last period',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 14H7.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M11 14H11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: 'Orders',
      value: '1,224',
      change: '+4.4%',
      changeType: 'positive',
      comparison: 'vs. 1,188 last period',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 10C16 11.1046 15.1046 12 14 12C12.8954 12 12 11.1046 12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },{
      title: 'Orders',
      value: '1,224',
      change: '+4.4%',
      changeType: 'positive',
      comparison: 'vs. 1,188 last period',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 10C16 11.1046 15.1046 12 14 12C12.8954 12 12 11.1046 12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    }
  ]

  return (
    <React.Fragment>
      {kpis.map((kpi, index) => {
        return (
          <div key={index} className="kpi-card">
            <div className="kpi-title">{kpi.title}</div>
            
            <div className="kpi-value">{kpi.value}</div>
            
            <div className="kpi-footer">
              <div className={`kpi-change ${kpi.changeType}`}>
                {kpi.changeType === 'positive' ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 10L2 6H5V2H7V6H10L6 10Z" fill="currentColor"/>
                  </svg>
                )}
                <span>{kpi.change}</span>
              </div>
              <div className="kpi-comparison">{kpi.comparison}</div>
            </div>
          </div>
        )
      })}
    </React.Fragment>
  )
}

export default KPICards

