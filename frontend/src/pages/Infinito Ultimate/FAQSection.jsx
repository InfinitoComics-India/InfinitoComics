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
    <div className="max-w-10/12 mx-auto pt-20 text-left">
      <h3 className="flex justify-center text-[2rem] font-bold mb-4">
        Frequently Asked Questions
      </h3>

      {loading ? (
        <p className="text-center text-gray-500">Loading FAQs...</p>
      ) : error ? (
        <p className="text-center text-gray-500">
          Oops! We couldn’t load the FAQs right now. Please refresh or try again later.
        </p>
      ) : faqData.length === 0 ? (
        <p className="text-center">No FAQs available.</p>
      ) : (
        <div className="divide-y-2 divide-[#7D7D7D]">
          {faqData.map((faq, index) => (
            <div key={faq._id || index} className="py-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left text-[1.4rem] font-bold text-black"
              >
                <span>{faq.question}</span>
                {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openIndex === index && (
                <div className="pt-3 text-xl font-semibold text-left text-gray-700">
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
