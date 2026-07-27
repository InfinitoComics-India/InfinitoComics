import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { resetPasswordFunc } from '../../services/userServices';
import bgImage from '../../../assets/Images/backgroundImg.jpg';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // 👈 Eye icons

const ResetPassword = () => {
  const { id, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordFunc(id, token, newPassword);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{ backgroundSize: '50px 50px' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000,16px_16px_0px_rgba(0,0,0,0.1)] p-8 relative overflow-hidden text-center">
            <div className="w-50 h-20 mx-auto flex items-center justify-center bg-transparent pb-4">
              <img src="../../../assets/Logo.png" alt="Company Logo" className="h-full object-contain" />
            </div>

            <div className="bg-white border-4 border-black rounded-3xl p-6 mb-8 relative shadow-[4px_4px_0px_rgba(0,0,0,0.1)] text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-3 tracking-wide" style={{ fontFamily: 'Comic Neue, cursive', textShadow: '1px 1px 0px #222222' }}>
                Create New PASSWORD
              </h2>
              <p className="text-gray-700 text-base leading-relaxed font-normal" style={{ fontFamily: 'Comic Neue, cursive' }}>
                Time to set up your new super-secure password! Make it strong and memorable, hero!
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6 relative z-10">
              {/* New Password */}
              <div className="text-left relative">
                <label htmlFor="newPassword" className="block font-bold text-gray-700 mb-2 text-lg uppercase tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                  New Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Superhero@123"
                  className="w-full p-4 border-4 border-black rounded-xl text-base text-center bg-white pr-12 focus:outline-none"
                  style={{ fontFamily: 'Comic Neue, cursive' }}
                />
                <div
                  className="absolute right-6 top-[67%] transform -translate-y-1/2 text-gray-600 cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="text-left relative">
                <label htmlFor="confirmPassword" className="block font-bold text-gray-700 mb-2 text-lg uppercase tracking-wide" style={{ fontFamily: 'Comic Neue, cursive' }}>
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Enter Password to Confirm"
                  className="w-full p-4 border-4 border-black rounded-xl text-base text-center bg-white pr-12 focus:outline-none"
                  style={{ fontFamily: 'Comic Neue, cursive' }}
                />
                <div
                  className="absolute right-6 top-[69%] transform -translate-y-1/2 text-gray-600 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-400 to-red-600 border-4 border-black text-white font-bold text-xl p-4 mb-4 cursor-pointer uppercase tracking-wider shadow-[4px_4px_0px_#000] transition-all duration-100 relative overflow-hidden hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Bangers, cursive', textShadow: '2px 2px 0px #000' }}
              >
                {loading ? 'Resetting...' : 'Reset Password!'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
