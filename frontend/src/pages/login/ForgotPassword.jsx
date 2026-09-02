import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/Images/backgroundImg.jpg';
import { forgetPasswordFunc } from '../../services/userServices.js';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';

const inputClass = "w-full p-4 border-4 border-black rounded-xl text-base md:text-lg text-center bg-white placeholder-gray-500 transition-all duration-300 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] focus:outline-none focus:scale-105";
const btnClass = "w-full bg-red-600 border-2 border-black text-white font-bold text-xl md:text-2xl p-4 cursor-pointer uppercase tracking-wider shadow-[4px_4px_0px_#000] transition-all duration-100 relative overflow-hidden hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1 — Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await forgetPasswordFunc(email);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/verify-otp`, { email, otp });
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/reset-password-otp`, { email, newPassword, confirmPassword });
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['FORGOT PASSWORD?', 'ENTER OTP', 'NEW PASSWORD'];
  const stepSubtitles = [
    "No worries, hero! Enter your email address and we'll send you a super-powered OTP!",
    `We've sent a 6-digit OTP to ${email}. Enter it below to continue.`,
    'Almost there! Set your new super-powered password below.',
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet" />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000,16px_16px_0px_rgba(0,0,0,0.1)] px-6 py-8 md:px-8 text-center relative max-w-xl">

            {/* Logo */}
            <div className="w-50 h-20 mx-auto flex items-center justify-center bg-transparent pb-4">
              <img src="../../../assets/Logo.png" alt="Company Logo" className="h-full object-contain" />
            </div>

            {/* Title card */}
            <div className="bg-white border-4 border-black rounded-3xl p-3 mb-8 relative shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-3 tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                {stepTitles[step - 1]}
              </h2>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed font-normal" style={{ fontFamily: 'Comic Neue, cursive' }}>
                {stepSubtitles[step - 1]}
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map(s => (
                <div key={s} className={`w-3 h-3 rounded-full border-2 border-black ${s === step ? 'bg-red-500' : s < step ? 'bg-gray-400' : 'bg-white'}`} />
              ))}
            </div>

            {/* Step 1 — Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="text-left">
                  <label className="block font-bold text-gray-900 mb-2 text-lg uppercase tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                    Email Address
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="superhero@example.com"
                    className={inputClass} style={{ fontFamily: 'Comic Neue, cursive' }}
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass} style={{ fontFamily: 'Bangers, cursive', textShadow: '4px 4px 0px #000' }}>
                  {loading ? 'Sending...' : 'Send OTP!'}
                </button>
              </form>
            )}

            {/* Step 2 — OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-left">
                  <label className="block font-bold text-gray-900 mb-2 text-lg uppercase tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                    Enter OTP
                  </label>
                  <input
                    type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required placeholder="6-digit OTP" maxLength={6}
                    className={inputClass} style={{ fontFamily: 'Comic Neue, cursive', letterSpacing: '0.3em', fontSize: '1.5rem' }}
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass} style={{ fontFamily: 'Bangers, cursive', textShadow: '4px 4px 0px #000' }}>
                  {loading ? 'Verifying...' : 'Verify OTP!'}
                </button>
                <button type="button" onClick={() => { setStep(1); setOtp(''); }} className="text-red-400 text-base font-bold uppercase tracking-wide hover:text-teal-400 transition-all" style={{ fontFamily: 'Comic Neue, cursive' }}>
                  ← Resend OTP
                </button>
              </form>
            )}

            {/* Step 3 — New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="text-left">
                  <label className="block font-bold text-gray-900 mb-2 text-lg uppercase tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                    New Password
                  </label>
                  <input
                    type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    required placeholder="Enter new password"
                    className={inputClass} style={{ fontFamily: 'Comic Neue, cursive' }}
                  />
                </div>
                <div className="text-left">
                  <label className="block font-bold text-gray-900 mb-2 text-lg uppercase tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    required placeholder="Confirm new password"
                    className={inputClass} style={{ fontFamily: 'Comic Neue, cursive' }}
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass} style={{ fontFamily: 'Bangers, cursive', textShadow: '4px 4px 0px #000' }}>
                  {loading ? 'Resetting...' : 'Reset Password!'}
                </button>
              </form>
            )}

            <div className="text-center mt-6">
              <button onClick={() => navigate('/login')} className="text-red-400 text-xl font-bold uppercase tracking-wide transition-all hover:text-teal-400" style={{ fontFamily: 'Comic Neue, cursive' }}>
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
