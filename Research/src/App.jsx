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
function App() {
   const dispatch = useDispatch();

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const fromMain = urlParams.get("from");

  if (fromMain === "main" && window.opener) {
    console.log(" Requesting user from main app");
    window.opener.postMessage("request-user", `${FRONTEND_BASE_URL}`);

    const handleMessage = (event) => {
      if (event.origin !== `${FRONTEND_BASE_URL}`) return;

      if (event.data?.type === "user-data") {
        try {
          const userData = JSON.parse(event.data.payload);
          dispatch(addUser(userData));
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("Got user from 3001:", userData);
        } catch (err) {
          console.error("Failed to parse user", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Proper cleanup
    return () => window.removeEventListener("message", handleMessage);
  }
}, [dispatch]);

  
  return (

   <BrowserRouter basename="/" >
    <Routes>
      <Route path="/" element={<Body/>} >
      <Route path="/" element={<Home/>} />
      <Route path="ResearchPlans" element={<ResearchPlans/>} />
      <Route path="readresearch/:id" element={<ReadResearch />} />
      <Route path="/browseResearch" element={<Paper/>} />
      
      </Route>
    </Routes>
   </BrowserRouter>
  );

}

export default App;
