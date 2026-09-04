import React from 'react';
import LoginLogo from '../../../assets/Images/LoginLogo.png';
import Avatar from '../../../assets/Images/Signup/Avatar.png';
import { Shuffle, Pencil, ArrowLeft } from 'lucide-react';

const SignupStep3 = ({ onNext, onBack, onCustomise }) => {
  return (
    <div className="w-[540px] bg-white bg-opacity-95 px-16 py-8 rounded shadow-md font-sans relative">
      {/* Back button */}
      <div
        className="absolute top-5 left-5 p-2 rounded-full cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 transition-all"
        onClick={onBack}
      >
        <ArrowLeft size={20} />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <img src={LoginLogo} alt="Infinito" className="w-[180px] mt-2" />

        <h2 className="text-xl font-semibold text-center text-[#1f1f1f]">Create your character!</h2>
        <p className="text-sm text-center text-gray-600">
          Complete your profile to enjoy this community to the fullest. It only takes 2 steps.
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-20 h-1 bg-red-600" />
          <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-bold">1</div>
          <div className="w-20 h-1 bg-gray-300" />
          <div className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 text-gray-400 text-sm font-semibold">2</div>
        </div>

        {/* Character preview */}
        <div className="flex items-center justify-center py-4">
          <img src={Avatar} alt="Character" className="h-44 object-contain" />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 w-full justify-center mt-2">
          <button
            onClick={() => {
              // Randomise just goes to next with random preset
              onNext({ randomised: true });
            }}
            className="flex items-center gap-2 border-2 border-[#DD1215] text-[#DD1215] px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition"
          >
            <Shuffle size={14} />
            Randomise
          </button>
          <button
            onClick={onCustomise}
            className="flex items-center gap-2 border-2 border-[#DD1215] text-[#DD1215] px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition"
          >
            <Pencil size={14} />
            Customise
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between w-full mt-6">
          <button
            onClick={onBack}
            className="text-xs font-bold uppercase tracking-widest text-gray-600 hover:underline"
          >
            Back
          </button>
          <button
            onClick={() => onNext({ randomised: false })}
            className="bg-[#DD1215] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition"
          >
            Continue &rsaquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupStep3;
