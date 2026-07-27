import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/Images/backgroundImg.jpg';
import { forgetPasswordFunc } from '../../services/userServices.js'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log("sending the mail");
      const user = await forgetPasswordFunc(email);
      console.log(user);
      toast.success('Reset link sent to your email!');
      console.log('Reset link sent to:', user?.email);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{ backgroundSize: '50px 50px' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-md mx-4 ">
          <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000,16px_16px_0px_rgba(0,0,0,0.1)] px-6 py-8 md:px-8 text-center relative max-w-xl">

            <div className="w-50 h-20 mx-auto flex items-center justify-center bg-transparent pb-4">
              <img
                src="../../../assets/Logo.png"
                alt="Company Logo"
                className="h-full object-contain "
              />
            </div>

            <div className="bg-white border-4 border-black rounded-3xl p-3 mb-8 relative shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-white"></div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-3 tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                FORGOT PASSWORD?
              </h2>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed font-normal" style={{ fontFamily: 'Comic Neue, cursive' }}>
                No worries, hero! Enter your email address and we'll send you a super-powered reset link!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="text-left">
                <label htmlFor="email" className="block font-bold text-gray-900 mb-2 text-lg md:text-xl uppercase tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="superhero@example.com"
                  className="w-full p-4 border-4 border-black rounded-xl text-base md:text-lg text-center bg-white placeholder-gray-500 transition-all duration-300 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] focus:outline-none focus:scale-105"
                  style={{ fontFamily: 'Comic Neue, cursive' }}
                />
                {emailError && <div className="text-red-600 text-sm mt-2 font-semibold">{emailError}</div>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 border-2 border-black text-white font-bold text-xl md:text-2xl p-4 cursor-pointer uppercase tracking-wider shadow-[4px_4px_0px_#000] transition-all duration-100 relative overflow-hidden hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Bangers, cursive', textShadow: '4px 4px 0px #000' }}
              >
                {loading ? 'Sending...' : 'Send Reset Email!'}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={showLogin}
                className="text-red-400 text-xl font-bold uppercase tracking-wide transition-all duration-300 hover:text-teal-400 "
                style={{ fontFamily: 'Comic Neue, cursive' }}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
