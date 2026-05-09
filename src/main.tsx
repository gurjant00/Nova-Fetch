import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'rgba(18, 18, 26, 0.95)',
          color: '#f0f0f5',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
        },
      }}
    />
    <App />
  </StrictMode>,
)
