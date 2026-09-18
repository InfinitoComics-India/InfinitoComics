import ContactQueryRepository from "../repository/contactQuery-repository.js";

class ContactQueryService {
  constructor() {
    this.repo = new ContactQueryRepository();
  }

  async submit({ email, topic, customTopic, details }) {
    // Use customTopic if no predefined topic was selected
    const resolvedTopic = topic || customTopic || "Other";
    return await this.repo.create({ email, topic: resolvedTopic, details });
  }

  async getAll({ topic, status, page, limit }) {
    return await this.repo.getFiltered({ topic, status, page, limit });
  }

  async updateStatus(id, status) {
    const allowed = ["new", "in-progress", "resolved"];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${allowed.join(", ")}`);
    }
    return await this.repo.findByIdandUpdate(id, { status });
  }

  async remove(id) {
    return await this.repo.findByIdandDelete(id);
  }
}

export default ContactQueryService;
