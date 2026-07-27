import React, { useState, useEffect } from "react";import NewsletterSectionShimmer from '../../shimmer/landingPageShimmer/NewsletterSectionShimmer'
const NewsletterSection = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      // fetch data / preload hero image ...
      setTimeout(() => setLoading(false), 2400); // demo
    }, []);
  return loading?<NewsletterSectionShimmer/>: (
    <div
      className="w-full bg-cover bg-center flex flex-col md:flex-row items-center justify-between px-12 md:px-76 py-12 md:py-20"
      style={{ backgroundImage: "url('/assets/Images/Newsletter.png')" }}
    >
      <div className="text-white  mt-14 md:mt-24 mx-40">
        <h2 className="text-4xl md:text-xl font-extrabold mb-4 scale-y-180 tracking-widest">
          STAY UPDATED
        </h2>
        <p className="text-lg md:text-xl mb-6">
          Get the latest news and updates with our newsletter!
        </p>
        <form className="flex w-full max-w-md">
          <input
            type="email"
            placeholder="Join Us, Write your mail"
            className="flex-grow px-4 py-3 rounded-l-md focus:outline-none text-black placeholder-white bg-white bg-opacity-20"
          />
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-r-md font-bold tracking-wider hover:bg-red-700 transition"
          >
            JOIN NOW!
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSection;


