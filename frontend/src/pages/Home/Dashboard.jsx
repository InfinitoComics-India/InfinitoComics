import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../../redux/userSlice.js";
import { FaLeaf, FaArrowRight } from "react-icons/fa";
import { BASE_URL } from "../../utils/constants.js";

// Import images from local assets
import comicImg from "../../../assets/Images/captainMarvel.png";
import Avatar from "../../../assets/Images/Signup/Avatar.png";

const ToggleRow = ({ label }) => {
  const [enabled, setEnabled] = useState(true); // Default: ON
  return (
    <div className="flex items-center justify-between pl-2 pr-4 py-2 border-b">
      <span className="font-medium text-sm">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-400 peer peer-checked:bg-red-600 transition-colors"></div>
        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 transition-transform peer-checked:translate-x-5"></div>
      </label>
    </div>
  );
};

const MyAccountPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    username: "",
    email: ""
  });

  useEffect(() => {
    // Get user data from localStorage when component mounts
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) {
      setUserData({
        username: user.username || "russian_loki",
        email: user.email || "user@example.com"
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if(confirmLogout){
      await axios.post(`${BASE_URL}/api/logout`, {}, { withCredentials: true });
      dispatch(removeUser()); // ✅ Clears Redux + localStorage
      navigate("/login");
      }
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="bg-white px-12 pt-8 pb-16 font-sans text-black min-h-screen w-full max-w-[1280px] mx-auto">
      <div className="text-2xl font-black tracking-widest mb-8 text-left">
        MY ACCOUNT
      </div>

      <div className="flex flex-row gap-8 items-start w-full">
        {/* Left Profile Panel */}
        <div className="border border-gray-300 p-6 flex flex-col items-center w-64 min-w-[256px] bg-white">
          <img src={Avatar} alt="Avatar" className="w-28 h-28 mb-6" />
          <div className="w-full flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{userData.username}</span>
            <button className="ml-2 text-gray-400 hover:text-black">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
              </svg>
            </button>
          </div>
          <div className="w-full flex items-center justify-between mb-4">
            <span className="font-semibold text-base truncate">
              {userData.username}
            </span>
          </div>
          <div className="w-full flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{userData.email}</span>
            <button className="ml-2 text-gray-400 hover:text-black">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
              </svg>
            </button>
          </div>
          <div className="w-full flex items-center justify-between">
            <span className="font-semibold text-base truncate">
              {userData.email}
            </span>
          </div>
        </div>

        {/* Right Main Section */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Subscription Plan */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold tracking-wide">
                My subscription plan
              </h2>
              <button className="text-2xl text-gray-400 hover:text-black font-light leading-none">
                ×
              </button>
            </div>
            <div className="bg-pink-100 border border-pink-200 px-6 py-4 flex items-center gap-6 relative">
              <div className="flex items-center gap-2">
                <FaLeaf className="text-black text-lg" />
                <span className="font-bold uppercase tracking-widest">FREE</span>
              </div>
              <span className="text-xs text-red-600 font-medium flex-1 text-center">
                Upgrade now and enjoy ad-free, unlimited access!
              </span>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest flex items-center transition-colors rounded-none">
                UPGRADE PLAN <FaArrowRight className="ml-2 text-xs" />
              </button>
            </div>
          </div>

          {/* My Orders */}
          <div className="mb-2">
            <div className="text-base font-bold tracking-wide mb-2">
              My Orders
            </div>
            <div className="flex flex-row gap-4">
              {["TRACK ORDERS", "ORDER HISTORY"].map((item, index) => (
                <div
                  key={index}
                  className="relative w-44 h-32 bg-gray-100 flex-shrink-0"
                >
                  <img
                    src={comicImg}
                    alt={item}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                    <span className="uppercase text-xs tracking-widest flex items-center justify-between w-full">
                      {item} <FaArrowRight className="ml-2 text-xs" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="mb-10">
            <div className="text-lg font-semibold mb-4">Account Settings</div>
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "Subscriptions related mails",
                  stateKey: "subscriptions"
                }
              ].map(({ label, stateKey }) => (
                <ToggleRow key={stateKey} label={label} />
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-row justify-between items-center mt-8">
            <div className="flex gap-4">
              <button
                className="border border-black px-6 py-2 text-xs tracking-widest font-bold uppercase rounded-none transition hover:bg-gray-100 flex items-center group"
                onClick={() => {
                  navigate("/feedback");
                }}
              >
                GIVE FEEDBACK{" "}
                <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="border border-black px-6 py-2 text-xs tracking-widest font-bold uppercase rounded-none transition hover:bg-gray-100 flex items-center group"
                onClick={() => {
                  navigate("/ErrorReport");
                }}
              >
                SUPPORT US{" "}
                <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="border border-red-600 text-red-600 px-6 py-2 text-xs tracking-widest font-bold uppercase rounded-none transition hover:bg-red-600 hover:text-white flex items-center group"
                onClick={handleLogout}
              >
                LOG OUT{" "}
                <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <button className="text-xs tracking-widest text-gray-500 hover:text-red-600 transition font-bold uppercase ml-8">
              DELETE MY ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
