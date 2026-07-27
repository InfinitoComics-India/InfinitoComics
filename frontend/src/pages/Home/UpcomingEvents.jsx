// 📁 src/components/UpcomingEvents.jsx
import React, { useEffect, useState } from 'react';
import image from "../../../assets/Images/upcomingEvent.png"
const TARGET_DATE = new Date('2025-10-12T00:00:00');// <-- Set your target date here
import UpcomingEventsShimmer from   "../../shimmer/landingPageShimmer/UpcomingEventsShimmer";
const getTimeLeft = () => {
  const now = new Date();
  const diff = TARGET_DATE - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, mins: 0, secs: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs };
};

const UpcomingEvents = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      // fetch data / preload hero image ...
      setTimeout(() => setLoading(false), 2400); // demo
    }, []);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return loading?<UpcomingEventsShimmer />:(
    <div className="w-full flex justify-center py-8 md:py-12 bg-white">
      <div className="relative w-full max-w-7xl mx-2 sm:mx-6 md:mx-20 lg:mx-40 xl:mx-60 h-56 sm:h-72 md:h-[492px]">
        {/* Event Image */}
        <img
          src={image}
          alt="Comic Con Event Banner"
          className="w-full h-full object-cover rounded-lg"
        />

        {/* Countdown Overlay - Responsive and aligned bottom-right */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-10 lg:right-20 flex gap-2 sm:gap-3 md:gap-4">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-black/70 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-md text-white">
              <div className="text-lg sm:text-xl md:text-3xl font-bold font-sans">{timeLeft.days}</div>
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm uppercase text-white text-center">Days</div>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-black/70 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-md text-white">
              <div className="text-lg sm:text-xl md:text-3xl font-bold font-sans">{timeLeft.hours}</div>
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm uppercase text-white text-center">Hours</div>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-black/70 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-md text-white">
              <div className="text-lg sm:text-xl md:text-3xl font-bold font-sans">{timeLeft.mins}</div>
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm uppercase text-white text-center">Mins</div>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-black/70 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-md text-white">
              <div className="text-lg sm:text-xl md:text-3xl font-bold font-sans">{timeLeft.secs}</div>
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm uppercase text-white text-center">Secs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
