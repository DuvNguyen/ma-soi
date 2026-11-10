import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GothicDialogProvider } from './context/GothicDialogContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GothicDialogProvider>
      <App />
    </GothicDialogProvider>
  </React.StrictMode>,
)
