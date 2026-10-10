import React, { useState, useEffect, useMemo } from 'react';
import { Share2, ShoppingCart } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { getProductByIdOrSlug, getCategorySuggestedProducts } from '../../services/productService';
import { addToCart } from '../../redux/cartSlice';

const ProductDetail = () => {
  // --- All Hooks declared strictly at top level ---
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { category: urlCategory, id: urlId, productId } = useParams();

  const [product, setProduct] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [visibleSuggestedCount, setVisibleSuggestedCount] = useState(4);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantPriceAdjustment, setVariantPriceAdjustment] = useState(0);
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
        if (currentProduct && Array.isArray(currentProduct.variants) && currentProduct.variants.length > 0) {
          const initialVariants = {};
          currentProduct.variants.forEach((v) => {
            if (v.name && Array.isArray(v.options) && v.options.length > 0) {
              const firstOpt = v.options[0];
              initialVariants[v.name] = typeof firstOpt === 'object' ? firstOpt.value : firstOpt;
            }
          });
          setSelectedVariants(initialVariants);
          const sizeVal = initialVariants['Size'] || initialVariants['size'];
          if (sizeVal) setSelectedSize(sizeVal);
        } else if (currentProduct && currentProduct.sizes && currentProduct.sizes.length > 0) {
          setSelectedVariants({ Size: currentProduct.sizes[0] });
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

  // Derive product variants list (combining explicit variants and fallback sizes)
  const productVariants = useMemo(() => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.filter((v) => v.name && Array.isArray(v.options) && v.options.length > 0);
    }
    const fallbackSizes = product?.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    return [
      {
        name: 'Size',
        options: fallbackSizes.map((s) => ({ value: s, price: 0, stock: 10 })),
      },
    ];
  }, [product]);

  const handleSelectVariant = (variantName, value, optPrice = 0) => {
    setSelectedVariants((prev) => {
      const updated = { ...prev, [variantName]: value };
      if (variantName.toLowerCase() === 'size') {
        setSelectedSize(value);
      }
      return updated;
    });
    if (optPrice && optPrice > 0) {
      setVariantPriceAdjustment(optPrice);
    } else {
      setVariantPriceAdjustment(0);
    }
  };

  // Handlers
  const handleAddToCart = (prod = product) => {
    if (!prod) return;
    const basePriceNum = typeof prod.price === 'string'
      ? parseFloat(prod.price.replace(/[^\d.]/g, '')) || 1299
      : Number(prod.price || prod.salePrice || prod.basePrice || 1299);
    const cleanPrice = variantPriceAdjustment > 0 ? variantPriceAdjustment : basePriceNum;

    const cleanMrp = typeof prod.mrp === 'string'
      ? parseFloat(prod.mrp.replace(/[^\d.]/g, '')) || Math.round(cleanPrice * 1.6)
      : Number(prod.mrp || prod.basePrice || Math.round(cleanPrice * 1.6));

    const primaryImg = (Array.isArray(prod.images) && prod.images.length > 0)
      ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url)
      : (prod.image || '/products/crimson_tshirt.jpg');

    const chosenSize = selectedVariants['Size'] || selectedVariants['size'] || selectedSize || 'Standard';
    const variantDesc = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    dispatch(
      addToCart({
        productId: prod._id || prod.id || prod.slug,
        size: chosenSize,
        variant: selectedVariants,
        variantText: variantDesc,
        quantity: 1,
        product: {
          id: prod._id || prod.id || prod.slug,
          name: prod.name || prod.title || 'Special Edition Crimson Red T-Shirt',
          title: prod.name || prod.title || 'Special Edition Crimson Red T-Shirt',
          price: cleanPrice,
          mrp: cleanMrp,
          image: primaryImg,
          description: prod.description || prod.shortDescription || '',
          rating: prod.rating || 4.5,
        },
      })
    );
    toast.success(`Added ${prod.name || prod.title} (${variantDesc || chosenSize}) to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart(product);
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
          onClick={() => { window.location.href = "https://shop.infinitohq.com/"; }}
          className="px-6 py-2.5 bg-red-600 text-white font-bold uppercase tracking-wide hover:bg-red-700 transition"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-black min-h-screen font-sans py-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12">
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
                <span className="text-3xl font-extrabold text-black">
                  ₹{variantPriceAdjustment > 0 ? variantPriceAdjustment : (product.rawPrice || (typeof product.price === 'string' ? product.price.replace(/[^\d.]/g, '') : product.price) || 1299)}
                </span>
                <span className="text-sm text-gray-500 line-through font-medium">
                  {product.mrp || 'MRP ₹2599'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">Inclusive of all taxes</p>
            </div>

            {/* Dynamic Product Variants (Size, Color, Material, etc.) */}
            <div className="mt-6 space-y-5">
              {productVariants.map((variant) => {
                const currentVal = selectedVariants[variant.name] || (variant.options[0]?.value || variant.options[0]);
                const isSize = variant.name.toLowerCase().includes('size');

                return (
                  <div key={variant.name} className="border-b border-gray-100 pb-5 last:border-b-0">
                    <div className="flex justify-between items-center mb-2.5">
                      <h4 className="font-bold text-sm md:text-base text-black flex items-center gap-1.5">
                        <span>Select {variant.name}</span>
                        {currentVal && (
                          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded ml-1">
                            {currentVal}
                          </span>
                        )}
                      </h4>
                      {isSize && (
                        <button
                          onClick={() => toast.info('Standard size guide')}
                          className="text-xs text-red-600 font-bold uppercase hover:underline cursor-pointer"
                        >
                          SIZE CHART &gt;
                        </button>
                      )}
                    </div>

                    {/* Variant Option Buttons */}
                    <div className="flex flex-wrap gap-2.5">
                      {variant.options.map((opt, optIdx) => {
                        const val = typeof opt === 'object' ? opt.value : opt;
                        const optPrice = typeof opt === 'object' && opt.price ? Number(opt.price) : 0;
                        const optStock = typeof opt === 'object' && opt.stock !== undefined ? Number(opt.stock) : null;
                        const isSelected = currentVal === val;
                        const isOutOfStock = optStock !== null && optStock <= 0;

                        return (
                          <button
                            key={`${variant.name}-${val}-${optIdx}`}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleSelectVariant(variant.name, val, optPrice)}
                            className={`min-w-[3.5rem] px-3.5 h-11 flex flex-col items-center justify-center font-bold text-xs md:text-sm transition cursor-pointer rounded-md border ${
                              isSelected
                                ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-200'
                                : isOutOfStock
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                                : 'bg-[#E5E7EB] text-gray-800 border-transparent hover:bg-gray-300'
                            }`}
                          >
                            <span>{val}</span>
                            {optPrice > 0 && (
                              <span className={`text-[10px] font-normal ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
                                ₹{optPrice}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
