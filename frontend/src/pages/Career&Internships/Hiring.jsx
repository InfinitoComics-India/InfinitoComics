import React, { useState, useEffect } from "react";
const avatars = Array(15).fill("https://api.dicebear.com/7.x/thumbs/svg?seed=designer");
import HiringShimmer from '../../shimmer/Career/HiringShimmer'

const Hiring = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      setTimeout(() => setLoading(false), 2400); 
    }, []);
 return loading?<HiringShimmer/>: (
    <div className="w-full px-4 md:px-20 py-12 text-center">
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-bold mb-3">We are always hiring!</h2>
      <p className="text-gray-600 mb-16">
        Apply for a wide range of positions we have to offer
      </p>

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-35 gap-x-6 justify-items-center mx-16">
        {avatars.map((avatar, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <img
              src={`${avatar}&${index}`}
              alt="UI designer avatar"
              className="w-20 h-20 rounded-full shadow-md"
            />
            <p className="text-sm text-black font-medium leading-tight">
              UI<br />designers
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hiring
