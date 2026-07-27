import React from 'react';
import { useNavigate } from 'react-router-dom';
import cartUrls from '../../../utils/imagesUrls/cartUrls.js'; // Import the URLs from the constants file

const Step2 = ({ onNext }) => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-3xl mt-[-10rem] mx-auto font-sans w-full">
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

      {/* Payment Heading */}
      <h2 className="text-2xl font-bold mb-2">Add a payment method</h2>
      <p className="mb-6 text-gray-600 text-sm">It will be used immediately to process payment</p>

      {/* Payment Options */}
      <div className="flex flex-col gap-4">
        {/* Credit/Debit Card */}
        <div
          className="border p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => navigate('/order-complete')}
        >
          <div className="flex items-center gap-4">
            <span className="font-medium">Credit or Debit Card</span>
            <img src={cartUrls.VISA_URL} alt="Visa" className="h-5" />
            <img src={cartUrls.MASTERCARD_URL} alt="Mastercard" className="h-5" />
          </div>
          <span>&gt;</span>
        </div>

        {/* UPI AutoPay */}
        <div
          className="border p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={onNext}
        >
          <div className="flex items-center gap-4">
            <span className="font-medium">UPI AutoPay</span>
            <img src={cartUrls.UPI_URL} alt="UPI" className="h-4" />
          </div>
          <span>&gt;</span>
        </div>
      </div>
    </div>
  );
};

export default Step2;
