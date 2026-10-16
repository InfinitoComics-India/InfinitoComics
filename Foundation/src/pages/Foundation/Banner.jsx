import React, { useEffect, useState } from "react";
import banner from '../../assets/images/foundation/banner.png'
import belowBanner from '../../assets/images/foundation/below_banner.png'
import foundationLogo from '../../../../frontend/assets/Images/Foundation Logo.png'

const focusAreas = [
  { id: "education", label: "Creating hope" },
  { id: "innovation", label: "Empowering people" },
  { id: "sports", label: "Kindle tomorrow" },
];

const Banner = () => {
  const [activeArea, setActiveArea] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveArea((currentArea) => (currentArea + 1) % focusAreas.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="foundation-banner w-full bg-[#111]">
      <div className="foundation-hero min-h-[300px] md:min-h-[600px]">
        <img
          src={banner}
          alt="Infinito Foundation"
          className="block w-full h-[300px] md:h-[600px] object-cover object-center"
        />
        <div className="foundation-banner-copy">
          <img src={foundationLogo} alt="Infinito Foundation" className="foundation-banner-logo" />
          <p>
            Initiatives focused on education, sports, research, skill development,
            and social welfare, the foundation supports young talent, encourages
            innovation, and helps individuals unlock their potential.
          </p>
          <a className="foundation-banner-button" href="#our-initiatives-title">
            Register now <span aria-hidden="true">&gt;</span>
          </a>
        </div>
        <nav className="foundation-banner-focus" aria-label="Foundation focus areas">
          {focusAreas.map((area, index) => (
            <a
              key={area.id}
              href={`#${area.id}`}
              className={index === activeArea ? "is-active" : ""}
              onClick={() => setActiveArea(index)}
            >
              {area.label}
              <span className="foundation-banner-underline" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      <img
        src={belowBanner}
        alt=""
        aria-hidden="true"
        className="block w-full h-auto"
      />
    </div>
  )
}

export default Banner
