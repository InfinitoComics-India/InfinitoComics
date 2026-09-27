import React, { useState } from 'react';
import { Share2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = [
    '/products/crimson_tshirt.jpg',
    '/products/crimson_tshirt.jpg',
    '/products/crimson_tshirt.jpg',
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = () => {
    toast.success(`Added INFINITO Crimson T-Shirt (${selectedSize}) to cart!`);
  };

  const handleBuyNow = () => {
    navigate('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'INFINITO Crimson Red T-Shirt',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const suggestedProducts = [
    {
      id: 1,
      title: 'INFINITO',
      subtitle: 'Elegant Edition White-Red Hoodie...',
      price: 'Rs.1499/-',
      image: '/products/white_hoodie.jpg',
    },
    {
      id: 2,
      title: 'INFINITO',
      subtitle: 'Special Edition Crimson Bloodlin...',
      price: 'Rs.1499/-',
      image: '/products/crimson_tshirt.jpg',
    },
    {
      id: 3,
      title: 'INFINITO',
      subtitle: 'Elegant Edition White-Red Hoodie...',
      price: 'Rs.1499/-',
      image: '/products/white_hoodie.jpg',
    },
    {
      id: 4,
      title: 'INFINITO',
      subtitle: 'Elegant Edition White-Red Hoodie...',
      price: 'Rs.1499/-',
      image: '/products/white_hoodie.jpg',
    },
  ];

  return (
    <div className="w-full bg-white text-black min-h-screen font-sans py-8 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Main Product Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery & Reviews */}
          <div>
            {/* Main Featured Image */}
            <div className="relative w-full aspect-square bg-black overflow-hidden rounded-sm shadow-md flex items-center justify-center border border-gray-100">
              <img
                src={images[selectedImageIndex] || '/products/crimson_tshirt.jpg'}
                alt="INFINITO Special Edition Crimson Red T-Shirt"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square border-2 cursor-pointer overflow-hidden transition ${
                    selectedImageIndex === idx ? 'border-red-600' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {/* +5 More Thumbnail Block */}
              <div
                onClick={() => toast.info('Viewing gallery')}
                className="relative aspect-square bg-gray-200 flex flex-col items-center justify-center cursor-pointer font-bold text-gray-700 hover:bg-gray-300 transition"
              >
                <span className="text-xl font-bold text-black">+5</span>
                <span className="text-xs text-gray-600 font-medium">more</span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">Reviews</h3>
                <div className="bg-[#E50914] text-white px-3 py-1 font-bold text-sm flex items-center gap-1 rounded-sm shadow-sm">
                  ★ 4.5
                </div>
              </div>

              {/* Rating Progress Bars */}
              <div className="space-y-2">
                {[
                  { star: 5, count: 35, width: '90%' },
                  { star: 4, count: 35, width: '85%' },
                  { star: 3, count: 35, width: '55%' },
                  { star: 2, count: 35, width: '35%' },
                  { star: 1, count: 35, width: '15%' },
                ].map((rating) => (
                  <div key={rating.star} className="flex items-center gap-3 text-sm">
                    <span className="w-6 font-semibold text-gray-800">{rating.star}★</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: rating.width }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-gray-500 font-medium text-xs">
                      ({rating.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col">
            {/* Title & Share Icon */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black">
                INFINITO
              </h1>
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition"
                title="Share"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Product Description */}
            <p className="mt-3 text-sm text-gray-600 leading-relaxed font-normal">
              The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven design, this piece is made to stand out while keeping things effortlessly wearable.
            </p>

            {/* Price Display */}
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-black">₹1299</span>
                <span className="text-sm text-gray-500 line-through font-medium">MRP ₹2599</span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">Inclusive of all taxes</p>
            </div>

            {/* Select Size */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-base text-black">Select Size</h4>
                <button
                  onClick={() => toast.info('Standard international size guide')}
                  className="text-xs text-red-600 font-bold uppercase hover:underline"
                >
                  SIZE CHART &gt;
                </button>
              </div>

              {/* Size Selectors */}
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-14 h-12 flex items-center justify-center font-bold text-sm transition ${
                      selectedSize === sz
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-[#E5E7EB] text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 border-2 border-red-600 text-red-600 font-bold text-sm tracking-wide uppercase hover:bg-red-50 transition cursor-pointer text-center"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-red-600 text-white font-bold text-sm tracking-wide uppercase hover:bg-red-700 transition cursor-pointer text-center"
              >
                Buy Now
              </button>
            </div>

            {/* Specification Grid */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2">
                Specification
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4 border-b border-gray-200 text-sm">
                {/* Column 1 */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Sleeve Length</p>
                    <p className="font-bold text-black text-sm mt-0.5">Half Sleeve</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Fit</p>
                    <p className="font-bold text-black text-sm mt-0.5">Regular Fit</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Length</p>
                    <p className="font-bold text-black text-sm mt-0.5">Regular</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Transparency</p>
                    <p className="font-bold text-black text-sm mt-0.5">Opaque</p>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Sleeve Length</p>
                    <p className="font-bold text-black text-sm mt-0.5">Half Sleeve</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Fit</p>
                    <p className="font-bold text-black text-sm mt-0.5">Regular Fit</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Length</p>
                    <p className="font-bold text-black text-sm mt-0.5">Regular</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Transparency</p>
                    <p className="font-bold text-black text-sm mt-0.5">Opaque</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast.info('100% Premium Cotton, Bio-washed')}
                className="mt-3 text-sm text-red-600 font-bold hover:underline"
              >
                See more
              </button>
            </div>

          </div>
        </div>

        {/* Suggested Section */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-2xl font-bold text-black mb-6">Suggested</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {suggestedProducts.map((prod) => (
              <div
                key={prod.id}
                className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="relative w-full aspect-square bg-black overflow-hidden group">
                  <img
                    src={prod.image}
                    alt={prod.subtitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    onClick={() => handleAddToCart()}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-red-600 text-white flex items-center justify-center rounded-sm transition"
                    title="Add to cart"
                  >
                    <ShoppingCart size={15} />
                  </button>
                </div>

                <div className="p-4 bg-white flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-extrabold text-sm text-black uppercase tracking-tight">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-gray-600 truncate mt-0.5 font-medium">
                      {prod.subtitle}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-black mt-3">{prod.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => toast.info('Loading more products')}
              className="px-8 py-3 bg-red-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition shadow-sm rounded-none"
            >
              View More
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
