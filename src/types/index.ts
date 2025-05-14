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

  //TASK EVENTS
  IS_PENDING_NEW_TASK = "is_pending_new_task",
  FETCHED_NEW_TASK = "fetched_new_task",
  PENDING_NEW_TASK = "pending_new_task",
}

// Define types for our votes tracking
export interface Vote {
  userId: string;
  user: User;
  value: string | number | null;
}
export type User = {
  dbId: string;
  role: string;
  name?: string | null;
  email?: string | null;
};
export interface RoomConfig {
  id: string;
  name: string;
  currentSubject: string;
  showVotes: boolean;
  votes: { [key: string]: Vote };
}
export interface RoomVotes {
  [key: string]: RoomConfig;
}

// Define interfaces for each SocketEvent payload
export interface LeaveRoomPayload {
  roomId: string;
}

export interface JoinRoomPayload {
  roomId: string;
  user: User;
}

export interface SendVotePayload {
  roomId: string;
  vote: string | number;
}

export interface FetchedNewTaskPayload {
  roomId: string;
  task: object;
}

export interface PendingNewTaskPayload {
  roomId: string;
}

export interface ClearAllVotesPayload {
  roomId: string;
}

export interface ClearMyVotePayload {
  roomId: string;
}

export interface ToggleVotesPayload {
  roomId: string;
  show: boolean;
}

export type SocketEventPayloads = {
  [key in SocketEvents]: key extends SocketEvents.JOIN_ROOM
    ? JoinRoomPayload
    : key extends SocketEvents.LEAVE_ROOM
    ? LeaveRoomPayload
    : key extends SocketEvents.SEND_VOTE
    ? SendVotePayload
    : key extends SocketEvents.FETCHED_NEW_TASK
    ? FetchedNewTaskPayload
    : key extends SocketEvents.PENDING_NEW_TASK
    ? PendingNewTaskPayload
    : key extends SocketEvents.CLEAR_ALL_VOTES
    ? ClearAllVotesPayload
    : key extends SocketEvents.CLEAR_MY_VOTE
    ? ClearMyVotePayload
    : key extends SocketEvents.TOGGLE_VOTES
    ? ToggleVotesPayload
    : never;
};
