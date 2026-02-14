import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import FileDropzone from '../components/FileDropzone'
import ExampleDataTable from '../components/ExampleDataTable'
import './Upload.css'

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    console.log('File selected:', file.name, file.size, file.type)
    // Here you could add client-side parsing with papaparse or xlsx
    // For now, we just store the file
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
