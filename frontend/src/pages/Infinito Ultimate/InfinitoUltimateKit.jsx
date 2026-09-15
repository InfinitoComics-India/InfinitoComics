import React, { useState, useEffect } from "react";
import { CircleCheck } from "lucide-react";
import { getAll as fetchCharacters } from "../../services/CharacterServices.js";

const InfinitoUltimateKit = () => {
  const [characters, setCharacters] = useState([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Fetch characters from API
  useEffect(() => {
    fetchCharacters()
      .then((data) => {
        let chars = [];
        if (data?.data && Array.isArray(data.data)) {
          chars = data.data;
        } else if (Array.isArray(data)) {
          chars = data;
        } else if (Array.isArray(data?.characters)) {
          chars = data.characters;
        }
        setCharacters(chars);
        if (chars.length > 0) {
          setSelectedCharacter(chars[0]._id);
        }
      })
      .catch((error) => {
        console.error("Error fetching characters for kit:", error);
        setCharacters([]);
      })
      .finally(() => setIsLoadingCharacters(false));
  }, []);

  const plan = {
    price: 1999,
    originalPrice: "₹3199",
    title: "INFINITO ULTIMATE KIT",
    features: [
      "Surprise Superhero Toy",
      "Infinito T-shirt",
      "Superhero Stickers",
      "Digital Wall Paintings",
    ],
    note: "First 5,000 customers get exclusive gift!",
    buttonText: "CHOOSE HALF YEAR",
  };

  return (
    <div className="flex flex-col w-full max-w-[420px] border-2 border-gray-300 bg-white">
      {/* Header */}
      <div className="bg-white p-6 border-b-2 border-gray-300">
        <h3 className="text-[#DD1215] text-lg font-bold mb-2 uppercase">
          {plan.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-black">
            ₹{plan.price}
          </span>
          <span className="text-sm line-through text-gray-400">
            {plan.originalPrice}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="p-6 space-y-3 flex-grow">
        {/* Character Selection Dropdown */}
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full border-2 border-[#DD1215] flex items-center justify-center">
                <CircleCheck size={14} color="#DD1215" strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm text-black font-medium">Character of your choice</span>
          </div>
          
          {isLoadingCharacters ? (
            <div className="ml-8 text-xs text-gray-500">Loading characters...</div>
          ) : characters.length > 0 ? (
            <select
              value={selectedCharacter || ""}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="ml-8 w-[calc(100%-2rem)] text-sm border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-[#DD1215]"
            >
              {characters.map((character) => (
                <option key={character._id} value={character._id}>
                  {character.knownAs || character.originalName}
                </option>
              ))}
            </select>
          ) : (
            <div className="ml-8 text-xs text-gray-500">No characters available</div>
          )}
        </div>

        {/* Other Features */}
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full border-2 border-[#DD1215] flex items-center justify-center">
                <CircleCheck size={14} color="#DD1215" strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm text-black">{feature}</span>
          </div>
        ))}

        {/* Note */}
        <div className="pt-3 border-t border-gray-200 mt-4">
          <p className="text-xs text-gray-600 italic">{plan.note}</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 pt-0">
        <button className="w-full bg-[#DD1215] hover:bg-red-700 text-white font-bold py-3 px-6 transition-colors duration-300 text-sm uppercase tracking-wide">
          {plan.buttonText}
        </button>
      </div>
    </div>
  );
};

export default InfinitoUltimateKit;
