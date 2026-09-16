import ContactQueryService from "../services/contactQuery-service.js";
const service = new ContactQueryService();

// POST /contact-query  — public, called from frontend form
export const submitQuery = async (req, res) => {
  try {
    const { email, topic, customTopic, details } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!topic && !customTopic) {
      return res.status(400).json({ success: false, message: "Please select or enter a topic." });
    }
    const query = await service.submit({ email, topic, customTopic, details });
    res.status(201).json({ success: true, data: query });
  } catch (err) {
    console.error("submitQuery error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /contact-query  — admin, with optional ?topic=&status=&page=&limit=
export const getAllQueries = async (req, res) => {
  try {
    const { topic, status, page = 1, limit = 20 } = req.query;
    const result = await service.getAll({ topic, status, page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("getAllQueries error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /contact-query/:id/status  — admin, update status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await service.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Query not found." });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("updateStatus error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /contact-query/:id  — admin
export const deleteQuery = async (req, res) => {
  try {
    const deleted = await service.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Query not found." });
    }
    res.status(200).json({ success: true, message: "Deleted successfully." });
  } catch (err) {
    console.error("deleteQuery error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
