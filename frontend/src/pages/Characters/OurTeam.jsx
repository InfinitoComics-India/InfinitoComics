import React from "react";

const teams = [
  {
    name: "AVENGERS",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Avengers_logo.png",
  },
  {
    name: "FANTASTIC FOUR",
    img: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Fantastic_Four_logo.png",
  },
  {
    name: "X-MEN",
    img: "https://upload.wikimedia.org/wikipedia/commons/5/5e/X-Men_logo.png",
  },
  {
    name: "S.H.I.E.L.D.",
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Shield_logo.png",
  },
];

export default function MeetTeams() {
  return (
    <div className="w-full py-8 px-2 sm:py-12 md:py-16 sm:px-6 md:px-12">
      <div className="mx-2 sm:mx-8 md:mx-20 lg:mx-40">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-4">
          <h2 className="text-lg md:text-2xl font-bold tracking-widest">
            MEET ALL OUR TEAMS
          </h2>
          <a
            href="#"
            className="text-xs md:text-sm text-red-600 font-semibold tracking-widest hover:underline"
          >
            VIEW ALL &gt;
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {teams.map((team, idx) => (
            <div key={idx} className="flex flex-col">
              {/* Slanted background */}
              <div
                className="relative w-full aspect-square bg-gray-100 rounded-t"
                style={{
                  clipPath: "polygon(0 0, 100% 8%, 100% 100%, 0% 100%)",
                }}
              >
                <img
                  src={team.img}
                  alt={team.name}
                  className="absolute inset-0 w-3/4 h-3/4 object-contain mx-auto my-auto left-0 right-0 top-0 bottom-0"
                  style={{ margin: "auto" }}
                  draggable="false"
                />
              </div>
              {/* Team name bar */}
              <div className="bg-black text-white text-xs md:text-sm font-medium tracking-widest text-center py-3 rounded-b">
                {team.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}