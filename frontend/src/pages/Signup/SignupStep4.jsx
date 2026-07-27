import React from 'react';
import LoginLogo from '../../../assets/Images/LoginLogo.png';
import Avatar from '../../../assets/Images/Signup/Avatar.png';
import Shuffle from '../../../assets/Images/Signup/Shuffle.png';
import Pencil from '../../../assets/Images/Signup/Pencil.png';
import { ArrowLeft } from 'lucide-react';

const SignupStep4 = ({ onNext, onBack }) => {
  console.log("step4")
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="relative w-[540px] h-[670px] bg-white bg-opacity-95 px-24 py-10 rounded shadow-md font-sans">
      {/* Back Button */}
      <div
        className="absolute top-5 left-5 p-2 rounded-full cursor-pointer bg-red-100 text-red-700 hover:text-red-600 hover:bg-red-200 transition-all duration-200"
        onClick={onBack}
      >
        <ArrowLeft size={20} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <img src={LoginLogo} alt="Logo" className="w-[200px] m-4" />
        <div className="flex flex-col items-start justify-between mt-[-20px] h-21">
          <h2 className="text-2xl font-semibold text-left text-[#1f1f1f]">
            Create Something Uniquely You!
          </h2>
          <p className="text-sm text-left text-gray-600">
            Complete your profile to enjoy this community to the fullest. It only takes{' '}
            <span className="text-red-600 font-semibold">2</span> steps!
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-34 h-1 bg-red-600" />
          <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-bold">
            1
          </div>
          <div className="w-34 h-1 bg-red-600" />
          <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-semibold">
            2
          </div>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col items-center gap-7 mt-2" onSubmit={handleSubmit}>
          {/* Avatar Image */}
          <img src={Avatar} alt="Avatar" className="h-[200px] object-contain" />

          {/* Randomise & Customise Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              className="flex w-[150px] h-10 items-center gap-2 pl-6 border-2 border-[#DD1215] text-[#DD1215] text-[12px] px-2 py-2 font-semibold hover:bg-red-50 transition"
            >
              <img src={Shuffle} alt="Shuffle" className="w-4 h-4" />
              RANDOMISE
            </button>
            <button
              type="button"
              className="flex w-[150px] h-10 items-center gap-2 pl-6 border-2 border-[#DD1215] text-[#DD1215] text-[12px] px-4 py-2 font-semibold hover:bg-red-50 transition"
            >
              <img src={Pencil} alt="Customise" className="w-4 h-4" />
              CUSTOMISE
            </button>
          </div>

          {/* Continue Button */}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-[100px] bg-red-600 text-white py-2 hover:bg-red-700 transition uppercase text-[10px] tracking-widest"
            >
              Continue &gt;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupStep4;
