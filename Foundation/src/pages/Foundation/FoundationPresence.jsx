import React from "react";
import mpChhattisgarh from "../../assets/images1/mp.png";
import biharJharkhand from "../../assets/images1/bihar.png";
import ne from "../../assets/images1/NE.png";
import himachal from "../../assets/images1/himachal.png";
import tamilNadu from "../../assets/images1/tamil nadu.png";

const presenceItems = [
  { image: mpChhattisgarh, label: "MP & Chhattisgarh" },
  { image: biharJharkhand, label: "Bihar & Jharkhand" },
  { image: northeast, label: "Northeast India" },
  { image: himachal, label: "Himachal Pradesh" },
  { image: tamilNadu, label: "Tamil Nadu" },
];

const FoundationPresence = () => (
  <section className="foundation-presence" aria-labelledby="foundation-presence-title">
    <h2 id="foundation-presence-title">Infinito Foundation <strong>Presence</strong></h2>
    <div className="foundation-presence-scroll">
      <div className="foundation-presence-track">
        {presenceItems.map((item) => (
          <div className="foundation-presence-item" key={item.label}>
            <img src={item.image} alt={item.label} />
            <strong>{item.label}</strong>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FoundationPresence;
