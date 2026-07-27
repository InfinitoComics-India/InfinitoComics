import React, { useState, useEffect } from "react";
import PTI from "../../assets/images/foundation/PTI.png";
import groupPic from "../../assets/images/foundation/groupPic.png";
import PressTrustShimmer from '../../shimmer/Foundation/PressTrustShimmer'

const PressTrust = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); 
  }, []);
  return loading ? <PressTrustShimmer /> : (
    <div className="px-4 md:px-10 lg:px-40 py-6">
      <div>
        <h1 className="font-sans text-center font-bold text-2xl md:text-4xl text-red-600 transform scale-y-120 mb-6">
          PTI - PRESS TRUST OF INDIA
        </h1>
        <span className="flex justify-center items-center w-full h-full mb-6">
          <img src={PTI} alt="PTI" className="max-w-[220px] md:max-w-xs lg:max-w-md w-full h-auto" />
        </span>
      </div>

      <div className="mx-0 md:mx-10 lg:mx-40 p-2 md:p-4">
        <p className="text-justify text-base md:text-lg mb-8">
          INFINITO extends its heartfelt gratitude to the <strong className="text-red-600">Press Trust of India (PTI) </strong>
          for entrusting us with the opportunity to provide <strong className="text-red-600">Technical Support</strong>.
          It is an honor to collaborate with one of India's most prestigious and trusted news organizations. We are also proud to host Online connection to honorable Transport Minister <strong className="text-red-600">Sri Nitin Gadkari Ji.</strong>
        </p>
        <p className="text-justify text-base md:text-lg mb-8">
          We are committed to delivering top-notch support and ensuring seamless operations for PTI across the country. This partnership reflects our dedication to excellence and our vision of empowering India's media and entertainment industry with innovative solutions.
        </p>
        <span className="flex justify-center items-center w-full h-full my-8">
          <img src={groupPic} alt="group" className="max-w-[320px] md:max-w-lg lg:max-w-2xl w-full h-auto rounded shadow" />
        </span>
      </div>
    </div>
  );
};

export default PressTrust;
