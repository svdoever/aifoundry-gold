import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { KeylessVercelAISDK } from './KeylessVercelAISDK.tsx'
import '../../index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeylessVercelAISDK />
  </StrictMode>,
)
