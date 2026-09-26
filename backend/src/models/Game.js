import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverImage:  { type: String, default: "" },  // S3 URL
    bannerImage: { type: String, default: "" },
    genre:       { type: [String], default: [] }, // ["Action","Adventure"]
    platform:    { type: [String], default: ["Web"] },
    developer:   { type: String, default: "InfinitoComics" },
    releaseDate: { type: Date },
    playUrl:     { type: String, default: "" },   // link to play
    screenshots: { type: [String], default: [] }, // S3 URLs
    tags:        { type: [String], default: [] },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    views:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

GameSchema.index({ isActive: 1, isFeatured: -1 });
GameSchema.index({ genre: 1 });

const Game = mongoose.model("Game", GameSchema);
export default Game;
