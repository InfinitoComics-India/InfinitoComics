import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Shuffle, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LoginLogo from '../../../assets/Images/LoginLogo.png';
import { signUpUser } from '../../services/userServices';
import { addUser } from '../../redux/userSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignupStep2 = ({ formData, handleChange, onNext, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ name: '', dob: '', username: '' });
  const [touched, setTouched] = useState({ name: false, dob: false, username: false });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dateInputRef = useRef();

  const validateUsername = (username) => /^[0-9a-zA-Z._]{6,30}$/.test(username.trim().replace(/\s/g, ''));

  const validateDob = (dob) => {
    if (!dob) return false;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(dob)) return false;

    const [year, month, day] = dob.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);

    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) return false;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

    return age >= 0 && birthDate <= today;
  };

  const validateName = (name) => name.trim().length >= 2;

  const handleInputChange = (field, value) => {
    handleChange(field, value);
    if (field === 'username' && touched.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
    if (field === 'dob' && touched.dob) {
      setErrors(prev => ({
        ...prev,
        dob: validateDob(value) ? '' : 'Enter a valid date of birth'
      }));
    }
    if (field === 'name' && touched.name) {
      setErrors(prev => ({
        ...prev,
        name: validateName(value) ? '' : 'Name is required'
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'username') {
      setErrors(prev => ({
        ...prev,
        username: validateUsername(formData.username) ? '' : 'Invalid Username'
      }));
    }
    if (field === 'dob') {
      setErrors(prev => ({
        ...prev,
        dob: validateDob(formData.dob) ? '' : 'Enter a valid date of birth'
      }));
    }
    if (field === 'name') {
      setErrors(prev => ({
        ...prev,
        name: validateName(formData.name) ? '' : 'Enter your full name'
      }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = { name: '', dob: '', username: '' };
    let isValid = true;

    if (!validateName(formData.name)) {
      newErrors.name = 'Enter your full name';
      isValid = false;
    }
    if (!validateDob(formData.dob)) {
      newErrors.dob = 'Enter a valid date of birth ';
      isValid = false;
    }
    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 6-30 characters';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ name: true, dob: true, username: true });

    if (!isValid) return;

    try {
      setIsSubmitting(true);
      const data = await signUpUser(formData);
      dispatch(addUser(data.data));
      toast.success('Successfully signed up!');
      setTimeout(() => {
        onNext(); // This will now go directly to step 5
        navigate('/verifyEmail');
      }, 2000);
      
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong.';
      toast.error(backendMessage);
    } finally {
      setIsSubmitting(false);
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

  const getUsernameValidationClass = (rule) => {
    if (!touched.username || !formData.username) return 'text-[#999999]';
    const isValid =
      rule === 'length'
        ? formData.username.length >= 6 && formData.username.length <= 30
        : /^[0-9a-zA-Z._]*$/.test(formData.username);
    return isValid ? 'text-green-600' : 'text-red-500';
  };

  const getUsernameValidationIcon = (rule) => {
    if (!touched.username || !formData.username) {
      return <AlertCircle size={16} className="text-[#999999] mr-2" />;
    }
    const isValid =
      rule === 'length'
        ? formData.username.length >= 6 && formData.username.length <= 30
        : /^[0-9a-zA-Z._]*$/.test(formData.username);
    return isValid ? <CheckCircle size={16} className="text-green-600 mr-2" /> : <AlertCircle size={16} className="text-red-500 mr-2" />;
  };

  useEffect(() => {
    const generateDefaultUsername = () => {
      const firstName = formData.name.trim().split(' ')[0];
      const randomString = Math.random().toString(36).substring(2, 8);
      return `${firstName}_${randomString}`;
    };

    if (formData.name && !formData.username) {
      handleChange('username', generateDefaultUsername());
    }
  }, [formData.name]);

  return (
    <div className="w-[540px] h-[670px] bg-white bg-opacity-95 px-24 py-10 rounded shadow-md font-sans relative">
      <div className="absolute top-5 left-5 p-2 rounded-full cursor-pointer bg-red-100 text-red-700 hover:text-red-600 hover:bg-red-200 transition-all duration-200" onClick={() => onBack()}>
        <ArrowLeft size={20} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <img src={LoginLogo} alt="Logo" className="w-[200px] m-4" />
        <div className="flex flex-col items-start justify-between mt-[-20px] h-21">
          <h2 className="text-2xl font-semibold text-left text-[#1f1f1f]">Welcome to Infinito</h2>
          <p className="text-sm text-left text-gray-600">
            Complete your profile to enjoy this community to the fullest. Just{' '}
            <span className="text-red-600 font-semibold">1</span> more step!
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="w-34 h-1 bg-red-600" />
          <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-bold">1</div>
          <div className="w-34 h-1 bg-red-600" />
          <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-semibold">2</div>
        </div>

        <form className="w-full flex flex-col gap-1" onSubmit={handleSignup}>
          {/* Name Input */}
          <div>
            <label className="text-[#DD1215] text-[12px] font-semibold">Your Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ashok Kumar"
                className={`w-full border text-[12px] text-gray-500 px-4 py-2 pr-10 font-semibold transition-all duration-200 ${getInputBorderClass('name')}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon('name')}
              </div>
            </div>
            <p className="text-red-500 text-xs mt-1 h-4">{errors.name}</p>
          </div>

          {/* DOB */}
          <div>
            <label className="text-[#DD1215] text-[12px] font-semibold">Your Birthday</label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                className={`custom-date-input w-full border text-[12px] text-gray-500 px-4 py-2 pr-10 font-semibold transition-all duration-200 ${getInputBorderClass('dob')}`}
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                onBlur={() => handleBlur('dob')}
                required
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                  background: 'transparent',
                }}
              />
              <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center gap-2">
                {getValidationIcon('dob')}
                <Calendar className="text-gray-400 cursor-pointer" size={18} onClick={() => dateInputRef.current?.showPicker()} />
              </div>
            </div>
            <p className="text-red-500 text-xs mt-1 h-4">{errors.dob}</p>
            <style>{`
              .custom-date-input::-webkit-calendar-picker-indicator { opacity: 0; display: none; }
              .custom-date-input::-webkit-inner-spin-button, .custom-date-input::-webkit-clear-button { display: none; }
              .custom-date-input { -moz-appearance: textfield; }
              .custom-date-input::-ms-expand { display: none; }
            `}</style>
          </div>

          {/* Username */}
          <div>
            <label className="text-[#DD1215] text-[12px] font-semibold">Create Username*</label>
            <div className="flex mt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Pirana_Fish"
                  className={`w-full border text-[12px] text-gray-500 px-4 py-2 pr-10 font-semibold transition-all duration-200 ${getInputBorderClass('username')}`}
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.replace(/\s/g, ''))}
                  onBlur={() => handleBlur('username')}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon('username')}
                </div>
              </div>
              <div
                className="w-[50%] flex items-center gap-2 bg-[#DD1215] text-white px-3 py-2 cursor-pointer text-xs pl-6 hover:bg-red-700 transition-colors duration-200"
                onClick={() => {
                  const firstName = formData.name.trim().split(' ')[0];
                  const randomString = Math.random().toString(36).substring(2, 8);
                  handleInputChange('username', `${firstName}_${randomString}`);
                }}
              >
                RANDOM
                <Shuffle size={14} />
              </div>
            </div>
            <p className="text-red-500 text-xs mt-1 h-4">{errors.username}</p>
            <ul className="text-[12px] list-none mt-2 space-y-1">
              <li className={`flex items-center ${getUsernameValidationClass('length')}`}>
                {getUsernameValidationIcon('length')}
                Username must be between 6 to 30 characters.
              </li>
              <li className={`flex items-center ${getUsernameValidationClass('characters')}`}>
                {getUsernameValidationIcon('characters')}
                Username must only use letters, underscores, and periods.
              </li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-center mt-7">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-[100px] py-2 uppercase text-[10px] tracking-widest shadow-md transition-all duration-200 ${
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

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover theme="colored" />
    </div>
  );
};

export default SignupStep2;