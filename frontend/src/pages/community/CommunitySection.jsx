// 📁 src/components/CommunitySection.jsx
import React from "react";
import {communities} from "../../constants/communities";

// Dummy data for community cards
// const communities = [
//   {
//     name: "General",
//     imageUrl: gradient, // Replace with actual image
//   },
//   {
//     name: "Infinito Core",
//     imageUrl: gradient, // Replace with actual image
//   },
//   {
//     name: "Anti–Hero Group",
//     imageUrl: gradient, // Replace with actual image
//   },
// ];

const CommunitySection = () => {
  return (
    <div className="w-full px-4 md:px-10 lg:px-20 py-12">
      
      {/* Section heading with responsive spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 mx-4 sm:mx-10 lg:mx-40 space-y-4 sm:space-y-0">
        <h2 className="font-sans font-extrabold text-xl sm:text-4xl tracking-[0.1em] scale-y-100 uppercase text-center sm:text-left">
          Our Communities
        </h2>
        
        {/* Link to view all communities */}
        <a
          href="#"
          className="text-md tracking-widest text-red-600 uppercase font-semibold hover:underline"
        >
          View All &nbsp; &rsaquo;
        </a>
      </div>

      {/* Responsive grid of community cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-4 sm:mx-10 lg:mx-40">
        {communities.map((community, index) => (
          <div key={index} className="flex flex-col">
            
            {/* Card with background image and join button */}
            <div
              className="relative w-full h-[200px] sm:h-[220px] md:h-[250px] bg-gradient-to-br from-gray-200 to-black rounded overflow-hidden"
              style={{
                backgroundImage: `url(${community.imageUrl})`, // Card image background
                backgroundSize: "cover",                       // Cover the card
                backgroundPosition: "center",                  // Center the image
              }}
            >
              {/* Join Now button placed at bottom right */}
              <button className="absolute bottom-4 right-4 text-white tracking-widest px-6 py-2 border border-white hover:bg-white hover:text-black transition-all duration-300">
                JOIN NOW &rsaquo;
              </button>
            </div>

            {/* Community name displayed below the card */}
            <p className="text-xl font-semibold text-black mt-2">{community.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunitySection;
