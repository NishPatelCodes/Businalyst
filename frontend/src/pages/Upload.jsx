import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import FileDropzone from '../components/FileDropzone'
import ExampleDataTable from '../components/ExampleDataTable'
import { KpiContext } from '../context/KpiContext'
import './Upload.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const { setKpiData } = useContext(KpiContext)
  const navigate = useNavigate()

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setError(null)
    setUploadSuccess(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setError(null)
    setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const res = await fetch(`${API_BASE}/upload/`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }
      setKpiData({
        profit_sum: data.profit_sum,
        revenue_sum: data.revenue_sum,
        orders_sum: data.orders_sum,
        expense_sum: data.expense_sum,
        customers_sum: data.customers_sum,
        revenue_data: data.revenue_data,
        profit_data: data.profit_data,
        date_data: data.date_data,
      })
      setUploadSuccess(true)
    } catch (err) {
      setError(err.message || 'Network error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavigation />
        
        <div className="upload-content">
          <div className="upload-hero">
            <h1 className="upload-title">Upload Your Business Data</h1>
            <p className="upload-subtitle">
              Transform your spreadsheets into powerful insights with our AI-powered analytics
            </p>
          </div>

          <div className="upload-dropzone-section">
            <FileDropzone onFileSelect={handleFileSelect} />
            {selectedFile && !uploadSuccess && (
              <div className="upload-actions">
                <button
                  type="button"
                  className="upload-process-button"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Processing…' : 'Process file'}
                </button>
              </div>
            )}
            {error && <p className="upload-error">{error}</p>}
            {uploadSuccess && (
              <div className="upload-success">
                <p className="upload-success-message">File processed successfully. Your KPIs are ready.</p>
                <button
                  type="button"
                  className="upload-view-dashboard-button"
                  onClick={() => navigate('/dashboard')}
                >
                  View dashboard
                </button>
              </div>
            )}
          </div>

          <div className="upload-table-section">
            <ExampleDataTable />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload
