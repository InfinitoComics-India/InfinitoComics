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
    updatedBy: {
      type: String,
      default: "Admin",
    },
  },
  { timestamps: true }
);

const MarketingBanner = mongoose.model("MarketingBanner", MarketingBannerSchema);
export default MarketingBanner;
