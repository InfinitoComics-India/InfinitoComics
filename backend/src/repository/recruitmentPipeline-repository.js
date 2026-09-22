import RecruitmentPipeline from "../models/RecruitmentPipeline.js";
import CrudRepository from "./crud-repository.js";

class RecruitmentPipelineRepository extends CrudRepository {
  constructor() { super(RecruitmentPipeline); }

  async getByStage(stage) {
    const filter = stage && stage !== "all" ? { stage } : {};
    return await RecruitmentPipeline.find(filter)
      .populate("assignedTo", "firstName lastName")
      .sort({ createdAt: -1 });
  }

  async getKanbanBoard() {
    const STAGES = ["applied","screening","interview_scheduled","interview_done","offer_sent","hired","rejected","withdrawn"];
    const all = await RecruitmentPipeline.find({}).sort({ createdAt: -1 });
    const board = {};
    STAGES.forEach(s => { board[s] = []; });
    all.forEach(c => { if (board[c.stage]) board[c.stage].push(c); });
    return board;
  }

  async moveStage(id, stage, movedBy, note) {
    return await RecruitmentPipeline.findByIdAndUpdate(
      id,
      {
        stage,
        $push: { stageHistory: { stage, movedBy, note: note || "", movedAt: new Date() } },
      },
      { new: true }
    );
  }

  async addInterview(id, interview) {
    return await RecruitmentPipeline.findByIdAndUpdate(
      id,
      { $push: { interviews: interview } },
      { new: true }
    );
  }

  async updateInterview(pipelineId, interviewId, data) {
    return await RecruitmentPipeline.findOneAndUpdate(
      { _id: pipelineId, "interviews._id": interviewId },
      {
        $set: {
          "interviews.$.feedback":   data.feedback,
          "interviews.$.rating":     data.rating,
          "interviews.$.result":     data.result,
          "interviews.$.notes":      data.notes,
          "interviews.$.scheduledAt":data.scheduledAt,
        },
      },
      { new: true }
    );
  }

  async getStats() {
    return await RecruitmentPipeline.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);
  }

  async findByApplication(applicationId) {
    return await RecruitmentPipeline.findOne({ applicationId });
  }
}

export default RecruitmentPipelineRepository;
