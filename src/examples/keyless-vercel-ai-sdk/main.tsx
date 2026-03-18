import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { KeylessVercelAICompletionsSDK } from './KeylessVercelAISDKCompletionsAPI.tsx'
import '../../index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeylessVercelAICompletionsSDK />
  </StrictMode>,
)
