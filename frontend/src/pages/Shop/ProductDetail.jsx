import React, { useState, useEffect } from 'react';
import { Share2, ShoppingCart } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductByIdOrSlug, getCategorySuggestedProducts } from '../../services/productService';

const ProductDetail = () => {
  // --- All Hooks declared strictly at top level ---
  const navigate = useNavigate();
  const location = useLocation();
  const { category: urlCategory, id: urlId, productId } = useParams();

  const [product, setProduct] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [visibleSuggestedCount, setVisibleSuggestedCount] = useState(4);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const targetParam =
      productId ||
      urlId ||
      urlCategory ||
      (location.pathname ? location.pathname.split('/').pop() : null);

    const loadData = async () => {
      try {
        // 1. Fetch active product
        const currentProduct = await getProductByIdOrSlug(targetParam);

        if (!isMounted) return;

        setProduct(currentProduct);
        if (currentProduct && currentProduct.sizes && currentProduct.sizes.length > 0) {
          setSelectedSize(currentProduct.sizes[0]);
        }
        setSelectedImageIndex(0);

        // 2. Fetch suggested products in the same category (up to 8 items)
        if (currentProduct) {
          const suggested = await getCategorySuggestedProducts(
            currentProduct.category,
            currentProduct.id,
            8
          );
          if (isMounted) {
            setSuggestedProducts(suggested);
            setVisibleSuggestedCount(4);
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId, urlId, urlCategory, location.pathname, location.search]);

  // Handlers
  const handleAddToCart = (prod = product) => {
    if (!prod) return;
    toast.success(`Added ${prod.name || prod.title} (${selectedSize}) to cart!`);
  };

  const handleBuyNow = () => {
    navigate('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'INFINITO Product',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleProductSelect = (suggestedItem) => {
    const targetRoute = `/product/${suggestedItem.slug || suggestedItem.id}`;
    navigate(targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safe variables for rendering
  const images = product?.images && product.images.length > 0
    ? product.images
    : ['/products/crimson_tshirt.jpg'];

  const sizes = product?.sizes && product.sizes.length > 0
    ? product.sizes
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const specs = product?.specifications && product.specifications.length > 0
    ? product.specifications
    : [
        { label: 'Sleeve Length', value: 'Half Sleeve' },
        { label: 'Fit', value: 'Regular Fit' },
        { label: 'Length', value: 'Regular' },
        { label: 'Transparency', value: 'Opaque' },
      ];

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center text-gray-500 font-sans">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wide uppercase text-gray-600">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] bg-white flex flex-col items-center justify-center text-gray-700 font-sans">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been moved.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-red-600 text-white font-bold uppercase tracking-wide hover:bg-red-700 transition"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-black min-h-screen font-sans py-8 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery & Reviews */}
          <div>
            {/* Main Display Image */}
            <div className="relative w-full aspect-square bg-black overflow-hidden rounded-sm shadow-md flex items-center justify-center border border-gray-100">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name || product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.slice(0, 3).map((img, idx) => (
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
                onClick={() => toast.info('Gallery preview')}
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
                  ★ {product.rating || 4.5}
                </div>
              </div>

              {/* Rating Progress Bars */}
              <div className="space-y-2">
                {[
                  { star: 5, count: product.reviewsCount || 35, width: '90%' },
                  { star: 4, count: product.reviewsCount || 35, width: '85%' },
                  { star: 3, count: product.reviewsCount || 35, width: '55%' },
                  { star: 2, count: product.reviewsCount || 35, width: '35%' },
                  { star: 1, count: product.reviewsCount || 35, width: '15%' },
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

          {/* Right Column: Product Info & CTAs */}
          <div className="flex flex-col">
            {/* Title & Share Icon */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black uppercase">
                {product.title || 'INFINITO'}
              </h1>
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition"
                title="Share"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Subtitle / Full Name */}
            {product.name && product.name !== product.title && (
              <h2 className="text-base font-semibold text-gray-700 mt-1">
                {product.name}
              </h2>
            )}

            {/* Product Description */}
            <p className="mt-3 text-sm text-gray-600 leading-relaxed font-normal">
              {product.description ||
                'The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven design, this piece is made to stand out while keeping things effortlessly wearable.'}
            </p>

            {/* Price Block */}
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-black">{product.price || '₹1299'}</span>
                <span className="text-sm text-gray-500 line-through font-medium">
                  {product.mrp || 'MRP ₹2599'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">Inclusive of all taxes</p>
            </div>

            {/* Select Size */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-base text-black">Select Size</h4>
                <button
                  onClick={() => toast.info('Standard size guide')}
                  className="text-xs text-red-600 font-bold uppercase hover:underline"
                >
                  SIZE CHART &gt;
                </button>
              </div>

              {/* Size Selector Buttons */}
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[3.5rem] px-3 h-12 flex items-center justify-center font-bold text-sm transition ${
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

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAddToCart(product)}
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

            {/* Specifications Grid */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-2">
                Specification
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4 border-b border-gray-200 text-sm">
                {/* Column 1 */}
                <div className="space-y-3">
                  {specs.slice(0, Math.ceil(specs.length / 2)).map((spec, i) => (
                    <div key={i}>
                      <p className="text-xs text-gray-500 font-medium">{spec.label}</p>
                      <p className="font-bold text-black text-sm mt-0.5">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  {specs.slice(Math.ceil(specs.length / 2)).map((spec, i) => (
                    <div key={i}>
                      <p className="text-xs text-gray-500 font-medium">{spec.label}</p>
                      <p className="font-bold text-black text-sm mt-0.5">{spec.value}</p>
                    </div>
                  ))}
                  {/* Fallback column 2 items if specs array has 4 items */}
                  {specs.length <= 4 && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Sleeve Length</p>
                        <p className="font-bold text-black text-sm mt-0.5">Half Sleeve</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Transparency</p>
                        <p className="font-bold text-black text-sm mt-0.5">Opaque</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => toast.info('100% Premium Quality Certified')}
                className="mt-3 text-sm text-red-600 font-bold hover:underline"
              >
                See more
              </button>
            </div>

          </div>
        </div>

        {/* Suggested Section (Category Filtered) */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">Suggested</h2>
            {product.category && (
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-sm">
                Category: {product.category}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {suggestedProducts.slice(0, visibleSuggestedCount).map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleProductSelect(prod)}
                className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
              >
                <div className="relative w-full aspect-square bg-black overflow-hidden">
                  <img
                    src={prod.images?.[0] || '/products/crimson_tshirt.jpg'}
                    alt={prod.name || prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(prod);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-red-600 text-white flex items-center justify-center rounded-sm transition"
                    title="Add to cart"
                  >
                    <ShoppingCart size={15} />
                  </button>
                </div>

                <div className="p-4 bg-white flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-extrabold text-sm text-black uppercase tracking-tight">
                      {prod.title || 'INFINITO'}
                    </h3>
                    <p className="text-xs text-gray-600 truncate mt-0.5 font-medium">
                      {prod.name || prod.subtitle || prod.category}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-black mt-3">{prod.price}</p>
                </div>
              </div>
            ))}
          </div>

          {suggestedProducts.length > visibleSuggestedCount && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => {
                  setVisibleSuggestedCount((prev) => prev + 4);
                }}
                className="px-8 py-3 bg-red-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition shadow-sm rounded-none cursor-pointer"
              >
                View More
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
