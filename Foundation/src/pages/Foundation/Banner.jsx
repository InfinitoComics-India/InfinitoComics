import React, { useState, useEffect } from "react";
import banner from '../../assets/images/foundation/banner.png'
import BannerShimmer from '../../shimmer/Foundation/BannerShimmer'

const Banner = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); 
  }, []);
  return loading ? <BannerShimmer /> : (
    <div className="w-full min-h-[300px] md:min-h-[600px]">
      <img
        src={banner}
        alt="banner"
        className="w-full h-[300px] md:h-[600px] object-cover object-center"
      />
    </div>
  );
}

export default Banner
