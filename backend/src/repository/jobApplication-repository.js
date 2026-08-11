import CrudRepository from "./crud-repository.js";
import JobApplication from "../models/JobApplication.js";

class JobApplicationRepository extends CrudRepository {
    constructor() {
        super(JobApplication);
    }

    async getByJobId(jobId) {
        try {
            return await JobApplication.find({ jobId }).sort({ createdAt: -1 });
        } catch (error) {
            console.error("Error in getByJobId:", error);
            throw error;
        }
    }

    async getAllSorted() {
        try {
            return await JobApplication.find({}).sort({ createdAt: -1 });
        } catch (error) {
            console.error("Error in getAllSorted:", error);
            throw error;
        }
    }
}

export default JobApplicationRepository;
