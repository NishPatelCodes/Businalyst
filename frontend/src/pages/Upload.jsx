import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import FileDropzone from '../components/FileDropzone'
import ExampleDataTable from '../components/ExampleDataTable'
import { KpiContext } from '../context/KpiContext'
import { useAuth } from '../context/AuthContext'
import './Upload.css'

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const { setKpiData, isDemoData, datasetMeta } = useContext(KpiContext)
  const { authFetch, API_BASE } = useAuth()
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
      const res = await authFetch(`${API_BASE}/api/upload/`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }
      setKpiData(data)
      setUploadSuccess(true)
    } catch (err) {
      const msg = err.message || 'Network error'
      const isFetchFailed = /failed to fetch|network error|load failed/i.test(msg)
      setError(
        isFetchFailed
          ? `Could not reach the server. Make sure the backend is running at ${API_BASE}.`
          : msg
      )
    } finally {
      setIsUploading(false)
    }
  }

  const isReplacing = !isDemoData && datasetMeta

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavigation />
        
        <div className="upload-content">
          <div className="upload-hero">
            <h1 className="upload-title">
              {isReplacing ? 'Replace Your Business Data' : 'Upload Your Business Data'}
            </h1>
            <p className="upload-subtitle">
              {isReplacing
                ? `Currently using "${datasetMeta.name}". Upload a new file to replace it.`
                : 'Transform your spreadsheets into powerful insights with our AI-powered analytics'}
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
