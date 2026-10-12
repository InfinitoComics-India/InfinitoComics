import React, { useState, useEffect } from "react";
import NewsletterSectionShimmer from "../../shimmer/landingPageShimmer/NewsletterSectionShimmer";

const NewsletterSection = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <NewsletterSectionShimmer />;

  return (
    <section
      className="w-full bg-cover bg-center py-16 sm:py-20"
      style={{
        backgroundImage: "url('/assets/Images/Newsletter/Newsletter.png')",
    
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col items-start justify-center text-white">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-widest">
            STAY UPDATED
          </h2>

          <p className="text-base sm:text-xl mb-6 max-w-2xl">
            Get the latest news and updates with our newsletter!
          </p>

          <form className="flex w-full max-w-md">
            <input
              type="email"
              placeholder="Join Us, Write your mail"
              className="flex-1 min-w-0 px-4 py-3 rounded-l-md focus:outline-none text-black placeholder-gray-500 bg-white/90"
            />

            <button
              type="submit"
              className="bg-red-600 text-white px-5 sm:px-6 py-3 rounded-r-md font-bold tracking-wider hover:bg-red-700 transition"
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
