import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { verifyEmail } from "../../services/userServices";
import { useSelector } from "react-redux";
import LoginLogo from "../../../assets/Images/LoginLogo.png";
import LoginBackground from "../../../assets/Images/LoginBackground.jpg";
import Bullet from "../../../assets/Images/Bullet.png";
import Riza from "../../../assets/Images/Riza Jose.png";
import { MailCheck } from "lucide-react";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeInput, setActiveInput] = useState(0);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  // Focus active input
  useEffect(() => {
    if (inputRefs.current[activeInput]) {
      inputRefs.current[activeInput].focus();
    }
  }, [activeInput]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) setActiveInput(index + 1);
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
      const digits = pasteData.split("");
      setOtp(digits);
      setActiveInput(5);
    }
  };

  const validateOTP = () => {
    const otpString = otp.join("");
    if (!/^\d{6}$/.test(otpString)) {
      setError("Please enter a valid 6-digit code.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateOTP()) return;
    setIsSubmitting(true);
    try {
      const code = otp.join("");
      const response = await verifyEmail(code);
      if (response.data.success) {
        toast.success("Email verified! Let's create your avatar.");
        setTimeout(() => {
          navigate("/signup?step=3");
        }, 1200);
      } else {
        toast.error(response.data.message || "Verification failed. Try again.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
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
    toast.success("A new code has been sent to your email.");
  };

  // Mask the email for display: e.g. "ab***@gmail.com"
  const maskedEmail = user?.email
    ? user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : "your email";

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans">
      {/* Background — matches SignupWrapper */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-[70%] w-full relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${LoginBackground})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, #310303, #000000)",
              opacity: 0.7,
            }}
          />
        </div>
        <div
          className="h-[30%] w-full"
          style={{ background: "linear-gradient(to bottom, #111111, #663939)" }}
        />
      </div>

      {/* Side characters */}
      <img
        src={Bullet}
        alt="Bullet"
        className="absolute bottom-0 h-[80vh] z-40 object-contain pointer-events-none hidden lg:block"
        style={{ left: "calc(50% - 620px)" }}
      />
      <img
        src={Riza}
        alt="Riza"
        className="absolute bottom-0 h-[80vh] z-40 object-contain pointer-events-none hidden lg:block"
        style={{ right: "calc(50% - 620px)" }}
      />

      {/* Card */}
      <div className="absolute inset-0 z-50 flex items-center justify-center">
        <div className="w-[480px] bg-white bg-opacity-95 px-12 py-10 rounded shadow-md">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <img src={LoginLogo} alt="Infinito" className="w-[180px]" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-[#DD1215]">
                <MailCheck size={24} />
              </div>
              <h2 className="text-xl font-semibold text-[#1f1f1f] mt-1">
                Verify your email
              </h2>
              <p className="text-[12px] text-gray-500 text-center">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-gray-700">{maskedEmail}</span>
                <br />
                Enter it below to continue.
              </p>
            </div>
          </div>

          {/* Step indicator — step 2 of 2 (email verify after profile setup) */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-20 h-1 bg-red-600" />
            <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-bold">
              1
            </div>
            <div className="w-20 h-1 bg-red-600" />
            <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-bold">
              2
            </div>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 mb-2">
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
                className={`w-11 h-13 text-xl font-bold text-center border-2 rounded focus:outline-none transition-all py-3
                  ${
                    activeInput === index
                      ? "border-[#DD1215] bg-red-50 text-[#DD1215]"
                      : error
                      ? "border-red-400 bg-red-50"
                      : digit
                      ? "border-green-500 bg-green-50 text-gray-800"
                      : "border-gray-300 hover:border-gray-400 text-gray-800"
                  }`}
              />
            ))}
          </div>

          {/* Inline error */}
          <div className="h-5 text-center mb-2">
            {error && (
              <p className="text-red-500 text-xs font-medium">{error}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-2 uppercase text-[11px] font-bold tracking-widest shadow-md transition-all duration-200 mt-1
              ${
                isSubmitting
                  ? "bg-red-300 cursor-not-allowed text-white"
                  : "bg-[#DD1215] text-white hover:bg-red-700 hover:scale-[1.02] hover:shadow-lg"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying…
              </span>
            ) : (
              "Verify & Continue ›"
            )}
          </button>

          {/* Resend */}
          <div className="mt-5 text-center">
            <p className="text-gray-500 text-[12px]">
              Didn't receive the code?{" "}
              {timeLeft > 0 ? (
                <span className="text-gray-400 font-medium">
                  Resend in 00:{timeLeft.toString().padStart(2, "0")}
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-[#DD1215] font-semibold hover:underline focus:outline-none"
                >
                  Resend code
                </button>
              )}
            </p>
          </div>

          {/* Back to signup */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/signup")}
              className="text-[11px] text-gray-400 hover:text-gray-600 uppercase tracking-widest font-semibold hover:underline"
            >
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
