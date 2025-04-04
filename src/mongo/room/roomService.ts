import mongoose, { MongooseError, Error } from "mongoose";
import RoomModel, { Room, VoteSchema } from "./roomSchema";
import UserModel from "../user/userSchema";

export class RoomService {
  constructor() {
    console.log("RoomService");
  }
  public async getAllRooms() {
    try {
      const rooms = await RoomModel.find();
      return rooms;
    } catch (err) {
      throw new Error("Error retrieving rooms" + err);
    }
  }
  public async addRoom(room: Room) {
    const newRoom = new RoomModel(room);
    await newRoom.save();
    return newRoom;
  }
  public async getRoom(roomId: string) {
    return RoomModel.findById(roomId);
  }

  public async editRoomName(roomId: string, name: string) {
    console.log("editRoomName", roomId, name);
    return await RoomModel.findByIdAndUpdate(
      roomId,
      { $set: { name } },
      {
        new: true,
      }
    );
  }
  public async deleteRoom(roomId: string) {
    return await RoomModel.findByIdAndDelete(roomId);
  }

  public async getSubjectsHistory(roomId: string) {
    const room = await RoomModel.findById(roomId).select("subjects -_id");

    return room;
  }
  public async addSubject({
    roomId,
    jiraId,
  }: {
    roomId: string;
    jiraId: string;
  }) {
    // In your service/controller code:
    const room = await RoomModel.findById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const currentJiraIds = room.subjects.map((s) => s.jiraId);
    currentJiraIds.forEach((id) => {
      if (id === jiraId) {
        throw new Error(`Duplicate jiraId found: ${jiraId}`);
      }
    });
    await room.updateOne({ $push: { subjects: { jiraId, users: [] } } });
    return await RoomModel.findById(roomId);

    // If everything is good, perform the update
    // await RoomModel.findOneAndUpdate(
    //   { _id: roomId },
    //   { $push: { subjects: { jiraId, users: [] } } }
    // );

    // const room = await RoomModel.findByIdAndUpdate(roomId, {
    //   $push: { subjects: { jiraId, users: [] } },
    // });
    // if (room) {
    //   return room;
    // }
    // throw new Error("Room not found");
  }
  public async getSubject(roomId: string, subjectId: string) {
    const room = await RoomModel.findById(roomId);
    if (room) {
      console.log("room", subjectId, room.subjects);
      return room.subjects.find((subject) => subject.jiraId === subjectId);
    }
    throw new Error("Room not found");
  }
  public async getSubjectVotes(roomId: string, jiraId: string) {
    const room = await RoomModel.findById(roomId);
    if (room) {
      return (
        room.subjects.find((subject) => subject.jiraId === jiraId)?.votes || []
      );
    }
    throw new Error("Room not found");
  }
  public async addSubjectVote(
    roomId: string,
    jiraId: string,
    voteData: { userId: string; vote: string }
  ) {
    const room = await RoomModel.findById(roomId);
    const user = await UserModel.findById(voteData.userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!room) {
      throw new Error("Room not found");
    }

    const subject = room.subjects.find((s) => s.jiraId === jiraId);
    if (subject) {
      const vote = subject.votes.find((v) => v._id === voteData.userId);
      if (vote) {
        vote.vote = voteData.vote;
      } else {
        // const newVote = mongoose.   VoteSchema(voteData);
        subject.votes.push({
          _id: new mongoose.Types.ObjectId().toString(),
          userId: voteData.userId,
          vote: voteData.vote,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      await room.save();
      return voteData;
    }
    throw new Error("Subject not found");
  }
  public async updateSubjectVote(
    roomId: string,
    jiraId: string,
    voteData: any
  ) {
    const room = await RoomModel.findOneAndUpdate(
      { _id: roomId },
      { $set: { "subjects.$[subject].users": voteData } },
      { arrayFilters: [{ "subject.name": jiraId }], new: true }
    );

    if (room) {
      return room;
    }
    throw new Error("Room not found");
  }
}
