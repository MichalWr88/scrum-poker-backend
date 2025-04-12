import { Error } from "mongoose";
import RoomModel, { Room } from "./roomSchema";

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
  public async getRoom(name: string) {
    return RoomModel.findOne({ name });
  }

  public async editRoomName(
    roomId: string,
    updateRoom: Partial<Pick<Room, "name" | "lastSubject">>
  ) {
    console.log("editRoomName", roomId, updateRoom);
    return await RoomModel.findOneAndUpdate(
      { name: roomId },
      { $set: updateRoom },
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
}
