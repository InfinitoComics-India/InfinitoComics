import React from "react";

export default function CharacterDetail({ character }) {
  // Destructure character data with fallbacks
  const outfitImage = character?.mainImageUrl || "";
  const storyLineImage = character?.storyLine?.image || "";
  const storyLineText = character?.storyLine?.text || "N/A";

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left: Outfit */}
        <div className="md:w-1/2 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 w-full text-left">Outfit</h2>
          {outfitImage ? (
            <img
              src={outfitImage}
              alt={character?.knownAs || "Character Outfit"}
              className="w-full max-w-3xl h-full object-contain"
              draggable="false"
            />
          ) : (
            <p className="text-gray-500">No outfit image available</p>
          )}
        </div>

        {/* Right: Storyline */}
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Storyline</h2>
          {storyLineImage ? (
            <img
              src={storyLineImage}
              alt="Storyline"
              className="w-full h-64 object-cover rounded mb-4"
              draggable="false"
            />
          ) : (
            <p className="text-gray-500">No storyline image available</p>
          )}
          <p className="text-base font-normal mb-4">
            {storyLineText}
          </p>
        </div>
      </div>
    </div>
  );
}
