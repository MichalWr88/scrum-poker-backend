import SubjectService from "./subjectService";
import { Request, Response } from "express";

const subjectService = new SubjectService();
export class MongoSubjectController {
  public async getAllSubjects(req: Request, res: Response): Promise<void> {
    try {
      const subjects = await subjectService.getAllSubjects();
      res.status(200).json(subjects);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Unknown error", details: err });
      }
    }
  }

  public async addSubject(req: Request, res: Response): Promise<void> {
    try {
      const { jiraId } = req.body;

      const newSubject = await subjectService.addSubject(jiraId);
      res.status(201).json(newSubject);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Unknown error", details: err });
      }
    }
  }

  public async getSubject(req: Request, res: Response): Promise<void> {
    try {
      const subjectId = req.params.subjectId;
      const populate = req.query.populate as string;
      console.log("populate", populate);

      const subject = await subjectService.getSubject(subjectId, populate);
      res.status(200).json(subject);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Unknown error", details: err });
      }
    }
  }
  public async addOrUpdateVoteToSubject(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { subjectId } = req.params;
      const { userId, vote } = req.body;

      await subjectService.addOrUpdateVoteToSubject({
        subjectId,
        userId,
        vote,
      });
      res.status(201).json({ message: "Vote added successfully" });
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Unknown error", details: err });
      }
    }
  }
  public async getUserVotes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const votes = await subjectService.getVotesByUser(userId);
      res.status(200).json(votes);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Unknown error", details: err });
      }
    }
  }
}
