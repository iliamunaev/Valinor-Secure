import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Vite only exposes variables prefixed with VITE_
console.log('VITE_TEST_FRONTEND =', import.meta.env.VITE_TEST_FRONTEND)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
