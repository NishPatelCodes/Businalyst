import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import { useAuth } from '../context/AuthContext'
import './Settings.css'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'data', label: 'Data' },
  { id: 'account', label: 'Account' },
]

const THEME_STORAGE_KEY = 'businalyst_theme'

function formatUploadedAt(value) {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return '-'
  return dt.toLocaleString()
}

const Settings = () => {
  const { user, logout, authFetch, API_BASE, updateUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [profileState, setProfileState] = useState({ saving: false, error: '', success: '' })

  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [securityState, setSecurityState] = useState({ saving: false, error: '', success: '' })

  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'system'
    } catch {
      return 'system'
    }
  })
  const [datasets, setDatasets] = useState([])
  const [dataState, setDataState] = useState({ loading: false, error: '' })
  const [deleteDatasetId, setDeleteDatasetId] = useState(null)
  const [accountState, setAccountState] = useState({ deleting: false, error: '' })
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    })
  }, [user?.name, user?.email])

  useEffect(() => {
    const root = document.documentElement
    let nextMode = themeMode
    if (themeMode === 'system') {
      nextMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    root.setAttribute('data-theme', nextMode)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    } catch {}
  }, [themeMode])

  const userInitials = useMemo(() => {
    const displayName = profileForm.name || user?.name || 'U'
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [profileForm.name, user?.name])

  const fetchDatasets = async () => {
    setDataState({ loading: true, error: '' })
    try {
      const res = await authFetch(`${API_BASE}/api/datasets/`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load datasets')
      }
      setDatasets(Array.isArray(data.datasets) ? data.datasets : [])
      setDataState({ loading: false, error: '' })
    } catch (err) {
      setDataState({
        loading: false,
        error: err.message || 'Failed to load datasets',
      })
    }
  }

  useEffect(() => {
    if (activeTab === 'data') {
      fetchDatasets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileState({ saving: true, error: '', success: '' })
    try {
      const res = await authFetch(`${API_BASE}/api/auth/profile/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      if (data.user) updateUser(data.user)
      setProfileState({ saving: false, error: '', success: 'Profile updated successfully.' })
    } catch (err) {
      setProfileState({ saving: false, error: err.message || 'Failed to update profile', success: '' })
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (securityForm.new_password !== securityForm.confirm_password) {
      setSecurityState({ saving: false, error: 'New passwords do not match.', success: '' })
      return
    }
    setSecurityState({ saving: true, error: '', success: '' })
    try {
      const res = await authFetch(`${API_BASE}/api/auth/change-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: securityForm.current_password,
          new_password: securityForm.new_password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password')
      }
      setSecurityForm({ current_password: '', new_password: '', confirm_password: '' })
      setSecurityState({ saving: false, error: '', success: 'Password updated successfully.' })
    } catch (err) {
      setSecurityState({ saving: false, error: err.message || 'Failed to change password', success: '' })
    }
  }

  const handleDeleteDataset = async (datasetId) => {
    setDeleteDatasetId(datasetId)
    try {
      const res = await authFetch(`${API_BASE}/api/datasets/${datasetId}/`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete dataset')
      }
      setDatasets((prev) => prev.filter((item) => item.id !== datasetId))
    } catch (err) {
      setDataState((prev) => ({
        ...prev,
        error: err.message || 'Failed to delete dataset',
      }))
    } finally {
      setDeleteDatasetId(null)
    }
  }

  const handleDeleteAccount = async () => {
    setAccountState({ deleting: true, error: '' })
    try {
      const res = await authFetch(`${API_BASE}/api/auth/account/`, { method: 'DELETE' })
      if (!res.ok) {
        let message = 'Failed to delete account'
        try {
          const data = await res.json()
          message = data.error || message
        } catch {}
        throw new Error(message)
      }
      logout()
      navigate('/', { replace: true })
    } catch (err) {
      setAccountState({ deleting: false, error: err.message || 'Failed to delete account' })
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavigation />
        <div className="settings-content">
          <div className="settings-header">
            <h1 className="settings-title">Settings</h1>
          </div>

          <section className="settings-card">
            <div className="settings-card-head">
              <h2 className="settings-card-title">Account settings</h2>
            </div>

            <nav className="settings-tab-bar" aria-label="Settings tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`settings-tab-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="settings-card-body">
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile}>
                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Profile Photo</p>
                      <p className="setting-row-desc">Generated from your name initials.</p>
                    </div>
                    <div className="setting-row-right">
                      <div className="profile-avatar-row">
                        <div className="profile-avatar-lg">{userInitials}</div>
                        <div>
                          <div className="profile-avatar-name">{profileForm.name || 'Your Name'}</div>
                          <div className="profile-avatar-email">{profileForm.email || 'your@email.com'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Display Name</p>
                      <p className="setting-row-desc">Your full name shown across the app.</p>
                    </div>
                    <div className="setting-row-right">
                      <input
                        className="settings-input"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Email Address</p>
                      <p className="setting-row-desc">Account login email and notifications destination.</p>
                    </div>
                    <div className="setting-row-right">
                      <input
                        className="settings-input"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="setting-row-footer">
                    <div>
                      {profileState.error && <p className="settings-error">{profileState.error}</p>}
                      {profileState.success && <p className="settings-success">{profileState.success}</p>}
                    </div>
                    <button type="submit" className="settings-primary-btn" disabled={profileState.saving}>
                      {profileState.saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handleChangePassword}>
                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Current Password</p>
                      <p className="setting-row-desc">Required to verify your identity.</p>
                    </div>
                    <div className="setting-row-right">
                      <input
                        className="settings-input"
                        type="password"
                        value={securityForm.current_password}
                        onChange={(e) => setSecurityForm((prev) => ({ ...prev, current_password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">New Password</p>
                      <p className="setting-row-desc">Choose a strong password for better security.</p>
                    </div>
                    <div className="setting-row-right">
                      <input
                        className="settings-input"
                        type="password"
                        value={securityForm.new_password}
                        onChange={(e) => setSecurityForm((prev) => ({ ...prev, new_password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Confirm New Password</p>
                      <p className="setting-row-desc">Must match your new password.</p>
                    </div>
                    <div className="setting-row-right">
                      <input
                        className="settings-input"
                        type="password"
                        value={securityForm.confirm_password}
                        onChange={(e) => setSecurityForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="setting-row-footer">
                    <div>
                      {securityState.error && <p className="settings-error">{securityState.error}</p>}
                      {securityState.success && <p className="settings-success">{securityState.success}</p>}
                    </div>
                    <button type="submit" className="settings-primary-btn" disabled={securityState.saving}>
                      {securityState.saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Theme</p>
                      <p className="setting-row-desc">Choose how the app looks in your workspace.</p>
                    </div>
                    <div className="setting-row-right">
                      <div className="theme-switch">
                        {['light', 'dark', 'system'].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            className={`theme-option ${themeMode === mode ? 'active' : ''}`}
                            onClick={() => setThemeMode(mode)}
                          >
                            {mode[0].toUpperCase() + mode.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div>
                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Uploaded Datasets</p>
                      <p className="setting-row-desc">Files used to power your analytics dashboard.</p>
                    </div>
                    <div className="setting-row-right settings-data-actions">
                      <Link to="/upload" className="settings-primary-btn as-link">Upload New Dataset</Link>
                    </div>
                  </div>

                  {dataState.loading && <p className="settings-help">Loading datasets...</p>}
                  {dataState.error && <p className="settings-error">{dataState.error}</p>}
                  {!dataState.loading && !datasets.length && (
                    <p className="settings-help">No datasets uploaded yet.</p>
                  )}
                  {!!datasets.length && (
                    <div className="dataset-table-wrap settings-data-table-section">
                      <table className="dataset-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Rows</th>
                            <th>Currency</th>
                            <th>Uploaded</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datasets.map((item) => (
                            <tr key={item.id}>
                              <td>{item.name}</td>
                              <td>{item.row_count || 0}</td>
                              <td>{item.source_currency || '-'}</td>
                              <td>{formatUploadedAt(item.uploaded_at)}</td>
                              <td>
                                {item.is_active ? (
                                  <span className="dataset-badge active">Active</span>
                                ) : (
                                  <span className="dataset-badge">Inactive</span>
                                )}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="settings-danger-btn"
                                  onClick={() => handleDeleteDataset(item.id)}
                                  disabled={deleteDatasetId === item.id}
                                >
                                  {deleteDatasetId === item.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Signed in as</p>
                      <p className="setting-row-desc">Your current authenticated account.</p>
                    </div>
                    <div className="setting-row-right account-row">
                      <strong>{user?.email || '-'}</strong>
                    </div>
                  </div>

                  <div className="setting-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Session</p>
                      <p className="setting-row-desc">Sign out from this device.</p>
                    </div>
                    <div className="setting-row-right">
                      <button type="button" className="settings-primary-btn" onClick={handleSignOut}>
                        Sign Out
                      </button>
                    </div>
                  </div>

                  <div className="setting-row danger-row">
                    <div className="setting-row-left">
                      <p className="setting-row-title">Delete Account</p>
                      <p className="setting-row-desc">Permanently removes your account and uploaded datasets.</p>
                    </div>
                    <div className="setting-row-right">
                      {accountState.error && <p className="settings-error">{accountState.error}</p>}
                      <button type="button" className="settings-danger-btn" onClick={() => setShowDeleteAccount(true)}>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showDeleteAccount && (
        <div className="settings-modal-backdrop">
          <div className="settings-modal card">
            <h3>Delete account?</h3>
            <p>This cannot be undone.</p>
            <div className="settings-modal-actions">
              <button
                type="button"
                className="settings-secondary-btn"
                onClick={() => setShowDeleteAccount(false)}
                disabled={accountState.deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="settings-danger-btn"
                onClick={handleDeleteAccount}
                disabled={accountState.deleting}
              >
                {accountState.deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
