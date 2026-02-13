import React from 'react'
import './ExampleDataTable.css'

const ExampleDataTable = () => {
  const sampleData = [
    {
      id: 1,
      name: 'Wilson Rhiel Madsen',
      avatar: 'WM',
      date: '08 Sep 2024 2:48 PM',
      type: 'Transfer',
      amount: '$66.00',
      status: 'Send',
      statusType: 'danger'
    },
    {
      id: 2,
      name: 'Adobe CC',
      avatar: 'AC',
      date: '02 Sep 2024 11:54 AM',
      type: 'Subscription',
      amount: '$49.00',
      status: 'Payment',
      statusType: 'primary'
    },
    {
      id: 3,
      name: 'Ashleyn Stanton',
      avatar: 'AS',
      date: '30 Aug 2024 8:32 AM',
      type: 'Request',
      amount: '$840.00',
      status: 'Received',
      statusType: 'success'
    },
    {
      id: 4,
      name: 'Charlie Baptiste',
      avatar: 'CB',
      date: '27 Aug 2024 11:32 AM',
      type: 'Transfer',
      amount: '$45.00',
      status: 'Send',
      statusType: 'danger'
    },
    {
      id: 5,
      name: 'Uber Taxi',
      avatar: 'UT',
      date: '26 Aug 2024 6:56 PM',
      type: 'Transport',
      amount: '$56.00',
      status: 'Payment',
      statusType: 'primary'
    }
  ]

  return (
    <div className="example-data-table-container">
      <div className="table-header">
        <h3 className="table-title">Example Data:</h3>
        <span className="table-badge">CSV</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <span className="th-content">
                  Name
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 3V9M6 3L4 5M6 3L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="th-content">
                  Date
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 3V9M6 3L4 5M6 3L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="th-content">
                  Type
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 3V9M6 3L4 5M6 3L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="th-content">
                  Amount
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 3V9M6 3L4 5M6 3L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="th-content">
                  Status
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 3V9M6 3L4 5M6 3L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="th-content">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="name-cell">
                    <div className="avatar">{row.avatar}</div>
                    <span className="name-text">{row.name}</span>
                  </div>
                </td>
                <td className="date-cell">{row.date}</td>
                <td className="type-cell">{row.type}</td>
                <td className="amount-cell">{row.amount}</td>
                <td>
                  <span className={`status-badge status-${row.statusType}`}>
                    {row.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="action-button">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="3" r="1" fill="currentColor"/>
                      <circle cx="8" cy="8" r="1" fill="currentColor"/>
                      <circle cx="8" cy="13" r="1" fill="currentColor"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExampleDataTable
