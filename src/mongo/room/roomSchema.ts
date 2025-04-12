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

const RoomRequestBodySchema = z.object({
  name: z.string(),
  subjects: z.array(objectIdSchema).default([]),
});

export const RoomSchemaZod = z.object({
  _id: z.string(),
  name: z.string(),
  typeOfEstimate: z.enum(["fibonacci", "t-shirt"]).default("fibonacci"),
  lastSubject: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Room = z.infer<typeof RoomSchemaZod>;

export const validationAddRoom = validate({ body: RoomRequestBodySchema });

const RoomSchema: Schema<Room> = new Schema<Room>(
  {
    name: { type: String, required: true, unique: true },
    typeOfEstimate: {
      type: String,
      enum: ["fibonacci", "t-shirt"],
      default: "fibonacci",
    },
    lastSubject: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RoomModel: Model<Room> =
  mongoose.models.Room || mongoose.model<Room>("Room", RoomSchema);

export default RoomModel;
