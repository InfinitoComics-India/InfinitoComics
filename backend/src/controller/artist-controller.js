import Artist from "../models/Artist.js";
import Comics from "../models/Comics.js";

// GET all active artists
const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find({ isActive: true })
      .select("-__v")
      .sort({ isVerified: -1, followers: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: artists, count: artists.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET artist by ID with their comics
const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
      .populate("comicsCreated", "title coverImage releasedYear");
    if (!artist) return res.status(404).json({ success: false, message: "Artist not found." });
    res.status(200).json({ success: true, data: artist });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST create artist (admin)
const createArtist = async (req, res) => {
  try {
    const artist = await Artist.create(req.body);
    res.status(201).json({ success: true, message: "Artist created.", data: artist });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT update artist (admin)
const updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!artist) return res.status(404).json({ success: false, message: "Artist not found." });
    res.status(200).json({ success: true, message: "Artist updated.", data: artist });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE artist (admin)
const deleteArtist = async (req, res) => {
  try {
    await Artist.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Artist deleted." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export default { getAllArtists, getArtistById, createArtist, updateArtist, deleteArtist };
