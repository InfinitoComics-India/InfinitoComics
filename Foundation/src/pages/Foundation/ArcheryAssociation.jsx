import React, { useState, useEffect } from "react";
import logo from "../../assets/images/foundation/logo.png";
import img1 from "../../assets/images/foundation/img1.png";
import img2 from "../../assets/images/foundation/img2.png";
import img3 from "../../assets/images/foundation/img3.png";
import img4 from "../../assets/images/foundation/img4.png";
import img5 from "../../assets/images/foundation/img5.png";
import img6 from "../../assets/images/foundation/img6.png";
import img7 from "../../assets/images/foundation/img7.png";
import img8 from "../../assets/images/foundation/img8.png";
import ArcheryAssociationShimmer from '../../shimmer/Foundation/ArcheryAssociationShimmer'

const ArcheryAssociation = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); 
  }, []);
  return loading ? <ArcheryAssociationShimmer/>: (
    <>
      <div className="flex flex-col my-8 md:my-14">
        <div>
          <h1 className="font-sans text-center font-bold text-2xl md:text-4xl text-red-600 transform scale-y-120">
            BIHAR ARCHERY ASSOCIATION
          </h1>
        </div>

        <span className="flex justify-center items-center w-full h-full my-6 md:my-10">
          <img src={logo} alt="logo" className="max-w-[180px] md:max-w-full h-auto" />
        </span>

        <div className="mx-4 md:mx-20 lg:mx-80 p-2 md:p-4">
          <p className="text-justify text-base md:text-lg">
            INFINITO is honored to collaborate with the{" "}
            <strong className="text-red-600"> Bihar Archery Association</strong>{" "}
            as the{" "}
            <strong className="text-red-600">
              Official Merchandise Partner
            </strong>{" "}
            for the prestigious{" "}
            <strong className="text-red-600">Archery National Games</strong>.
            This partnership reflects our commitment to supporting sports and
            celebrating the spirit of excellence and determination that athletes
            embody. Through this collaboration, INFINITO aims to inspire and
            empower athletes while fostering a stronger connection with the
            sporting community.
          </p>
        </div>
      </div>

      <div className="flex justify-center p-1 mb-10 md:mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl px-2">
          {/* Images */}
          {[img1, img2, img3, img4, img5, img6, img7, img8].map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Placeholder ${idx + 1}`}
              className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ArcheryAssociation;
