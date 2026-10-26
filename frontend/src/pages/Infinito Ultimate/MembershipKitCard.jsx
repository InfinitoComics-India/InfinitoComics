import React, { useState, useEffect } from 'react';
import { Gift, Package, Sparkles } from 'lucide-react';
import membershipKitImage from '../../../assets/Images/Ultimate/MembershipKitImage.png';
import InfinitoUltimateKit from './InfinitoUltimateKit';

const BACKEND_BASE = "https://infinitocomics-68cr.onrender.com";

const MembershipKitCard = () => {
  const [kit, setKit] = useState(() => {
    try {
      const raw = localStorage.getItem("infinito_shop_banners");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.ultimateKit) return parsed.ultimateKit;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    let cancelled = false;

    const loadLiveKit = async () => {
      try {
        let res;
        try {
          res = await fetch(`${BACKEND_BASE}/shop/marketing/banners?_t=${Date.now()}`).then((r) => r.json());
        } catch {
          res = await fetch(`http://localhost:5000/shop/marketing/banners?_t=${Date.now()}`).then((r) => r.json());
        }
        if (res?.success && res.data?.ultimateKit && !cancelled) {
          setKit(res.data.ultimateKit);
        }
      } catch (err) {
        console.warn("Could not load kit for MembershipKitCard:", err);
      }
    };

    loadLiveKit();
    return () => { cancelled = true; };
  }, []);

  const isNoPhoto = Boolean(kit?.noPhoto || kit?.image === 'no_photo');
  const customImg = kit?.image && kit?.image !== 'no_photo' ? kit.image : null;
  const displayImage = customImg || membershipKitImage;

  return (
    <div className='flex justify-center mt-28 px-4'>

      {/* Desktop View */}
      <div className="hidden md:flex flex-row w-[90%] max-w-[80.625rem] justify-between items-center h-[39rem] gap-6 bg-white px-10 py-12 shadow-md border">
        
        {/* Left Image / Branded Canvas */}
        <div className="md:w-[67%] h-[35rem] flex items-center justify-center overflow-hidden rounded">
          {isNoPhoto ? (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-[#3a080c] to-[#120204] text-white p-8 rounded-lg border border-red-900/40 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 bg-[#DD1215] text-white font-extrabold text-xs uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1.5">
                  <Gift size={13} />
                  MEMBERSHIP KIT
                </span>
                <span className="text-xs text-red-300/80 font-mono tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" />
                  AUTHENTIC COLLECTOR BUNDLE
                </span>
              </div>

              <div className="my-auto py-6">
                <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mb-3">
                  {kit?.cardTitle || kit?.title || "EXCLUSIVE LIMITED EDITION MEMBERSHIP KIT"}
                </h2>
                <p className="text-sm text-gray-300 max-w-lg leading-relaxed">
                  {kit?.note || "Get official limited-edition superhero merchandise, custom apparel, toys, and exclusive digital perks bundled directly into one collector box."}
                </p>

                {Array.isArray(kit?.includedProducts) && kit.includedProducts.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {kit.includedProducts.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-red-900/50 rounded-lg text-xs"
                      >
                        <Package size={13} className="text-[#DD1215]" />
                        <span className="text-gray-200 font-semibold">{p.title || p.name}</span>
                        {p.quantity > 1 && <span className="text-red-400 font-bold">x{p.quantity}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-red-900/30 pt-4">
                <span>INFINITO UNIVERSE DIRECT</span>
                <span className="font-semibold text-emerald-400">100% Genuine Merchandise</span>
              </div>
            </div>
          ) : (
            <img
              src={displayImage}
              alt="Membership Kit"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Right: InfinitoUltimateKit Card */}
        <div className="md:w-[40%] h-[35rem] flex items-center justify-center">
          <InfinitoUltimateKit kit={kit} />
        </div>

      </div>

      {/* Mobile View */}
      <div className="block md:hidden w-full max-w-[90%] bg-white px-4 py-8 shadow-md border flex flex-col items-center gap-6">
        
        {/* Image / Canvas */}
        <div className="w-full flex items-center justify-center">
          {isNoPhoto ? (
            <div className="w-full bg-gradient-to-br from-neutral-900 via-[#3a080c] to-[#120204] text-white p-6 rounded-lg border border-red-900/40 text-center">
              <span className="inline-block px-3 py-1 bg-[#DD1215] text-white font-bold text-xs uppercase tracking-wider rounded-full mb-3">
                MEMBERSHIP KIT
              </span>
              <h3 className="text-xl font-bold uppercase text-white mb-2">
                {kit?.cardTitle || kit?.title || "INFINITO ULTIMATE KIT"}
              </h3>
              <p className="text-xs text-gray-300">
                {kit?.note || "Official limited edition merchandise bundle."}
              </p>
            </div>
          ) : (
            <img
              src={displayImage}
              alt="Membership Kit"
              className="w-full h-auto object-contain"
            />
          )}
        </div>

        {/* InfinitoUltimateKit Card */}
        <div className="w-full flex justify-center">
          <InfinitoUltimateKit kit={kit} />
        </div>

      </div>

    </div>
  );
};

export default MembershipKitCard;
