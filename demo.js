import mongoose from "mongoose";

const CharacterSchema = new mongoose.Schema(
  {
    knownAs: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      default: "Unknown",
    },
    birthDate: {
      type: Date,
      required: true,
    },
    placeOfOrigin: {
      type: String,
      required: true,
    },
    characteristics: [
      {
        type: String,
      },
    ],
    interests: [
      {
        type: String,
      },
    ],
    weapon: [
      {
        type: String,
        default: "",
      },
    ],
    capabilities: [
      {
        type: String,
      },
    ],
    powers: [
      {
        type: String,
      },
    ],
    height: {
      type: String,
      default: "NA",
    },
    weight: {
      type: String,
      default: "NA",
    },
    age: {
      type: Number,
    },
    Species: {
      type: String,
      default: "Unknown",
    },
    Eyes: {
      type: String,
      default: "NA",
    },
    Hair: {
      type: String,
      default: "NA",
    },
    limitations: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
    },
    creator: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    family: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Character",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Character",
      },
    ],
    Enemies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Character",
      },
    ],
    comicsAppearedIn: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comic",
      },
    ],
    StoryLine: {
      type: String,
      required: true,
    },
    About: {
      type: String,
      required: true,
    },
    Origin: {
      type: String,
      required: true,
    },
    ImagesUrl: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Character", CharacterSchema);
