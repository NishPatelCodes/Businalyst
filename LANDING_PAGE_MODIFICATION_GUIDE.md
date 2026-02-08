# Landing Page Modification Guide

## Current Branch Status
- **Branch**: `feature/coming-soon-landing-page`
- **Status**: Work is complete, ready for integration
- **Structure**: React app with Vite

## Steps to Modify Landing Page State

### 1. Switch to Landing Page Branch
```bash
git checkout feature/coming-soon-landing-page
git pull origin feature/coming-soon-landing-page
```

### 2. Make Your Changes

#### Modify Landing Page Component
- **File**: `frontend/src/pages/ComingSoon.jsx`
- **Current State Variables**:
  - `email` - Email input value
  - `submitted` - Form submission status
  - `theme` - Theme selection ('light' or 'dark')
  - `dropdownOpen` - Theme dropdown visibility

#### Common Modifications:

**A. Update Email Form State**
```javascript
// Add new state variable
const [loading, setLoading] = useState(false)

// Modify handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  // Your API call here
  setLoading(false)
}
```

**B. Update Theme State**
```javascript
// Change default theme
const [theme, setTheme] = useState('dark') // Change from 'light' to 'dark'

// Add new theme option
const handleThemeChange = (newTheme) => {
  setTheme(newTheme)
  setDropdownOpen(false)
  // Add localStorage persistence
  localStorage.setItem('theme', newTheme)
}
```

**C. Add New State Variables**
```javascript
const [error, setError] = useState('')
const [successMessage, setSuccessMessage] = useState('')
```

### 3. Update Styling
- **File**: `frontend/src/pages/ComingSoon.css`
- Modify CSS classes to match your design changes

### 4. Test Your Changes Locally
```bash
cd frontend
npm install  # If dependencies changed
npm run dev  # Start development server
```
- Visit `http://localhost:5173` (or port shown in terminal)
- Test all functionality

### 5. Commit Your Changes
```bash
# Follow commit message format from GitWorkflow.md
git add .
git commit -m "Update: [describe your changes]"
# Examples:
# "Update: add loading state to email form"
# "Fix: theme persistence in localStorage"
# "Add: error handling for email submission"
```

### 6. Push Changes
```bash
git push origin feature/coming-soon-landing-page
```

## Important Files to Know

### Main Component
- `frontend/src/pages/ComingSoon.jsx` - Main landing page component

### Routing
- `frontend/src/App.jsx` - React Router configuration
  - Currently has route: `/` → ComingSoon component
  - TODO comment indicates login route will be added

### Styling
- `frontend/src/pages/ComingSoon.css` - All landing page styles
- `frontend/src/index.css` - Global styles

### Configuration
- `frontend/package.json` - Dependencies (React, React Router, Vite)
- `frontend/vite.config.js` - Vite build configuration
- `frontend/vercel.json` - Deployment configuration

## Before Merging to Main

1. **Ensure all changes are committed and pushed**
2. **Test thoroughly**:
   - Email form submission
   - Theme switching
   - Responsive design
   - All interactive elements

3. **Coordinate with teammate** working on login page
4. **Wait for integration plan** to merge both features together

## Notes

- Landing page is a React component, not standalone HTML
- Uses React Router for navigation (ready for login page integration)
- State management uses React hooks (useState, useEffect)
- All styling is in CSS files, not inline (except some SVG icons)

