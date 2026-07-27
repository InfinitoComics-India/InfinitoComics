import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const page5 = ({ onBack, onNext }) => {
  const navigate = useNavigate();
  const [isDefault, setIsDefault] = useState(false);

  return (
    <div className=" mt- p-8 max-w-3xl mt-[14rem] mx-auto font-sans w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Add New Address</h2>
        <button onClick={onBack}>
          <X className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Use Current Location */}
      <button className="bg-red-600 text-white w-full py-3 mb-6 text-sm tracking-widest">
        USE CURRENT LOCATION
      </button>

      {/* Address Form */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input type="text" placeholder="Sujal" className="border flex-1 p-3" />
          <input type="text" placeholder="Karande" className="border flex-1 p-3" />
        </div>

        <input type="text" placeholder="House No., Building Name*" className="border p-3" />
        <input type="text" placeholder="Street Name, Area*" className="border p-3" />
        <input type="text" placeholder="Landmark" className="border p-3" />

        <div className="flex gap-4">
          <input type="text" placeholder="Postal Code*" className="border flex-1 p-3" />
          <input type="text" placeholder="City/District*" className="border flex-1 p-3" />
        </div>

        <div className="flex gap-4">
          <input type="text" value="India" readOnly className="border flex-1 p-3 bg-gray-100 text-gray-500" />
          <input type="text" placeholder="State" className="border flex-1 p-3" />
        </div>

        <div className="flex gap-4">
          <input type="text" value="+91" readOnly className="border w-20 p-3 bg-gray-100 text-gray-500" />
          <input type="text" placeholder="1234567890" className="border flex-1 p-3" />
        </div>

        {/* Checkbox */}
        <div className="flex items-center mt-4 mb-6">
          <input
            type="checkbox"
            id="default"
            checked={isDefault}
            onChange={() => setIsDefault(!isDefault)}
            className="w-5 h-5 accent-red-600 border-red-600 focus:ring-red-500"
          />
          <label htmlFor="default" className="ml-3 text-sm text-gray-800">Make this my default address</label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-4">
        <button
          onClick={onBack}
          className="border px-8 py-3 text-sm"
        >
          CANCEL
        </button>

        <button
          onClick={onNext}
          className={`px-8 py-3 text-sm tracking-widest ${
            isDefault ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isDefault}
        >
          SAVE
        </button>
      </div>
    </div>
  );
};

export default page5;
