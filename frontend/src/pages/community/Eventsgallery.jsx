// 📁 src/components/EventsGallery.jsx
import React from "react";
import {eventImages} from "../../constants/communities"

const EventsGallery = () => {
  return (
    <div className="w-full px-4 md:px-10 lg:px-20 py-12">
      
      {/* Section heading and link with responsive horizontal spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 mx-4 sm:mx-10 lg:mx-40 space-y-4 sm:space-y-0">
        <h2 className="font-sans font-extrabold text-xl sm:text-4xl tracking-wide scale-y-100 uppercase text-center sm:text-left">
          EVENTS GALLERY
        </h2>

        {/* Link to view full gallery */}
        <a
          href="#"
          className="text-md tracking-widest text-red-600 uppercase font-semibold hover:underline"
        >
          View All &nbsp; &rsaquo;
        </a>
      </div>

      {/* Responsive grid for event images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-4 sm:mx-10 lg:mx-40">
        {eventImages.map((img, index) => (
          <div
            key={index}
            className="w-full h-[220px] md:h-[250px] overflow-hidden"
          >
            {/* Event image with object-fit styling */}
            <img
              src={img}
              alt={`Event ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsGallery;
