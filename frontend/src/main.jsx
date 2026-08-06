import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios'

// Global response interceptor to catch fallback HTML (like index.html) 
// when the API server/backend is down or not connected.
axios.interceptors.response.use(
  (response) => {
    const contentType = response.headers?.['content-type'] || '';
    if (contentType.includes('text/html')) {
      return Promise.reject(new Error('Invalid response: Expected JSON, but received HTML (the backend might be offline).'));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
