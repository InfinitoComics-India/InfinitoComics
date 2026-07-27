import React from 'react';

const Step1 = ({ onNext }) => {
  return (
    <div className="p-8 max-w-3xl mx-auto font-sans w-full">
{/* Progress Bar */}
<div className="flex items-center justify-evenly mb-8">
  <div className="flex flex-col items-center text-gray-400">
    <div className="w-8 h-8 flex items-center justify-center border border-gray-400">1</div>
    <span className="mt-2 text-sm text-black">Login</span>
  </div>

  <div className="flex-1 border-t border-gray-300 mx-2"></div>

  <div className="flex flex-col items-center text-red-600">
    <div className="w-8 h-8 flex items-center justify-center border-2 border-red-600">2</div>
    <span className="mt-2 text-sm text-black font-semibold">Address</span>
  </div>

  <div className="flex-1 border-t border-gray-300 mx-2"></div>

  <div className="flex flex-col items-center text-gray-400">
    <div className="w-8 h-8 flex items-center justify-center border  border-gray-400">3</div>
    <span className="mt-2 text-sm text-black">Payment</span>
  </div>

  <div className="flex-1 border-t border-gray-300 mx-2"></div>

  <div className="flex flex-col items-center text-gray-400">
    <div className="w-8 h-8 flex items-center justify-center border border-gray-400">4</div>
    <span className="mt-2 text-sm text-black">Order Complete</span>
  </div>
</div>

      {/* Delivery To */}
      <h2 className="text-2xl font-bold mb-6">Delivery To</h2>

      <div className="flex gap-6 mb-10">
        {/* Address Card */}
        <div className="border p-4 w-1/2 relative">
          <div className="absolute top-4 right-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-bold">Sujal Karande</h3>
          <p className="text-sm mt-2">1/234 Lorem Ipsum<br />
            Lorem ipsum dolor sit amet consectetur adipiscing elit.<br />
            Mumbai – 123456<br />
            Mobile: <span className="font-bold">1234567890</span></p>

          <div className="flex gap-4 mt-4">
            <button className="border border-black px-4 py-1 text-sm">EDIT</button>
            <button className="border border-black px-4 py-1 text-sm">REMOVE</button>
          </div>
        </div>

        {/* Add New Address */}
        <div className="border p-4 w-1/2 flex items-center justify-center cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center text-gray-500">
            <div className="w-8 h-8 bg-gray-300 mb-3 text-3xl flex items-center justify-center">+</div>

            <span>Add New Address</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button onClick={onNext} className="bg-red-600 text-white w-full py-3 text-lg tracking-widest">
        CONTINUE TO CHECK-OUT
      </button>
    </div>
  );
};

export default Step1;
