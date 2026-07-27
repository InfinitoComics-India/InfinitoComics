import React, { useState, useEffect } from "react";
import EsummitImg1 from '../../assets/images/foundation/EsummitImg1.png'
import EsummitImg2 from '../../assets/images/foundation/EsummitImg2.png'
import EsummitImg3 from '../../assets/images/foundation/EsummitImg3.png'
import EsummitImg4 from '../../assets/images/foundation/EsummitImg4.png'
import EsummitShimmer from '../../shimmer/Foundation/EsummitShimmer'

const Esummit = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); 
  }, []);
  return loading ? <EsummitShimmer/> : (
    <div>
      <div className='mb-16'>
        <h1 className="font-sans text-center font-bold text-2xl md:text-4xl text-red-600 transform scale-y-120">
          NIT RAIPUR <span className="font-sans text-center font-bold text-2xl md:text-4xl text-black transform scale-y-120">E-SUMMIT [2022]</span>
        </h1>
      </div>

      <div className="mx-4 md:mx-20 lg:mx-80 p-4">
        <p className="text-justify text-base md:text-lg mb-8">
          <strong className="text-red-600">INFINITO </strong>is thrilled to announce its partnership with <strong className="text-red-600">E-Summit '22, NIT Raipur </strong>, a premier platform celebrating innovation, entrepreneurship, and the spirit of creativity. This collaboration underscores our commitment to nurturing young talent and fostering the entrepreneurial ecosystem in India. We are equally proud to share that our founder, <strong className="text-red-600">Rajan Sharma </strong>, will serve as a jury member of the Business Model Competition at E-summit, NIT Raipur, bringing his expertise and insights to evaluate groundbreaking ideas and inspiring ventures.
        </p>
        <p className="text-justify text-base md:text-lg">
          At <strong className="text-red-600">INFINITO </strong>, we believe in empowering visionaries who dare to dream big and innovate fearlessly. Together with E-Summit '22, we look forward to driving meaningful conversations and unlocking the potential of aspiring entrepreneurs.
        </p>
      </div>

      <div className="flex justify-center p-1 my-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl">
          <img
            src={EsummitImg1}
            alt="Placeholder 1"
            className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
          />
          <img
            src={EsummitImg2}
            alt="Placeholder 2"
            className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
          />
          <img
            src={EsummitImg3}
            alt="Placeholder 3"
            className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
          />
          <img
            src={EsummitImg4}
            alt="Placeholder 4"
            className="w-full h-40 sm:h-48 md:h-48 lg:h-56 object-cover rounded shadow-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default Esummit
