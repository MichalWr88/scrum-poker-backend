import mongoose from "mongoose";
import SubjectModel from "./subjectSchema";

export default class SubjectService {
  public async getAllSubjects() {
    try {
      const subjects = await SubjectModel.find();
      return subjects;
    } catch (err) {
      throw new Error("Error retrieving subjects" + err);
    }
  }

  public async addSubject(jiraId: string) {
    const newSubject = SubjectModel.findOneAndUpdate(
      { jiraId },
      { $setOnInsert: { jiraId } },
      { upsert: true, new: true }
    );
    // const newSubject = new SubjectModel({ jiraId });
    // await newSubject.save();
    return newSubject;
  }

  public async getSubject(jiraId: string, populate?: string) {
    if (!jiraId) {
      throw new Error("Jira ID is required");
    }
    if (populate === "true") {
      return await SubjectModel.findOne({ jiraId }).populate("votes.userId");
    }
    return await SubjectModel.findOne({ jiraId });
  }

  public async getVotesByUser(userId: string) {
    const votes = await SubjectModel.aggregate([
      // Unwind the votes array to work with individual vote documents
      { $unwind: "$votes" },
      // Match votes whose userId equals the given userId
      { $match: { "votes.userId": userId } },
      // Project the fields you care about
      {
        $project: {
          _id: 0,
          jiraId: 1,
          vote: "$votes.vote",
          voteCreatedAt: "$votes.createdAt",
          voteUpdatedAt: "$votes.updatedAt",
        },
      },
    ]).exec();

    return votes;
  }

  public async addOrUpdateVoteToSubject({
    subjectId,
    userId,
    vote,
  }: {
    subjectId: string;
    userId: string;
    vote: string;
  }) {
    const subject = await SubjectModel.findOne({ jiraId: subjectId });
    if (!subject) {
      throw new Error("Subject not found");
    }

    const existingVoteIndex = subject.votes.findIndex(
      (v) => v.userId === userId
    );
    if (existingVoteIndex !== -1) {
      subject.votes[existingVoteIndex].vote = vote;
      subject.votes[existingVoteIndex].updatedAt = new Date();
    } else {
      subject.votes.push({
        _id: new mongoose.Types.ObjectId().toString(),
        userId,
        vote,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await subject.save();
  }
}
