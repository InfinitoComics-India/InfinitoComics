import './App.css'
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import appStore from './redux/appStore';
import Body from './components/Body';
import Loggedin from './components/Homepage-loggedin/Body';
import Premium from './components/Homepage-premium/Body';
import Home from '../src/pages/Home/Home';
import Login from './pages/login/login'
import SignupWrapper from './pages/Signup/SignupWrapper';
import News from './pages/News_Blogs/News';
import CareerInternship from './pages/Career&Internships/CareerMain'
import Community from './pages/community/communities'
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';
import DashboardPage from './pages/Home/Dashboard';
import FeedbackForm from './pages/FeedbackForm/Feedback';
import News_Display from './pages/News_Blogs/News_Display';
import SupportUs from './pages/SupportUs/Index.jsx'
import Ultimate from './pages/Infinito Ultimate/Ultimate';
import Jobs from './pages/Career&Internships/jobs'
import AllNewsPage from './pages/News_Blogs/AllNewsDisplayPage';
import OTPVerification from './pages/resentOtp/resendOtp';
import AboutUs from './pages/aboutUs/index.jsx'
import ErrorPage from './pages/ErrorForm/ErrorPage.jsx';
import SignupStep3 from './pages/Signup/SignupStep3';
import Cart from './pages/Cart/Cart';
import Comic from './components/Comics/Comic.jsx'
import ComicsPage from './pages/Comics/ComicsPage.jsx'
import Characters from './pages/Characters/index.jsx'
import Biography from './pages/biography/Index.jsx'
import {Toaster} from 'react-hot-toast'  
import Games from './pages/Games/Games.jsx'
import NotFound from './constants/errorPage/NotFound.jsx'
import NetworkError from './constants/errorPage/NetworkError'
import {RESEARCH_BASE_URL, FOUNDATION_BASE_URL} from './utils/constants.js'
import PrivacyPolicy from './pages/Policy/PrivacyPolicy.jsx';
import RefundPolicy from './pages/Policy/Refund.jsx';
import TermsOfService from './pages/Policy/TermsofUse.jsx';
import TermsOfUse from './pages/Policy/TermsofUse.jsx';
import ComicChap from './components/Comics/ComicChap.jsx'
import ChildrensPrivacyPolicy from './pages/Policy/Children.jsx';
import AntiHarassmentPolicy from './pages/Policy/AntiHarassment.jsx';

function App() {
  useEffect(() => {
    const listener = (event) => {
      const allowedOrigins = [`${RESEARCH_BASE_URL}`, `${FOUNDATION_BASE_URL}`];
      if (!allowedOrigins.includes(event.origin)) return;

      if (event.data === "request-user") {
        const user = localStorage.getItem("user");
        if (user) {
          event.source.postMessage(
            { type: "user-data", payload: user },
            event.origin
          );
          console.log(" Sent user to:", event.origin, user);
        }
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NetworkError />;
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Provider store={appStore}>

      <BrowserRouter basename="/">
      <Routes>
        
        <Route path="/"  element={<Body/>} > 
          <Route path="/"  element={<Home/>} />
          <Route path="/login"  element={<Login/>} />
          <Route path="/loggedin"  element={<Loggedin/>} />
          <Route path="/Premium"  element={<Premium/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />    
          <Route path="/characters" element={<Characters/>} />    
          <Route path="/characters/biography" element={<Biography/>} />    
           <Route path="/aboutUS" element={<AboutUs />} />
          <Route path="/Feedback" element={<FeedbackForm/>} /> 
          <Route path="/Dashboard" element={<DashboardPage/>} /> 
          <Route path="/Reset-password" element={<ResetPassword/>} />
          <Route path="/signup"  element={<SignupWrapper/>} />
          <Route path="/news" element = {<News/>} />
           <Route path="/news/:id" element = {<News_Display/>} /> 
           <Route path="/"  element={<Home/>} />
            <Route path="/login"  element={<Login/>} />
             <Route path="/loggedin"  element={<Loggedin/>} />
           <Route path="/Premium"  element={<Premium/>} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />    
            <Route path="/Feedback" element={<FeedbackForm/>} /> 
            <Route path="/Dashboard" element={<DashboardPage/>} /> 
            <Route path="/Reset-password" element={<ResetPassword/>} />
           <Route path="/signup"  element={<SignupWrapper/>} />
           <Route path="/careers" element={<CareerInternship/>} />
           <Route path="/careers/apply" element={<Jobs/>} />
           <Route path="/community" element={<Community/>} />
           <Route path="/support-us" element={<SupportUs />} />
           <Route path="/ultimate" element={<Ultimate/>} />
            <Route path="/all-news" element={<AllNewsPage />} />
            <Route path="/verifyEmail" element={<OTPVerification/>}/>


            <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path ="/ErrorReport" element={<ErrorPage/>}/>

            <Route path="/createAvatar" element={<SignupStep3/>}/>
            <Route path="/cart" element={<Cart/>}/>
            <Route path="/comics" element={<ComicsPage/>}/>
            <Route path="/comicChap/:comicId/chapters" element={<ComicChap></ComicChap>}></Route>
            <Route path="/comicChap/:comicId/chapters/pdfView" element={<ComicChap></ComicChap>}></Route>
            <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
            <Route path='/games' element={<Games></Games>}></Route>

            <Route path="/characters" element={<Community/>} />
            <Route path="/animation" element={<Community/>} />
            <Route path="/shop" element={<Community/>} />\
            <Route path="/children-privacy-policy" element={<ChildrensPrivacyPolicy/>}></Route>
            <Route path="/anti-harassment" element={<AntiHarassmentPolicy/>}></Route>
            <Route path='/terms-of-use' element={<TermsOfUse/>}></Route>
            <Route path="*" element={<NotFound></NotFound>}></Route>


            
            </Route>
          </Routes>
        </BrowserRouter>

      </Provider>
    </>
  );
}

export default App;
