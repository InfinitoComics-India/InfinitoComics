import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Step4 = ({ onNext }) => {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="p-8 max-w-3xl mt-[8rem] mx-auto font-sans w-full">
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
          <span className="mt-2 text-sm text-red-600 font-semibold">Payment</span>
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

      {/* ₹129/month */}
      <div className="border p-4 w-full mb-4 font-semibold text-gray-800">
        ₹129/month
      </div>

      {/* UPI ID with Bank */}
      <div className="border p-4 w-full mb-6 font-semibold text-gray-800">
        ₹129/month<br />
        <span className="text-sm text-gray-500">abc@okhdfcbank</span>
      </div>

      {/* Terms and Conditions */}
      <div className="text-s text-black mb-6">
        By checking the checkbox below, you agree to our <span className="text-blue-500 underline cursor-pointer">Terms of Use</span>, <span className="text-blue-500 underline cursor-pointer">Privacy Statement</span>. Infinito Comics will automatically continue your membership and charge the membership fee (currently <b>₹129/month</b>) to your payment method until you cancel. <b>You may cancel at any time to avoid future charges.</b>
      </div>

      {/* Checkbox */}
<div className="flex items-center mb-6">
  <input
    type="checkbox"
    id="agree"
    checked={isChecked}
    onChange={() => setIsChecked(!isChecked)}
    className="w-5 h-5 accent-red-600 border-red-600 focus:ring-red-500"
  />
  <label htmlFor="agree" className="ml-3 text-sm text-gray-800">I agree.</label>
</div>


      {/* NEXT Button */}
      <button
        onClick={onNext}
        disabled={!isChecked}
        className={`w-full py-3 text-lg tracking-widest ${
          isChecked ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        NEXT
      </button>
    </div>
  );
};

export default Step4;
