import express from "express";
import MarketingBanner from "../models/MarketingBanner.js";

const router = express.Router();

// GET /shop/marketing/banners - Public endpoint so storefront and admin can fetch banners
router.get("/banners", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const banners = await MarketingBanner.findOne().sort({ updatedAt: -1 });
    if (!banners) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }
    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching marketing banners:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch marketing banners",
      error: error.message,
    });
  }
});

// GET /shop/marketing/promo-bars - Public endpoint specifically for announcement bars
router.get("/promo-bars", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const banners = await MarketingBanner.findOne().sort({ updatedAt: -1 });
    const promoBars = banners?.promoBars || [];
    return res.status(200).json({
      success: true,
      data: promoBars,
      promoBars,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch promo bars",
      error: error.message,
    });
  }
});

// PUT /shop/marketing/promo-bars - Specifically update announcement / promo bars
const updatePromoBarsHandler = async (req, res) => {
  try {
    const rawBars = req.body.promoBars || req.body.bars || req.body;
    const promoBars = Array.isArray(rawBars) ? rawBars : (rawBars?.promoBars || []);

    const updated = await MarketingBanner.findOneAndUpdate(
      {},
      { $set: { promoBars, updatedAt: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Announcement bars updated successfully",
      data: updated,
      promoBars: updated.promoBars,
    });
  } catch (error) {
    console.error("Error saving promo bars:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save promo bars",
      error: error.message,
    });
  }
};

router.put("/promo-bars", updatePromoBarsHandler);
router.post("/promo-bars", updatePromoBarsHandler);
router.put("/banners/promo-bars", updatePromoBarsHandler);
router.post("/banners/promo-bars", updatePromoBarsHandler);

// GET /shop/marketing/ultimate-kit - Get Ultimate Kit card data
router.get("/ultimate-kit", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const banners = await MarketingBanner.findOne().sort({ updatedAt: -1 });
    const kit = banners?.ultimateKit || {
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
    };
    return res.status(200).json({
      success: true,
      data: kit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ultimate kit",
      error: error.message,
    });
  }
});

// PUT /shop/marketing/ultimate-kit - Update Ultimate Kit card
const updateUltimateKitHandler = async (req, res) => {
  try {
    const ultimateKit = req.body.ultimateKit || req.body;
    const updated = await MarketingBanner.findOneAndUpdate(
      {},
      { $set: { ultimateKit, updatedAt: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({
      success: true,
      message: "Ultimate Kit updated successfully",
      data: updated.ultimateKit,
    });
  } catch (error) {
    console.error("Error saving ultimate kit:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save ultimate kit",
      error: error.message,
    });
  }
};

router.put("/ultimate-kit", updateUltimateKitHandler);
router.post("/ultimate-kit", updateUltimateKitHandler);

// PUT /shop/marketing/banners - Update or create marketing banners
const updateAllBannersHandler = async (req, res) => {
  try {
    const { heroSlider, promoBanners, promoBars, ultimateKit, updatedBy } = req.body;

    const payload = {};
    if (Array.isArray(heroSlider)) payload.heroSlider = heroSlider;
    if (Array.isArray(promoBanners)) payload.promoBanners = promoBanners;
    if (Array.isArray(promoBars)) payload.promoBars = promoBars;
    if (ultimateKit && typeof ultimateKit === "object") payload.ultimateKit = ultimateKit;
    if (updatedBy) payload.updatedBy = updatedBy;
    payload.updatedAt = new Date();

    const updated = await MarketingBanner.findOneAndUpdate(
      {},
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Marketing banners updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error saving marketing banners:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save marketing banners",
      error: error.message,
    });
  }
};

router.put("/banners", updateAllBannersHandler);
router.post("/banners", updateAllBannersHandler);

export default router;
