import Wishlist from "../models/Wishlist.js";

// GET all wishlist items for a user
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await Wishlist.find({ userId })
      .populate("comicId", "title coverImage releasedYear authors")
      .sort({ addedAt: -1 });
    res.status(200).json({ success: true, data: items, count: items.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { comicId } = req.body;
    if (!comicId) return res.status(400).json({ success: false, message: "comicId is required." });

    const existing = await Wishlist.findOne({ userId, comicId });
    if (existing) return res.status(409).json({ success: false, message: "Already in wishlist." });

    const item = await Wishlist.create({ userId, comicId });
    res.status(201).json({ success: true, message: "Added to wishlist.", data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { comicId } = req.params;
    await Wishlist.findOneAndDelete({ userId, comicId });
    res.status(200).json({ success: true, message: "Removed from wishlist." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET check if a comic is in wishlist
const checkWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { comicId } = req.params;
    const item = await Wishlist.findOne({ userId, comicId });
    res.status(200).json({ success: true, inWishlist: !!item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export default { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };
