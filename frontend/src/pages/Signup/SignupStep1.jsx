import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import LoginLogo from '../../../assets/Images/LoginLogo.png';
import ASignup from '../../../assets/Images/Signup/ASignup.png';
import FSignup from '../../../assets/Images/Signup/FSignup.png';
import GSignup from '../../../assets/Images/Signup/Gsignup.png';
import { Link } from 'react-router-dom';

const SignupStep1 = ({ formData, handleChange, onNext }) => {
    console.log("step1")

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return passwordRegex.test(password);
  };

  const handleInputChange = (field, value) => {
    handleChange(field, value);
    
    // Real-time validation
    if (field === 'email' && touched.email) {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value) ? '' : 'Please enter a valid email address.'
      }));
    }
    
    if (field === 'password' && touched.password) {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(value) ? '' : 'Must include Uppercase, Lowercase, Number & Symbol'
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(formData.email) ? '' : 'Please enter a valid email address.'
      }));
    }
    
    if (field === 'password') {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(formData.password) ? '' : 'Must include Uppercase, Lowercase, Number & Symbol'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!validatePassword(formData.password)) {
      newErrors.password =
        'Must include Uppercase, Lowercase, Number & Symbol';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (isValid) {
      onNext();
    }
  };

  const getInputBorderClass = (field) => {
    if (errors[field]) return 'border-red-500 bg-red-50';
    if (touched[field] && formData[field] && !errors[field]) return 'border-green-500 bg-green-50';
    return 'border-gray-400';
  };

  const getValidationIcon = (field) => {
    if (errors[field]) return <AlertCircle size={16} className="text-red-500" />;
    if (touched[field] && formData[field] && !errors[field]) return <CheckCircle size={16} className="text-green-500" />;
    return null;
  };

  return (
    <div className="w-[540px] h-[670px] bg-white bg-opacity-95 py-10 px-24 rounded shadow-md">
      <div className="flex flex-col items-center gap-4">
        <img src={LoginLogo} alt="Logo" className="w-[200px] m-4" />

        <div className="flex flex-col items-start justify-evenly w-full mt-[-10px] h-20">
          <h2 className="font-semibold text-[27px]">Sign-up to our universe</h2>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link className="text-[#0090FF] font-medium cursor-pointer" to="/login">
              Log-in
            </Link>
          </p>
        </div>

        <div className="flex justify-center gap-4">
          {[GSignup, FSignup, ASignup].map((imgSrc, idx) => (
            <div key={idx} className="w-11 h-11 flex justify-center items-center cursor-pointer hover:shadow border-black transition-shadow duration-200">
              <img src={imgSrc} alt={`signup-icon-${idx}`} className="w-full h-full object-contain p-1" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center w-full mt-1">
          <hr className="w-[80px] border-gray-300 border-t-[1.5px]" />
          <span className="mx-2 text-gray-400 text-xs font-semibold">OR</span>
          <hr className="w-[80px] border-gray-300 border-t-[1.5px]" />
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-1 mb-1 mt-2">
          {/* Email Field */}
          <div className="relative">
            <label className="text-[#DD1215] text-[12px] font-semibold">Register an email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="Please type your email here"
                className={`w-full border text-[12px] text-gray-500 px-4 py-2 pr-10 font-semibold transition-all duration-200 ${getInputBorderClass('email')}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon('email')}
              </div>
            </div>
            {/* Fixed height container for error message */}
            <div className="h-3 mt-1">
              <p className={`text-red-500 text-xs transition-opacity duration-200 ${errors.email ? 'opacity-100' : 'opacity-0'}`}>
                {errors.email || ' '}
              </p>
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <label className="text-[#DD1215] text-[12px] font-semibold">Create a password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`w-full border text-[12px] text-gray-500 px-4 py-2 pr-16 font-semibold transition-all duration-200 ${getInputBorderClass('password')}`}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {getValidationIcon('password')}
                <div
                  className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </div>
              </div>
            </div>
            {/* Fixed height container for error message */}
            <div className="h-3 mt-1">
              <p className={`text-red-500 text-xs transition-opacity duration-200 ${errors.password ? 'opacity-100' : 'opacity-0'}`}>
                {errors.password || ' '}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm mt-2">
            <label className="flex items-center gap-3">
  <input
    type="checkbox"
    checked={formData.newsLetter} // Controlled by formData
    onChange={(e) => handleInputChange('newsLetter', e.target.checked)}
    className="w-5 h-5 accent-[#DD1215] transition-transform duration-200 hover:scale-105"
  />
  <span className="text-[#666666] text-[12px] font-semibold">Sign-up to our newsletter!</span>
</label>


            <label className="flex items-center gap-3">
              <input type="checkbox" required className="w-5 h-5 accent-[#DD1215] transition-transform duration-200 hover:scale-105" />
              <span className="text-[#666666] text-[12px] font-semibold">
                I agree to the <span className="text-[#0090FF] cursor-pointer hover:underline transition-all duration-200">Terms of Use</span>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-[100px] py-2 uppercase mt-7 text-[10px] tracking-widest shadow-md transition-all duration-200 ${
                isSubmitting
                  ? 'bg-red-300 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 hover:shadow-lg'
              }`}
            >
              Continue &gt;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupStep1;