import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import LoginBackground from '../../../assets/Images/LoginBackground.jpg';
import LoginLogo from '../../../assets/Images/LoginLogo.png';
import Bullet from '../../../assets/Images/Bullet.png';
import Riza from '../../../assets/Images/Riza Jose.png';
import { forgetPasswordFunc } from '../../services/userServices.js';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';

const inputClass = "w-full px-4 py-2 border border-gray-400 text-sm text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200";
const btnClass = "w-full bg-[#DD1215] text-white font-bold text-[11px] uppercase tracking-widest py-2 shadow-md hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

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
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full h-screen relative overflow-hidden font-sans">
        {/* Background — matches login/signup */}
        <div className="absolute inset-0 z-0 flex flex-col">
          <div className="h-[70%] w-full relative">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${LoginBackground})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, #310303, #000000)',
                opacity: 0.7,
              }}
            />
          </div>
          <div
            className="h-[30%] w-full"
            style={{ background: 'linear-gradient(to bottom, #111111, #663939)' }}
          />
        </div>

        {/* Side characters */}
        <img
          src={Bullet}
          alt="Bullet"
          className="absolute bottom-0 h-[80vh] z-40 object-contain pointer-events-none hidden lg:block"
          style={{ left: 'calc(50% - 620px)' }}
        />
        <img
          src={Riza}
          alt="Riza"
          className="absolute bottom-0 h-[80vh] z-40 object-contain pointer-events-none hidden lg:block"
          style={{ right: 'calc(50% - 620px)' }}
        />

        {/* Card */}
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="w-[480px] bg-white bg-opacity-95 px-12 py-10 rounded shadow-md font-sans">

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={LoginLogo} alt="Infinito" className="w-[180px] object-contain" />
            </div>

            {/* Title block */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                {stepTitles[step - 1]}
              </h2>
              <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                {stepSubtitles[step - 1]}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full border-2 transition-all ${
                    s === step
                      ? 'bg-[#DD1215] border-[#DD1215]'
                      : s < step
                      ? 'bg-gray-400 border-gray-400'
                      : 'bg-white border-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Step 1 — Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div>
                  <label className="text-[#DD1215] text-[12px] font-semibold uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    required placeholder="superhero@example.com"
                    className={inputClass + " mt-1"}
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass + " mt-2"}>
                  {loading ? 'Sending…' : 'Send OTP >'}
                </button>
              </form>
            )}

            {/* Step 2 — OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div>
                  <label className="text-[#DD1215] text-[12px] font-semibold uppercase tracking-wide">
                    Enter OTP
                  </label>
                  <input
                    type="text" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required placeholder="6-digit code" maxLength={6}
                    className={inputClass + " mt-1 text-center tracking-[0.4em] text-lg font-semibold"}
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass + " mt-2"}>
                  {loading ? 'Verifying…' : 'Verify OTP >'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); }}
                  className="text-[11px] text-[#DD1215] font-semibold uppercase tracking-widest hover:underline text-center"
                >
                  ← Resend OTP
                </button>
              </form>
            )}

            {/* Step 3 — New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div>
                  <label className="text-[#DD1215] text-[12px] font-semibold uppercase tracking-wide">
                    New Password
                  </label>
                  <input
                    type="password" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required placeholder="Enter new password"
                    className={inputClass + " mt-1"}
                  />
                </div>
                <div>
                  <label className="text-[#DD1215] text-[12px] font-semibold uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <input
                    type="password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required placeholder="Confirm new password"
                    className={inputClass + " mt-1"}
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass + " mt-2"}>
                  {loading ? 'Resetting…' : 'Reset Password >'}
                </button>
              </form>
            )}

            {/* Back to login */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/login')}
                className="text-[11px] text-gray-400 hover:text-gray-600 font-semibold uppercase tracking-widest hover:underline"
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
