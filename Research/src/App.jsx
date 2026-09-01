import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser } from './redux/userSlice'; 
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
  // Always try to sync user from main site on load
  const syncUserFromMain = () => {
    const iframe = document.createElement('iframe');
    iframe.src = `${FRONTEND_BASE_URL}?request-user=1`;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 5000);
  };

  const handleMessage = (event) => {
    if (event.origin !== `${FRONTEND_BASE_URL}`) return;

    if (event.data?.type === "user-data") {
      try {
        const userData = JSON.parse(event.data.payload);
        dispatch(addUser(userData));
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Failed to parse user", err);
      }
    }

    // Also handle direct postMessage from main site
    if (event.data === "request-user") {
      const user = localStorage.getItem("user");
      if (user && event.source) {
        event.source.postMessage({ type: "user-data", payload: user }, event.origin);
      }
    }
  };

  window.addEventListener("message", handleMessage);

  // Load user from localStorage on mount (at least show cached user)
  const cachedUser = localStorage.getItem("user");
  if (cachedUser) {
    try {
      dispatch(addUser(JSON.parse(cachedUser)));
    } catch {}
  }

  // Request fresh user from main site
  window.parent.postMessage("request-user", `${FRONTEND_BASE_URL}`);
  window.opener?.postMessage("request-user", `${FRONTEND_BASE_URL}`);

  return () => window.removeEventListener("message", handleMessage);
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
