import { Request, Response } from "express";
import { RoomService } from "./roomService";
import { unknown } from "zod";

const roomService = new RoomService();
export class MongoRoomController {
  // GET /api/mongo/rooms
  public async getRooms(req: Request, res: Response): Promise<void> {
    const rooms = await roomService.getAllRooms();
    console.log(rooms);
    res.send(rooms);
  }

  public async addRoom(req: Request, res: Response): Promise<void> {
    try {
      const newRoom = await roomService.addRoom(req.body);

      res.send(newRoom);
    } catch (err: any & Error) {
      if (err.code === 11000) {
        res
          .status(400)
          .json({ error: "Room already exists", details: err.message });
      } else {
        res
          .status(500)
          .json({ error: "Error adding room", details: err.message });
      }
    }
  }
  public async getRoom(req: Request, res: Response): Promise<void> {
    const { roomId } = req.params;
    const room = await roomService.getRoom(roomId);
    console.log(roomId, room);
    if (room) {
      res.send(room);
    } else {
      res.status(404).json({ error: "Room not found" });
    }
  }
  /**
   * Edits the name of a room.
   *
   * @param req - The request object containing the room ID in the parameters and the new name in the body.
   * @param res - The response object used to send the updated room.
   */
  public async editRoom(req: Request, res: Response): Promise<void> {
    const { roomId } = req.params;
    const { lastSubject } = req.body;
    const updatedRoom = await roomService.editRoomName(roomId, {
      lastSubject,
    });
    res.send(updatedRoom);
  }
  public async deleteRoom(req: Request, res: Response): Promise<void> {
    const { roomId } = req.params;
    const deletedRoom = await roomService.deleteRoom(roomId);
    res.send(deletedRoom);
  }
  //------------------
  public async getSubjectsHistory(req: Request, res: Response): Promise<void> {
    const { roomId } = req.params;
    const history = await roomService.getSubjectsHistory(roomId);
    res.send(history);
  }
}
