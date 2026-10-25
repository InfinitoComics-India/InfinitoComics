import mongoose from "mongoose";

const MarketingBannerSchema = new mongoose.Schema(
  {
    heroSlider: {
      type: Array,
      default: [],
    },
    promoBanners: {
      type: Array,
      default: [],
    },
    promoBars: {
      type: Array,
      default: [],
    },
    ultimateKit: {
      type: Object,
      default: {
        sectionTitle: "ULTIMATE KIT",
        badgeText: "INFINITO",
        title: "ULTIMATE KIT",
        originalPrice: "₹2199",
        salePrice: "₹1999",
        image: "",
        features: [
          "Comic of your choice",
          "Surprise Superhero Toy",
          "Digital Wall Paintings",
          "Superhero Stickers",
          "Infinito T-shirt",
        ],
        buttonText: "Get Now",
        buttonLink: "/checkout",
        sku: "INF-ULTIMATE-KIT",
        isActive: true,
      },
    },
    updatedBy: {
      type: String,
      default: "Admin",
    },
  },
  { timestamps: true }
);

const MarketingBanner = mongoose.model("MarketingBanner", MarketingBannerSchema);
export default MarketingBanner;
