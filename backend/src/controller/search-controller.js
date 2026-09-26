import Comics from "../models/Comics.js";
import Character from "../models/Character.js";
import Blog from "../models/Blog.js";

// GET /search?q=batman&type=all
const globalSearch = async (req, res) => {
  try {
    const { q, type = "all" } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Search query must be at least 2 characters." });
    }

    const regex = new RegExp(q.trim(), "i");
    const results = {};

    if (type === "all" || type === "comics") {
      results.comics = await Comics.find({
        $or: [{ title: regex }, { authors: regex }]
      }).select("title coverImage releasedYear authors").limit(10);
    }

    if (type === "all" || type === "characters") {
      results.characters = await Character.find({
        $or: [{ knownAs: regex }, { originalName: regex }, { characteristics: regex }]
      }).select("knownAs originalName profileImage").limit(10);
    }

    if (type === "all" || type === "blogs") {
      results.blogs = await Blog.find({
        $or: [{ title: regex }, { content: regex }, { tags: regex }]
      }).select("title coverImage publishedAt author").limit(10);
    }

    const total =
      (results.comics?.length || 0) +
      (results.characters?.length || 0) +
      (results.blogs?.length || 0);

    res.status(200).json({ success: true, data: results, total, query: q });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export default { globalSearch };
