import Game from "../models/Game.js";

// GET all active games
const getAllGames = async (req, res) => {
  try {
    const { genre, featured } = req.query;
    const filter = { isActive: true };
    if (genre) filter.genre = genre;
    if (featured) filter.isFeatured = true;
    const games = await Game.find(filter).sort({ isFeatured: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: games, count: games.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET single game
const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: "Game not found." });
    // Increment views
    await Game.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ success: true, data: game });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST create game (admin)
const createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json({ success: true, message: "Game created.", data: game });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT update game (admin)
const updateGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!game) return res.status(404).json({ success: false, message: "Game not found." });
    res.status(200).json({ success: true, message: "Game updated.", data: game });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE game (admin)
const deleteGame = async (req, res) => {
  try {
    await Game.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Game deleted." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export default { getAllGames, getGameById, createGame, updateGame, deleteGame };
