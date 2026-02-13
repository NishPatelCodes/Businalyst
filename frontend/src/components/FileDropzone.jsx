import React, { useState, useRef } from 'react'
import './FileDropzone.css'

const FileDropzone = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      handleFileSelect(file)
    }
  }

  const handleFileSelect = (file) => {
    // Check if file type is supported
    const validTypes = ['.csv', '.xlsx', '.xls']
    const fileExt = '.' + file.name.split('.').pop().toLowerCase()
    
    if (validTypes.includes(fileExt)) {
      setSelectedFile(file)
      if (onFileSelect) {
        onFileSelect(file)
      }
    } else {
      alert('Please upload a CSV, XLSX, or XLS file')
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div
      className={`file-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      
      <div className="dropzone-content">
        <div className="dropzone-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="12" width="32" height="28" rx="3" fill="#E5F2FF" stroke="#007AFF" strokeWidth="1.5"/>
            <path d="M16 20H32M16 26H28M16 32H24" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M24 8L20 12M24 8L28 12M24 8V16" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {!selectedFile ? (
          <>
            <h3 className="dropzone-title">Drag & Drop File</h3>
            <p className="dropzone-subtitle">or click to browse from your computer</p>
          </>
        ) : (
          <>
            <h3 className="dropzone-title">{selectedFile.name}</h3>
            <p className="dropzone-subtitle">{formatFileSize(selectedFile.size)}</p>
          </>
        )}
        
        <div className="dropzone-formats">
          <span className="format-badge">CSV</span>
          <span className="format-badge">XLSX</span>
          <span className="format-badge">XLS</span>
        </div>
      </div>
    </div>
  )
}

export default FileDropzone
