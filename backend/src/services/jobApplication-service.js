import JobApplicationRepository from "../repository/jobApplication-repository.js";

const jobApplicationRepo = new JobApplicationRepository();

class JobApplicationService {

    async createApplication(data) {
        return await jobApplicationRepo.create(data);
    }

    async getAllApplications() {
        return await jobApplicationRepo.getAllSorted();
    }

    async getApplicationsByJob(jobId) {
        return await jobApplicationRepo.getByJobId(jobId);
    }

    async deleteApplication(id) {
        return await jobApplicationRepo.findByIdandDelete(id);
    }
}

export default JobApplicationService;
