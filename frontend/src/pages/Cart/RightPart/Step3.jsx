import React from 'react';
import { useNavigate } from 'react-router-dom';

const Step3 = ({onNext}) => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-3xl mt-[-5rem] mx-auto font-sans w-full">
      {/* Progress Bar */}
      <div className="flex items-center justify-evenly mb-8">
        <div className="flex flex-col items-center text-gray-400">
          <div className="w-8 h-8 flex items-center justify-center border border-gray-400">1</div>
          <span className="mt-2 text-sm text-black">Login</span>
        </div>

        <div className="flex items-center flex-1 mx-2">
          <div className="w-full border-t border-gray-300"></div>
        </div>

        <div className="flex flex-col items-center text-gray-400">
          <div className="w-8 h-8 flex items-center justify-center border border-gray-400">2</div>
          <span className="mt-2 text-sm text-black">Address</span>
        </div>

        <div className="flex items-center flex-1 mx-2">
          <div className="w-full border-t border-gray-300"></div>
        </div>

        <div className="flex flex-col items-center text-red-600">
          <div className="w-8 h-8 flex items-center justify-center border-2 border-red-600">3</div>
          <span className="mt-2 text-sm text-black font-semibold">Payment</span>
        </div>

        <div className="flex items-center flex-1 mx-2">
          <div className="w-full border-t border-gray-300"></div>
        </div>

        <div className="flex flex-col items-center text-gray-400">
          <div className="w-8 h-8 flex items-center justify-center border border-gray-400">4</div>
          <span className="mt-2 text-sm text-black">Order Complete</span>
        </div>
      </div>

      {/* UPI AutoPay Setup */}
      <h2 className="text-2xl font-bold mb-2">Setup UPI AutoPay</h2>
      <p className="mb-6 text-gray-600 text-sm">You can change this recurring payment any time</p>

      {/* Select UPI App */}
      <div
        className="border p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 mb-4"
        onClick={() => alert('Select UPI App clicked')} // Placeholder action
      >
        <span className="text-gray-500">Select Your UPI App</span>
        <span>&gt;</span>
      </div>

      {/* UPI ID Input */}
      <input
        type="text"
        placeholder="UPI ID"
        className="border p-4 w-full mb-6 focus:outline-none"
      />

      {/* Next Button */}
      <button
        onClick={onNext}
        className="bg-red-600 text-white w-full py-3 text-lg tracking-widest"
      >
        NEXT
      </button>
    </div>
  );
};

export default Step3;
