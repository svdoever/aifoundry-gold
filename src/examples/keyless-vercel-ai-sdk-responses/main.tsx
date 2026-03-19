import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { KeylessVercelAISDKResponsesAPI } from './KeylessVercelAISDKResponsesAPI.tsx'
import '../../index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeylessVercelAISDKResponsesAPI />
  </StrictMode>,
)
