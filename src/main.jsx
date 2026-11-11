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

// Register Service Worker for PWA (iPhone / Android)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('Werewolf PWA ServiceWorker registered with scope:', reg.scope);
    }).catch((err) => {
      console.warn('Werewolf PWA ServiceWorker registration failed:', err);
    });
  });
}
