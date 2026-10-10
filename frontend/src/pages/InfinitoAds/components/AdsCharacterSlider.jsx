import React from "react";
import CharacterCarousel from "../../Characters/CharacterCarousel";

const AdsCharacterSlider = () => {
  return (
    <section className="w-full bg-white py-10 sm:py-14 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <CharacterCarousel
          isDark={false}
          showHeader={true}
          title="SELECT THE FACE OF YOUR BRAND"
          showViewAll={true}
        />
      </div>
    </section>
  );
};

export default AdsCharacterSlider;
