import React from 'react'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import DashboardMetrics from '../features/DashboardMetrics'
import LeadsChart from '../features/LeadsChart'
import ExpenseSources from '../features/ExpenseSources'
import SubscriptionAnalytics from '../features/SubscriptionAnalytics'
import OrdersList from '../features/OrdersList'
import MapView from '../features/MapView'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavigation />
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <div className="dashboard-actions">
              <div className="date-range-selector">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="5" cy="9" r="0.5" fill="currentColor"/>
                  <circle cx="8" cy="9" r="0.5" fill="currentColor"/>
                  <circle cx="11" cy="9" r="0.5" fill="currentColor"/>
                </svg>
                <span>Jan 1, 2025 - Feb, 1 2025</span>
              </div>
              
              <div className="dropdown-selector">
                <span>Last 30 days</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <button className="action-button add-widget-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Add widget</span>
              </button>
              
              <button className="action-button primary export-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 11L8 2M8 11L5 8M8 11L11 8M2 14L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="dashboard-metrics">
            <DashboardMetrics />
          </div>

          <div className="charts-row">
            <div className="chart-left">
              <LeadsChart />
            </div>
            <div className="chart-right">
              <ExpenseSources />
            </div>
          </div>
          
          <div className="analytics-map-row">
            <div className="analytics-left">
              <div className="analytics-card-wrapper">
                <SubscriptionAnalytics />
              </div>
            </div>
            <div className="orders-middle">
              <div className="analytics-card-wrapper">
                <OrdersList />
              </div>
            </div>
            <div className="map-right">
              <div className="analytics-card-wrapper">
                <MapView />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

