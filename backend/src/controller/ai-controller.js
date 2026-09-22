import AIService from "../services/ai-service.js";
const aiService = new AIService();

const chat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "message is required." });
    const userId   = req.user._id;
    const userName = req.user.name || req.user.username || req.user.email || "Admin";
    const result = await aiService.chat(conversationId || null, message.trim(), userId, userName);
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    console.error("ai-controller.chat:", e);
    res.status(500).json({ success: false, message: e.message || "AI service error." });
  }
};

const getConversations = async (req, res) => {
  try {
    const d = await aiService.getConversations(req.user._id);
    res.status(200).json({ success: true, data: d });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getConversation = async (req, res) => {
  try {
    const d = await aiService.getConversation(req.params.id);
    if (!d) return res.status(404).json({ success: false, message: "Conversation not found." });
    res.status(200).json({ success: true, data: d });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteConversation = async (req, res) => {
  try {
    await aiService.deleteConversation(req.params.id);
    res.status(200).json({ success: true, message: "Conversation deleted." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const clearAll = async (req, res) => {
  try {
    await aiService.clearAll(req.user._id);
    res.status(200).json({ success: true, message: "All conversations cleared." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export default { chat, getConversations, getConversation, deleteConversation, clearAll };
