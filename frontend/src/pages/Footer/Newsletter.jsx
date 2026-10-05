import React, { useState, useEffect } from "react";
import NewsletterSectionShimmer from "../../shimmer/landingPageShimmer/NewsletterSectionShimmer";
import newsletterimage from "../../../assets/Images/Newsletter/Newsletter.png";

const NewsletterSection = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Preload demo
    const timer = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // Add your newsletter submission logic here
    console.log("Subscribed:", email);
    setEmail("");
  };

  if (loading) return <NewsletterSectionShimmer />;

  return (
    <section
      className="w-full bg-cover bg-center bg-no-repeat flex items-center min-h-[260px] md:min-h-[340px] px-6 sm:px-12 md:px-16 lg:px-24 py-10 md:py-14"
      style={{ backgroundImage: `url(${newsletterimage})` }}
    >
      {/* Left Content Container */}
      <div className="w-full max-w-lg text-white">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-wide uppercase mb-2">
          STAY UPDATED
        </h2>

        <p className="text-gray-200 text-sm sm:text-base font-normal mb-6">
          Get the latest news and updates with our newsletter!
        </p>

        {/* Input & Button Form */}
        <form onSubmit={handleSubmit} className="flex w-full max-w-md shadow-lg">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#d01824] hover:bg-[#b0131d] text-white font-bold text-xs sm:text-sm tracking-wider uppercase px-6 py-3 flex items-center justify-center gap-1 shrink-0 transition-colors duration-200"
          >
            <span>JOIN NOW</span>
            <span className="text-xs">&gt;</span>
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;