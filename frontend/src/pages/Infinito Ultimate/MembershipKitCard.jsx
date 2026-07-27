import React from 'react';
import membershipKitImage from '../../../assets/Images/Ultimate/MembershipKitImage.png';
import InfinitoUltimateKit from './InfinitoUltimateKit';

const MembershipKitCard = () => {
  return (
    <div className='flex justify-center mt-28 px-4'>

      {/* Desktop View */}
      <div className="hidden md:flex flex-row w-[90%] max-w-[80.625rem] justify-between items-center h-[39rem] gap-6 bg-white px-10 py-12 shadow-md border">
        
        {/* Left Image */}
        <div className="md:w-[67%] h-[45rem] flex items-center">
          <img
            src={membershipKitImage}
            alt="Membership Kit"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right: InfinitoUltimateKit Card */}
        <div className="md:w-[40%] h-[25rem] mt-[0.2rem] pt-0.5 flex items-center justify-center">
          <InfinitoUltimateKit />
        </div>

      </div>

      {/* Mobile View */}
      <div className="block md:hidden w-full max-w-[90%] bg-white px-4 py-8 shadow-md border flex flex-col items-center gap-6">
        
        {/* Image */}
        <div className="w-full flex items-center">
          <img
            src={membershipKitImage}
            alt="Membership Kit"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* InfinitoUltimateKit Card */}
        <div className="w-full flex justify-center">
          <InfinitoUltimateKit />
        </div>

      </div>

    </div>
  );
};

export default MembershipKitCard;
