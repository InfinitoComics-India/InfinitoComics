import React, { useState, useEffect } from "react";
import NewsletterSectionShimmer from "../../shimmer/landingPageShimmer/NewsletterSectionShimmer";
import bgimage from "../../../assets/Images/Newsletter/Newsletter.png";

const NewsletterSection = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <NewsletterSectionShimmer />;

  return (
    <section
      className="w-full bg-cover bg-center py-10 sm:py-16 md:py-20"
      style={{
        backgroundImage: `url(${bgimage})`,
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col items-start justify-center text-white">
          <h2 className="text-2xl sm:text-4xl font-black mb-2 sm:mb-4 tracking-widest">
            STAY UPDATED
          </h2>

          <p className="text-sm sm:text-xl mb-4 sm:mb-6 max-w-2xl">
            Get the latest news and updates with our newsletter!
          </p>

          <form className="flex flex-col sm:flex-row w-full max-w-md gap-2 sm:gap-0">
            <input
              type="email"
              placeholder="Join Us, Write your mail"
              className="w-full sm:flex-1 min-w-0 px-4 py-2.5 sm:py-3 rounded-md sm:rounded-r-none focus:outline-none text-black text-xs sm:text-sm placeholder-gray-500 bg-white/95"
            />

            <button
              type="submit"
              className="bg-red-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-md sm:rounded-l-none font-bold text-xs sm:text-sm tracking-wider hover:bg-red-700 transition cursor-pointer w-full sm:w-auto shrink-0 shadow-md"
            >
              JOIN NOW!
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
