import React from "react";

const AllCharacters = ({
  characters,
  searchQuery,
  setSearchQuery,
  onEdit,
  onDelete,
  loading,
  onRefresh 
}) => {
  return (
    <div className="bg-gray-800 p-6 md:p-10 rounded-lg shadow-xl max-w-4xl mx-auto">
       <label className="block text-gray-300 font-medium mb-2">
          Search Characters
        </label>
      <div className="mb-6 flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by character name..."
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
        />
               <button
          onClick={onRefresh}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Refresh character list"
        >
          Refresh
        </button>
      </div>


      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading characters...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {characters.length === 0 ? (
            <p className="text-center text-gray-400">No characters found</p>
          ) : (
            characters.map((character) => (
              <div
                key={character._id}
                className="bg-gray-700 p-4 rounded-lg flex items-center justify-between hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {(character.mainImageUrl || character.mainImage) && (
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-600">
                      <img
                        src={character.mainImageUrl || character.mainImage}
                        alt={character.knownAs}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">
                      {character.knownAs}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {character.originalName || "unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(character)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(character._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AllCharacters;