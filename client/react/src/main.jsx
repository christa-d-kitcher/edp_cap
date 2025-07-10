import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import CapApp from './CapApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CapApp />
  </StrictMode>,
)
