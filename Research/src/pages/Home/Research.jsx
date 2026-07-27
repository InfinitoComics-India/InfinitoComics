// ResearchPlans.jsx
import React from "react";
import FAQSection from "./FAQSection"; // Adjust the path if needed
import "./Research.css";
import ResearchCards from "./ResearchCards";


const ResearchPlans = () => {

  const cardImages = [
    "/img1.jpg",
    "/img2.jpg",
    "/img3.jpg",
    "/img4.jpg",
    "/img5.jpg",
    "/img6.jpg",
  ];

  return (
    <>
      {/* Hero Section */}
<div className="pt-10 pb-10 relative">
  <div className="relative flex flex-col md:flex-row items-center md:items-stretch">
    
    {/* Left Text Section */}
    <div className="flex flex-col md:flex-row w-full mx-auto bg-black overflow-hidden h-auto md:h-80 relative z-10">
      <div className="px-6 py-6 md:ml-[8rem] text-white flex flex-col justify-center w-full md:w-1/2">
        <h3 className="text-2xl md:text-4xl font-extrabold mb-4 flex items-center gap-2">
          <img
            src="../../../assets/Images/Foundation Logo.png"
            alt="logo"
            className="w-36 md:w-40 h-20 object-contain"
          />
        </h3>
        <h3 className="text-xl md:text-3xl font-bold leading-relaxed max-w-md">
          Make your research seamless.
        </h3>
        <p className="text-sm md:text-base">
          Get easy access to our wide range of papers, all at once!
          <br />
          Join Research Plus today to unlock them all.
        </p>
        <a
          href="#"
          className="uppercase mt-4 text-sm md:text-md tracking-widest font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 w-max rounded"
        >
          Join Now &rsaquo;
        </a>
      </div>
    </div>

    {/* Right image */}
    <div className="w-full md:absolute md:top-[-40px] md:right-[280px] max-w-[700px] z-20 px-6 md:px-0 mt-6 md:mt-0">
      <img
        src="../../../assets/Images/research/research+.png"
        alt="Research"
        className="w-full h-[280px] md:h-[420px] object-cover shadow-xl rounded-md"
      />
    </div>
  </div>
</div>

      <div>
        <ResearchCards/>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-white py-15 px-4 md:px-10 text-center">
        <h2 className="text-4xl font-semibold text-black">
          Over <span className="text-red-600 font-bold">50+</span> Papers Across Major Fields
        </h2>
        <p className="text-md text-black mb-10">
          Get a wide range of papers for your research.
        </p>


        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-10 mb-15 mx-auto">
          {cardImages.map((src, i) => (
            <div key={i} className="w-50 h-60 bg-[#D9D9D9] overflow-hidden shadow-sm">
              <img src={src} alt={`card-${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* FAQ Section (UI intact) */}
        <FAQSection category="research" />
      </div>

    </>
  );
};

export default ResearchPlans;
