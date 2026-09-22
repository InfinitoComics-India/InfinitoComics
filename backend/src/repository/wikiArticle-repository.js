import WikiArticle from "../models/WikiArticle.js";
import CrudRepository from "./crud-repository.js";

class WikiArticleRepository extends CrudRepository {
  constructor() { super(WikiArticle); }

  async getPublished(category = null) {
    const filter = { isPublished: true };
    if (category) filter.category = category;
    return await WikiArticle.find(filter)
      .select("title slug category tags views helpful isPinned authorName createdAt updatedAt")
      .sort({ isPinned: -1, views: -1, updatedAt: -1 });
  }

  async getAll(category = null) {
    const filter = {};
    if (category) filter.category = category;
    return await WikiArticle.find(filter)
      .select("title slug category tags views helpful isPublished isPinned authorName updatedAt")
      .sort({ isPinned: -1, updatedAt: -1 });
  }

  async getBySlug(slug) {
    return await WikiArticle.findOne({ slug })
      .populate("relatedArticles", "title slug category");
  }

  async search(query) {
    return await WikiArticle.find({
      isPublished: true,
      $or: [
        { title:   { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags:    { $regex: query, $options: "i" } },
      ],
    }).select("title slug category tags views authorName updatedAt").limit(20);
  }

  async incrementViews(id) {
    return await WikiArticle.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
  }

  async vote(id, helpful) {
    const field = helpful ? "helpful" : "notHelpful";
    return await WikiArticle.findByIdAndUpdate(id, { $inc: { [field]: 1 } }, { new: true });
  }

  async getPopular(limit = 5) {
    return await WikiArticle.find({ isPublished: true })
      .sort({ views: -1 })
      .limit(limit)
      .select("title slug category views");
  }

  async addVersion(id, content, editedBy, editedByName, changeNote) {
    const doc = await WikiArticle.findById(id);
    if (!doc) throw new Error("Article not found.");
    return await WikiArticle.findByIdAndUpdate(
      id,
      {
        content,
        lastEditedBy: editedBy,
        lastEditedByName: editedByName,
        $inc: { version: 1 },
        $push: {
          versions: {
            version:     doc.version,
            content:     doc.content,
            editedBy,
            editedByName,
            editedAt:    new Date(),
            changeNote:  changeNote || "",
          },
        },
      },
      { new: true }
    );
  }

  async getCategoryStats() {
    return await WikiArticle.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: "$category", count: { $sum: 1 }, totalViews: { $sum: "$views" } } },
      { $sort: { count: -1 } },
    ]);
  }
}

export default WikiArticleRepository;
