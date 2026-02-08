import React, { useState } from 'react'
import './RealtimeAnalyticsTab.css'

const RealtimeAnalyticsTab = () => {
  const [activeTab, setActiveTab] = useState('realtime')

  return (
    <div className="realtime-tabs">
      <button
        className={`tab-button ${activeTab === 'realtime' ? 'active' : ''}`}
        onClick={() => setActiveTab('realtime')}
      >
        Real time analytics
      </button>
    </div>
  )
}

export default RealtimeAnalyticsTab




