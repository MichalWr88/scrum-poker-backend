import { Router } from "express";
import { IndexController } from "../controllers";
import { MongoRoomController } from "../mongo/room/mongoRoomController";
import { validationAddRoom } from "../mongo/room/roomSchema";
import { MongoSubjectController } from "../mongo/subject/subjectController";

const mongoApiPath = "/api/mongo";
const indexController = new IndexController();
const mongoRoomController = new MongoRoomController();
const mongoSubjectController = new MongoSubjectController();

export function setRoutes(app: Router) {
  app.get("/api/status", indexController.getStatus);
  app.get(mongoApiPath + "/rooms", mongoRoomController.getRooms);
  app.post(
    mongoApiPath + "/room",
    validationAddRoom,
    mongoRoomController.addRoom
  );
  app.get(mongoApiPath + "/room/:roomId", mongoRoomController.getRoom);
  app.patch(mongoApiPath + "/room/:roomId", mongoRoomController.editRoom);
  app.delete(mongoApiPath + "/room/:roomId", mongoRoomController.deleteRoom);
  //
  app.get(mongoApiPath + "/subjects", mongoSubjectController.getAllSubjects);
  app.post(
    mongoApiPath + "/subject/:subjectId",
    mongoSubjectController.addSubject
  );
  app.get(
    mongoApiPath + "/subject/:subjectId",
    mongoSubjectController.getSubject
  );
  // votes
  app.post(
    mongoApiPath + "/subject/:subjectId/vote",
    mongoSubjectController.addOrUpdateVoteToSubject
  );
  app.get(
    mongoApiPath + "/user/:userId/votes",
    mongoSubjectController.getUserVotes
  );
}
