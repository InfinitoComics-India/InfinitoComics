import CrudRepository from "./crud-repository.js";
import ContactQuery from "../models/ContactQuery.js";

class ContactQueryRepository extends CrudRepository {
  constructor() {
    super(ContactQuery);
  }

  async getFiltered({ topic, status, page = 1, limit = 20 }) {
    try {
      const filter = {};
      if (topic) filter.topic = topic;
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        ContactQuery.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        ContactQuery.countDocuments(filter),
      ]);

      return { data, total, page: Number(page), limit: Number(limit) };
    } catch (error) {
      console.error("Error in getFiltered - ContactQueryRepository");
      throw error;
    }
  }
}

export default ContactQueryRepository;
