import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CircleCheck, PackageCheck } from "lucide-react";
import { getAll as fetchCharacters } from "../../services/CharacterServices.js";
import { addToCart } from "../../redux/cartSlice.js";

const BACKEND_BASE = "https://infinitocomics-68cr.onrender.com";

const InfinitoUltimateKit = ({ kit: propKit, onBuyNow }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [characters, setCharacters] = useState([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Live kit state fallback
  const [liveKit, setLiveKit] = useState(() => {
    try {
      const raw = localStorage.getItem("infinito_shop_banners");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.ultimateKit) return parsed.ultimateKit;
      }
    } catch {}
    return null;
  });

  // Fetch live kit from marketing banners API if not provided via props
  useEffect(() => {
    if (propKit) return;
    let cancelled = false;

    const fetchLiveKit = async () => {
      try {
        let res;
        try {
          res = await fetch(`${BACKEND_BASE}/shop/marketing/banners?_t=${Date.now()}`).then((r) => r.json());
        } catch {
          res = await fetch(`http://localhost:5000/shop/marketing/banners?_t=${Date.now()}`).then((r) => r.json());
        }
        if (res?.success && res.data?.ultimateKit && !cancelled) {
          setLiveKit(res.data.ultimateKit);
        }
      } catch (err) {
        console.warn("Could not fetch live marketing kit data:", err);
      }
    };

    fetchLiveKit();
    return () => { cancelled = true; };
  }, [propKit]);

  // Fetch characters from API
  useEffect(() => {
    fetchCharacters()
      .then((data) => {
        let chars = [];
        if (data?.data && Array.isArray(data.data)) {
          chars = data.data;
        } else if (Array.isArray(data)) {
          chars = data;
        } else if (Array.isArray(data?.characters)) {
          chars = data.characters;
        }
        setCharacters(chars);
        if (chars.length > 0) {
          setSelectedCharacter(chars[0]._id);
        }
      })
      .catch((error) => {
        console.error("Error fetching characters for kit:", error);
        setCharacters([]);
      })
      .finally(() => setIsLoadingCharacters(false));
  }, []);

  const activeKit = propKit || liveKit || {};

  const cleanSalePrice = String(activeKit.salePrice || 1999).replace(/^₹\s*/, "");
  const cleanOriginalPrice = String(activeKit.originalPrice || 3199).replace(/^₹\s*/, "");

  const plan = {
    price: cleanSalePrice,
    originalPrice: cleanOriginalPrice ? `₹${cleanOriginalPrice}` : "₹3199",
    title: activeKit.cardTitle || activeKit.title || "INFINITO ULTIMATE KIT",
    features: Array.isArray(activeKit.features) && activeKit.features.length > 0
      ? activeKit.features
      : [
          "Surprise Superhero Toy",
          "Infinito T-shirt",
          "Superhero Stickers",
          "Digital Wall Paintings",
        ],
    includedProducts: Array.isArray(activeKit.includedProducts) ? activeKit.includedProducts : [],
    note: activeKit.note || "First 5,000 customers get exclusive gift!",
    buttonText: activeKit.buttonText || "BUY NOW",
  };

  const handleBuyNowClick = () => {
    if (onBuyNow) {
      onBuyNow(selectedCharacter, activeKit);
      return;
    }

    const priceNum = Number(cleanSalePrice) || 1999;
    const mrpNum = Number(cleanOriginalPrice) || 3199;
    const charName = characters.find((c) => c._id === selectedCharacter)?.knownAs || "Chosen Hero";

    dispatch(
      addToCart({
        productId: "infinito-ultimate-kit",
        size: "Collector Edition",
        sku: "INF-ULTIMATE-KIT",
        quantity: 1,
        variant: {
          size: "Collector Edition",
          sku: "INF-ULTIMATE-KIT",
          price: priceNum,
        },
        product: {
          id: "infinito-ultimate-kit",
          name: plan.title,
          title: `${plan.title} (${charName})`,
          price: priceNum,
          mrp: mrpNum,
          sku: "INF-ULTIMATE-KIT",
          image: activeKit.image && activeKit.image !== "no_photo" ? activeKit.image : "/products/ultimate_kit_box.jpg",
          description: `Exclusive Infinito Ultimate Membership Kit with ${charName} selection.`,
          rating: 5.0,
          includedProducts: plan.includedProducts,
        },
      })
    );

    navigate("/cart");
  };

  return (
    <div className="flex flex-col w-full max-w-[420px] border-2 border-gray-300 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-white p-6 border-b-2 border-gray-300">
        <h3 className="text-[#DD1215] text-lg font-bold mb-2 uppercase tracking-wide">
          {plan.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-black">
            ₹{plan.price}
          </span>
          {plan.originalPrice && (
            <span className="text-sm line-through text-gray-400">
              {plan.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="p-6 space-y-3 flex-grow">
        {/* Character Selection Dropdown */}
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full border-2 border-[#DD1215] flex items-center justify-center">
                <CircleCheck size={14} color="#DD1215" strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm text-black font-medium">Character of your choice</span>
          </div>
          
          {isLoadingCharacters ? (
            <div className="ml-8 text-xs text-gray-500">Loading characters...</div>
          ) : characters.length > 0 ? (
            <select
              value={selectedCharacter || ""}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="ml-8 w-[calc(100%-2rem)] text-sm border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-[#DD1215]"
            >
              {characters.map((character) => (
                <option key={character._id} value={character._id}>
                  {character.knownAs || character.originalName}
                </option>
              ))}
            </select>
          ) : (
            <div className="ml-8 text-xs text-gray-500">No characters available</div>
          )}
        </div>

        {/* Dynamic Checklist Features */}
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full border-2 border-[#DD1215] flex items-center justify-center">
                <CircleCheck size={14} color="#DD1215" strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm text-black">{feature}</span>
          </div>
        ))}

        {/* Bundled Store Products Inclusions Pill List (if present) */}
        {plan.includedProducts.length > 0 && (
          <div className="pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1 mb-1.5">
              <PackageCheck size={13} className="text-emerald-600" />
              Store Catalog Items Included ({plan.includedProducts.length}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {plan.includedProducts.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-800 text-[11px] rounded"
                >
                  <span className="font-semibold">{p.title || p.name}</span>
                  {p.quantity > 1 && <span className="text-red-600 font-bold">x{p.quantity}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        {plan.note && (
          <div className="pt-3 border-t border-gray-200 mt-4">
            <p className="text-xs text-gray-600 italic">{plan.note}</p>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="p-6 pt-0">
        <button
          type="button"
          onClick={handleBuyNowClick}
          className="w-full bg-[#DD1215] hover:bg-red-700 text-white font-bold py-3 px-6 transition-colors duration-300 text-sm uppercase tracking-wide cursor-pointer shadow"
        >
          {plan.buttonText}
        </button>
      </div>
    </div>
  );
};

export default InfinitoUltimateKit;
