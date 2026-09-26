import mongoose from "mongoose";

const ArtistSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    bio:          { type: String, default: "" },
    avatar:       { type: String, default: "" },  // S3 URL
    coverImage:   { type: String, default: "" },
    designation:  { type: String, default: "Artist" }, // "Writer", "Illustrator", etc.
    socialLinks: {
      instagram: { type: String, default: "" },
      twitter:   { type: String, default: "" },
      linkedin:  { type: String, default: "" },
      website:   { type: String, default: "" },
    },
    comicsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comics" }],
    isVerified:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    followers:    { type: Number, default: 0 },
    joinedDate:   { type: Date, default: Date.now },
    tags:         { type: [String], default: [] },
  },
  { timestamps: true }
);

ArtistSchema.index({ isActive: 1, isVerified: 1 });

const Artist = mongoose.model("Artist", ArtistSchema);
export default Artist;
