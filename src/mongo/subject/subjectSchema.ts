import mongoose, { Schema, Document, Model, Types } from "mongoose";
import validate from "express-zod-safe";
import { z } from "zod";
import User from "../user/userSchema";
import RoomModel from "../room/roomSchema";

// Create a custom Zod schema for ObjectId
export const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  });

export const UserVoteSchemaZod = z.object({
  _id: objectIdSchema,
  userId: objectIdSchema,
  vote: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RoomVSubjectSchema = z.object({
  jiraId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  votes: z.array(UserVoteSchemaZod).default([]),
});

export type UserVote = z.infer<typeof UserVoteSchemaZod>;
export type Subject = z.infer<typeof RoomVSubjectSchema>;

export const VoteSchema = new Schema<UserVote>(
  {
    userId: { type: String, ref: User, required: true },
    vote: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SubjectSchema = new Schema<Subject>(
  {
    jiraId: { type: String, required: true, unique: true },
    votes: [VoteSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SubjectModel: Model<Subject> =
  mongoose.models.Subject || mongoose.model<Subject>("Subject", SubjectSchema);

export default SubjectModel;
