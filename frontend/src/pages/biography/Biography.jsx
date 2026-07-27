import React from "react";

export default function Biography({ character }) {
  if (!character) return null; // No data yet

  const safeValue = (value) => value || "N/A";
  const safeArray = (arr) => (arr && arr.length > 0 ? arr : ["N/A"]);

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-2">
      <div className="max-w-7xl mx-auto">
        <h1 className="tracking-widest font-bold text-xl md:text-2xl mb-8 text-center md:text-left">
          BIOGRAPHY
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column */}
          <div className="md:w-1/3 w-full">
            <div className="border border-gray-400 rounded p-6 bg-white">
              <div className="mb-4">
                <div className="text-xs text-gray-500">Full Name</div>
                <div className="font-medium">{safeValue(character.originalName)}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500">Other Aliases</div>
                <div className="font-medium">{safeValue(character.knownAs)}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500">Powers</div>
                <div className="font-medium">{safeArray(character.powers).join(", ")}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500">Weapons</div>
                <div className="font-medium">{safeArray(character.weapon).join(", ")}</div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Height</div>
                  <div>{safeValue(character.height)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Age</div>
                  <div>{safeValue(character.age)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Species</div>
                  <div>{safeValue(character.species)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Weight</div>
                  <div>{safeValue(character.weight)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Date of Birth</div>
                  <div>
                    {character.birthDate
                      ? new Date(character.birthDate).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Eyes</div>
                  <div>{safeValue(character.eyes)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Gender</div>
                  <div>{safeValue(character.gender)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Hair</div>
                  <div>{safeValue(character.hair)}</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-500">Place of Origin</div>
                <div>{safeValue(character.placeOfOrigin)}</div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-500">Universe</div>
                <div>{safeValue(character.universe)}</div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-500">Relationships</div>
                <div className="text-xs text-gray-500">Family</div>
                {safeArray(character.family).map((f, i) => (
                  <div key={i} className="italic">{f}</div>
                ))}
                <div className="text-xs text-gray-500 mt-1">Friends</div>
                {safeArray(character.friends).map((f, i) => (
                  <div key={i} className="italic">{f}</div>
                ))}
                <div className="text-xs text-gray-500 mt-1">Enemies</div>
                {safeArray(character.enemies).map((f, i) => (
                  <div key={i} className="italic">{f}</div>
                ))}
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-500">Group Affiliations</div>
                <div>{safeValue(character.groupAffiliations)}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Creator</div>
                <div className="text-pink-600 font-semibold tracking-widest text-xs">
                  {safeArray(character.creator).join(", ")}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3 w-full">
            <div className="italic text-gray-500 text-base mb-6">
              “{safeValue(character.description)}”
            </div>

            <div className="mb-6">
              <div className="font-bold mb-1">About</div>
              <div className="text-gray-700 text-sm md:text-base">
                {safeValue(character.about)}
              </div>
            </div>

            <div className="mb-6">
              <div className="font-bold mb-1">Origin</div>
              <div className="mb-6 mt-5">
                <img
                  src={character.origin?.image || character.mainImageUrl || null}
                  alt="character"
                  className="w-full max-w-lg rounded mx-auto"
                />
              </div>
              <div className="text-gray-700 text-sm md:text-base">
                {safeValue(character.origin?.text)}
              </div>
            </div>

            {/* <div className="mb-6">
              <div className="font-bold mb-1">Story Line</div>
              <div className="mb-6 mt-5">
                <img
                  src={character.storyLine?.image || ""}
                  alt="storyline"
                  className="w-full max-w-lg rounded mx-auto"
                />
              </div>
              <div className="text-gray-700 text-sm md:text-base">
                {safeValue(character.storyLine?.text)}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
