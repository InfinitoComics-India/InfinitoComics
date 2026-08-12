import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkWithUsShimmer from "../../shimmer/Career/WorkWIthUsShimmer";
import careerUrls from "../../utils/imagesUrls/carrerUrls.js";

const scrollToOpportunities = () => {
  const section = document.getElementById("career-opportunities");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

const WorkWIthUs = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  const goToInternships = () => {
    navigate("/internships");
  };

  if (loading) return <WorkWithUsShimmer />;

  return (
    <div
      className="w-full min-h-[600px] flex items-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]"
      style={{
        backgroundImage: `url(${careerUrls.BANNER_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12 py-10">
        <div className="max-w-xl">
          <p className="mb-4 text-white font-semibold text-sm sm:text-base tracking-widest">
            CAREERS AT INFINITO
          </p>

          <h1 className="font-sans font-bold text-3xl sm:text-4xl text-red-600 tracking-tight mb-6 scale-y-110">
            WORK WITH US
          </h1>

          <p className="text-white text-base sm:text-lg mb-8 leading-relaxed tracking-wide">
            Explore remote-friendly, flexible opportunities and join our mission
            to make work life simpler, more pleasant and more productive.
          </p>

          <button
            onClick={scrollToOpportunities}
            className="py-3 px-6 sm:py-4 sm:px-8 bg-red-700 text-white text-xs sm:text-sm tracking-[4px] mb-6 hover:bg-red-800 transition-colors focus:outline-none"
          >
            VIEW CAREERS
          </button>

          <div>
            <button
              onClick={goToInternships}
              className="text-blue-300 underline text-sm sm:text-base hover:text-white transition-colors"
            >
              Looking for internships?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkWIthUs;
