import ReadingProgress from "../models/ReadingProgress.js";
import { authenticate } from "../middleware/auth.js";

// GET progress for a user on a specific chapter
const getProgress = async (req, res) => {
  try {
    const { comicId, chapId } = req.params;
    const userId = req.user._id;
    const progress = await ReadingProgress.findOne({ userId, comicId, chapId });
    if (!progress) return res.status(200).json({ success: true, data: { lastPage: 1, isCompleted: false } });
    res.status(200).json({ success: true, data: progress });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET all reading progress for a user (history)
const getAllProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await ReadingProgress.find({ userId })
      .populate("comicId", "title coverImage")
      .sort({ lastReadAt: -1 });
    res.status(200).json({ success: true, data: progress });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST / PATCH save or update progress
const saveProgress = async (req, res) => {
  try {
    const { comicId, chapId } = req.params;
    const userId = req.user._id;
    const { lastPage, totalPages, isCompleted } = req.body;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, comicId, chapId },
      { lastPage, totalPages, isCompleted: isCompleted || false, lastReadAt: new Date() },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: progress });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export default { getProgress, getAllProgress, saveProgress };
