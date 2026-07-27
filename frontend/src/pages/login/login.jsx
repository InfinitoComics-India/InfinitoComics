import React, { useState } from 'react';
import LoginBackground from '../../../assets/Images/LoginBackground.jpg';
import Bullet from '../../../assets/Images/Bullet.png';
import Riza from '../../../assets/Images/Riza Jose.png';
import { FaGoogle, FaFacebookF, FaApple } from 'react-icons/fa';
import ASignup from '../../../assets/Images/Signup/ASignup.png';
import FSignup from '../../../assets/Images/Signup/FSignup.png';
import GSignup from '../../../assets/Images/Signup/Gsignup.png';
import { Eye, EyeOff } from 'lucide-react';
import LoginLogo from '../../../assets/Images/LoginLogo.png';
import loginBg from '../../../assets/Images/login.png';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/userServices';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addUser } from '../../redux/userSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const data = await loginUser(email, password);
      localStorage.setItem('authtoken', data.token.token);
      dispatch(addUser(data.token.user));
      toast.success('Login successful!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Login failed:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans">
      {/* Background Section */}
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
        <div className="h-[30%] w-full" style={{ background: 'linear-gradient(to bottom, #111111, #663939)' }} />
      </div>

      {/* Characters */}
      {/* <img src={Bullet} alt="Bullet" className="absolute left-56 bottom-8 h-[700px] z-50 object-contain pointer-events-none" />
      <img src={Riza} alt="Riza" className="absolute right-48 bottom-8 h-[700px] z-50 object-contain pointer-events-none" /> */}

      {/* Central Card */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="w-[540px] bg-white bg-opacity-95 px-8 py-10 rounded shadow-md">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Logo */}
            <div className="flex justify-center">
              <img src={LoginLogo} alt="Login Logo" className="w-[160px] object-contain m-5" />
            </div>

            {/* Heading */}
            <div className="flex pl-7 flex-col gap-1 text-left">
              <h2 className="font-semibold text-2xl">Log-in to our universe</h2>
              <p className="text-sm mt-2 text-gray-600">
                Don’t have an account?{' '}
                <Link to="/signup" className="text-blue-600 font-medium">Create one!</Link>
              </p>
            </div>

            {/* Email */}
            <div className="flex flex-col pl-7 gap-1">
              <label className="text-sm text-red-600 font-semibold">Email</label>
              <input
                type="email"
                placeholder="Please type your email here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-7/8 px-4 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 pl-7 relative">
              <label className="text-sm text-red-600 font-semibold">Password</label>
              <div className="relative w-7/8">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-400'} rounded pr-10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                  required
                />
                <div
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 mt-1 ml-1">{error}</p>
              )}
            </div>

            {/* Forgot Password */}
            <Link to="/forgot-password" className="text-sm text-blue-600 cursor-pointer pl-7 text-left">Forgot password?</Link>

            {/* Submit Button */}
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="w-[100px] bg-red-600 text-white py-2 hover:bg-red-700 transition uppercase text-[10px] tracking-widest"
              >
                Continue &gt;
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center w-full mt-1 ">
              <hr className=" w-[80px] border-gray-300" />
              <span className="mx-1 text-gray-400 text-xs font-semibold">OR</span>
              <hr className="w-[80px] border-gray-300" />
            </div>

            {/* Social Logins */}
            <div className="flex justify-center p-4 mt-[-10px] gap-3">
              {[GSignup, FSignup, ASignup].map((iconSrc, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 flex items-center justify-center cursor-pointer hover:shadow"
                >
                  <img
                    src={iconSrc}
                    alt={`social-icon-${idx}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover theme="colored" />
    </div>
  );
};

export default Login;
