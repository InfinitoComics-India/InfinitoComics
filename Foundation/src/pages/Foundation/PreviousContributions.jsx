import React from "react";
import img1 from "../../assets/images1/image1.png";
import img2 from "../../assets/images1/image2.png";
import img3 from "../../assets/images1/image3.png";
import img4 from "../../assets/images1/image4.png";
import img5 from "../../assets/images1/image5.png";
import img6 from "../../assets/images1/image6.png";

const contributionImages = [img1, img2, img3, img4, img5, img6];

const PreviousContributions = () => (
  <section className="foundation-previous-contributions" aria-labelledby="previous-contributions-title">
    <h2 id="previous-contributions-title">Our Previous <strong>Contributions</strong></h2>
    <div className="foundation-contributions-grid">
      {contributionImages.map((image, index) => (
        <img key={image} src={image} alt={`Previous contribution ${index + 1}`} />
      ))}
    </div>
  </section>
);

export default PreviousContributions;