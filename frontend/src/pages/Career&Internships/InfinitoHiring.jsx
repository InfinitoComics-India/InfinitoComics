import React, { useState, useEffect } from "react";
import {steps} from '../../constants/career'
import InfinitoHiringShimmer from '../../shimmer/Career/InfinitoHiringShimmer '

const InfinitoHiring = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      setTimeout(() => setLoading(false), 2400); 
    }, []);
  return loading? <InfinitoHiringShimmer/>:(
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-20 py-12">
      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
        Infinitos’ hiring, explained
      </h2>
      <p className="text-center text-gray-600 text-sm sm:text-base mb-10">
        Not all heroes wear capes — but we do email back.
      </p>

      {/* Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {steps.map((step) => (
          <div
            key={step.id}
            className="bg-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Step number and title */}
            <div className="flex flex-col items-start mb-5">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 font-medium text-sm mb-2">
                {step.id}
              </div>
              <h3 className="text-lg sm:text-xl font-bold">{step.title}</h3>
            </div>

            {/* Step description */}
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfinitoHiring;
