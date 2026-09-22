import mongoose from "mongoose";

const WikiArticleSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, unique: true }, // auto-generated from title
    content:     { type: String, default: "" }, // rich text / markdown

    // ── Categorisation ────────────────────────────────────────
    category: {
      type: String,
      enum: ["Engineering","Design","HR","Finance","Marketing","Operations","Research","General"],
      default: "General",
    },
    tags: [{ type: String }],

    // ── Access ────────────────────────────────────────────────
    isPublished: { type: Boolean, default: false },
    isPinned:    { type: Boolean, default: false },

    // ── Authorship ────────────────────────────────────────────
    author:      { type: mongoose.Schema.Types.ObjectId },
    authorName:  { type: String, default: "" }, // snapshot
    lastEditedBy:{ type: mongoose.Schema.Types.ObjectId },
    lastEditedByName: { type: String, default: "" },

    // ── Stats ─────────────────────────────────────────────────
    views:       { type: Number, default: 0 },
    helpful:     { type: Number, default: 0 },  // upvotes
    notHelpful:  { type: Number, default: 0 },

    // ── Version history ───────────────────────────────────────
    version: { type: Number, default: 1 },
    versions: [{
      version:   Number,
      content:   String,
      editedBy:  mongoose.Schema.Types.ObjectId,
      editedByName: String,
      editedAt:  Date,
      changeNote: String,
    }],

    // ── Related articles ──────────────────────────────────────
    relatedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "WikiArticle" }],
  },
  { timestamps: true }
);

// Auto-generate slug from title
WikiArticleSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 80);
  }
  next();
});

WikiArticleSchema.index({ category: 1, isPublished: 1 });
WikiArticleSchema.index({ title: "text", content: "text", tags: "text" });
WikiArticleSchema.index({ views: -1 });

const WikiArticle = mongoose.model("WikiArticle", WikiArticleSchema);
export default WikiArticle;
