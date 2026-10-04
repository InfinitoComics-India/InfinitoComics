import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowUpRight } from "lucide-react";
import { BASE_URL, RESEARCH_BASE_URL } from "../../utils/constants";

// Fallback demo data in case the backend returns empty or is loading
const FALLBACK_PAPERS = [
  {
    _id: "1",
    category: "BUSINESS",
    title: "REMOTE COMMUNITY BUILDING: STRATEGIES FOR GROWING AN AVGC-XR BRAND THROUGH THE ONLINE COMMUNITY AND ENGAGEMENT",
    authors: [{ name: "ANKIT ROUT" }],
  },
  {
    _id: "2",
    category: "BUSINESS",
    title: "REMOTE COMMUNITY BUILDING: STRATEGIES FOR GROWING AN AVGC-XR BRAND THROUGH THE ONLINE COMMUNITY AND ENGAGEMENT",
    authors: [{ name: "ANKIT ROUT" }],
  },
  {
    _id: "3",
    category: "BUSINESS",
    title: "REMOTE COMMUNITY BUILDING: STRATEGIES FOR GROWING AN AVGC-XR BRAND THROUGH THE ONLINE COMMUNITY AND ENGAGEMENT",
    authors: [{ name: "ANKIT ROUT" }],
  },
  {
    _id: "4",
    category: "BUSINESS",
    title: "REMOTE COMMUNITY BUILDING: STRATEGIES FOR GROWING AN AVGC-XR BRAND THROUGH THE ONLINE COMMUNITY AND ENGAGEMENT",
    authors: [{ name: "ANKIT ROUT" }],
  },
];

const ResearchSection = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/research-papers?limit=4&isPublished=true`);
        const fetchedData = res.data?.data?.papers || res.data?.data || [];
        setPapers(fetchedData.length > 0 ? fetchedData.slice(0, 4) : FALLBACK_PAPERS);
      } catch (err) {
        console.error("Error fetching research papers:", err);
        setPapers(FALLBACK_PAPERS);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  const handleCardClick = (paperId) => {
    // Redirects to the Research subdomain paper reader
    window.open(`${RESEARCH_BASE_URL}/research/browseResearch`, "_blank");
  };

  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ── Section Header ── */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl md:text-2xl font-black text-black tracking-wider uppercase">
            Research Papers
          </h2>
          <a
            href={`${RESEARCH_BASE_URL}/research/browseResearch`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-600 font-bold text-xs md:text-sm tracking-wider uppercase flex items-center gap-1 transition"
          >
            VIEW ALL &gt;
          </a>
        </div>

        {/* ── 4 Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {papers.map((paper, idx) => {
            const authorName = paper.authors?.[0]?.name || "ANKIT ROUT";
            const category = paper.category || "BUSINESS";

            return (
              <div
                key={paper._id || idx}
                onClick={() => handleCardClick(paper._id)}
                className="border-2 border-black bg-white flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all duration-300 min-h-[380px] group"
              >
                {/* Card Black Top Bar */}
                <div className="bg-black text-white px-4 py-2.5 flex justify-between items-center">
                  <span className="text-xs font-bold tracking-widest uppercase">
                    {category}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {/* Title */}
                  <h3 className="font-extrabold text-black text-sm md:text-[15px] leading-snug tracking-wide uppercase line-clamp-6">
                    {paper.title}
                  </h3>

                  {/* Author */}
                  <div className="mt-8 pt-4">
                    <p className="text-xs font-bold text-black uppercase tracking-wider">
                      -{authorName}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ResearchSection;