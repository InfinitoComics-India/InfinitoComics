import React from "react";

const iconMap = {
  Badminton: (
    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 16l8-8M16 16l-8-8" />
    </svg>
  ),
  Painting: (
    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M12 19l7-7-7-7-7 7 7 7z" />
    </svg>
  ),
  Reading: (
    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 4v16M16 4v16" />
    </svg>
  ),
};

const socialIcons = {
  facebook: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 00-5 5v3H6v4h4v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  instagram: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17" cy="7" r="1" />
    </svg>
  ),
  linkedin: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M16 8a6 6 0 016 6v6h-4v-6a2 2 0 00-4 0v6h-4v-6a6 6 0 016-6z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  x: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  ),
};

export default function TeamMemberModal({ open, onClose, member }) {
  if (!open || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-2">
      <div className="bg-white rounded shadow-xl max-w-5xl w-full mx-auto p-6 md:p-12 relative flex flex-col md:flex-row gap-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 border-2 border-black rounded w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-gray-100 transition"
        >
          ×
        </button>
        {/* Left: Image */}
        <div className="flex-shrink-0 flex justify-center items-center">
          <img
            src={member.img}
            alt={member.name}
            className="w-40 h-40 md:w-60 md:h-60 rounded object-cover"
          />
        </div>
        {/* Right: Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              HI, I'M <span className="text-red-600">{member.name}</span>
            </h2>
            <p className="text-gray-700 mb-4">{member.bio}</p>
            <div className="flex flex-wrap gap-8 mb-4">
              <div>
                <div className="font-bold">WISH ME ON</div>
                <div>{member.birthday}</div>
              </div>
              <div>
                <div className="font-bold">TIME WORKED</div>
                <div>{member.timeWorked}</div>
              </div>
              <div>
                <div className="font-bold">FAVOURITE CHARACTER</div>
                <div>{member.favCharacter}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <div className="font-bold mb-2">SOME OF MY INTERESTS</div>
              <div className="flex gap-6">
                {member.interests?.map((interest) => (
                  <div key={interest} className="flex flex-col items-center">
                    {iconMap[interest] || (
                      <span className="w-10 h-10 flex items-center justify-center">🎯</span>
                    )}
                    <span className="text-xs mt-1">{interest}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold mb-2">FOLLOW ME ON</div>
              <div className="flex gap-3">
                {member.socials?.facebook && (
                  <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="border-2 border-black rounded w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                    {socialIcons.facebook}
                  </a>
                )}
                {member.socials?.instagram && (
                  <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="border-2 border-black rounded w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                    {socialIcons.instagram}
                  </a>
                )}
                {member.socials?.linkedin && (
                  <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="border-2 border-black rounded w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                    {socialIcons.linkedin}
                  </a>
                )}
                {member.socials?.x && (
                  <a href={member.socials.x} target="_blank" rel="noopener noreferrer" className="border-2 border-black rounded w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                    {socialIcons.x}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}