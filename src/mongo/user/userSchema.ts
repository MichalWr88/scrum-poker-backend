import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type Role = "admin" | "developer" | "tester";

export interface IUser extends Document {
  name: string;
  email: string;
  role: Role;
  _id: Types.ObjectId;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "developer", "tester"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
