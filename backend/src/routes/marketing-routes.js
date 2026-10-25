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

// PUT /shop/marketing/banners - Update or create marketing banners
const updateAllBannersHandler = async (req, res) => {
  try {
    const { heroSlider, promoBanners, promoBars, updatedBy } = req.body;

    const payload = {};
    if (Array.isArray(heroSlider)) payload.heroSlider = heroSlider;
    if (Array.isArray(promoBanners)) payload.promoBanners = promoBanners;
    if (Array.isArray(promoBars)) payload.promoBars = promoBars;
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
