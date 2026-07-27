import React, { useState, useEffect } from "react";
import uploadedImage from "../../../assets/Images/ExclusiveContent.jpg";
import ExclusiveContentShimmer from "../../shimmer/landingPageShimmer/ExclusiveContentShimmer";

const ExclusiveContent = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); // demo
  }, []);

  return loading ? (
    <ExclusiveContentShimmer />
  ) : (
    <div className="flex flex-col w-full min-h-[500px] gap-5 px-4 md:px-8 lg:px-0">
      {/* Title heading */}
      <div className="mx-4 sm:mx-8 md:mx-40 lg:mx-60">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mt-5 text-center lg:text-left">
          CHECK OUT OUR APP FOR EXCLUSIVE CONTENT
        </h1>
      </div>

      {/* Content section */}
      <div className="flex flex-col lg:flex-row justify-around w-full min-h-[450px]">
        {/* Left section */}
        <div className="w-full lg:w-[45%] lg:ml-40">
          <div className="m-4 sm:m-8 md:m-12 lg:m-16">
            <img
              src={uploadedImage}
              alt="Exclusive Content"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="w-full lg:w-[45%] px-4 sm:px-8 lg:px-0">
          <div className="flex flex-col items-center lg:items-start justify-start lg:w-[50%] gap-6 my-8 lg:my-40">
            {/* Description text */}
            <p className="text-black text-base leading-relaxed text-center lg:text-left">
              Get exclusive content, early releases,
              and special discounts on physical
              copies all at your fingertips.
              Experience the ultimate comic
              platform on your mobile device
              today!
            </p>

            {/* Store buttons + QR */}
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              {/* Store buttons */}
              <div className="flex flex-row sm:flex-col items-center gap-4">
                {/* App Store button */}
                <button className="w-40 inline-flex items-center rounded-full border border-black bg-white px-4 py-2 cursor-not-allowed opacity-70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-black"
                    viewBox="0 0 305 305"
                  >
                    <path d="M40.74 112.12c-25.79 44.74-9.4 112.65 19.12 153.82C74.09 286.52 88.5 305 108.24 305c.37 0 .74 0 1.13-.02 9.27-.37 15.97-3.23 22.45-5.99 7.27-3.1 14.8-6.3 26.6-6.3 11.22 0 18.39 3.1 25.31 6.1 6.83 2.95 13.87 6 24.26 5.81 22.23-.41 35.88-20.35 47.92-37.94a168.18 168.18 0 0021-43l.09-.28a2.5 2.5 0 00-1.33-3.06l-.18-.08c-3.92-1.6-38.26-16.84-38.62-58.36-.34-33.74 25.76-51.6 31-54.84l.24-.15a2.5 2.5 0 00.7-3.51c-18-26.37-45.62-30.34-56.73-30.82a50.04 50.04 0 00-4.95-.24c-13.06 0-25.56 4.93-35.61 8.9-6.94 2.73-12.93 5.09-17.06 5.09-4.64 0-10.67-2.4-17.65-5.16-9.33-3.7-19.9-7.9-31.1-7.9l-.79.01c-26.03.38-50.62 15.27-64.18 38.86z" />
                    <path d="M212.1 0c-15.76.64-34.67 10.35-45.97 23.58-9.6 11.13-19 29.68-16.52 48.38a2.5 2.5 0 002.29 2.17c1.06.08 2.15.12 3.23.12 15.41 0 32.04-8.52 43.4-22.25 11.94-14.5 17.99-33.1 16.16-49.77A2.52 2.52 0 00212.1 0z" />
                  </svg>
                  <span className="ml-3 text-sm font-medium text-black">
                    Coming Soon
                  </span>
                </button>

                {/* Google Play button */}
                <button className="w-40 inline-flex items-center rounded-full border border-black bg-white px-4 py-2 cursor-not-allowed opacity-70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-black"
                    viewBox="0 0 512 512"
                  >
                    <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z" />
                  </svg>
                  <span className="ml-3 text-sm font-medium text-black">
                    Coming Soon
                  </span>
                </button>
              </div>

              {/* QR Code section */}
              <div className="flex flex-col sm:flex-row items-center gap-2 opacity-70 cursor-not-allowed">
                
                <span className="text-xl w-[100px] text-gray-600 text-center sm:text-left">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExclusiveContent;
