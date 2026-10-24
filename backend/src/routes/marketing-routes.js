import express from "express";
import MarketingBanner from "../models/MarketingBanner.js";

const router = express.Router();

// GET /shop/marketing/banners - Public endpoint so storefront and admin can fetch banners
router.get("/banners", async (req, res) => {
  try {
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

// PUT /shop/marketing/banners - Update or create marketing banners
router.put("/banners", async (req, res) => {
  try {
    const { heroSlider, promoBanners, promoBars, updatedBy } = req.body;

    const payload = {};
    if (Array.isArray(heroSlider)) payload.heroSlider = heroSlider;
    if (Array.isArray(promoBanners)) payload.promoBanners = promoBanners;
    if (Array.isArray(promoBars)) payload.promoBars = promoBars;
    if (updatedBy) payload.updatedBy = updatedBy;

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
});

// POST alias for PUT
router.post("/banners", async (req, res) => {
  try {
    const { heroSlider, promoBanners, promoBars, updatedBy } = req.body;

    const payload = {};
    if (Array.isArray(heroSlider)) payload.heroSlider = heroSlider;
    if (Array.isArray(promoBanners)) payload.promoBanners = promoBanners;
    if (Array.isArray(promoBars)) payload.promoBars = promoBars;
    if (updatedBy) payload.updatedBy = updatedBy;

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
});

export default router;
