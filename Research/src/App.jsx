import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser, removeUser } from './redux/userSlice'; 
import { FRONTEND_BASE_URL } from './utils/constants.js';

import Body from './components/Body';
import Home from './pages/Home/Home';
import ResearchPlans from './pages/Home/Research';
import ReadResearch from './pages/ReadResearch/ReadResearch';
import Paper from './pages/BrowsePapers/Paper';
import Checkout from './pages/Checkout/Checkout';
function App() {
   const dispatch = useDispatch();

useEffect(() => {
  const MAIN_URL = import.meta.env.VITE_FRONTEND_BASE_URL || 'https://infinitohq.com';

  // Load cached user immediately
  const cachedUser = localStorage.getItem("user");
  if (cachedUser) {
    try { dispatch(addUser(JSON.parse(cachedUser))); } catch {}
  }

  // Load auth bridge iframe to sync user from main site
  const iframe = document.createElement('iframe');
  iframe.src = `${MAIN_URL}/auth-bridge.html`;
  iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute;';
  document.body.appendChild(iframe);

  const handleMessage = (event) => {
    if (event.data?.type === 'auth-bridge') {
      if (event.data.user) {
        try {
          const userData = JSON.parse(event.data.user);
          dispatch(addUser(userData));
          localStorage.setItem("user", event.data.user);
        } catch {}
      } else {
        // No user on main site — clear research session too
        localStorage.removeItem("user");
        localStorage.removeItem("authtoken");
        localStorage.removeItem("token");
        dispatch(removeUser());
      }
      if (event.data.token) {
        localStorage.setItem("authtoken", event.data.token);
      }
      // Clean up iframe
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }

    // Legacy postMessage support
    if (event.data?.type === "user-data" && event.data?.payload) {
      try {
        const userData = JSON.parse(event.data.payload);
        dispatch(addUser(userData));
        localStorage.setItem("user", event.data.payload);
      } catch {}
    }
  };

  window.addEventListener("message", handleMessage);
  return () => {
    window.removeEventListener("message", handleMessage);
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  };
}, [dispatch]);

  
  return (

   <BrowserRouter basename="/research" >
    <Routes>
      <Route path="/" element={<Body/>} >
      <Route index element={<Paper/>} />
      <Route path="home" element={<Home/>} />
      <Route path="ResearchPlans" element={<ResearchPlans/>} />
      <Route path="readresearch/:id" element={<ReadResearch />} />
      <Route path="browseResearch" element={<Paper/>} />
      <Route path="/checkout" element={<Checkout/>} />
      </Route>
    </Routes>
   </BrowserRouter>
  );

}

export default App;
