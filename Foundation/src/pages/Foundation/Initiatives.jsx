import React from "react";
import khushiLogo from "../../assets/images/foundation/Khushi_Foundation_logo.png";
import graduationCap from "../../assets/images/foundation/graduation_cap.png";
import sportsLogo from "../../assets/images/foundation/Infinito_Sports_logo.png";
import researchLogo from "../../assets/images/foundation/Infinito_Research.png";

const impactItems = [
  { overline: "Initiatives", title: "Focused on", accent: "Education" },
  { overline: "Unlock and", title: "Encourage", accent: "Innovation" },
  { overline: "Supports young", title: "Talent to unlock", accent: "Sportsmanship" },
  { overline: "Deliver individual", title: "Stories for", accent: "Happiness" },
];

const Initiatives = () => (
  <section className="foundation-initiatives" id="education" aria-labelledby="our-initiatives-title">
    <div className="foundation-impact-strip">
      {impactItems.map((item) => (
        <div className="foundation-impact-item" key={item.accent}>
          <span>{item.overline}</span>
          <span>{item.title}</span>
          <strong>{item.accent}</strong>
        </div>
      ))}
    </div>

    <div className="foundation-initiative-heading">
      <h1 id="our-initiatives-title">Our <strong>Initiatives</strong></h1>
    </div>

    <article className="foundation-education-feature">
      <div className="foundation-initiative-mark">
        <img src={khushiLogo} alt="Khushi Foundation" />
      </div>
      <div className="foundation-education-copy">
        <h2>Funding for <strong>Education</strong></h2>
        <h3>Empowering Girls. Enriching Lives. Building Futures.</h3>
        <p><b>Khushi Education Support Programme</b> is a CSR initiative dedicated to empowering girl children through education, livelihood opportunities, and safety.</p>
        <div className="foundation-funding-line">
          <img className="foundation-graduation-mark" src={graduationCap} alt="" aria-hidden="true" />
          <span>Funding up to <strong>INR 20,000/-</strong><small>during higher-secondary education</small></span>
        </div>
        <p className="foundation-notification"><b>Notification release date</b> - 15<sup>th</sup> February 2027</p>
      </div>
    </article>

    <article className="foundation-education-feature foundation-research-feature" id="innovation">
      <div className="foundation-education-copy">
        <h2>Infinito <strong>Research Fellowship</strong></h2>
        <h3>Supporting Ideas. Advancing Research. Shaping the Future.</h3>
        <p><b>Infinito Research Fellowship</b> is an initiative dedicated to supporting young and promising researchers who are working on innovative, interdisciplinary, and future-oriented research.</p>
        <div className="foundation-funding-line">
          <img className="foundation-graduation-mark" src={graduationCap} alt="" aria-hidden="true" />
          <span>Funding up to <strong>INR 50,000/-</strong><small>per researcher for one year</small></span>
        </div>
        <p className="foundation-notification"><b>Notification release date</b> - 20<sup>th</sup> April 2027</p>
      </div>
      <div className="foundation-initiative-mark">
        <img src={researchLogo} alt="Infinito Research Fellowship" />
      </div>
    </article>

    <article className="foundation-education-feature foundation-sports-feature" id="sports">
      <div className="foundation-initiative-mark">
        <img src={sportsLogo} alt="Infinito Sports Fellowship" />
      </div>
      <div className="foundation-education-copy">
        <h2>Infinito <strong>Sports Fellowship</strong></h2>
        <h3>Supporting Talent. Building Champions.</h3>
        <p><b>Infinito Sports Fellowship</b> is an initiative dedicated to supporting young and promising sportspersons with the talent, determination, and potential to compete at higher levels.</p>
        <div className="foundation-funding-line">
          <img className="foundation-graduation-mark" src={graduationCap} alt="" aria-hidden="true" />
          <span>Funding up to <strong>INR 1,00,000/-</strong><small>per athlete for one year</small></span>
        </div>
        <p className="foundation-notification"><b>Notification release date</b> - 5<sup>th</sup> January 2027</p>
      </div>
    </article>
  </section>
);

export default Initiatives;