import React from 'react';
import bgTorn from '../../../assets/Images/Ultimate/CreatorAccessMiddle.png'; 
import topTorn from '../../../assets/Images/Ultimate/CreatorAccessUpper.png'; 
import bottomTorn from '../../../assets/Images/Ultimate/CreatorAccessLower.png'; 
import playIcon from '../../../assets/Images/Ultimate/playIcon.png';

import trailer1 from '../../../assets/Images/Ultimate/trailer1.png';
import trailer2 from '../../../assets/Images/Ultimate/trailer2.png';
import trailer3 from '../../../assets/Images/Ultimate/trailer3.png';
import trailer4 from '../../../assets/Images/Ultimate/trailer4.png';

const trailers = [
  { id: 1, image: trailer1 },
  { id: 2, image: trailer2 },
  { id: 3, image: trailer3 },
  { id: 4, image: trailer4 },
];

const CreatorAccess = () => {
  return (
    <div className="w-full text-white leading-none">
      {/* Top Torn Edge Image */}
      <img
        src={topTorn}
        alt="Top Torn Edge"
        className="w-full object-cover block m-0 p-0 -mb-1"
      />

      {/* Main Section with Background */}
      <div className="relative w-full block m-0 p-0">
        <img
          src={bgTorn}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none m-0 p-0"
        />

        <div className="relative z-10 py-[4rem] px-[1rem]">
          <div className="text-center mb-[2.5rem]">
            <h2 className="text-[1.5rem] md:text-[1.875rem] font-semibold leading-relaxed md:leading-tight">
              Unlock Creator Access with Infinito Ultimate
            </h2>
          </div>

          {/* Cards Container - Desktop flex-wrap, Mobile horizontal scroll */}
          <div className="flex md:flex-wrap md:justify-center gap-[1rem] overflow-x-auto md:overflow-visible px-4 md:px-0 pb-4 no-scrollbar">

            {trailers.map((trailer) => (
              <div 
                key={trailer.id} 
                className="w-[15rem] md:w-[18.625rem] flex-shrink-0"
              >
                <div className="relative w-full h-[8.75rem] md:h-[10rem]">
                  <img
                    src={trailer.image}
                    alt="Trailer"
                    className="w-full h-full object-cover rounded"
                  />
                  <img
                    src={playIcon}
                    alt="Play"
                    className="absolute top-1/2 left-1/2 w-[2.5rem] h-[2.5rem] md:w-[3rem] md:h-[3rem] transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
                <p className="mt-[0.5rem] text-sm text-center">Watch Trailer</p>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Bottom Torn Edge Image */}
      <img
        src={bottomTorn}
        alt="Bottom Torn Edge"
        className="w-full object-cover block m-0 p-0 -mt-1"
      />
    </div>
  );
};

export default CreatorAccess;
