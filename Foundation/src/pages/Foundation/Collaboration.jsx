import React, { useState, useEffect } from "react";
import CollaborationImg1 from "../../assets/images/foundation/CollaborationImg1.png";
import CollaborationImg2 from "../../assets/images/foundation/CollaborationImg2.png";
import CollaborationImg3 from "../../assets/images/foundation/CollaborationImg3.png";
import CollaborationImg4 from "../../assets/images/foundation/CollaborationImg4.png";
import CollaborationShimmer from '../../shimmer/Foundation/CollaborationShimmer'

const Collaboration = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); 
  }, []);
  return loading ? <CollaborationShimmer/>: (
    <>
      <div className="my-6">
        <div>
          <h1 className="font-sans text-center font-bold text-2xl md:text-4xl text-red-600 transform scale-y-120">
            Collaboration with My FM & CG Government
          </h1>
        </div>
        <div className="text-black text-center mt-8 md:mt-12 font-semibold text-xl md:text-3xl">
          Media & Documentary Partner with CG Government
        </div>
        <div className="mx-4 md:mx-20 lg:mx-80 p-4 my-2">
          <p className="text-justify text-base md:text-lg mb-8">
            <strong className="text-red-600">Infinito</strong> proudly serves as
            the{" "}
            <strong className="text-red-600">
              Official Media and Documentary Partner
            </strong>{" "}
            for the prestigious "Ram Path se Ram Van Yatra." This monumental
            journey retraces the sacred trail of Lord Ram's exile, connecting
            devotees with India's rich spiritual and cultural heritage.
          </p>
          <p className="text-justify text-base md:text-lg mb-8">
            As the media and documentary partner, Infinito takes pride in
            capturing and preserving every significant moment of this
            extraordinary yatra. From the grandeur of its commencement to the
            serene devotion of the pilgrims, our team ensures that no detail is
            left unnoticed.
          </p>
          <p className="text-justify text-base md:text-lg mb-8">
            <strong className="text-red-600">
              Our Mission Is To Document The Spiritual Essence, Vibrant
              Traditions, And The Emotional Connection That Thousands Of
              Devotees Experience During The Yatra
            </strong>
          </p>
          <p className="text-justify text-base md:text-lg mb-8">
            Thank you to Chhattisgarh Government for the opportunity to capture
            the moments.
          </p>
        </div>

        <div className="flex justify-center p-1 m-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl">
            <img
              src={CollaborationImg1}
              alt="Placeholder 1"
              className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
            />
            <img
              src={CollaborationImg2}
              alt="Placeholder 2"
              className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
            />
            <img
              src={CollaborationImg3}
              alt="Placeholder 3"
              className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
            />
            <img
              src={CollaborationImg4}
              alt="Placeholder 4"
              className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-20 mb-10">
        <h1 className="font-sans text-center font-bold text-2xl md:text-4xl text-black transform scale-y-120">
          For Collaboration
        </h1>
        <div className="text-black text-center mt-4 font-semibold text-lg md:text-2xl">
          Mail Us at{" "}
          <span className="text-red-600">business@infinitocomics.com</span>
        </div>
      </div>
    </>
  );
};

export default Collaboration;
