import React, { useState, useEffect } from "react";
import FoundationSectionShimmer from "../../shimmer/landingPageShimmer/FoundationSectionShimmer";
import foundimg from "../../../assets/Images/Foundation/foundation.png"
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
        <div className="ml-[132px] mb-9">
          <h1 className="uppercase tracking-widest font-bold text-black text-xl md:text-2xl">
            Supporting the Real Heros
          </h1>
        </div>

        <div className='relative flex flex-col md:flex-row items-center md:items-stretch'>
        {/* Black background section with text and image */}
        <div className="flex flex-col md:flex-row w-full mx-auto bg-black overflow-hidden md:h-80 realative z-10">
          {/* Left Text Block */}
<div className="ml-33 text-white/90 px-8 md:p-12 flex flex-col justify-center gap-4 w-full md:w-1/2">

  <h3 className="text-xl md:text-2xl font-bold">
    UPLIFTING SOCIETY
  </h3>

  <p className="text-sm md:text-base leading-snug max-w-md">
    For our nation, we stand united—supporting sports, uplifting society,
    and protecting the environment with every hand we lend. For our nation,
    we stand united—supporting sports, uplifting society, and protecting the
    environment with every hand we lend. protecting the environment with
    every hand we lend.
  </p>
  <a
    href="#"
    className= "w-fit border border-white/90 px-4 py-2 uppercase text-xs tracking-widest font-semibold hover:text-red-500"
  >
    Join Now &rsaquo;
  </a>

</div>
        </div>    

           <div className="w-full md:w-auto md:absolute md:top-[-70px] md:right-[190px] max-w-[420px] z-20">
            <img
                src={foundimg}
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