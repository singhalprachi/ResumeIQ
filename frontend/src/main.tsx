import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--surface-3)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: 'var(--signal-green)', secondary: 'var(--ink)' } },
        error: { iconTheme: { primary: 'var(--signal-red)', secondary: 'var(--ink)' } },
      }}
    />
  </React.StrictMode>
)
