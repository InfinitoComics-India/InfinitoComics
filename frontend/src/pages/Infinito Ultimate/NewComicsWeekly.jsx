import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll as fetchCharacters } from '../../services/CharacterServices.js';

const CharactersSection = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      })
      .catch((error) => {
        console.error("Error fetching characters:", error);
        setCharacters([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className='w-full flex flex-col items-center justify-center py-16 my-12'>
      <div className="w-11/12 md:w-2/3 text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#000000]">
          Our Characters
        </h2>
        <p className="text-md md:text-lg leading-relaxed text-[#000000]">
          Meet the heroes and villains of the Infinito Universe — each with unique powers, stories, and destinies.
        </p>
      </div>

      <div className='w-5/6'>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-[3/4] bg-gray-200 rounded" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
                <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No characters available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {characters.map((character) => (
              <div
                key={character._id}
                onClick={() => navigate("/characters/biography", { state: character._id })}
                className="group cursor-pointer"
              >
                <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 rounded">
                  <img
                    src={character.mainImageUrl || character.mainLandscapeImageUrl || "https://via.placeholder.com/300x400"}
                    alt={character.knownAs || character.originalName}
                    className="w-full h-full object-contain object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="mt-2 text-sm md:text-base font-semibold truncate group-hover:text-[#DD1215] transition-colors">
                  {character.knownAs || character.originalName}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">
                  {character.placeOfOrigin || character.species || ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharactersSection;
