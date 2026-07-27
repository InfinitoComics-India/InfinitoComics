import React from "react";

const articles = [
  {
    title: "Hero Name: Why We Think He Cant Be Defeated",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Quick Vision's 10 Most Liked Battles",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Hero Name: Why We Think He Cant Be Defeated",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Hero Name: Why We Think He Cant Be Defeated",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
];

export default function FavouriteCharacters() {
  return (
    <div className="w-full py-8 px-2 sm:py-12 md:py-16 sm:px-6 md:px-12">
      <div className="mx-2 sm:mx-8 md:mx-20 lg:mx-40 ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold tracking-widest">
            READ ABOUT YOUR FAVOURITE CHARACTERS
          </h2>
          <a
            href="#"
            className="text-xs md:text-sm text-red-600 font-semibold tracking-widest hover:underline"
          >
            VIEW ALL &gt;
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {articles.map((article, idx) => (
            <div key={idx} className="bg-white">
              <div className="w-full aspect-[4/3] bg-gray-200 overflow-hidden rounded">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="mt-2 font-semibold text-sm md:text-base">
                {article.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}