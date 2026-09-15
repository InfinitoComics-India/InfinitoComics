import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const FAQSection = ({ category }) => {
  const [faqData, setFaqData] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const getFAQs = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/faq?category=${category}`);
        const data = response.data.data || response.data;
        const sorted = data.sort((a, b) => a.order - b.order);
        setFaqData(sorted);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setError("Failed to load FAQs.");
      } finally {
        setLoading(false);
      }
    };

    getFAQs();
  }, [category]);

  return (
    <div className="max-w-4xl mx-auto text-left">
      <h3 className="text-center text-2xl md:text-3xl font-bold mb-8 text-black">
        Frequently Asked Questions
      </h3>

      {loading ? (
        <p className="text-center text-gray-500">Loading FAQs...</p>
      ) : error ? (
        <p className="text-center text-gray-500">
          Oops! We couldn't load the FAQs right now. Please refresh or try again later.
        </p>
      ) : faqData.length === 0 ? (
        <p className="text-center">No FAQs available.</p>
      ) : (
        <div className="divide-y divide-gray-300">
          {faqData.map((faq, index) => (
            <div key={faq._id || index} className="py-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left text-sm md:text-base font-semibold text-black hover:text-gray-700 transition-colors"
              >
                <span>{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp size={18} className="flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown size={18} className="flex-shrink-0 ml-4" />
                )}
              </button>
              {openIndex === index && (
                <div className="pt-3 text-sm md:text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQSection;
