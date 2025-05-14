import { Server, ServerOptions } from "socket.io";
import roomService from "../mongo/room/roomService";
import { RoomVotes, SocketEventPayloads, SocketEvents, User } from "../types";

// Track rooms and votes
const roomVotes: RoomVotes = {};

export function setupSocket(server: Partial<ServerOptions>) {
  const io = new Server(server);

  io.on(SocketEvents.CONNECT, (socket) => {
    console.log("A user connected:", socket.id);

    // Join room event
    socket.on(
      SocketEvents.JOIN_ROOM,
      async ({ roomId, user }: SocketEventPayloads[SocketEvents.JOIN_ROOM]) => {
        if (!user) {
          return;
        }
        socket.join(roomId);

        // Initialize room if it doesn't exist
        if (!roomVotes[roomId]) {
          const room = await roomService.getRoom(roomId);
          if (!room) {
            console.error(`Room ${roomId} not found`);
            return;
          }
          roomVotes[roomId] = {
            id: roomId,
            name: room.name,
            currentSubject: room.lastSubject ?? "",
            showVotes: false,
            votes: {
              [socket.id]: {
                userId: socket.id,
                user: {
                  dbId: user.dbId,
                  role: user.role,
                  name: user.name,
                  email: user.email,
                },
                value: null,
              },
            },
          };
        } else {
          roomVotes[roomId].votes[socket.id] = {
            userId: socket.id,
            user: {
              dbId: user.dbId,
              role: user.role,
              name: user.name,
              email: user.email,
            },
            value: null,
          };
        }
        // Broadcast updated user list to room
        io.to(roomId).emit(
          SocketEvents.ROOM_USERS_UPDATED,
          roomVotes[roomId].votes
        );
        console.log(
          `User  (${user.name}) - ${user.role} joined room: ${roomId}`
        );
      }
    );

    // Leave room event
    socket.on(
      SocketEvents.LEAVE_ROOM,
      ({ roomId }: SocketEventPayloads[SocketEvents.LEAVE_ROOM]) => {
        socket.leave(roomId);

        if (roomVotes[roomId] && roomVotes[roomId].votes[socket.id]) {
          delete roomVotes[roomId].votes[socket.id];
        }

        // Clean up empty rooms
        if (roomVotes[roomId] && Object.keys(roomVotes[roomId]).length === 0) {
          delete roomVotes[roomId];
        } else if (roomVotes[roomId]) {
          // Broadcast updated user list to room
          io.to(roomId).emit(
            SocketEvents.ROOM_USERS_UPDATED,
            Object.values(roomVotes[roomId])
          );
        }

        console.log(`User ${socket.id} left room: ${roomId}`);
      }
    );

    // Send vote event
    socket.on(
      SocketEvents.SEND_VOTE,
      ({ roomId, vote }: SocketEventPayloads[SocketEvents.SEND_VOTE]) => {
        console.log(`User ${socket.id} voted: ${vote} in room: ${roomId}`);
        console.log(roomVotes);
        if (roomVotes[roomId] && roomVotes[roomId].votes[socket.id]) {
          // Update user's vote
          roomVotes[roomId].votes[socket.id].value = vote;

          // Send updated votes to the room
          io.to(roomId).emit(
            SocketEvents.VOTES_UPDATED,
            roomVotes[roomId].votes
          );
          console.log(`User ${socket.id} voted: ${vote} in room: ${roomId}`);
        }
      }
    );
    socket.on(
      SocketEvents.FETCHED_NEW_TASK,
      ({
        roomId,
        task,
      }: SocketEventPayloads[SocketEvents.FETCHED_NEW_TASK]) => {
        socket.broadcast.to(roomId).emit(SocketEvents.FETCHED_NEW_TASK, task);
      }
    );
    // Pending new task
    socket.on(
      SocketEvents.PENDING_NEW_TASK,
      ({ roomId }: SocketEventPayloads[SocketEvents.PENDING_NEW_TASK]) => {
        socket.broadcast.to(roomId).emit(SocketEvents.IS_PENDING_NEW_TASK);
        // io.to(roomId).emit(SocketEvents.IS_PENDING_NEW_TASK);
      }
    );

    // Clear all votes for a room
    socket.on(
      SocketEvents.CLEAR_ALL_VOTES,
      ({ roomId }: SocketEventPayloads[SocketEvents.CLEAR_ALL_VOTES]) => {
        if (roomVotes[roomId]) {
          // Set all votes to null
          Object.keys(roomVotes[roomId].votes).forEach((userId) => {
            roomVotes[roomId].votes[userId].value = null;
          });

          // Broadcast cleared votes
          io.to(roomId).emit(
            SocketEvents.VOTES_UPDATED,
            roomVotes[roomId].votes
          );
          io.to(roomId).emit(SocketEvents.VOTES_CLEARED);
          console.log(`All votes cleared in room: ${roomId}`);
        }
      }
    );

    // Clear my vote
    socket.on(
      SocketEvents.CLEAR_MY_VOTE,
      ({ roomId }: SocketEventPayloads[SocketEvents.CLEAR_MY_VOTE]) => {
        if (roomVotes[roomId] && roomVotes[roomId].votes[socket.id]) {
          // Clear just this user's vote
          roomVotes[roomId].votes[socket.id].value = null;

          // Broadcast updated votes
          io.to(roomId).emit(
            SocketEvents.VOTES_UPDATED,
            roomVotes[roomId].votes
          );
          console.log(
            `User ${socket.id} cleared their vote in room: ${roomId}`
          );
        }
      }
    );

    socket.on(
      SocketEvents.TOGGLE_VOTES,
      ({ roomId, show }: SocketEventPayloads[SocketEvents.TOGGLE_VOTES]) => {
        if (roomVotes[roomId]) {
          if (show) {
            // Send users' votes to all users in the room
            io.to(roomId).emit(
              SocketEvents.VOTES_UPDATED,
              roomVotes[roomId].votes
            );
          }
          // Send hide/show status to all users in the room
          io.to(roomId).emit(SocketEvents.TOGGLE_VOTES, { show });
          console.log(`Votes ${show ? "shown" : "hidden"} in room: ${roomId}`);
        }
      }
    );

    socket.on(SocketEvents.DISCONNECT, () => {
      console.log("User disconnected:", socket.id);

      // Remove user from all rooms they were in
      Object.keys(roomVotes).forEach((roomId) => {
        if (roomVotes[roomId].votes[socket.id]) {
          delete roomVotes[roomId].votes[socket.id];

          // Clean up empty rooms
          if (Object.keys(roomVotes[roomId].votes).length === 0) {
            delete roomVotes[roomId];
          } else {
            // Broadcast updated user list to room
            io.to(roomId).emit(
              SocketEvents.ROOM_USERS_UPDATED,
              Object.values(roomVotes[roomId].votes)
            );
          }
        }
      });
    });
  });

  return io;
}
