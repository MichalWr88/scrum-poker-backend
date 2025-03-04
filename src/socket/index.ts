import { Server, ServerOptions } from "socket.io";

// Socket event enum for type safety
export enum SocketEvents {
  // Connection events
  CONNECT = "connection",
  DISCONNECT = "disconnect",

  // Room events
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  ROOM_USERS_UPDATED = "room_users_updated",

  // Voting events
  SEND_VOTE = "send_vote",
  VOTES_UPDATED = "votes_updated",
  CLEAR_ALL_VOTES = "clear_all_votes",
  CLEAR_MY_VOTE = "clear_my_vote",
  VOTES_CLEARED = "votes_cleared",
  TOGGLE_VOTES = "toggle_votes",
}

// Define types for our votes tracking
interface Vote {
  userId: string;
  userName: string;
  value: string | number | null;
}

// Track rooms and votes
const roomVotes: Record<string, Record<string, Vote>> = {};

export function setupSocket(server: Partial<ServerOptions>) {
  const io = new Server(server);

  io.on(SocketEvents.CONNECT, (socket) => {
    console.log("A user connected:", socket.id);

    // Join room event
    socket.on(
      SocketEvents.JOIN_ROOM,
      ({ roomId, userName }: { roomId: string; userName: string }) => {
        socket.join(roomId);

        // Initialize room if it doesn't exist
        if (!roomVotes[roomId]) {
          roomVotes[roomId] = {};
        }

        // Add user to room with null vote initially
        roomVotes[roomId][socket.id] = {
          userId: socket.id,
          userName,
          value: null,
        };

        // Broadcast updated user list to room
        io.to(roomId).emit(
          SocketEvents.ROOM_USERS_UPDATED,
          Object.values(roomVotes[roomId])
        );
        console.log(`User ${socket.id} (${userName}) joined room: ${roomId}`);
      }
    );

    // Leave room event
    socket.on(SocketEvents.LEAVE_ROOM, ({ roomId }: { roomId: string }) => {
      socket.leave(roomId);

      // Remove user's vote from room
      if (roomVotes[roomId] && roomVotes[roomId][socket.id]) {
        delete roomVotes[roomId][socket.id];
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
    });

    // Send vote event
    socket.on(
      SocketEvents.SEND_VOTE,
      ({ roomId, vote }: { roomId: string; vote: string | number }) => {
        console.log(`User ${socket.id} voted: ${vote} in room: ${roomId}`);
        console.log(roomVotes);
        if (roomVotes[roomId] && roomVotes[roomId][socket.id]) {
          // Update user's vote
          roomVotes[roomId][socket.id].value = vote;

          // Send updated votes to the room
          io.to(roomId).emit(
            SocketEvents.VOTES_UPDATED,
            Object.values(roomVotes[roomId])
          );
          console.log(`User ${socket.id} voted: ${vote} in room: ${roomId}`);
        }
      }
    );

    // Clear all votes for a room
    socket.on(
      SocketEvents.CLEAR_ALL_VOTES,
      ({ roomId }: { roomId: string }) => {
        if (roomVotes[roomId]) {
          // Set all votes to null
          Object.keys(roomVotes[roomId]).forEach((userId) => {
            roomVotes[roomId][userId].value = null;
          });

          // Broadcast cleared votes
          io.to(roomId).emit(
            SocketEvents.VOTES_UPDATED,
            Object.values(roomVotes[roomId])
          );
          io.to(roomId).emit(SocketEvents.VOTES_CLEARED);
          console.log(`All votes cleared in room: ${roomId}`);
        }
      }
    );

    // Clear my vote
    socket.on(SocketEvents.CLEAR_MY_VOTE, ({ roomId }: { roomId: string }) => {
      if (roomVotes[roomId] && roomVotes[roomId][socket.id]) {
        // Clear just this user's vote
        roomVotes[roomId][socket.id].value = null;

        // Broadcast updated votes
        io.to(roomId).emit(
          SocketEvents.VOTES_UPDATED,
          Object.values(roomVotes[roomId])
        );
        console.log(`User ${socket.id} cleared their vote in room: ${roomId}`);
      }
    });

    socket.on(
      SocketEvents.TOGGLE_VOTES,
      ({ roomId, show }: { roomId: string; show: boolean }) => {
        if (roomVotes[roomId]) {
          if (show) {
            // Send users' votes to all users in the room
            io.to(roomId).emit(
              SocketEvents.VOTES_UPDATED,
              Object.values(roomVotes[roomId])
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
        if (roomVotes[roomId][socket.id]) {
          delete roomVotes[roomId][socket.id];

          // Clean up empty rooms
          if (Object.keys(roomVotes[roomId]).length === 0) {
            delete roomVotes[roomId];
          } else {
            // Broadcast updated user list to room
            io.to(roomId).emit(
              SocketEvents.ROOM_USERS_UPDATED,
              Object.values(roomVotes[roomId])
            );
          }
        }
      });
    });
  });

  return io;
}
