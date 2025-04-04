import mongoose, { Schema, Document, Model, Types } from "mongoose";
import validate from "express-zod-safe";
import { z } from "zod";
import User from "../user/userSchema";

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
  // _id: objectIdSchema,
  jiraId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  votes: z.array(UserVoteSchemaZod).default([]),
});

const RoomRequestBodySchema = z.object({
  name: z.string(),
  subjects: z.array(objectIdSchema).default([]),
});

export const RoomSchemaZod = z.object({
  _id: z.string(),
  name: z.string(),
  subjects: z.array(RoomVSubjectSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserVote = z.infer<typeof UserVoteSchemaZod>;
export type RoomSubject = z.infer<typeof RoomVSubjectSchema>;
export type Room = z.infer<typeof RoomSchemaZod>;

export const validationAddRoom = validate({ body: RoomRequestBodySchema });

export const VoteSchema = new Schema<UserVote>({
  _id: { type: String, required: true },
  userId: { type: String, ref: User, required: true },
  vote: { type: String, required: true },
});

const SubjectSchema = new Schema<RoomSubject>(
  {
    jiraId: { type: String, required: true, unique: true },
    votes: [VoteSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RoomSchema: Schema<Room> = new Schema<Room>(
  {
    name: { type: String, required: true, unique: true },
    subjects: [SubjectSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RoomModel: Model<Room> =
  mongoose.models.Room || mongoose.model<Room>("Room", RoomSchema);

export default RoomModel;
