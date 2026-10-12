import React, { useState, useEffect } from "react";
import FoundationSectionShimmer from "../../shimmer/landingPageShimmer/FoundationSectionShimmer";

const FoundationSection = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      // fetch data / preload hero image ...
      setTimeout(() => setLoading(false), 2400); // demo
    }, []);
  
  return loading? <FoundationSectionShimmer/>: (
      <div>
      <section className="w-full bg-white py-16">
        {/* Header */}
        <div className="text-left max-w-6xl mx-auto mb-9 px-4">
          <h2 className="uppercase tracking-widest font-bold font-['Dharma Gothic E'] text-black text-md md:text-lg">
            Supporting the Real Heros
          </h2>
        </div>

        <div className='relative flex flex-col md:flex-row items-center md:items-stretch'>
        {/* Black background section with text and image */}
        <div className="flex flex-col md:flex-row w-full mx-auto bg-black overflow-hidden md:h-80 realative z-10">
          {/* Left Text Block */}
          <div className="ml-33 text-white px-8 md:p-12 flex flex-col justify-center w-full md:w-1/2">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4 flex flex-wrap items-center">
              <img src="../../../assets/Images/Foundation Logo.png" alt="logo" className='w-130 h-20 object-fill'></img>
               
              
            </h3>

            <p className="text-lg md:text-lg mb-6 leading-relaxed max-w-md">
              For our nation, we stand united—supporting sports, <br/>uplifting society, and protecting the environment with <br/>every hand we lend.
            </p>

            <a
              href="#"
              className="uppercase text-xs tracking-widest font-semibold  hover:text-red-500"
            >
              Join Now &rsaquo;
            </a>
          </div>
        </div>    

           <div className="w-full md:w-auto md:absolute md:top-[-40px] md:right-[190px] max-w-[420px] z-20">
            <img
                src="../../../assets/Images/archery.jpg"
                alt="Archers"
                className="w-full h-[400px] object-cover shadow-xl"
            />
            </div>
        </div>

        {/* AD Section */}
        <div className="mt-20 mx-45 bg-gray-200 text-center py-10 text-black font-bold text-lg tracking-widest">
          AD
        </div>
      </section>
    </div>
  )
}

export default FoundationSection;