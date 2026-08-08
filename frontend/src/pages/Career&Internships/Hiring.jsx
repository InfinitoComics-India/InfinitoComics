import React from "react";

const ROLES = [
  { label: "UI\ndesigners",          seed: "ui-designer-male"    },
  { label: "UX\ndesigners",          seed: "ux-designer-female"  },
  { label: "Animator",               seed: "animator-red"        },
  { label: "Video\nEditors",         seed: "video-editor"        },
  { label: "Human\nResource",        seed: "hr-purple"           },
  { label: "Bloggers",               seed: "blogger-male"        },
  { label: "R&D",                    seed: "rnd-glasses"         },
  { label: "Graphic\nDesign",        seed: "graphic-design"      },
  { label: "Character\nDesigners",   seed: "character-designer"  },
  { label: "Comic\nArtist",          seed: "comic-artist"        },
  { label: "Content\nCreator",       seed: "content-creator-red" },
  { label: "Animation\nArtist",      seed: "animation-artist"    },
  { label: "Fashion\nCommunication", seed: "fashion-comm"        },
  { label: "Fashion\nDesign",        seed: "fashion-design"      },
  { label: "2D\nAnimator",           seed: "2d-animator-dark"    },
];

const Hiring = () => (
  <div className="w-full bg-white py-16">
    <div className="w-full max-w-[1200px] mx-auto px-12 text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">We are always hiring!</h2>
      <p className="text-gray-500 mb-16 text-sm md:text-base">
        Apply for a wide range of positions we have to offer
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-8 gap-y-12 justify-items-center">
        {ROLES.map((role) => (
          <div key={role.seed} className="flex flex-col items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(role.seed)}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
              alt={role.label.replace("\n", " ")}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100"
            />
            <p className="text-xs md:text-sm text-gray-800 font-medium leading-snug text-center whitespace-pre-line">
              {role.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Hiring;
