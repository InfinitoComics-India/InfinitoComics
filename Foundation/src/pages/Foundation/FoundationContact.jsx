import React, { useState } from "react";
import foundationLogo from "../../../../frontend/assets/Images/Foundation Logo.png";

const FoundationContact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <section className="foundation-contact" aria-labelledby="foundation-contact-title">
        <div className="foundation-contact-intro">
          <p className="foundation-contact-kicker">Let&apos;s create hope together</p>
          <h2 id="foundation-contact-title">Contact us to be<br />the part of</h2>
          <img src={foundationLogo} alt="Infinito Foundation" className="foundation-contact-logo" />
          <p className="foundation-contact-lede">Tell us about you and let&apos;s creating somthing extraordinary.</p>
          <a href="#our-initiatives-title" className="foundation-contact-button">Explore Infinito Universe <span>&gt;</span></a>
        </div>

        <form className="foundation-contact-form" onSubmit={handleSubmit}>
          <div className="foundation-form-row">
            <input aria-label="Your Name" placeholder="Your Name" required />
            <input aria-label="Organisation Name" placeholder="Organisation Name" required />
          </div>
          <div className="foundation-form-row">
            <input type="email" aria-label="Email Address" placeholder="Email Address" required />
            <input aria-label="Contact Number" placeholder="Contact Number" required />
          </div>
          <select aria-label="Contribution Area" defaultValue="" required>
            <option value="" disabled>Contribution Area</option>
            <option>Education</option>
            <option>Sports</option>
            <option>Research</option>
            <option>Social Welfare</option>
          </select>
          <textarea aria-label="Message" placeholder="Tell us about your brand and ideas" rows="5" required />
          <button type="submit" className="foundation-contact-button">{submitted ? "Message Sent" : "Send Message"} <span>&gt;</span></button>
        </form>
      </section>
    </>
  );
};

export default FoundationContact;