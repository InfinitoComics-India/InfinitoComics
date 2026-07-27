import React from "react";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import aboutUsUrls from "../../utils/imagesUrls/aboutUsUrls.js"; // Import the URL from the constants file

const FounderSection = () => {
  return (
    <div className="w-full px-4 sm:px-8 md:px-20 py-10 sm:py-14 md:py-16">
      <div className="mx-0 sm:mx-10 md:mx-20 lg:mx-40">
        {/* Section Title */}
        <h2 className="text-black font-bold tracking-widest text-base  sm:text-lg md:text-3xl uppercase mb-6 sm:mb-10">
          Our Founder
        </h2>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Founder Image */}
          <img
            src={aboutUsUrls.FOUNDER_URL} // Use the URL from the constants file or fallback to local image
            alt="Founder"
            className="w-full max-w-xs md:w-[240px] h-auto object-cover mx-auto md:mx-0"
          />

          {/* Text Content */}
          <div className="flex-1 space-y-5">
            {/* Name and Role */}
            <div>
              <h3 className="text-red-600 text-xl sm:text-2xl md:text-3xl font-bold tracking-wider uppercase">
                A.R Rajan Sharma
              </h3>
              <p className="text-black text-md sm:text-sm font-semibold tracking-widest mt-1">
                FOUNDER & CEO
              </p>
            </div>

            {/* Paragraph */}
            <p className="text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed tracking-wide">
              Leads and oversees all operations of the company, including creative
              direction, financial management, and strategic planning. Paragraph on
              Our founder – a lil extract– if u may.! gotta bring the boss in focus
              obviously – come on! guys – write some good stuff ! see it gotta be
              this long Leads and oversees all operations of the company, including
              creative direction, financial management, and strategic planning.
              Paragraph on Our founder – a lil extract– if u may.! gotta bring the
              boss in focus obviously – come on! guys – write some good stuff ! see
              it gotta be this long Leads and oversees all operations of the
              company, including creative direction, financial management.
            </p>

            {/* Icons and Read More */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Social Icons */}
              <div className="flex gap-4 justify-center sm:justify-start">
                <a href="#" className="border border-black p-2  hover:bg-black hover:text-white transition">
                  <FaInstagram className="text-black" />
                </a>
                <a href="#" className="border border-black p-2  hover:bg-black hover:text-white transition">
                  <FaFacebookF className="text-black" />
                </a>
                <a href="#" className="border border-black p-2 hover:bg-black hover:text-white transition">
                  <FaLinkedinIn className="text-black" />
                </a>
                <a href="#" className="border border-black p-2 hover:bg-black hover:text-white transition">
                  <FaYoutube className="text-black" />
                </a>
              </div>

              {/* Read More */}
              <a
                href="#"
                className="text-red-600 font-semibold text-xs sm:text-sm tracking-wider uppercase text-center sm:text-left"
              >
                Read More &gt;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderSection;