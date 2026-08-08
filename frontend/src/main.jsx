import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Wake up the Render backend immediately on app load
// Prevents 30-60s cold start delay on first API call
const BASE_URL = import.meta.env.VITE_BASE_URL;
if (BASE_URL) {
  fetch(`${BASE_URL}/career/getall`, { method: 'GET' }).catch(() => {});
}

const hostname = window.location.hostname;
const path = window.location.pathname;

if (hostname === 'admin.infinitohq.com' && !path.startsWith('/admin')) {
  window.location.replace('/admin' + path + window.location.search);
} else if (hostname === 'research.infinitohq.com' && !path.startsWith('/research')) {
  window.location.replace('/research' + path + window.location.search);
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode><App /></StrictMode>
  )
}
