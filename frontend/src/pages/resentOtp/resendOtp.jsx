import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { verifyEmail } from "../../services/userServices";

const OTPVerification = () => {
  console.log("hi in verify otp");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeInput, setActiveInput] = useState(0);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Focus management
  useEffect(() => {
    if (inputRefs.current[activeInput]) {
      inputRefs.current[activeInput].focus();
    }
  }, [activeInput]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus to next input if digit entered
    if (value && index < 5) {
      setActiveInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setActiveInput(index - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split("");
      const newOtp = [...otp];
      pasteArray.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      setActiveInput(5);
    }
  };

  const validateOTP = () => {
    const otpString = otp.join("");
    if (!/^\d{6}$/.test(otpString)) {
      setError("Please enter a valid 6-digit OTP");
      return false;
    }
    return true;
  };

const handleSubmit = async () => {
  if (!validateOTP()) return;

  setIsSubmitting(true);

  try {
    const code = otp.join(""); // Join OTP digits into string
    const response = await verifyEmail(code); // ✅ await added

    if (response.data.success) {
      toast.success("OTP verified successfully!");
      setTimeout(() => {
        navigate("/signup?step=3");
      }, 1000);
    } else {
      toast.error(response.data.message || "OTP verification failed.");
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    toast.error(
      error.response?.data?.message ||
        "Something went wrong while verifying the OTP."
    );
  } finally {
    setIsSubmitting(false);
  }
};




  const handleResend = () => {
    setTimeLeft(30);
    setOtp(["", "", "", "", "", ""]);
    setActiveInput(0);
    setError("");
    // Simulate resend API call
    toast.success("New OTP has been sent to your device"); // Use toast instead of alert
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" /> {/* Add this line */}
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Verify your identity
          </h2>
          <p className="mt-2 text-gray-600">
            We've sent a 6-digit code to your device
          </p>
        </div>

        <div className="mt-8">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => setActiveInput(index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-2xl font-bold text-center border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                  activeInput === index
                    ? "ring-2 ring-[#d31c1f] border-[#F9090F] "
                    : error
                    ? "border-red-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mt-4 text-center text-red-500 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`mt-8 w-full py-3 px-4 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-[#dd1014] hover:bg-[#F9090F] focus:ring-[#F9090F]"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Didn't receive the code?{" "}
              {timeLeft > 0 ? (
                <span className="text-gray-500 font-medium">
                  Resend in 00:{timeLeft.toString().padStart(2, "0")}
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-blue-600 font-medium hover:text-blue-800 focus:outline-none focus:underline"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
