import React, { memo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../App.css'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <div className="container">
        <h1>Businalyst</h1>
        <p className="coming-soon">Welcome, {user?.name || user?.email}!</p>
        <button 
          onClick={logout}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid white',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default memo(Dashboard)

