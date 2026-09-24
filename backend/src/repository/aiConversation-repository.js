import AIConversation from "../models/AIConversation.js";
import CrudRepository from "./crud-repository.js";

class AIConversationRepository extends CrudRepository {
  constructor() { super(AIConversation); }

  async getForUser(userId, limit = 20) {
    return await AIConversation.find({ userId, isArchived: false })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 })
      .limit(limit);
  }

  async addMessage(conversationId, message) {
    return await AIConversation.findByIdAndUpdate(
      conversationId,
      { $push: { messages: message } },
      { new: true }
    );
  }

  async updateTitle(conversationId, title) {
    return await AIConversation.findByIdAndUpdate(conversationId, { title }, { new: true });
  }

  async archive(conversationId) {
    return await AIConversation.findByIdAndUpdate(conversationId, { isArchived: true }, { new: true });
  }

  async clearAll(userId) {
    return await AIConversation.updateMany({ userId }, { isArchived: true });
  }
}

export default AIConversationRepository;
